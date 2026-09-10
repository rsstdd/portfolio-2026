/**
 * The three marks on the theme control: light, dark, and follow-the-system.
 *
 * `DESIGN_SYSTEM.md` section 6 used to say the site shipped exactly one icon
 * and that a second would turn a considered exception into an inconsistent set.
 * That rule has been rewritten rather than quietly broken, and it already
 * specified what a set must look like if one were ever justified: Lucide
 * geometry, 20px, outlined, never mixed with filled. These follow it exactly,
 * so the set arrives inside a shape the design system had already chosen.
 *
 * Hand-authored rather than pulled from `lucide-react`. Three glyphs do not
 * justify a dependency, and this is the same reasoning that keeps `GitHubMark`
 * inline: no extra request, no runtime, and Server Components like everything
 * else here.
 *
 * Stroked with `currentColor` and `fill="none"`, which is the difference from
 * `GitHubMark`. That one is a filled brand mark and remains the single filled
 * exception; these three are the outlined set, and section 6 requires the two
 * never mix within a set.
 *
 * `aria-hidden` on all three, because each is paired with a visually hidden
 * word that names its radio. A `<title>` here would announce twice.
 */

/**
 * Shared geometry, so three glyphs cannot drift apart on stroke or grid.
 *
 * `aria-hidden` is deliberately not in here. Biome's `noSvgWithoutTitle` reads
 * the JSX statically and cannot see an attribute arriving through a spread, so
 * hiding it in this object trades a real lint guarantee for a tidier literal.
 * It is written out on each element instead, which is also what `GitHubMark`
 * does.
 */
const grid = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function SunMark({ className }: { className?: string }) {
  return (
    <svg {...grid} aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="m6.34 17.66-1.41 1.41" />
    </svg>
  );
}

export function MoonMark({ className }: { className?: string }) {
  return (
    <svg {...grid} aria-hidden="true" focusable="false" className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/**
 * Follow the system: a circle with its left half filled.
 *
 * The conventional "auto" glyph, and the one place a fill appears in the
 * outlined set. It is half of a single shape rather than a second icon style,
 * which is the distinction section 6's never-mix rule is drawing.
 */
export function SystemMark({ className }: { className?: string }) {
  return (
    <svg {...grid} aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
