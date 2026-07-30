/**
 * Identity only. Facts that would otherwise be duplicated across layout
 * metadata, OG images, JSON-LD, the sitemap, and the footer.
 *
 * Page copy does not belong here. It lives in content/, so that changing a
 * sentence never means editing a TypeScript file.
 */
export const site = {
  name: "Ross Todd",
  role: "Senior Software Engineer",
  location: "München",
  url: "https://rsstdd.com",
  email: "rssmtdd@gmail.com",
  github: "https://www.github.com/rsstdd",
  linkedin: "https://www.linkedin.com/in/rsstdd",
  /**
   * Set to null when the search ends. The home page omits the line entirely
   * rather than rendering an empty element.
   */
  availability: "Based in Munich. Authorized to work in Germany without sponsorship. Open to senior and staff platform or full-stack roles." as string | null,

  /**
   * Ladungsfähige Anschrift for the Impressum, required by § 5 DDG. A P.O. box
   * does not satisfy it, so this must be a real street address.
   *
   * It lives here rather than inline in the page because the Impressum cites it
   * twice (§ 5 DDG and § 18 Abs. 2 MStV) and two copies of an address is one
   * opportunity to correct it in one place.
   *
   * ONE VALUE LEFT TO FILL: `street`. The page renders a visible warning while
   * it still contains the placeholder, so this cannot ship half-done by
   * accident.
   */
  address: {
    street: "Krautgärten 20",
    postalCode: "82057",
    city: "Icking",
    country: "Deutschland",
  },

  /**
   * Named on the privacy page. A US provider means the privacy page must
   * disclose a third-country transfer and the safeguard relied on, so changing
   * this value means re-reading that page rather than only editing this line.
   */
  host: {
    name: "Vercel Inc.",
    country: "USA",
  },
} as const;

/** True while the Impressum still carries placeholder text. */
export const addressIncomplete = site.address.street.startsWith("[");
