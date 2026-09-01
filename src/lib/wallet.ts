const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const ZERO_RE = /^0x0+$/;
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

export type WalletParse =
  | { ok: true; wallet: string }
  | { ok: false; error: string };

export type HandleParse =
  | { ok: true; handle: string }
  | { ok: false; error: string };

export function parseWallet(input: string): WalletParse {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Paste a Base / EVM address." };
  }
  if (!WALLET_RE.test(raw)) {
    return {
      ok: false,
      error: "Not a valid address. 0x followed by 40 hex characters.",
    };
  }
  if (ZERO_RE.test(raw)) {
    return { ok: false, error: "Zero address is not accepted." };
  }
  return { ok: true, wallet: raw.toLowerCase() };
}

export function parseXHandle(input: string): HandleParse {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, error: "Paste an X username." };
  }
  const core = raw.startsWith("@") ? raw.slice(1) : raw;
  if (!HANDLE_RE.test(core)) {
    return {
      ok: false,
      error: "Not a valid X username. 1–15 letters, numbers, underscore.",
    };
  }
  return { ok: true, handle: `@${core}` };
}

export function shortenWallet(wallet: string): string {
  if (wallet.length < 12) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}
