import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * Per-page metadata with a correct canonical URL.
 *
 * This exists because of a specific defect worth not repeating. Setting
 * `alternates: { canonical: "/" }` on the root layout looks like it configures
 * the site once. It does not: Next inherits that literal into every route that
 * does not override it, so /cv, /about, /projects and /colophon each declared
 * themselves duplicates of the home page and asked search engines to index the
 * home page instead. That is worse than emitting no canonical at all.
 *
 * Next does not derive canonicals from the route, so every page must state its
 * own. Making `path` a required argument means a new page cannot quietly
 * inherit the wrong one: forgetting it is a type error rather than an SEO
 * defect nobody notices for months.
 *
 * Every route goes through this helper, including the two dynamic ones. An
 * earlier version exempted project pages, which meant one hand-rolled copy of
 * the same object drifting quietly from this one.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: {
  /** Page title. The root layout's template appends the site name. */
  title?: string;
  description?: string;
  /** Route-relative and leading-slash, resolved against `metadataBase`. */
  path: `/${string}`;
  /** Social card. Falls back to the site default when omitted. */
  image?: string;
  /**
   * `article` for anything with a publication date: blog posts and projects.
   * `profile` for /about, which describes a person rather than a document.
   * Defaults to `website`, so a caller that does not care is already correct.
   *
   * This matters more than it looks. Without it the root layout's `website`
   * is inherited by every post, and a post that declares itself a website
   * carries no publication date a search engine will read.
   */
  type?: "website" | "article" | "profile";
  /** Emitted as `article:published_time`. Ignored unless `type` is `article`. */
  publishedTime?: Date;
  /** Emitted as `article:modified_time`. Ignored unless `type` is `article`. */
  modifiedTime?: Date;
  /** Emitted as `article:tag`. Ignored unless `type` is `article`. */
  tags?: readonly string[];
}): Metadata {
  const card = image ?? "/images/og/default.png";

  /*
   * Next only serializes `publishedTime`, `modifiedTime`, `authors` and `tags`
   * when `type` is `article`; passing them under `website` is silently dropped.
   * Narrowing here keeps that rule in one place rather than at each call site.
   */
  const article =
    type === "article"
      ? {
          type: "article" as const,
          ...(publishedTime ? { publishedTime: publishedTime.toISOString() } : {}),
          ...(modifiedTime ? { modifiedTime: modifiedTime.toISOString() } : {}),
          ...(tags?.length ? { tags: [...tags] } : {}),
          authors: [site.url],
        }
      : { type: type === "profile" ? ("profile" as const) : ("website" as const) };

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    /*
     * The feed lives here rather than only in the root layout because Next
     * replaces the whole `alternates` object when a page sets one, rather than
     * merging into it. A page declaring a canonical was silently dropping the
     * layout's feed link, which is every page on the site.
     */
    alternates: {
      canonical: path,
      types: { "application/rss+xml": `${site.url}/feed.xml` },
    },
    openGraph: {
      /*
       * `siteName` and `locale` are restated rather than inherited. Next
       * replaces the whole `openGraph` object when a segment sets one, the same
       * way it replaces `alternates`, so a page declaring an image was dropping
       * both of the root layout's values.
       */
      siteName: site.name,
      locale: "en_US",
      ...article,
      url: path,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [{ url: card, width: 1200, height: 630, alt: title ?? site.name }],
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [card],
    },
  };
}
