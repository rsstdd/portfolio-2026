/**
 * Rasterise the OG card SVG masters to PNG.
 *
 * The masters carry a real font stack ("IBM Plex Serif, Georgia, serif"); the
 * PNGs are what social platforms actually fetch. The first batch shipped in
 * DejaVu Serif Bold because the rasteriser silently substituted a lookalike
 * when IBM Plex was not installed, and nothing failed. Everything below exists
 * to make that failure impossible rather than merely unlikely:
 *
 * - Fonts are embedded as data URIs from `@fontsource/ibm-plex-*`, the same
 *   woff2 files the site itself serves, so a card cannot render in a face the
 *   site does not use.
 * - The page asserts `document.fonts.check()` before a screenshot is taken, so
 *   a missing face throws instead of quietly falling back.
 * - Rendering happens in the Chromium that Playwright already installs for the
 *   e2e suite, so this adds no dependency and no separate font database.
 *
 * Usage: node scripts/render-og.mjs [--check]
 *   --check  render and compare against the committed PNGs without writing.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CARDS = join(ROOT, "public", "images", "og");
const WIDTH = 1200;
const HEIGHT = 630;

/** The faces the masters ask for, and the files that satisfy them. */
const FACES = [
  ["IBM Plex Serif", 600, "@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-600-normal.woff2"],
  ["IBM Plex Serif", 400, "@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff2"],
  ["IBM Plex Mono", 600, "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2"],
  ["IBM Plex Mono", 400, "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"],
];

async function fontFaceCss() {
  const blocks = await Promise.all(
    FACES.map(async ([family, weight, path]) => {
      const data = await readFile(join(ROOT, "node_modules", path), "base64");
      return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${data}) format("woff2");}`;
    }),
  );
  return blocks.join("\n");
}

async function main() {
  const check = process.argv.includes("--check");
  const css = await fontFaceCss();
  const names = (await readdir(CARDS)).filter((f) => f.endsWith(".svg")).sort();

  if (names.length === 0) throw new Error(`No .svg masters in ${CARDS}.`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  let changed = 0;

  for (const name of names) {
    const svg = await readFile(join(CARDS, name), "utf8");

    await page.setContent(
      `<style>${css}html,body{margin:0;padding:0}svg{display:block}</style>${svg}`,
      { waitUntil: "load" },
    );
    /*
     * The guard the first batch did not have. `document.fonts.check` returns
     * false when a family is unavailable, which is exactly the condition that
     * produced DejaVu Serif without any error.
     *
     * The explicit `load` matters: a declared face stays unloaded until
     * something on the page uses it, so checking straight after `ready` reports
     * a false negative for any weight this particular card does not happen to
     * set. Loading first makes the check answer "is this face available",
     * which is the question worth asking.
     */
    const missing = await page.evaluate(
      async (faces) => {
        await Promise.all(
          faces.map(([f, w]) => document.fonts.load(`${w} 64px "${f}"`).catch(() => {})),
        );
        await document.fonts.ready;
        return faces.filter(([f, w]) => !document.fonts.check(`${w} 64px "${f}"`));
      },
      FACES.map(([f, w]) => [f, w]),
    );
    if (missing.length > 0) {
      throw new Error(
        `Fonts did not load for ${name}: ${missing.map(([f, w]) => `${f} ${w}`).join(", ")}.\n` +
          "Refusing to write a card in a substituted typeface. Run pnpm install.",
      );
    }

    const png = await page.screenshot({ type: "png" });
    const target = join(CARDS, name.replace(/\.svg$/, ".png"));
    const before = await readFile(target).catch(() => null);

    if (before?.equals(png)) {
      console.log(`  unchanged  ${name}`);
      continue;
    }

    changed += 1;
    if (check) {
      console.log(`  DIFFERS    ${name}`);
    } else {
      await writeFile(target, png);
      console.log(`  wrote      ${name} -> ${name.replace(/\.svg$/, ".png")}`);
    }
  }

  await browser.close();

  console.log(
    `\n${names.length} masters, ${changed} ${check ? "differing" : "rewritten"}, rendered in IBM Plex.`,
  );
  if (check && changed > 0) process.exitCode = 1;
}

await main();
