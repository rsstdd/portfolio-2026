import Link from "next/link";
import { getBlogPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Engineering notes",
  description:
    "Notes on web security, databases, concurrency, and agentic engineering practice — each one written to be checked, not taken on faith.",
  path: "/blog",
});

/**
 * Blog index.
 *
 * Same shape as the projects index, deliberately: a flat list rather than a
 * filterable grid, ordered newest first, rows rather than cards so each post
 * gets a full line of summary. The loader owns the ordering, same reason as
 * `getProjects`: every consumer should agree without duplicating the rule.
 */
export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <p className="font-mono overline uppercase text-muted">Notes</p>
        <h1 className="mt-2 font-display text-display font-semibold text-balance">Engineering notes</h1>
        <p className="mt-4 text-body-lg text-muted">
          Working notes on security, systems, and the practice of engineering with AI, written to
          be checked, not taken on faith.
        </p>
      </header>

      <ul className="mt-16 border-t border-line">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 border-b border-line py-6 transition-colors duration-(--duration-fast) hover:bg-well md:flex-row md:items-baseline md:gap-8"
            >
              <div className="md:w-1/3">
                <h2 className="font-display text-h2 font-semibold group-hover:text-accent-text">
                  {post.title}
                </h2>
                <p className="mt-1 font-mono text-caption uppercase text-muted">
                  {post.tags.slice(0, 3).join(" · ")}
                </p>
              </div>

              <div className="md:flex-1">
                <p className="text-muted">{post.summary}</p>
              </div>

              <p className="font-mono text-caption tabular-nums text-muted md:w-28 md:text-right">
                {post.date.toISOString().slice(0, 10)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {/*
        Empty state names what belongs in the space and how to fill it, per
        VOICE.md 2.6 — this is that section's own worked example, verbatim.
      */}
      {posts.length === 0 ? (
        <p className="mt-8 max-w-prose text-muted">
          No notes yet. Add one under <code className="font-mono">content/blog</code>.
        </p>
      ) : (
        <p className="mt-8 max-w-prose font-mono text-caption text-muted">
          Posted as topics come up in real work, not on a schedule.
        </p>
      )}
    </main>
  );
}
