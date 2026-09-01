import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG, GOOGLE_FORM } from "@/config";
import { parseWallet } from "@/lib/wallet";

export type ListStatus = {
  open: boolean;
  cap: number;
};

export type SubmitResult =
  | { ok: true; wallet: string }
  | { ok: false; reason: "closed" | "invalid" };

const submitSchema = z.object({
  wallet: z.string(),
});

export function getListStatus(): ListStatus {
  return {
    open: CONFIG.APPLICATION_OPEN,
    cap: CONFIG.MAX_SUBMISSIONS,
  };
}

export async function postToGoogleForm(wallet: string): Promise<boolean> {
  const body = new URLSearchParams();
  body.set(GOOGLE_FORM.WALLET, wallet);

  const res = await fetch(GOOGLE_FORM.ACTION, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: GOOGLE_FORM.ACTION.replace("/formResponse", "/viewform"),
    },
    body,
    redirect: "manual",
  });

  if (res.status === 302) return true;
  const text = await res.text().catch(() => "");
  return res.status === 200 && /your response has been recorded/i.test(text);
}

export const submitWallet = createServerFn({ method: "POST" })
  .validator((data) => submitSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitResult> => {
    if (!CONFIG.APPLICATION_OPEN) {
      return { ok: false, reason: "closed" };
    }

    const parsed = parseWallet(data.wallet);
    if (!parsed.ok) return { ok: false, reason: "invalid" };

    const posted = await postToGoogleForm(parsed.wallet);
    if (!posted) return { ok: false, reason: "invalid" };

    return { ok: true, wallet: parsed.wallet };
  });
