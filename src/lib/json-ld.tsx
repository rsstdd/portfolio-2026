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
 * the App Router and ships no client JavaScript. It does not belong in a client
 * component and does not need one.
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
