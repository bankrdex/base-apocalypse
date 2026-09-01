import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CONFIG, GOOGLE_FORM } from "@/config";
import { parseWallet, parseXHandle } from "@/lib/wallet";

export type ListStatus = {
  open: boolean;
  cap: number;
};

export type SubmitResult =
  | { ok: true; wallet: string; handle: string; preference: "GTD" | "WL" }
  | { ok: false; reason: "closed" | "invalid" };

const submitSchema = z.object({
  wallet: z.string(),
  twitter: z.string(),
  preference: z.enum(["GTD", "WL"]),
});

export function getListStatus(): ListStatus {
  return {
    open: CONFIG.APPLICATION_OPEN,
    cap: CONFIG.MAX_SUBMISSIONS,
  };
}

export async function postToGoogleForm(input: {
  wallet: string;
  handle: string;
  preference: "GTD" | "WL";
}): Promise<boolean> {
  const body = new URLSearchParams();
  body.set(GOOGLE_FORM.WALLET, input.wallet);
  body.set(GOOGLE_FORM.TWITTER, `${input.handle} · ${input.preference}`);

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

    const handle = parseXHandle(data.twitter);
    if (!handle.ok) return { ok: false, reason: "invalid" };

    const posted = await postToGoogleForm({
      wallet: parsed.wallet,
      handle: handle.handle,
      preference: data.preference,
    });

    if (!posted) return { ok: false, reason: "invalid" };

    return {
      ok: true,
      wallet: parsed.wallet,
      handle: handle.handle,
      preference: data.preference,
    };
  });
