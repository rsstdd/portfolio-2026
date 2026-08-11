import type { ReactNode } from "react";

export function DataPlate({ children }: { children: ReactNode }) {
 // 'div' to allow nesting of other block elements
 return <div className="data-plate max-w-160 mt-2">{children}</div>;
}
