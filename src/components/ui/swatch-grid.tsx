interface SwatchItem {
 name: string;
 token: string;
}

interface SwatchGridProps {
 items: SwatchItem[];
}

export function SwatchGrid({ items = [] }: SwatchGridProps) {
 return (
  <div className="swatches grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 mt-6">
   {items.map((swatch) => (
    <div key={swatch.name} className="swatch border border-[var(--border-c)] bg-[var(--surface)]">
     <div className="chip h-16" style={{ backgroundColor: swatch.token }} />
     <div className="meta p-3">
      <b className="block text-sm font-medium">{swatch.name}</b>
      <span className="caption">{swatch.token}</span>
     </div>
    </div>
   ))}
  </div>
 );
}
