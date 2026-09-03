import { Link } from "@tanstack/react-router";
import { CAP_LABEL, CONFIG } from "@/config";

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function Wordmark({
  size,
  to = "/",
}: {
  size: "tiny" | "hero" | "footer";
  to?: string;
}) {
  const cls =
    size === "hero"
      ? "wordmark wordmark-hero"
      : size === "footer"
        ? "wordmark wordmark-footer"
        : "wordmark wordmark-tiny";

  const inner = (
    <>
      <span className="wm-base">Base</span>
      <span className="wm-apo">Apocalypse</span>
    </>
  );

  if (size === "footer") {
    return <p className={cls}>{inner}</p>;
  }

  if (size === "hero") {
    return <h1 className={`${cls} hero-enter-delay mt-7 md:mt-9`}>{inner}</h1>;
  }

  return (
    <Link to={to} className={cls} aria-label="BASE APOCALYPSE">
      {inner}
    </Link>
  );
}

export function StatusPill({
  open,
  className = "",
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <span className={`status-pill ${open ? "open" : ""} ${className}`.trim()}>
      <span className="dot" aria-hidden="true" />
      {open ? `Open · ${CAP_LABEL} cap` : "Closed"}
    </span>
  );
}

const NAV = [
  { hash: "overview", label: "Overview" },
  { hash: "allocation", label: "Allocation" },
  { hash: "tasks", label: "Tasks" },
] as const;

export function SiteHeader({
  open,
  variant = "home",
}: {
  open: boolean;
  variant?: "home" | "apply";
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Wordmark size="tiny" />
        <div className="header-showcase" aria-label="BASE APOCALYPSE NFT army showcase">
          <span className="header-showcase-label">Army</span>
          <div className="header-showcase-stack">
            {[
              ["/nft/orange-cat.png", "Orange cat soldier"],
              ["/nft/skeleton-cowboy.png", "Skeleton cowboy"],
              ["/nft/black-soldier.png", "Black soldier"],
              ["/nft/white-soldier.png", "White soldier"],
              ["/nft/crocodile.png", "Crocodile gunslinger"],
            ].map(([src, alt]) => (
              <img key={src} src={src} alt={alt} className="header-showcase-avatar" />
            ))}
          </div>
        </div>
        <nav className="site-nav" aria-label="Sections">
          {variant === "apply" ? (
            <Link to="/" className="nav-link">
              Back
            </Link>
          ) : (
            <>
              {NAV.map((item) => (
                <Link
                  key={item.hash}
                  to="/"
                  hash={item.hash}
                  className="nav-link hidden md:inline-flex"
                >
                  {item.label}
                </Link>
              ))}
              {open ? (
                <Link to="/apply" className="nav-link">
                  Apply
                </Link>
              ) : (
                <span className="nav-link is-disabled">Apply</span>
              )}
            </>
          )}
        </nav>
        <StatusPill open={open} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer-pad px-5 pt-16 md:pt-20">
      <div className="mx-auto flex max-w-site flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <Wordmark size="footer" />
          <a
            className="label text-type hover:text-mute"
            href={CONFIG.X_URL}
            target="_blank"
            rel="noreferrer"
          >
            X
          </a>
        </div>
        <div className="flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-end md:justify-between">
          <p className="measure text-legal leading-normal text-mute">
            No purchase required to apply. Allocation is discretionary.
          </p>
          <p className="credit">Base</p>
        </div>
      </div>
    </footer>
  );
}
