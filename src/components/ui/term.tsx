import type { CSSProperties, ReactNode } from "react";

/**
 * A defined term with a note, built on the native Popover API.
 *
 * Still no client component. This lands on the colophon, the page asserting
 * that every file is a Server Component, so an island here would refute the
 * claim it sits under. The browser supplies the behaviour instead.
 *
 * Why this replaced a CSS hover tooltip: WCAG 2.2 SC 1.4.13 requires content
 * shown on hover to be dismissible without moving pointer or focus, and exempts
 * only content that does not obscure anything. This note is positioned over the
 * heading, so it obscures, so the exemption does not apply and Escape is
 * required. Escape needs a key handler, which needs an island, unless the
 * browser provides it. `popover` provides it: Escape and click-outside light
 * dismiss come free, and focus returns to the trigger on close.
 *
 * What that trades away is hover. For a definition that is close to no loss,
 * because hover has no discoverability affordance of its own, does not exist on
 * touch at all, and a definition is content a reader opts into rather than
 * something to reveal by accident. The dotted underline reads as "there is more
 * here" either way.
 *
 * Positioning note: a popover lives in the top layer, which escapes the
 * containing block of every ancestor, so ordinary absolute positioning does
 * nothing. Placement uses CSS anchor positioning, and each instance carries its
 * own anchor name derived from `id` so that two terms on one page cannot
 * collide. globals.css carries an `@supports` fallback for engines without it.
 */
export function Term({
 children,
 note,
 id,
}: {
 /** The term itself, rendered as the trigger. */
 children: ReactNode;
 /** The definition. Kept short, because a popover is not an essay. */
 note: ReactNode;
 /** Unique per page. Wires the trigger to its note and names the anchor. */
 id: string;
}) {
 const anchor = `--anchor-${id}`;

 return (
  <>
   <button
    type="button"
    className="term-trigger"
    popoverTarget={id}
    aria-describedby={id}
    // anchor-name is not yet in React's CSSProperties, hence the cast.
    style={{ anchorName: anchor } as CSSProperties}
   >
    {children}
   </button>
   <span
    id={id}
    role="note"
    popover="auto"
    /*
     * tabindex allows a keyboard or screen-reader user to move into the
     * note once it opens. Escape closes it and the browser returns focus to
     * the trigger without any code here.
     */
    tabIndex={-1}
    className="term-note"
    style={{ positionAnchor: anchor } as CSSProperties}
   >
    {note}
   </span>
  </>
 );
}
