interface IAircraftRow {
 model: string;
 hp: number;
 mtow: string;
 range: number;
}

interface IDataDemoProps {
 rows: IAircraftRow[];
}

export function DataDemo({ rows = [] }: IDataDemoProps) {
 return (
  <>
   <div className="flex flex-wrap items-start gap-8">
    <div className="card clickable bg-[var(--surface)] border border-[var(--border-c)] p-6 max-w-xs transition-transform duration-120 hover:-translate-y-0.5 hover:shadow-md">
     <p className="overline">Project</p>
     <p className="h3 mt-1.5">plane-scraper</p>
     <p className="small mt-2 text-[var(--text-muted)]">
      Concurrent async pipeline in Rust with backpressure and graceful shutdown.
     </p>
    </div>

    <figure className="max-w-xs">
     <div className="ph aspect-[3/2] bg-[var(--well)] grid place-items-center text-[var(--text-muted)] text-sm border border-[var(--border-c)]">
      photograph (no radius, ever)
     </div>
     <figcaption className="data-plate mt-2">
      Isar, München · X-T5 · 23mm · f/8 · 1/250 · ISO 160 · 2026-07-29
     </figcaption>
    </figure>
   </div>

   <table className="w-full max-w-[640px] text-[0.9375rem] [font-variant-numeric:tabular-nums] border-collapse mt-8">
    <thead>
     <tr>
      <th scope="col" className="text-left font-semibold text-[0.8125rem] font-mono tracking-wider uppercase text-[var(--text-muted)] p-3 border-b border-[var(--border-c)]">Model</th>
      <th scope="col" className="text-right font-semibold text-[0.8125rem] font-mono tracking-wider uppercase text-[var(--text-muted)] p-3 border-b border-[var(--border-c)]">HP</th>
      <th scope="col" className="text-right font-semibold text-[0.8125rem] font-mono tracking-wider uppercase text-[var(--text-muted)] p-3 border-b border-[var(--border-c)]">MTOW kg</th>
      <th scope="col" className="text-right font-semibold text-[0.8125rem] font-mono tracking-wider uppercase text-[var(--text-muted)] p-3 border-b border-[var(--border-c)]">Range nm</th>
     </tr>
    </thead>
    <tbody>
     {rows.map((row) => (
      <tr key={row.model} className="hover:bg-[var(--well)]">
       <td className="p-3 border-b border-[var(--border-c)]">{row.model}</td>
       <td className="num text-right font-mono text-[0.875rem] [font-feature-settings:'zero'] p-3 border-b border-[var(--border-c)]">{row.hp}</td>
       <td className="num text-right font-mono text-[0.875rem] [font-feature-settings:'zero'] p-3 border-b border-[var(--border-c)]">{row.mtow}</td>
       <td className="num text-right font-mono text-[0.875rem] [font-feature-settings:'zero'] p-3 border-b border-[var(--border-c)]">{row.range}</td>
      </tr>
     ))}
    </tbody>
   </table>
  </>
 );
}
