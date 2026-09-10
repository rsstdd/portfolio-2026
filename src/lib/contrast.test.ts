import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildTable, parsePalette, ratio } from "./contrast";

const CSS = readFileSync(join(process.cwd(), "src", "app", "styles", "design-tokens.css"), "utf8");

describe("ratio", () => {
  it("returns 21 for black on white, the WCAG maximum", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("returns 1 for a colour against itself", () => {
    expect(ratio("#dd4e12", "#dd4e12")).toBeCloseTo(1, 5);
  });

  it("is symmetric, because contrast has no foreground and background", () => {
    expect(ratio("#221f1a", "#f5f2ec")).toBeCloseTo(ratio("#f5f2ec", "#221f1a"), 10);
  });
});

describe("parsePalette", () => {
  it("reads literal hex primitives out of the real token file", () => {
    const palette = parsePalette(CSS);
    expect(palette.get("paper")).toBe("#f5f2ec");
    expect(palette.get("ink")).toBe("#221f1a");
    expect(palette.get("dark-accent")).toBe("#e8632c");
  });

  /*
   * Semantic tokens are declared as `var(--other)`. Following that indirection
   * would mean writing a CSS resolver to keep a colophon table honest, so the
   * pairs name primitives and this documents that the mapping layer is skipped
   * on purpose rather than by accident.
   */
  it("skips tokens defined as a var() mapping rather than a value", () => {
    const palette = parsePalette(CSS);
    expect(palette.has("bg")).toBe(false);
    expect(palette.has("accent")).toBe(false);
  });
});

describe("buildTable", () => {
  it("publishes the ratios the colophon shows, computed from the palette", () => {
    const rows = buildTable(CSS);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.ratio]));

    // Hand-computed from the primitives. If a palette change moves one of
    // these, the number on a public page moves with it, which is the point.
    expect(byLabel["Ink on paper"]).toBe("14.70");
    expect(byLabel["Muted on paper"]).toBe("5.17");
    expect(byLabel["Orange on paper (UI, large text)"]).toBe("3.63");
    expect(byLabel["Orange body text on paper"]).toBe("5.24");
    expect(byLabel["Text on dark"]).toBe("14.65");
    expect(byLabel["Muted on dark"]).toBe("6.55");
    expect(byLabel["Accent body text on dark"]).toBe("5.37");
  });

  it("clears every level it claims", () => {
    const floor = { AAA: 7, AA: 4.5, "AA large": 3 } as const;
    for (const row of buildTable(CSS)) {
      expect(Number(row.ratio), row.label).toBeGreaterThanOrEqual(floor[row.level]);
    }
  });

  /*
   * The two assertions that matter. A guard that cannot fail is worse than no
   * guard, and this file exists because five correct literals looked exactly
   * like five maintained ones.
   */
  it("throws when a palette change drops a pair below the level it claims", () => {
    // Muted moved most of the way to paper: still legible-looking, well under AA.
    const broken = CSS.replace("--ink-muted: #6b655a;", "--ink-muted: #b9b3a6;");
    expect(broken).not.toBe(CSS);
    expect(() => buildTable(broken)).toThrow(/Muted on paper.*below the AA floor/);
  });

  it("throws when a primitive a pair names is renamed away", () => {
    const broken = CSS.replace("--orange-text:", "--orange-body:");
    expect(broken).not.toBe(CSS);
    expect(() => buildTable(broken)).toThrow(/--orange-text/);
  });
});
