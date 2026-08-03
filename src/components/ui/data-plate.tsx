import type { ReactNode } from "react";

export function DataPlate({ children }: { children: ReactNode }) {
 // 'div' to allow nesting of other block elements
 return <div className="data-plate max-w-[640px] mt-2">{children}</div>;
}
