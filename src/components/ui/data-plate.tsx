import type { ReactNode } from "react";

export function DataPlate({ children }: { children: ReactNode }) {
 // 'div' to allow nesting of other block elements
 return <div className="data-plate mt-2 max-w-prose text-muted">{children}</div>;
}
