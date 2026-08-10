import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex max-w-content flex-col items-start px-5 pt-24 pb-32 md:px-8 lg:px-10"
    >
      <p className="mono text-overline uppercase text-muted">404</p>

      <h1 className="mt-2 font-display text-display font-semibold text-balance">
        No entry at this datum.
      </h1>

      <p className="mt-4 max-w-prose text-body-lg text-muted">
        The page does not exist, or it moved and nothing redirects here yet.
      </p>

      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-3 mono text-overline uppercase text-accent-text"
      >
        <span
          aria-hidden
          className="h-0.5 w-4 bg-accent transition-[width] duration-(--duration-base) ease-(--ease-standard) group-hover:w-7"
        />
        Back to the start
      </Link>
    </main>
  );
}
