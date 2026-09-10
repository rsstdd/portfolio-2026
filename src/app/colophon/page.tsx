import { DataPlate, GitHubMark, SectionRule, Term } from "@/components/ui";
import { getContrastTable } from "@/lib/contrast";
import lighthouse from "@/lib/lighthouse.json";
import measurements from "@/lib/measurements.json";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Colophon",
  description:
    "How this site is built: Next.js 16, static generation, MDX in git, zero client components.",
  path: "/colophon",
  image: "/images/og/colophon.png",
});

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
    "A persisted theme control",
    "System, light, and dark remain three radio inputs read by CSS. A small inline script stores an explicit choice in localStorage and restores it before first paint, without adding a client component.",
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

const datumCopy =
  "Datum takes its name from the fixed reference plane used in aircraft design to calculate structural coordinates, measurements, and weight balance. It serves the same role here: the system's zero point. The visual language uses warm paper tones, restrained monochrome surfaces, a single instrument color, and the IBM Plex family for display, body, and data. Color relationships were calculated for consistency and contrast rather than selected by eye.";

/** Lighthouse's category keys are not display copy. `seo` is not a word. */
const CATEGORY_LABELS: Record<string, string> = {
  performance: "performance",
  accessibility: "accessibility",
  "best-practices": "best practices",
  seo: "SEO",
};

