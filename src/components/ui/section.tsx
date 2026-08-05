import type { ReactNode } from "react";

interface SectionProps {
 index?: string; // Optional index to align with SectionRule
 overline: string;
 title: string;
 children: ReactNode;
}

export function Section({ index, overline, title, children }: SectionProps) {
 return (
  <section className="rule rule--datum mt-16 pt-6">
   {/* Aligning the overline styling with SectionRule */}
   <p className="font-mono text-overline overline uppercase text-muted">
    {index ? `${index} — ` : null}
    {overline}
   </p>
   <h2 className="h2 mt-2">{title}</h2>
   {children}
  </section>
 );
}
