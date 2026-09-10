import Link from "next/link";
import type { LoadedBlogPost } from "@/lib/content";

/**
 * A list of posts.
 *
 * Extracted because two places want the same rows and a third copy of the
 * markup is how they start to disagree. `RelatedPosts` uses it at the foot of a
 * post, the home page uses it for the notes section, and neither owns the
 * treatment.
 *
 * Selection is the caller's job and presentation is this component's. That split
 * is the point: relatedness by shared tags and featured-first ordering are
 * different questions with different answers, and neither belongs in a list.
 *
 * TWO VARIANTS, BECAUSE THE CONTEXTS DIFFER
 *
 * `stacked` is title over summary at reading measure, for a column of prose.
 * `rows` puts the title in a left column and the summary beside it, which is
 * how /blog lays out the same content and what keeps a full-width section from
 * ending halfway across the page. Both keep each column inside a comfortable
 * measure; the difference is only whether there is width to spend.
 *
 * Lives beside `project-card.tsx` because both render a content entity, which is
 * what `src/components/content/` is for.
 */
export function PostList({
  posts,
  variant = "stacked",
}: {
  posts: LoadedBlogPost[];
  variant?: "stacked" | "rows";
}) {
  if (variant === "rows") {
    return (
      <ul className="border-t border-line">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 border-b border-line py-6 transition-colors duration-(--duration-fast) hover:bg-well md:flex-row md:items-baseline md:gap-8"
            >
              <div className="md:w-1/3">
                <h3 className="h3 group-hover:text-accent-text">{post.title}</h3>
                <p className="mt-1 mono caption uppercase text-muted">
                  {post.tags.slice(0, 3).join(" · ")}
                </p>
              </div>

              <p className="text-muted md:flex-1">{post.summary}</p>

              <time
                dateTime={post.date.toISOString().slice(0, 10)}
                className="mono caption tabular-nums text-muted md:w-28 md:text-right"
              >
                {post.date.toISOString().slice(0, 10)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="max-w-prose">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-line py-4">
          <h3 className="h3">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors duration-(--duration-fast) hover:text-accent-text"
            >
              {post.title}
            </Link>
          </h3>
          <p className="mt-1 small text-muted">{post.summary}</p>
        </li>
      ))}
    </ul>
  );
}
