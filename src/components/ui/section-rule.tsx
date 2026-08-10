/**
 * The datum tick: a hairline with a short orange mark at its origin.
 *
 * `index` renders a mono section number when a page genuinely has an order.
 * Pages without a meaningful sequence omit it rather than number arbitrarily.
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
        <p
          className="mono text-overline overline uppercase text-muted"
        >
          {index ? `${index} — ` : null}
          {label}
        </p>
      ) : null}
    </div>
  );
}
