import type { LoadedBlogPost, LoadedProject } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * Structured data.
 *
 * One `Person` entity, described identically on every page that describes it.
 * The reason this is a shared builder rather than a literal in each page is the
 * same reason `site.ts` exists: two copies of an identity are one opportunity to
 * update it in one place.
 *
 * Deliberately minimal, per PORTFOLIO_PLAN § 9. Name, job title, location, url,
 * and sameAs. The payoff is entity resolution rather than a rich result: `Person`
 * markup produces no visual search feature, and `sameAs` is what tells a search
 * engine that this site, the GitHub profile, and the LinkedIn profile are one
 * person instead of three. Adding more types would not change that.
 */

/**
 * A stable identifier for the entity, so the home page and the about page are
 * understood as two descriptions of one person rather than two people. This is
 * the detail most implementations omit, and it is the one that makes the markup
 * work as intended.
 */
const PERSON_ID = `${site.url}/#person`;

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: site.url,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    /*
     * Locality only, and Munich rather than the Impressum's Icking.
     *
     * The street address exists on the Impressum because § 5 DDG requires it,
     * and there is no reason to repeat it in machine-readable form. The city is
     * the metro-area shorthand the rest of the site uses, which is the open
     * decision recorded in cookbook-final-pass.md § 12. If that decision
     * changes, this is the second place it has to change.
     */
    address: {
      "@type": "PostalAddress",
      addressLocality: "Munich",
      addressRegion: "Bayern",
      addressCountry: "DE",
    },
    /*
     * The load-bearing property. Every profile listed here is claimed as the
     * same entity, so only add a URL you actually control.
     */
    sameAs: [site.github, site.linkedin].filter(Boolean),
  };
}

/**
 * Renders a JSON-LD block.
 *
 * A plain script tag in a Server Component, which is the supported approach in
 * the App Router. The block is serialized at build time and needs no client
 * component to render, which is the whole reason it is written this way.
 *
 * The `<` escape is not optional even though every value here comes from
 * `site.ts` and is trusted today. A closing script tag appearing inside the
 * serialized JSON would end the block early, and the guard costs one call.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the only supported
      // way to emit a JSON-LD block; the payload is escaped and locally sourced.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * A `BlogPosting` per post.
 *
 * The load-bearing detail is that `author` and `publisher` are `@id` references
 * to the Person above rather than inline objects. An inline author would state
 * a second, unlinked entity that happens to share a name; the reference says
 * the writer of this post is the same entity the home page already describes.
 * That is the whole reason `PERSON_ID` is a constant rather than a literal.
 *
 * `blogPostSchema` carries no author field, and should not: a single-author
 * site would be storing the same name in eight files. The author comes from
 * `site.ts`, which is where identity lives.
 */
export function blogPostingJsonLd(post: LoadedBlogPost) {
  const url = `${site.url}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: post.title,
    description: post.summary,
    datePublished: post.date.toISOString(),
    /*
     * schema.org treats a missing dateModified as unknown rather than as
     * "same as published", and Google reads the pair together. Falling back to
     * the publish date states the true thing: this post has not been revised.
     */
    dateModified: (post.updated ?? post.date).toISOString(),
    keywords: [...post.tags],
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    image: `${site.url}${post.ogImage ?? "/images/og/default.png"}`,
    /*
     * Names the subject as an entity rather than as a string in the body. A
     * post about a named company otherwise leaves a search engine to infer the
     * association from prose, which it may or may not do.
     */
    ...(post.about
      ? { about: { "@type": "Organization", name: post.about.name, url: post.about.url } }
      : {}),
  };
}

/**
 * A `CreativeWork` per project.
 *
 * Not `SoftwareSourceCode`, which describes a code file rather than a piece of
 * work, and not `SoftwareApplication`, which would claim these are installable
 * products. `CreativeWork` with `codeRepository` says what is true: a described
 * body of work, some of which has a public repository.
 */
export function projectJsonLd(project: LoadedProject) {
  const url = `${site.url}/projects/${project.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    name: project.title,
    description: project.summary,
    dateCreated: project.date.toISOString(),
    keywords: [...project.stack],
    inLanguage: "en",
    creator: { "@id": PERSON_ID },
    ...(project.repo ? { codeRepository: project.repo } : {}),
    image: `${site.url}${project.ogImage ?? "/images/og/default.png"}`,
  };
}

/**
 * The blog index as a `Blog`, listing its posts.
 *
 * Each entry is an `@id` reference to the `BlogPosting` the post page declares,
 * for the same reason the author is a reference: one description of each post,
 * in one place, pointed at from everywhere else.
 */
export function blogJsonLd(posts: LoadedBlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog#blog`,
    url: `${site.url}/blog`,
    name: "Engineering notes",
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${site.url}/blog/${post.slug}#post`,
    })),
  };
}

/**
 * A `BreadcrumbList` for the two detail routes.
 *
 * The trail already exists visually as the "← All notes" link; this states it
 * in a form a search engine can render as a path under the result. Takes the
 * trail rather than deriving it from a slug, because the caller is the only
 * thing that knows the human label for its own page.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}