/** "a, b and c", because a bare join reads as a stack trace in prose. */
function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Capitalises a sentence opener without disturbing an initialism like SEO. */
function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ColophonPage() {
  /*
   * Computed from design-tokens.css at build time rather than transcribed.
   * These five sat here as string literals, and all five were correct, which is
   * the state that makes a published claim dangerous: right today, unmaintained,
   * and silently wrong after the next palette edit. `buildTable` also throws
   * when a pair drops below the level it claims, so that edit fails the build
   * instead of shipping a page that states arithmetic it no longer performs.
   */
  const contrast = getContrastTable();

  /*
   * Lighthouse split into what it measured reliably and what it did not.
   *
   * Accessibility and best practices are deterministic audits of the document
   * and returned the same score on every run. Performance is a simulation whose
   * result moves with load on the measuring machine: three runs against one URL
   * spanned 66 to 92, and earlier sessions returned 99 and 80. Quoting a number
   * out of that would describe a laptop rather than the site, so the page prints
   * the range and says so instead. Computed rather than written down, so a
   * future run where everything agrees needs no edit here.
   */
  const scores = Object.entries(lighthouse.categories).map(([key, value]) => ({
    label: CATEGORY_LABELS[key] ?? key,
    ...value,
  }));
  const stable = scores.filter((s) => s.min === s.max);
  const unstable = scores.filter((s) => s.min !== s.max);

  /*
   * Built as strings rather than assembled in JSX. The first version
   * interleaved `{" "}` around conditional fragments and rendered "…rsstdd.com/
   * , performance and seo are not quoted": a space before a comma, and a
   * sentence starting lowercase. Prose is easier to get right as prose.
   */
  const measured =
    stable.length > 0
      ? `Lighthouse scores ${formatList(stable.map((s) => `${s.label} ${s.min}`))} against ` +
        `${lighthouse.url}, identically in every one of ${lighthouse.runs} runs.`
      : "";

  const withheld =
    unstable.length > 0
      ? `${sentenceCase(formatList(unstable.map((s) => s.label)))} ` +
        `${unstable.length === 1 ? "is" : "are"} not quoted, because ` +
        `${unstable.length === 1 ? "it ranged" : "they ranged"} ` +
        `${formatList(unstable.map((s) => `${s.min} to ${s.max}`))} across those same runs.`
      : "";

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 pb-8 md:px-8 md:pt-16 lg:px-10">
      <header>
        <p className="text-overline uppercase text-muted">
          <Term
            id="colophon-definition"
            note={
              <>
                <i lang="grc-Latn" className="mono not-italic">
                  kolophōn
                </i>
                , from the Greek for <i>finishing stroke</i>. A <dfn>colophon</dfn> is the note
                traditionally placed at the end of a book describing how it was made. This page is
                the digital equivalent: a record of the technologies, design decisions, and
                engineering behind this site. That is why it is not titled{" "}
                <span className="whitespace-nowrap">&ldquo;About this site.&rdquo;</span>
              </>
            }
          >
            Colophon
          </Term>
        </p>
        <h1 className="mt-3 display">How this site is built</h1>
        <p className="measure mt-4 body-lg text-muted">
          What the site is built from, and why each piece is there.
        </p>
      </header>

      <section className="mt-16">
        <SectionRule index="01" label="Stack" as="h2" />
        <dl className="mt-8 max-w-prose">
          {stack.map(([name, why]) => (
            <div key={name} className="border-b border-line py-4">
              <dt className="h3 font-semibold">{name}</dt>
              <dd className="measure mt-1 text-muted">{why}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24">
        <SectionRule index="02" label="Datum" as="h2" />
        <div className="mt-8 max-w-prose">
          <p className="measure text-muted">{datumCopy}</p>

          <table className="mt-8 w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line pb-3 pr-4 text-left text-overline uppercase text-muted">
                  Pair
                </th>
                <th className="border-b border-line pb-3 pr-4 text-right text-overline uppercase text-muted">
                  Ratio
                </th>
                <th className="border-b border-line pb-3 pr-4 text-right text-overline uppercase text-muted">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {contrast.map((row) => (
                <tr key={row.label}>
                  <td className="py-2">{row.label}</td>
                  <td className="py-2 text-right mono tabular-nums">{row.ratio}</td>
                  <td className="py-2 text-right mono">{row.level}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <DataPlate>
            Computed at build from design-tokens.css against opaque backgrounds · WCAG 2.1
          </DataPlate>

          <p className="mt-6">
            <a href="/design" className="link-standalone">
              View the design system
            </a>
          </p>
        </div>
      </section>

      <section className="mt-24">
        <SectionRule index="03" label="Measurements" as="h2" />
        <div className="mt-8 max-w-prose">
          <p className="measure text-muted">
            The home page ships {measurements.homeScriptTransferKb}KB of compressed JavaScript,
            which the browser expands to {measurements.homeScriptParsedKb}KB to parse. The measured
            bundle is Next.js runtime rather than application code. A small inline theme script is
            embedded in the HTML and excluded from these Resource Timing figures. Zero client
            components means nothing here adds a hydrated client island; it does not mean nothing is
            sent, because the App Router loads its client runtime whether a page uses it or not.
          </p>
          <p className="measure mt-4 text-muted">
            The figures come from <code>scripts/measure-payload.mjs</code>, which loads every route
            in the sitemap and reads the Resource Timing API rather than adding up chunk files,
            because that measures what a visitor actually downloads. The numbers are a budget as
            well as a record: the build fails if the payload grows more than five per cent past
            them.
          </p>
          <p className="measure mt-4 text-muted">
            {measured} {withheld} That spread measures how busy the machine running Lighthouse was
            rather than how quickly the site loads, and picking a number out of it would be
            publishing a property of a laptop. The figures above are deterministic, which is why
            they carry a budget and this does not.
          </p>
          <DataPlate>
            JavaScript {measurements.homeScriptTransferKb}KB compressed,{" "}
            {measurements.homeScriptParsedKb}KB parsed · Largest route {measurements.largestRoute}{" "}
            at {measurements.largestRouteTransferKb}KB · {measurements.routes} routes measured{" "}
            {measurements.measuredAt} · Lighthouse {lighthouse.runs} runs {lighthouse.measuredAt},{" "}
            {lighthouse.profile}
          </DataPlate>
        </div>
      </section>

      <section className="mt-24">
        <SectionRule index="04" label="Source" as="h2" />
        <div className="mt-8 max-w-prose">
          <p className="measure text-muted">
            The repository is public. Fonts are self-hosted, and there are no third-party requests,
            so nothing about a visit is shared with anyone.
          </p>
          <p className="mt-6">
            {/*
              `--no-flag` because the mark is this link's leading element. The
              datum tick and the GitHub mark both occupy that slot, and a link
              wearing both reads as two design languages arguing.
            */}
            <a href={`${site.github}/portfolio-2026`} className="link-standalone--no-flag gap-1.5">
              <GitHubMark />
              View the source
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
