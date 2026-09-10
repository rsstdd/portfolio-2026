interface SwatchItem {
  name: string;
  /** A CSS colour for the chip, normally `var(--token)`. */
  token: string;
  /** The resolved value, shown as the caption. */
  value: string;
}

interface SwatchGridProps {
  items: SwatchItem[];
}

/**
 * The palette wall.
 *
 * The caption used to print `token` verbatim, which meant the page showed
 * readers the string `var(--paper, #f5f2ec)`: a CSS expression, including a
 * fallback that never applies because the token is always defined. Splitting
 * the chip colour from the printed value lets the chip stay a live token
 * reference while the caption shows the hex somebody would actually copy.
 */
export function SwatchGrid({ items = [] }: SwatchGridProps) {
  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
      {items.map((swatch) => (
        <div key={swatch.name} className="border border-line bg-surface">
          <div className="h-16" style={{ backgroundColor: swatch.token }} />
          <div className="p-3">
            <b className="block small font-medium">{swatch.name}</b>
            <span className="mono caption tabular-nums text-muted">{swatch.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
