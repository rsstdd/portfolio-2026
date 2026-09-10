import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";

/**
 * Contrast ratios, computed from the palette rather than transcribed from it.
 *
 * The colophon says these are "computed against the palette, not eyeballed",
 * and until now that was true only of how the numbers were first obtained. They
 * sat on the page as five string literals. I checked all five and every one was
 * correct, which is exactly the state that makes a claim dangerous: it looks
 * maintained because it is currently right, and the next palette edit turns a
 * public page into arithmetic it no longer performs.
 *
 * So the page reads the token file at build time and does the sums. There is no
 * committed number left to drift, and no second copy to keep in step.
 *
 * Server-only. It reads the filesystem, the same way src/lib/content/index.ts
 * does, and every consumer is a Server Component.
 */

const TOKENS = join(process.cwd(), "src", "app", "styles", "design-tokens.css");

/** WCAG 2.1 minimum for each level, at the text size the pair is used at. */
const FLOOR = {
  AAA: 7,
  AA: 4.5,
  "AA large": 3,
} as const;

export type Level = keyof typeof FLOOR;

/**
 * Each row is a pair the site actually renders, named by the primitives it
 * resolves to rather than by a hex value, so a palette edit reaches this table
 * automatically instead of requiring someone to remember it exists.
 *
 * `level` is the claim being made, not the result. The build checks the
 * computed ratio against it and fails if the palette no longer earns it, per
 * the hard-stop rule in CLAUDE.md: a portfolio that silently publishes a failing
 * contrast ratio is worse than one that refuses to compile.
 */
const PAIRS: ReadonlyArray<{ label: string; fg: string; bg: string; level: Level }> = [
  { label: "Ink on paper", fg: "ink", bg: "paper", level: "AAA" },
  { label: "Muted on paper", fg: "ink-muted", bg: "paper", level: "AA" },
  { label: "Paper on ink (button)", fg: "paper", bg: "ink", level: "AA" },
  { label: "Orange on paper (UI, large text)", fg: "orange", bg: "paper", level: "AA large" },
  { label: "Orange body text on paper", fg: "orange-text", bg: "paper", level: "AA" },
  { label: "Text on dark", fg: "dark-text", bg: "dark-bg", level: "AAA" },
  { label: "Muted on dark", fg: "dark-text-muted", bg: "dark-bg", level: "AA" },
  { label: "Accent body text on dark", fg: "dark-accent", bg: "dark-bg", level: "AA" },
];

/** Relative luminance, WCAG 2.1 §1.4.3. */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const [r, g, b] = linear as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours, WCAG 2.1 §1.4.3. */
export function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Pulls the primitives out of design-tokens.css.
 *
 * Deliberately only literal hex declarations. A token defined as `var(--other)`
 * is a mapping rather than a value, and following the indirection here would
 * mean writing a small CSS resolver to keep a colophon table honest. The pairs
 * above name primitives for that reason, and an unknown name throws rather than
 * rendering a blank row.
 */
export function parsePalette(css: string): Map<string, string> {
  const palette = new Map<string, string>();
  for (const [, name, hex] of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (name && hex) palette.set(name, hex.toLowerCase());
  }
  return palette;
}

export interface ContrastRow {
  label: string;
  ratio: string;
  level: Level;
}

export function buildTable(css: string): ContrastRow[] {
  const palette = parsePalette(css);

  return PAIRS.map(({ label, fg, bg, level }) => {
    const foreground = palette.get(fg);
    const background = palette.get(bg);

    if (!foreground || !background) {
      throw new Error(
        `Contrast pair "${label}" names ${!foreground ? `--${fg}` : `--${bg}`}, which is not a ` +
          "literal hex primitive in design-tokens.css. Renaming a primitive means updating " +
          "PAIRS in src/lib/contrast.ts.",
      );
    }

    const measured = ratio(foreground, background);

    if (measured < FLOOR[level]) {
      throw new Error(
        `Contrast pair "${label}" is ${measured.toFixed(2)}:1, below the ${level} floor of ` +
          `${FLOOR[level]}:1. The palette changed and the colophon would publish a failing ` +
          "ratio as a passing one. Fix the colour or lower the claim.",
      );
    }

    return { label, ratio: measured.toFixed(2), level };
  });
}

/** The table the colophon renders. Cached per render, like the content loader. */
export const getContrastTable = cache((): ContrastRow[] =>
  buildTable(readFileSync(TOKENS, "utf8")),
);
