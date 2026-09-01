import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CAP_LABEL, CONFIG } from "@/config";
import { Grain, SiteFooter, SiteHeader } from "@/components/frame";
import { getListStatus, submitWallet } from "@/lib/submissions";
import { parseWallet, shortenWallet } from "@/lib/wallet";

const STORAGE_KEY = "ba-list-wallet";

export const Route = createFileRoute("/apply")({
  loader: () => getListStatus(),
  component: ApplyPage,
});

function ApplyPage() {
  const loaded = Route.useLoaderData();
  const status = loaded ?? {
    open: CONFIG.APPLICATION_OPEN,
    count: 0,
    cap: CONFIG.MAX_SUBMISSIONS,
    remaining: CONFIG.MAX_SUBMISSIONS,
  };

  return (
    <div className="relative min-h-dvh bg-ground text-type">
      <Grain />
      <SiteHeader open={status.open} variant="apply" />
      <main className="mx-auto max-w-site px-5 pb-16 pt-24 md:pt-28">
        <p className="label">04 / Entry</p>
        {status.open ? <ApplyForm remaining={status.remaining} /> : <Closed />}
      </main>
      <hr className="rule" />
      <SiteFooter />
    </div>
  );
}

function Closed() {
  return (
    <div className="mt-10 measure">
      <h1 className="display-closed">
        Applications
        <br />
        closed
      </h1>
      <p className="mt-8 text-pretty text-body leading-normal text-type">
        The {CAP_LABEL}-submission cap has been reached. Wallets are no longer
        accepted.
      </p>
      <p className="mt-6">
        <a
          className="btn-text px-0"
          href={CONFIG.X_URL}
          target="_blank"
          rel="noreferrer"
        >
          Follow @{CONFIG.X_HANDLE} for the next window
        </a>
      </p>
    </div>
  );
}

function ApplyForm({ remaining }: { remaining: number }) {
  const [wallet, setWallet] = useState("");
  const [preference, setPreference] = useState<"GTD" | "WL">("WL");
  const [verified, setVerified] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{
    wallet: string;
    preference: "GTD" | "WL";
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { wallet: string; preference: "GTD" | "WL" };
      if (saved.wallet) setDone(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function verify() {
    const parsed = parseWallet(wallet);
    if (!parsed.ok) {
      setVerified(null);
      setError(parsed.error);
      return;
    }
    setError(null);
    setVerified(parsed.wallet);
  }

  async function submit() {
    if (!verified) {
      verify();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await submitWallet({
        data: { wallet: verified, preference },
      });
      if (result.ok) {
        const record = { wallet: result.wallet, preference: result.preference };
        setDone(record);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        } catch {
          /* ignore */
        }
        return;
      }
      if (result.reason === "duplicate") {
        setError("This wallet is already on the list.");
      } else if (result.reason === "closed") {
        setError("The cap has been reached. Wallets are no longer accepted.");
      } else {
        setError("Address did not verify.");
      }
    } catch {
      setError("Submission failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="mt-10 max-w-xl">
        <h1 className="display-slot">On the list.</h1>
        <p className="mt-8 font-body text-body text-type">
          {shortenWallet(done.wallet)}
        </p>
        <p className="label mt-4">{done.preference}</p>
        <p className="mt-10 text-legal text-mute">
          Allocation is discretionary. Completing later tasks does not guarantee
          GTD.
        </p>
        <Link to="/" className="btn-text mt-8 px-0">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-xl">
      <h1 className="display-slot">Put the wallet.</h1>
      <p className="measure mt-6 text-pretty text-body text-mute">
        Verify the address, then one submission. Signal tasks come next.
      </p>

      <label className="label mt-12 block" htmlFor="wallet">
        Wallet (Base / EVM)
      </label>
      <input
        id="wallet"
        className="field mt-3"
        name="wallet"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="0x"
        value={wallet}
        onChange={(e) => {
          setWallet(e.target.value);
          setVerified(null);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            verify();
          }
        }}
      />

      {verified ? (
        <p className="mt-4 text-legal text-type">
          Verified · {shortenWallet(verified)}
        </p>
      ) : (
        <button type="button" className="btn-ghost mt-5 w-full" onClick={verify}>
          Verify
        </button>
      )}

      {error ? (
        <p className="mt-4 text-legal text-type" role="alert">
          {error}
        </p>
      ) : null}

      {verified ? (
        <>
          <p className="label mt-10">Preference</p>
          <div className="mt-3 grid grid-cols-2 gap-0 border border-rule">
            <button
              type="button"
              className="choice"
              aria-pressed={preference === "GTD"}
              onClick={() => setPreference("GTD")}
            >
              GTD
            </button>
            <button
              type="button"
              className="choice"
              aria-pressed={preference === "WL"}
              onClick={() => setPreference("WL")}
            >
              WL
            </button>
          </div>
          <p className="mt-3 text-legal text-mute">
            Preference is not a promise until it is written against a wallet.
          </p>
          <button
            type="button"
            className="btn-primary mt-10 w-full"
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending ? "Submitting" : "Submit"}
          </button>
        </>
      ) : null}

      <p className="mt-5 text-legal text-mute">
        Capacity {CAP_LABEL}. {remaining.toLocaleString("en-US")} remaining.
      </p>
    </div>
  );
}
