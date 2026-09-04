/**
 * The GitHub mark, for links that point at source.
 *
 * This is the only icon on the site, by decision rather than by accident, and
 * `DESIGN_SYSTEM.md` §6 records it as the single sanctioned exception to the
 * iconography rule. It is a filled brand mark in a system that otherwise
 * specifies outlined stroke glyphs, so it earns its place by being the one
 * symbol a reader recognizes faster than the word next to it. Adding a second
 * icon would turn a deliberate exception into an inconsistent icon set, which
 * is the state the rule exists to prevent.
 *
 * Inline SVG rather than an icon font or a sprite sheet, because one icon does
 * not justify either, and inline markup costs no extra request and no runtime.
 * A Server Component like everything else here: it renders to static markup.
 *
 * Sized in `em` so it tracks whatever type size the link sits in, and filled
 * with `currentColor` so it inherits both the link colour and the hover state
 * without a second rule to keep in sync.
 *
 * Where it accompanies a standalone link, that link uses
 * `link-standalone--no-flag` rather than `link-standalone`: the datum tick and
 * this mark are both leading marks, and a link wearing both reads as an
 * unresolved argument between two design languages.
 *
 * `aria-hidden` because every current caller pairs the mark with a visible text
 * label. A caller that wants an icon-only link must supply its own accessible
 * name, since a lone unlabelled mark would be an unnamed link.
 */
export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
