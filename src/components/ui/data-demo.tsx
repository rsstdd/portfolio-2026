interface IAircraftRow {
 model: string;
 hp: number;
 mtow: string;
 range: number;
}

interface IDataDemoProps {
 rows: IAircraftRow[];
}

/**
 * The card, figure, and table specimens on the design page.
 *
 * Every class here now names a Datum token or utility rather than reaching
 * into `var(--…)` by hand. A design system's own showcase is the one page
 * where a hardcoded value is least defensible: it is the page that claims the
 * tokens are real.
 */
export function DataDemo({ rows = [] }: IDataDemoProps) {
 return (
  <>
   <div className="flex flex-wrap items-start gap-8">
    <div className="max-w-xs border border-line bg-surface p-6 transition-[transform,box-shadow] duration-(--duration-fast) ease-(--ease-standard) hover:-translate-y-0.5 hover:shadow-md">
     <p className="text-overline uppercase text-muted">Project</p>
     <p className="h3 mt-1.5">plane-scraper</p>
     <p className="mt-2 small text-muted">
      Concurrent async pipeline in Rust with backpressure and graceful shutdown.
     </p>
    </div>

    <figure className="max-w-xs">
     <div className="grid aspect-[3/2] place-items-center border border-line bg-well small text-muted">
      photograph (no radius, ever)
     </div>
     {/* The data-plate caption pattern from DESIGN_SYSTEM.md 4.3 and 2.5. */}
     <figcaption className="data-plate mt-2 text-muted">
      Isar, München · X-T5 · 23mm · f/8 · 1/250 · ISO 160 · 2026-07-29
     </figcaption>
    </figure>
   </div>

   <table className="mt-8 w-full max-w-[640px] border-collapse tabular-nums">
    <thead>
     <tr>
      <th scope="col" className="border-b border-line p-3 text-left text-overline uppercase text-muted">Model</th>
      <th scope="col" className="border-b border-line p-3 text-right text-overline uppercase text-muted">HP</th>
      <th scope="col" className="border-b border-line p-3 text-right text-overline uppercase text-muted">MTOW kg</th>
      <th scope="col" className="border-b border-line p-3 text-right text-overline uppercase text-muted">Range nm</th>
     </tr>
    </thead>
    <tbody>
     {rows.map((row) => (
      <tr key={row.model} className="transition-colors duration-(--duration-fast) hover:bg-well">
       <td className="border-b border-line p-3">{row.model}</td>
       <td className="border-b border-line p-3 text-right mono">{row.hp}</td>
       <td className="border-b border-line p-3 text-right mono">{row.mtow}</td>
       <td className="border-b border-line p-3 text-right mono">{row.range}</td>
      </tr>
     ))}
    </tbody>
   </table>
  </>
 );
}
