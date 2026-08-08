import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/content/mdx";
import { getBlogPost, getBlogPostSlugs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

/**
 * Every post is known at build time, so every page is static, same as
 * `projects/[slug]`.
 */
export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <Link
        href="/blog"
        className="font-mono text-overline uppercase text-muted transition-colors duration-(--duration-fast) hover:text-ink"
      >
        ← All notes
      </Link>

      <header className="mt-8 max-w-prose">
        <p className="font-mono text-overline uppercase text-muted">{post.tags.join(" · ")}</p>

        <h1 className="mt-2 font-display text-display font-semibold text-balance">
          {post.title}
        </h1>

        <p className="mt-4 text-body-lg text-muted">{post.summary}</p>

        {/* Data plate: same pattern as the project page, published/updated only. */}
        <dl className="data-plate mt-8 flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-2">
            <dt className="sr-only">Published</dt>
            <dd>{post.date.toISOString().slice(0, 10)}</dd>
          </div>
          {post.updated ? (
            <div className="flex gap-2">
              <dt className="sr-only">Updated</dt>
              <dd>updated {post.updated.toISOString().slice(0, 10)}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      <article className="mt-16">
        <Mdx source={post.body} />
      </article>
    </main>
  );
}
