import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG } from "@/config";
import { parseWallet } from "@/lib/wallet";

export type ListStatus = {
  open: boolean;
  count: number;
  cap: number;
  remaining: number;
};

export type SubmitResult =
  | { ok: true; wallet: string; preference: "GTD" | "WL"; remaining: number }
  | { ok: false; reason: "closed" | "invalid" | "duplicate" };

const submitSchema = z.object({
  wallet: z.string(),
  preference: z.enum(["GTD", "WL"]),
});

export const getListStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ListStatus> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ count: number }>`
      select count(*)::int as count from submissions
    `;
    const count = rows[0]?.count ?? 0;
    const cap = CONFIG.MAX_SUBMISSIONS;
    const remaining = Math.max(0, cap - count);
    const open = CONFIG.APPLICATION_OPEN && remaining > 0;
    return { open, count, cap, remaining };
  },
);

export const submitWallet = createServerFn({ method: "POST" })
  .validator((data) => submitSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    const parsed = parseWallet(data.wallet);
    if (!parsed.ok) return { ok: false, reason: "invalid" };

    if (!CONFIG.APPLICATION_OPEN) {
      return { ok: false, reason: "closed" };
    }

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const cap = CONFIG.MAX_SUBMISSIONS;

    try {
      const inserted = await sql.query<{ id: number }>(
        `with c as (select count(*)::int as n from submissions)
         insert into submissions (wallet, preference)
         select $1, $2 from c
         where c.n < $3
         returning id`,
        [parsed.wallet, data.preference, cap],
      );

      if (inserted.length === 0) {
        return { ok: false, reason: "closed" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("23505") ||
        /unique/i.test(message) ||
        /duplicate/i.test(message)
      ) {
        return { ok: false, reason: "duplicate" };
      }
      throw err;
    }

    const rows = await sql<{ count: number }>`
      select count(*)::int as count from submissions
    `;
    const count = rows[0]?.count ?? 0;
    return {
      ok: true,
      wallet: parsed.wallet,
      preference: data.preference,
      remaining: Math.max(0, cap - count),
    };
  });
