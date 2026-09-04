import type { Metadata } from "next";
import type { ComponentProps } from "react";
import { Mdx } from "@/components/content/mdx";
import { getDesignSystem } from "@/lib/content";
import {
 SectionRule,
 SwatchGrid,
 DataPlate,
 ControlsDemo,
 ElevationDemo,
 DataDemo
} from "@/components/ui";

const palette = [
 { name: 'paper', token: 'var(--paper, #f5f2ec)' },
 { name: 'paper-raised', token: 'var(--paper-raised, #fbf9f5)' },
 { name: 'paper-sunken', token: 'var(--paper-sunken, #ebe6da)' },
 { name: 'line', token: 'var(--line, #d9d2c2)' },
 { name: 'ink', token: 'var(--ink, #221f1a)' },
 { name: 'ink-soft', token: 'var(--ink-soft, #38342c)' },
 { name: 'ink-muted', token: 'var(--ink-muted, #6b655a)' },
 { name: 'orange', token: 'var(--orange, #dd4e12)' },
 { name: 'orange-body', token: 'var(--orange-text, #b13f0d)' },
 { name: 'success', token: 'var(--success, #3e6b3a)' },
 { name: 'error', token: 'var(--error, #a02c2c)' },
];

const aircrafts = [
 { model: 'PA-28-181', hp: 180, mtow: '1,157', range: 522 },
 { model: 'C172S', hp: 180, mtow: '1,157', range: 640 },
 { model: 'SR22', hp: 310, mtow: '1,633', range: 1169 },
];

export function generateMetadata(): Metadata {
 const { title, description } = getDesignSystem();
 return {
  title: title,
  description: description,
  openGraph: {
   title: title,
   description: description,
   type: "profile",
  },
 };
}

export default function DesignSystemPage() {
 const { title, overline, updated, body, description } = getDesignSystem();

 // Create local wrappers that inject the data
 const pageComponents = {
  ControlsDemo,
  DataPlate,
  ElevationDemo,
  SectionRule,
  SwatchGrid: (props: ComponentProps<typeof SwatchGrid>) => (
   <SwatchGrid {...props} items={palette} />
  ),
  DataDemo: (props: ComponentProps<typeof DataDemo>) => (
   <DataDemo {...props} rows={aircrafts} />
  ),
 };

 return (
  <main id="main" className="relative mx-auto max-w-content px-5 pt-12 pb-24 md:px-8 md:pt-16 lg:px-10">
   <header>
    <p className="datum-overline text-muted">{overline}</p>
    <h1 className="mt-3 display">{title}</h1>
    <p className="measure mt-4 body-lg text-muted">{description}</p>
   </header>

   <article className="mt-16">
    {/*
     * `max-w-none` releases the 65ch cap .prose-datum applies. That cap is the
     * measure for running text, and the specimens below are grids, a table, and
     * a swatch wall rather than text. The prose inside the MDX keeps the cap by
     * wearing `.measure` itself.
     */}
    <Mdx source={body} components={pageComponents} className="max-w-none" />
   </article>

   <p className="data-plate mt-16 max-w-prose text-muted">
    Updated {updated.toISOString().slice(0, 10)}
   </p>
  </main>
 );
}
