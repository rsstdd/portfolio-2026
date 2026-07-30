import type { Metadata } from "next";
import { SectionRule } from "@/components/ui/section-rule";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Colophon",
  description:
    "How this site is built: Next.js 16, static generation, MDX in git, no client JavaScript.",
};

const stack = [
  [
    "Next.js 16, App Router",
    "Static generation covers every route. Dynamic rendering requires a stated reason, and no route currently has one.",
  ],
  [
    "React 19 with the compiler",
    "Manual memoization is absent by default. React Compiler handles the common cases; profiling determines whether an explicit escape hatch is needed.",
  ],
  [
    "Zero client components",
    "Every file is a Server Component. Each candidate island was rejected with a reason recorded in the file rather than in a commit message.",
  ],
  [
    "MDX parsed by about a hundred owned lines",
    "gray-matter plus Zod. A content library would save those lines and cost understanding of the build.",
  ],
  [
    "Biome, plus ESLint for the compiler rules only",
    "One fast formatter and linter. ESLint survives solely for the React Compiler diagnostics, which Biome does not implement.",
  ],
  [
    "No database, no CMS, no analytics",
    "Content is files in git, reviewed by diff. Nothing is collected from visitors.",
  ],
];

/**
 * Contrast ratios computed against the palette, not eyeballed. Reproduced here
 * because a design system that claims accessibility should show the arithmetic.
 */
const contrast = [
  ["Ink on paper", "14.70", "AAA"],
  ["Muted on paper", "5.17", "AA"],
  ["Paper on ink (button)", "14.70", "AA"],
  ["Orange on paper (UI, large text)", "3.63", "AA large"],
  ["Orange body text on paper", "5.24", "AA"],
];

const copy = {
  datum:
    "Datum takes its name from the fixed reference plane used in aircraft design to calculate structural coordinates, measurements, and weight balance. It serves the same role here: the system's zero point. The visual language uses warm paper tones, restrained monochrome surfaces, a single instrument color, and the IBM Plex family for display, body, and data.Color relationships were calculated for consistency and contrast rather than selected by eye.",
};

export default function ColophonPage() {
  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 pb-8 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <p className="font-mono text-overline uppercase text-muted">Colophon</p>
        <h1 className="mt-2 font-display text-display font-semibold text-balance">
          How this site is built
        </h1>
        <p className="mt-4 text-body-lg text-muted">
          What the site is built from, and why each piece is there.
        </p>
      </header>

      <section className="mt-16">
        <SectionRule index="01" label="Stack" />
        <dl className="mt-8 max-w-prose">
          {stack.map(([name, why]) => (
            <div key={name} className="border-b border-line py-4">
              <dt className="font-sans text-h3 font-semibold">{name}</dt>
              <dd className="mt-1 text-muted">{why}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24">
        <SectionRule index="02" label="Datum" />
        <div className="mt-8 max-w-prose">
          <p className="text-muted">{copy.datum}</p>

          <table className="mt-8 w-full">
            <thead>
              <tr>
                <th>Pair</th>
                <th className="text-right">Ratio</th>
                <th className="text-right">Level</th>
              </tr>
            </thead>
            <tbody>
              {contrast.map(([pair, ratio, level]) => (
                <tr key={pair}>
                  <td>{pair}</td>
                  <td className="text-right font-mono tabular-nums">{ratio}</td>
                  <td className="text-right font-mono">{level}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="data-plate mt-4">
            Computed 2026-07-29 against opaque backgrounds · WCAG 2.2
          </p>
        </div>
      </section>

      <section className="mt-24">
        <SectionRule index="03" label="Measurements" />
        <div className="mt-8 max-w-prose">
          <p className="text-muted">
            Not yet measured. These will carry real numbers once the site is deployed, and they will
            say so plainly if any of them disappoint.
          </p>
          <p className="data-plate mt-6">
            JavaScript shipped: not yet measured · Largest route: not yet measured · Lighthouse: not
            yet measured
          </p>
        </div>
      </section>

      <section className="mt-24">
        <SectionRule index="04" label="Source" />
        <div className="mt-8 max-w-prose">
          <p className="text-muted">
            The repository is public, because a site that claims engineering discipline should let
            people read the code. Fonts are self-hosted and there are no third-party requests, so
            nothing about a visit is shared with anyone.
          </p>
          <p className="mt-6">
            <a
              href={`${site.github}/portfolio`}
              className="font-mono text-overline uppercase text-accent-text"
            >
              View the source
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
