import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CAP_LABEL, CONFIG, GOOGLE_FORM } from "@/config";
import { Grain, SiteFooter, SiteHeader } from "@/components/frame";
import { SignalTasks } from "@/components/signal-tasks";
import { getListStatus, submitWallet } from "@/lib/submissions";
import { useSignalTasks } from "@/lib/signal";
import {
  connectBaseWallet,
  formatAllocation,
  formatBaseActivity,
  getBaseActivity,
  type BaseActivity,
} from "@/lib/base-activity";
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
    cap: CONFIG.MAX_SUBMISSIONS,
  };

  return (
    <div className="relative min-h-dvh bg-ground text-type">
      <Grain />
      <SiteHeader open={status.open} variant="apply" />
      <main className="mx-auto max-w-site px-5 pb-16 pt-24 md:pt-28">
        <p className="label">04 / Entry</p>
        {status.open ? <ApplyForm /> : <Closed />}
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

function ApplyForm() {
  const signal = useSignalTasks();
  const [wallet, setWallet] = useState("");
  const [verified, setVerified] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkingActivity, setCheckingActivity] = useState(false);
  const [activity, setActivity] = useState<BaseActivity | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { wallet?: string };
      if (saved.wallet) setDone(saved.wallet);
    } catch {
      /* ignore */
    }
  }, []);

  async function checkWallet(address: string) {
    setCheckingActivity(true);
    setActivity(null);
    setError(null);
    try {
      const result = await getBaseActivity(address);
      setVerified(address);
      setActivity(result);
    } catch (cause) {
      setVerified(null);
      setError(
        cause instanceof Error
          ? `${cause.message} Try again or use another public Base RPC connection.`
          : "Base activity could not be checked. Try again.",
      );
    } finally {
      setCheckingActivity(false);
    }
  }

  async function verify() {
    if (!signal.complete) {
      setError("Clear the signal first. Follow, like, repost, comment.");
      return;
    }
    const parsed = parseWallet(wallet);
    if (!parsed.ok) {
      setVerified(null);
      setActivity(null);
      setError(parsed.error);
      return;
    }
    await checkWallet(parsed.wallet);
  }

  async function connectWallet() {
    if (!signal.complete) {
      setError("Clear the signal first. Follow, like, repost, comment.");
      return;
    }
    try {
      const address = await connectBaseWallet();
      setWallet(address);
      await checkWallet(address.toLowerCase());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wallet connection failed.");
    }
  }

  async function postDirect(address: string) {
    const body = new URLSearchParams();
    body.set(GOOGLE_FORM.WALLET, address);
    await fetch(GOOGLE_FORM.ACTION, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }

  async function submit() {
    if (!signal.complete) {
      setError("Clear the signal first. Follow, like, repost, comment.");
      return;
    }
    if (!verified || !activity) {
      void verify();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await submitWallet({ data: { wallet: verified } });
      if (result.ok) {
        setDone(verified);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet: verified }));
        } catch {
          /* ignore */
        }
        return;
      }
      if (result.reason === "closed") {
        setError("The cap has been reached. Wallets are no longer accepted.");
        return;
      }
      await postDirect(verified);
      setDone(verified);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet: verified }));
      } catch {
        /* ignore */
      }
    } catch {
      try {
        await postDirect(verified);
        setDone(verified);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ wallet: verified }));
        } catch {
          /* ignore */
        }
      } catch {
        setError("Submission failed. Try again.");
      }
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="mt-10 max-w-xl">
        <h1 className="display-slot">On the list.</h1>
        <p className="mt-8 font-body text-body text-type">
          {shortenWallet(done)}
        </p>
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
    <div className="mt-10">
      <h1 className="display-slot">Put the wallet.</h1>
      <p className="measure mt-6 text-pretty text-body text-mute">
        Follow. Like. Repost. Comment. Then the wallet opens.
      </p>

      <div className="mt-12">
        <p className="label">Signal</p>
        <SignalTasks {...signal} />
      </div>

      <div className={`mt-14 max-w-xl ${signal.complete ? "" : "form-locked"}`}>
        {!signal.complete ? (
          <p className="unlock-hint">
            Wallet stays closed until follow, like, repost, and comment are marked.
          </p>
        ) : null}

        <label className="label mt-8 block" htmlFor="wallet">
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
          disabled={!signal.complete}
          onChange={(e) => {
            setWallet(e.target.value);
            setVerified(null);
            setActivity(null);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void verify();
            }
          }}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-ghost w-full"
            disabled={!signal.complete || checkingActivity}
            onClick={() => void connectWallet()}
          >
            {checkingActivity ? "Checking" : "Connect Base wallet"}
          </button>
          <button
            type="button"
            className="btn-ghost w-full"
            disabled={!signal.complete || checkingActivity}
            onClick={() => void verify()}
          >
            {checkingActivity ? "Calculating" : "Check address"}
          </button>
        </div>

        {verified ? (
          <p className="mt-4 text-legal text-type">
            Verified · {shortenWallet(verified)}
          </p>
        ) : null}

        {checkingActivity ? (
          <p className="mt-4 text-legal text-mute" role="status" aria-live="polite">
            Reading public Base activity and calculating the allocation…
          </p>
        ) : null}

        {activity ? (
          <div className="allocation-result mt-8 border border-rule p-5 sm:p-7">
            <p className="label">Your allocation</p>
            <p className="allocation-amount mt-2">{formatAllocation(activity.allocation)}</p>
            <p className="mt-3 text-legal text-mute">
              Base activity: {formatBaseActivity(activity)}
            </p>
            <p className="mt-4 text-legal leading-normal text-mute">
              Deterministic frontend score. Public RPC data is limited to measurable
              Base state; the maximum allocation is 97,000.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-legal text-type" role="alert">
            {error}
          </p>
        ) : null}

        {verified && activity && signal.complete ? (
          <button
            type="button"
            className="btn-primary mt-10 w-full"
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending ? "Submitting" : activity ? "Submit" : "Check allocation first"}
          </button>
        ) : null}

        <p className="mt-5 text-legal text-mute">Capacity {CAP_LABEL}.</p>
      </div>
    </div>
  );
}
