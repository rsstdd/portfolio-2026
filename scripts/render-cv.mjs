/**
 * Render /cv to a committed PDF.
 *
 * Two files already described `content/cv.mdx` as the source for "the exported
 * PDF" while no export existed, and the /cv page told a reader to print the
 * page themselves. A recruiter forwarding a candidate does not want to operate
 * a print dialog, and every ATS upload field wants a file, so the export is
 * built rather than the claim retracted.
 *
 * The approach follows scripts/render-og.mjs, which is the established pattern
 * here: render with the Chromium that Playwright already installs for the e2e
 * suite, commit the artifact, and give CI a `--check` mode so an edited source
 * with a stale artifact fails the build instead of shipping quietly.
 *
 * WHY --check HASHES INPUTS RATHER THAN COMPARING BYTES
 *
 * render-og.mjs compares PNG bytes, and that works because the same SVG and the
 * same fonts produce the same pixels every time. A PDF does not behave that
 * way: Chromium stamps a fresh /CreationDate and a fresh /ID into every
 * document, so two renders of an unchanged page differ on every run. A byte
 * comparison would fail constantly for reasons having nothing to do with the
 * CV, and a check that cries wolf gets deleted within a month.
 *
 * So the sidecar records a hash of the inputs that can change the document, and
 * `--check` recomputes it. That answers the question actually worth asking,
 * which is whether the source moved after the PDF was last rendered. It also
 * needs no browser and no server, so the CI step is fast and cannot flake.
 *
 * The honest limit: the input set is the three files below. A change to a
 * shared typography token in design-tokens.css can alter the document without
 * tripping this check. Widening the set to every file that transitively affects
 * a page means hashing most of src/, which would fail on changes that cannot
 * touch the CV and teach everyone to re-render on reflex. Three named files
 * that cover the realistic edits is the better trade, and naming the gap here
 * is the price of making it.
 *
 * Usage:
 *   node scripts/render-cv.mjs           render and write the PDF and sidecar
 *   node scripts/render-cv.mjs --check   verify the committed PDF is current
 *
 * Rendering requires a prior `next build`, because it serves the built site.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "cv");
const PDF = join(OUT_DIR, "ross-todd.pdf");
const SIDECAR = `${PDF}.sha256`;

/**
 * Held clear of 3000 (`pnpm dev`) and 3100 (playwright.config.ts) for the
 * reason that config's docstring gives at length: a server on a port something
 * else also uses becomes the server under test, silently.
 */
const PORT = Number(process.env.CV_PDF_PORT ?? 3200);
const ORIGIN = `http://127.0.0.1:${PORT}`;

/** The files that can change the document. See the note above about scope. */
const INPUTS = ["content/cv.mdx", "src/app/cv/page.tsx", "src/app/styles/components.css"];

async function inputHash() {
  const hash = createHash("sha256");
  for (const relative of INPUTS) {
    // The path goes in as well as the bytes, so renaming an input is a change.
    hash.update(relative);
    hash.update(await readFile(join(ROOT, relative)));
  }
  return hash.digest("hex");
}

async function check() {
  const expected = await inputHash();
  const recorded = (await readFile(SIDECAR, "utf8").catch(() => null))?.trim();

  if (recorded === null || recorded === undefined) {
    console.error(`No sidecar at ${SIDECAR}. Run: pnpm run cv:pdf`);
    process.exitCode = 1;
    return;
  }

  await readFile(PDF).catch(() => {
    console.error(`Sidecar present but ${PDF} is missing. Run: pnpm run cv:pdf`);
    process.exitCode = 1;
  });
  if (process.exitCode === 1) return;

  if (recorded !== expected) {
    console.error(
      "The CV PDF is stale: one of its sources changed after it was rendered.\n" +
        `  recorded ${recorded}\n  current  ${expected}\n` +
        `Sources: ${INPUTS.join(", ")}\n` +
        "Run: pnpm run build && pnpm run cv:pdf",
    );
    process.exitCode = 1;
    return;
  }

  console.log("The CV PDF is current.");
}

/** Waits for `next start` to answer, rather than sleeping and hoping. */
async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${ORIGIN}/cv`, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${ORIGIN}/cv did not answer within ${timeoutMs}ms.`);
}

/**
 * Refuses to run when something already holds the port.
 *
 * Without this the script attaches to whatever is listening and renders from
 * it. That is not hypothetical: a `next start` left over from an earlier run
 * kept serving a previous build, the new build replaced .next underneath it,
 * its CSS chunk 404ed, and the render came back with every print rule missing.
 * The failure looked like a broken stylesheet and was a stale server, which is
 * the same trap playwright.config.ts documents at length for port 3000.
 */
