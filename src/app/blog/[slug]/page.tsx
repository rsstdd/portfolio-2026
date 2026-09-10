import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/content/mdx";
import { ContactCta } from "@/components/layout/contact-cta";
import { RelatedPosts } from "@/components/layout/related-posts";
import { getBlogPost, getBlogPostSlugs, getTags } from "@/lib/content";
import { blogPostingJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/json-ld";
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
    image: post.ogImage,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const published = post.date.toISOString().slice(0, 10);
  const updated = post.updated?.toISOString().slice(0, 10);

  /*
   * A tag links only when it has a page, which is only when two or more posts
   * carry it. The asymmetry is deliberate: a link to a listing of one is a
   * worse destination than the post the reader is already on. See `getTags`.
   */
  const linkable = new Map(getTags().map((t) => [t.tag, t.slug]));

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Engineering notes", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <nav aria-label="Breadcrumb">
        <Link href="/blog" className="link-standalone--no-flag">
          ← All notes
        </Link>
      </nav>

      {/*
        The header sits inside the article rather than beside it, so the title,
        tags, and dates are part of the thing being described rather than page
        furniture that happens to precede it.
      */}
      <article className="mt-8">
        <header>
          <p className="text-overline uppercase text-muted">
            {post.tags.map((tag, index) => {
              const tagPath = linkable.get(tag);
              return (
                <span key={tag}>
                  {index > 0 ? " · " : ""}
                  {tagPath ? (
                    <Link href={`/blog/tags/${tagPath}`} className="prose-link">
                      {tag}
                    </Link>
                  ) : (
                    tag
                  )}
                </span>
              );
            })}
          </p>

          <h1 className="mt-3 display">{post.title}</h1>

          <p className="mt-4 max-w-prose body-lg text-muted">{post.summary}</p>

          {/* Data plate: same pattern as the project page, published/updated only. */}
          <dl className="data-plate mt-8 flex flex-wrap gap-x-6 gap-y-1">
            <div className="flex gap-2">
              <dt className="sr-only">Published</dt>
              <dd>
                <time dateTime={published}>{published}</time>
              </dd>
            </div>
            {updated ? (
              <div className="flex gap-2">
                <dt className="sr-only">Updated</dt>
                <dd>
                  updated <time dateTime={updated}>{updated}</time>
                </dd>
              </div>
            ) : null}
          </dl>
        </header>

        <div className="mt-16">
          <Mdx source={post.body} />
        </div>
      </article>

      {/*
        Blog posts are where strangers arrive from search, so they are the pages
        that most need somewhere to go next. They were the pages that had it
        least: the closing block landed on /projects, /about and the project
        pages in the same commit and missed this one.
      */}
      <RelatedPosts current={post} />
      <ContactCta />
    </main>
  );
}
