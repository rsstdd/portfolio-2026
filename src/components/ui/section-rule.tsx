/**
 * The datum tick: a hairline with a short orange mark at its origin, after the
 * reference line on a measurement drawing. This is the design system's most
 * frequent accent appearance, and on most pages it is the only one.
 *
 * The tick itself comes from `.rule-datum` in design-tokens.css rather than
 * from utilities here, because that file is shared with the Astro photography
 * site and the motif should have exactly one implementation. This component is
 * a wrapper, not a second definition.
 *
 * `index` renders a mono section number when a page genuinely has an order.
 * Pages without a meaningful sequence omit it rather than number arbitrarily.
 */
export function SectionRule({
  index = "",
  label = "",
  className = "",
}: {
  index?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`rule-datum ${className}`}>
      {label ? (
        <p className="font-mono text-overline uppercase text-muted">
          {index ? `${index} — ` : null}
          {label}
        </p>
      ) : null}
    </div>
  );
}