async function refuseIfPortBusy() {
  const busy = await fetch(ORIGIN, { signal: AbortSignal.timeout(1500) }).then(
    () => true,
    () => false,
  );
  if (busy) {
    throw new Error(
      `Something is already serving ${ORIGIN}. This script starts its own server and would ` +
        "otherwise render from that one, which may be a different build. Stop it, or set " +
        "CV_PDF_PORT to a free port.",
    );
  }
}

async function render() {
  await readFile(join(ROOT, ".next", "BUILD_ID")).catch(() => {
    throw new Error("No build found. Run `pnpm run build` first: this serves the built site.");
  });

  await refuseIfPortBusy();

  const server = spawn("pnpm", ["exec", "next", "start", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });
  server.on("error", (error) => {
    throw error;
  });

  try {
    await waitForServer();

    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto(`${ORIGIN}/cv`, { waitUntil: "networkidle" });

      /*
       * The same guard render-og.mjs carries, adapted. next/font rewrites the
       * family to a generated name like `__IBM_Plex_Sans_a1b2c3`, so checking
       * for the literal "IBM Plex Sans" would report a false failure. Reading
       * the family the page actually resolved and asking whether that one
       * loaded is the version of the question that survives the rename.
       */
      const font = await page.evaluate(async () => {
        await document.fonts.ready;
        const family = getComputedStyle(document.body).fontFamily.split(",")[0].trim();
        return { family, loaded: document.fonts.check(`400 16px ${family}`) };
      });
      if (!font.loaded) {
        throw new Error(
          `The page resolved ${font.family} but it did not load. ` +
            "Refusing to write a CV in a substituted typeface. Run pnpm install.",
        );
      }

      // Print media, so the stylesheet that hides the nav and footer applies.
      // That stylesheet is the thing on this page that breaks silently, and
      // rendering through it here is what puts it under a check at all.
      await page.emulateMedia({ media: "print" });

      /*
       * Wait for the switch to settle before reading anything or taking the
       * PDF. <body> carries `transition-colors`, so the background animates
       * from the site's paper to white and both a computed-style read and
       * page.pdf() taken straight after the media change land in the middle of
       * it. The e2e theme test hit the identical trap and was fixed the same
       * way; here it would mean exporting a document with a half-faded
       * background, which is worse than a flaky assertion because it ships.
       *
       * A timeout here is the print rule genuinely failing to win, so the
       * message says that rather than reporting a timeout.
       */
      await page
        .waitForFunction(
          () => {
            const s = getComputedStyle(document.body);
            return s.backgroundColor === "rgb(255, 255, 255)" && s.color === "rgb(0, 0, 0)";
          },
          undefined,
          { timeout: 5_000 },
        )
        .catch(async () => {
          const s = await page.evaluate(() => {
            const c = getComputedStyle(document.body);
            return { background: c.backgroundColor, color: c.color };
          });
          throw new Error(
            `The document settled on ${s.color} on ${s.background}, not black on white. ` +
              "A utility class on <body> is out-specifying the @media print rule in " +
              "src/app/styles/components.css. Refusing to export a CV flooded with the site " +
              "background.",
          );
        });

      /*
       * Two assertions, not one, and the second is here because the first
       * passed while the block was half broken.
       *
       * The chrome-hiding rules out-specify the utilities they compete with, so
       * they worked. The `body` background rule did not: Tailwind v4 emits its
       * utilities unlayered, so `.bg-bg` (0,1,0) beat `body` (0,0,1) and the
       * first export came out with the site's paper background across all nine
       * pages. A guard that only checks `display` would have signed that off.
       */
      const chromeHidden = await page.evaluate(() =>
        [...document.querySelectorAll("body > header, body > footer, .no-print")].every(
          (el) => getComputedStyle(el).display === "none",
        ),
      );

      if (!chromeHidden) {
        throw new Error(
          "The print stylesheet did not hide the site chrome. Check the @media print block " +
            "in src/app/styles/components.css before shipping a CV with a nav bar in it.",
        );
      }

      // A4 because these applications are filed in Germany.
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
      });

      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(PDF, pdf);
      await writeFile(SIDECAR, `${await inputHash()}\n`);

      console.log(`Wrote ${PDF} (${(pdf.length / 1024).toFixed(0)} KB) in ${font.family}.`);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }
}

if (process.argv.includes("--check")) {
  await check();
} else {
  await render();
}
