/**
 * The datum tick: a hairline with a short orange mark at its origin.
 *
 * `index` renders a mono section number when a page genuinely has an order.
 * Pages without a meaningful sequence omit it rather than number arbitrarily.
 *
 * `as` chooses the element the label renders as. It defaults to `p` because a
 * section rule is often just a divider with a caption, but a rule that
 * introduces a real section of the page should be a heading, and passing
 * `as="h2"` is what keeps the document outline continuous.
 *
 * That prop used to be destructured and then never used, so every rule rendered
 * as a `p` no matter what the caller asked for. The home page therefore went
 * from the `h1` straight to the project cards' `h3`, which Lighthouse flags as
 * a heading-order violation and a screen-reader user hears as a missing level.
 * The label keeps `.text-overline` in either case, so a heading here looks
 * exactly like the paragraph it replaces.
 */
export function SectionRule({
  index = "",
  label = "",
  as: Tag = "p",
  className = "",
}: {
  index?: string;
  label?: string;
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  return (
    <div className={`rule rule--datum ${className}`}>
      {label ? (
        <Tag className="text-overline uppercase text-muted">
          {index ? `${index} — ` : null}
          {label}
        </Tag>
      ) : null}
    </div>
  );
}
