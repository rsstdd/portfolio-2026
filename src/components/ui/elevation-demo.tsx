export function ElevationDemo() {
 return (
  <div className="elev flex gap-6 flex-wrap">
   <div className="e1 w-40 h-25 bg-[var(--surface)] grid place-items-center text-sm text-[var(--text-muted)] border border-[var(--border-c)]">
    1 · border
   </div>
   <div className="e2 w-40 h-25 bg-[var(--surface)] grid place-items-center text-sm text-[var(--text-muted)] border border-[var(--border-c)] shadow-md">
    2 · dropdown
   </div>
   <div className="e3 w-40 h-25 bg-[var(--surface)] grid place-items-center text-sm text-[var(--text-muted)] shadow-xl">
    3 · modal
   </div>
  </div>
 );
}
