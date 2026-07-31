import type { Metadata } from "next";

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
 * Project pages do not use this helper, because their metadata is generated
 * per slug in `generateMetadata` and already sets its own canonical.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  /** Page title. The root layout's template appends the site name. */
  title?: string;
  description?: string;
  /** Route-relative and leading-slash, resolved against `metadataBase`. */
  path: `/${string}`;
  /** Social card. Falls back to the site default when omitted. */
  image?: string;
}): Metadata {
  const card = image ?? "/images/og/default.png";

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    openGraph: {
      url: path,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [{ url: card, width: 1200, height: 630, alt: title ?? "Ross Todd" }],
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [card],
    },
  };
}
