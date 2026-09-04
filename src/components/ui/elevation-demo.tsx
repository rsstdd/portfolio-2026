export function ElevationDemo() {
 return (
  <div className="flex flex-wrap gap-6">
   <div className="grid h-25 w-40 place-items-center border border-line bg-surface small text-muted">
    1 · border
   </div>
   <div className="grid h-25 w-40 place-items-center border border-line bg-surface shadow-md small text-muted">
    2 · dropdown
   </div>
   <div className="grid h-25 w-40 place-items-center bg-surface shadow-lg small text-muted">
    3 · modal
   </div>
  </div>
 );
}
