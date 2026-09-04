interface SwatchItem {
 name: string;
 token: string;
}

interface SwatchGridProps {
 items: SwatchItem[];
}

export function SwatchGrid({ items = [] }: SwatchGridProps) {
 return (
  <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
   {items.map((swatch) => (
    <div key={swatch.name} className="border border-line bg-surface">
     <div className="h-16" style={{ backgroundColor: swatch.token }} />
     <div className="p-3">
      <b className="block small font-medium">{swatch.name}</b>
      <span className="mono caption text-muted">{swatch.token}</span>
     </div>
    </div>
   ))}
  </div>
 );
}
