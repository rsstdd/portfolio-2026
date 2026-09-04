import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex max-w-content flex-col items-start px-5 pt-24 pb-32 md:px-8 lg:px-10"
    >
      <p className="text-overline uppercase text-muted">404</p>

      <h1 className="mt-2 display text-balance">
        No entry at this datum.
      </h1>

      <p className="mt-4 max-w-prose body-lg text-muted">
        The page does not exist, or it moved and nothing redirects here yet.
      </p>

      {/* .link-standalone owns the datum tick, so the tick is not hand-rolled here. */}
      <Link href="/" className="mt-10 link-standalone">
        Back to the start
      </Link>
    </main>
  );
}
