import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsByTag, getTagName, getTags } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ tag: string }> };

/**
 * One page per tag that two or more posts carry.
 *
 * `getTags` applies that threshold, not this file. A tag on a single post would
 * produce a listing with one link on it, which is a worse destination than the
 * post itself and exactly the thin page a search engine is right to discard.
 */
export function generateStaticParams() {
  return getTags().map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const name = getTagName(tag);
  if (!name) return {};

  const count = getPostsByTag(tag).length;

  return pageMetadata({
    title: `Notes tagged ${name}`,
    description: `${count} engineering notes tagged ${name}.`,
    path: `/blog/tags/${tag}`,
  });
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const name = getTagName(tag);
  if (!name) notFound();

  const posts = getPostsByTag(tag);

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <nav aria-label="Breadcrumb">
        <Link href="/blog" className="link-standalone--no-flag">
          ← All notes
        </Link>
      </nav>

      <header className="mt-8">
        <p className="text-overline uppercase text-muted">Tag</p>
        <h1 className="mt-3 display">{name}</h1>
        <p className="mt-4 max-w-prose body-lg text-muted">
          {posts.length} notes tagged {name}.
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
              </div>

              <div className="md:flex-1">
                <p className="text-muted">{post.summary}</p>
              </div>

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
    </main>
  );
}
