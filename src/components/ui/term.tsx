import type { CSSProperties, ReactNode } from "react";

/**
 * A defined term with a note, built on the native Popover API.
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
