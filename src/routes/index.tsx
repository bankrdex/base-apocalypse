import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CAP_LABEL, CONFIG } from "@/config";
import { Grain, SiteFooter, SiteHeader, Wordmark } from "@/components/frame";
import { getListStatus } from "@/lib/submissions";

export const Route = createFileRoute("/")({
  loader: () => getListStatus(),
  component: Home,
});

function Home() {
  const status = Route.useLoaderData();
  const open = status?.open ?? CONFIG.APPLICATION_OPEN;
  const remaining = status?.remaining ?? CONFIG.MAX_SUBMISSIONS;

  return (
    <div className="relative min-h-dvh bg-ground text-type">
      <Grain />
      <SiteHeader open={open} />
      <main>
        <Hero open={open} />
        <hr className="rule" />
        <Overview />
        <hr className="rule" />
        <Allocation />
        <hr className="rule" />
        <Tasks open={open} />
        <hr className="rule" />
        <ApplyTeaser open={open} remaining={remaining} />
      </main>
      <hr className="rule" />
      <SiteFooter />
      {open ? (
        <div className="sticky-apply md:hidden">
          <Link to="/apply" className="btn-primary w-full">
            Apply
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Hero({ open }: { open: boolean }) {
  return (
    <section
      id="top"
      className="hero-screen relative flex flex-col items-center justify-center px-5 pb-28 pt-20 text-center md:pb-16 md:pt-24"
    >
      <p className="label hero-enter">On Base</p>
      <Wordmark size="hero" />
      <p className="hero-enter-late mt-8 font-body text-body text-mute md:mt-10">
        The last list.
      </p>
      <div className="hero-enter-late mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-8">
        {open ? (
          <Link to="/apply" className="btn-primary">
            Apply
          </Link>
        ) : (
          <span className="btn-primary pointer-events-none opacity-35">Apply</span>
        )}
        <a className="btn-text" href="#tasks">
          Tasks
        </a>
      </div>
    </section>
  );
}

function Overview() {
  return (
    <Chapter id="overview">
      <ChapterHead index="01" kicker="Transmission" />
      <p className="lead measure mt-10">
        BASE APOCALYPSE is a limited collection on Base. Allocation is not public
        mint first. It is a list.
      </p>
      <dl className="mt-16 grid grid-cols-1 gap-0 border-t border-rule md:grid-cols-3">
        <Fact label="Supply" value={CONFIG.SUPPLY} />
        <Fact label="Chain" value="Base" />
        <Fact label="Window" value={CONFIG.WINDOW} />
      </dl>
    </Chapter>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-rule py-7 md:border-b-0 md:border-r md:px-8 md:py-10 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
      <dt className="label">{label}</dt>
      <dd className="fact-value mt-3">{value}</dd>
    </div>
  );
}

function Allocation() {
  return (
    <Chapter id="allocation">
      <ChapterHead index="02" kicker="List" />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2">
        <article className="border-b border-rule pb-12 md:border-b-0 md:border-r md:pr-12 md:pb-0">
          <h3 className="display-slot">GTD</h3>
          <p className="measure-narrow mt-6 text-pretty text-body leading-normal text-type">
            Guaranteed mint slot. Finite. Complete proof required. Preference is
            not a promise until it is written against a wallet.
          </p>
        </article>
        <article className="pt-12 md:pt-0 md:pl-12">
          <h3 className="display-slot">WL</h3>
          <p className="measure-narrow mt-6 text-pretty text-body leading-normal text-type">
            Allowlist. Not guaranteed. Same tasks. Same form.
          </p>
        </article>
      </div>
      <p className="mt-12 border-t border-rule pt-8 text-legal text-mute">
        Completing tasks does not guarantee GTD.
      </p>
    </Chapter>
  );
}

function Tasks({ open }: { open: boolean }) {
  const signalReady = Boolean(CONFIG.TASK_URL);
  return (
    <Chapter id="tasks">
      <ChapterHead index="03" kicker="Signal" />
      <p className="measure mt-8 text-pretty text-body text-mute">
        Clearance, not a quest. Follow first. The signal post lands next.
      </p>
      <ol className="mt-12">
        <TaskRow
          num="01"
          action={
            <a
              className="btn-ghost"
              href={CONFIG.X_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open X
            </a>
          }
        >
          Follow @{CONFIG.X_HANDLE} on X
        </TaskRow>
        <TaskRow
          num="02"
          action={
            signalReady ? (
              <a
                className="btn-ghost"
                href={CONFIG.TASK_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open post
              </a>
            ) : (
              <span className="btn-ghost pointer-events-none opacity-40">Pending</span>
            )
          }
        >
          {signalReady ? (
            <>
              Quote or reply to the posted signal. Include the exact code{" "}
              <span className="code-stamp">{CONFIG.CODE}</span>. Keep the post
              public.
            </>
          ) : (
            <>Signal post. Link pending. Code will be {CONFIG.CODE}.</>
          )}
        </TaskRow>
        <TaskRow
          num="03"
          action={
            open ? (
              <Link to="/apply" className="btn-ghost">
                Apply
              </Link>
            ) : null
          }
        >
          Submit a verified Base / EVM wallet before the {CAP_LABEL} cap.
        </TaskRow>
      </ol>
      <p className="measure mt-10 text-legal leading-normal text-mute">
        Likes are not required and are not verifiable.
      </p>
    </Chapter>
  );
}

function TaskRow({
  num,
  children,
  action,
}: {
  num: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-4 border-t border-rule py-8 last:border-b md:flex-row md:items-center md:justify-between md:gap-10">
      <div className="flex gap-5 md:gap-8">
        <span className="task-num pt-0.5">{num}</span>
        <p className="measure text-pretty text-body leading-normal text-type">
          {children}
        </p>
      </div>
      {action ? <div className="shrink-0 pl-11 md:pl-0">{action}</div> : null}
    </li>
  );
}

function ApplyTeaser({
  open,
  remaining,
}: {
  open: boolean;
  remaining: number;
}) {
  return (
    <Chapter id="apply">
      <ChapterHead index="04" kicker="Entry" />
      {open ? (
        <div className="mt-10 max-w-xl">
          <p className="measure text-pretty text-body text-type">
            Wallet on this site. Verify, then one submission.
          </p>
          <Link to="/apply" className="btn-primary mt-10 w-full">
            Enter
          </Link>
          <p className="mt-5 text-legal text-mute">
            Capacity {CAP_LABEL}. {remaining.toLocaleString("en-US")} remaining.
          </p>
        </div>
      ) : (
        <div className="mt-12 measure">
          <h3 className="display-closed">
            Applications
            <br />
            closed
          </h3>
          <p className="mt-8 text-pretty text-body leading-normal text-type">
            The {CAP_LABEL}-submission cap has been reached. Wallets are no longer
            accepted.
          </p>
        </div>
      )}
    </Chapter>
  );
}

function Chapter({ id, children }: { id: string; children: ReactNode }) {
  const { ref, ready, visible } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      className={`section chapter mx-auto max-w-site px-5 py-16 md:py-28 ${
        ready ? "is-ready" : ""
      } ${visible ? "is-in" : ""}`}
    >
      {children}
    </section>
  );
}

function ChapterHead({ index, kicker }: { index: string; kicker: string }) {
  return (
    <p className="label chapter-index">
      {index} / {kicker}
    </p>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      setReady(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
        setReady(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, ready, visible };
}
