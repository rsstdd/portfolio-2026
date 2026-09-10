import type { Metadata } from "next";
import type { ComponentProps } from "react";
import { Mdx } from "@/components/content/mdx";
import {
  ControlsDemo,
  DataDemo,
  DataPlate,
  ElevationDemo,
  SectionRule,
  SwatchGrid,
} from "@/components/ui";
import { getDesignSystem } from "@/lib/content";
import { getPalette } from "@/lib/contrast";
import { pageMetadata } from "@/lib/metadata";

/**
 * The primitives this page displays, and the label each one wears.
 *
 * Only names here. The values are read from design-tokens.css at build time by
 * `getPalette`, because this list used to carry its own copy of every hex as a
 * `var(--paper, #f5f2ec)` fallback. A fallback on a token that is always defined
 * never resolves, so those eleven values were unreachable: they could have gone
 * stale without a single pixel on the page changing, which is the worst version
 * of the drift the colophon's contrast table had.
 *
 * These are primitives rather than semantic tokens, so they are the same in both
 * themes. `--bg` and `--text` do change, and belong to the theme documentation
 * rather than to a palette wall.
 */
const SWATCHES = [
  { name: "paper", token: "paper" },
  { name: "paper-raised", token: "paper-raised" },
  { name: "paper-sunken", token: "paper-sunken" },
  { name: "line", token: "line" },
  { name: "ink", token: "ink" },
  { name: "ink-soft", token: "ink-soft" },
  { name: "ink-muted", token: "ink-muted" },
  { name: "orange", token: "orange" },
  { name: "orange-body", token: "orange-text" },
  { name: "success", token: "success" },
  { name: "error", token: "error" },
];

const aircrafts = [
  { model: "PA-28-181", hp: 180, mtow: "1,157", range: 522 },
  { model: "C172S", hp: 180, mtow: "1,157", range: 640 },
  { model: "SR22", hp: 310, mtow: "1,633", range: 1169 },
];

export function generateMetadata(): Metadata {
  const { title, description } = getDesignSystem();
  return pageMetadata({
    title,
    description,
    path: "/design",
  });
}

export default function DesignSystemPage() {
  const { title, overline, updated, body, description } = getDesignSystem();

  /*
   * Resolved from the token file, and it throws rather than rendering a blank
   * chip: a design system page showing an empty swatch for a colour it claims
   * to define is worse than a build that stops, which is the same hard-stop
   * rule the content schemas follow.
   */
  const tokens = getPalette();
  const palette = SWATCHES.map(({ name, token }) => {
    const value = tokens.get(token);
    if (!value) {
      throw new Error(
        `/design lists the swatch "${name}", but --${token} is not a literal hex primitive in ` +
          "design-tokens.css. Renaming a primitive means updating SWATCHES in " +
          "src/app/design/page.tsx.",
      );
    }
    return { name, token: `var(--${token})`, value };
  });

  // Create local wrappers that inject the data
  const pageComponents = {
    ControlsDemo,
    DataPlate,
    ElevationDemo,
    SectionRule,
    SwatchGrid: (props: ComponentProps<typeof SwatchGrid>) => (
      <SwatchGrid {...props} items={palette} />
    ),
    DataDemo: (props: ComponentProps<typeof DataDemo>) => <DataDemo {...props} rows={aircrafts} />,
  };

  return (
    <main
      id="main"
      className="relative mx-auto max-w-content px-5 pt-12 pb-24 md:px-8 md:pt-16 lg:px-10"
    >
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

      {/*
        Omitted rather than guessed when the frontmatter carries no date. The
        loader used to substitute `Date.now()` here, so this line claimed the
        design system was revised on whatever day the site last built.
      */}
      {updated ? (
        <p className="data-plate mt-16 max-w-prose text-muted">
          Updated{" "}
          <time dateTime={updated.toISOString().slice(0, 10)}>
            {updated.toISOString().slice(0, 10)}
          </time>
        </p>
      ) : null}
    </main>
  );
}
