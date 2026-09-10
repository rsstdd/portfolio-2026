/**
 * Measure what a visitor actually downloads, and hold it to a budget.
 *
 * The colophon has carried "JavaScript shipped: not yet measured · Largest
 * route: not yet measured" since it was written. That placeholder was honest
 * about being empty, which is better than a guess, but the site argues at
 * length that a claim needs a checkable anchor and this was a promise of one
 * that never arrived. This fills it.
 *
 * WHY A BROWSER RATHER THAN THE BUILD MANIFEST
 *
 * The obvious approach is to read `.next/build-manifest.json` and add up chunk
 * sizes. Under Turbopack that manifest carries `rootMainFiles` and a `pages`
 * map with a single `/_app` entry, and nothing that maps an App Router route to
 * its chunks, so any number derived from it would be an inference about
 * bundler internals that changes when the bundler does.
 *
 * Loading each route in Chromium and reading the Resource Timing API instead
 * measures the actual thing: `encodedBodySize` is what crossed the wire after
 * compression, `decodedBodySize` is what the engine had to parse. It survives a
 * bundler change because it never asks how the bundle was made.
 *
 * WHY A BUDGET RATHER THAN AN EQUALITY CHECK
 *
 * `--check` fails when the payload exceeds the committed number by more than
 * BUDGET_TOLERANCE, not when it differs from it. Chunk contents shift by a few
 * bytes across toolchain versions, and a check that fires on noise gets deleted.
 * A regression is what matters, and a reduction should never fail a build.
 *
 * Usage:
 *   node scripts/measure-payload.mjs           measure and write the JSON
 *   node scripts/measure-payload.mjs --check    verify the budget still holds
 *
 * Both modes need a prior `next build`: they serve the built site.
 */
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "lib", "measurements.json");

/** Clear of 3000 (dev), 3100 (playwright) and 3200 (render-cv.mjs). */
const PORT = Number(process.env.PAYLOAD_PORT ?? 3300);
const ORIGIN = `http://127.0.0.1:${PORT}`;

/** How far over budget is a regression rather than toolchain noise. */
const BUDGET_TOLERANCE = 0.05;

const kb = (bytes) => Math.round(bytes / 1024);

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(ORIGIN, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${ORIGIN} did not answer within ${timeoutMs}ms.`);
}

/**
 * Refuses to attach to a server this script did not start. render-cv.mjs
 * carries the same guard for the same reason: a leftover server serving an
 * older build produces a plausible number that is about nothing.
 */
async function refuseIfPortBusy() {
  const busy = await fetch(ORIGIN, { signal: AbortSignal.timeout(1500) }).then(
    () => true,
    () => false,
  );
  if (busy) {
    throw new Error(
      `Something is already serving ${ORIGIN}. This script starts its own server and would ` +
        "otherwise measure that one. Stop it, or set PAYLOAD_PORT to a free port.",
    );
  }
}

/** Every route the site publishes, taken from its own sitemap. */
async function routes() {
  const xml = await fetch(`${ORIGIN}/sitemap.xml`).then((r) => r.text());
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (locs.length === 0) throw new Error("The sitemap listed no routes.");
  return locs.sort();
}

async function measure() {
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
    const paths = await routes();
    const browser = await chromium.launch();

    try {
      const results = [];

      for (const path of paths) {
        // A fresh context per route, so a warm cache never reports zero bytes
        // for a chunk the previous route already fetched.
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`${ORIGIN}${path}`, { waitUntil: "networkidle" });

        const sizes = await page.evaluate(() => {
          const entries = performance.getEntriesByType("resource");
          const sum = (predicate) =>
            entries.filter(predicate).reduce(
              (acc, e) => ({
                transfer: acc.transfer + (e.encodedBodySize || 0),
                parsed: acc.parsed + (e.decodedBodySize || 0),
              }),
              { transfer: 0, parsed: 0 },
            );
          const isScript = (e) => e.initiatorType === "script" || e.name.endsWith(".js");
          return { script: sum(isScript), all: sum(() => true) };
        });

        // The document itself is not a resource entry; add it from navigation.
        const document = await page.evaluate(() => {
          const [nav] = performance.getEntriesByType("navigation");
          return nav
            ? { transfer: nav.encodedBodySize || 0, parsed: nav.decodedBodySize || 0 }
            : { transfer: 0, parsed: 0 };
        });

        results.push({
          path,
          scriptTransfer: sizes.script.transfer,
          scriptParsed: sizes.script.parsed,
          totalTransfer: sizes.all.transfer + document.transfer,
        });

        await context.close();
      }

      const home = results.find((r) => r.path === "/");
      if (!home) throw new Error("The sitemap did not include the home page.");
      const largest = results.reduce((a, b) => (b.totalTransfer > a.totalTransfer ? b : a));

      return {
        measuredAt: new Date().toISOString().slice(0, 10),
        routes: results.length,
        homeScriptTransferKb: kb(home.scriptTransfer),
        homeScriptParsedKb: kb(home.scriptParsed),
        largestRoute: largest.path,
        largestRouteTransferKb: kb(largest.totalTransfer),
      };
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }
}

const current = await measure();

if (process.argv.includes("--check")) {
  const committed = JSON.parse(await readFile(OUT, "utf8"));
  const budgets = [
    ["home JavaScript (transfer)", current.homeScriptTransferKb, committed.homeScriptTransferKb],
    ["home JavaScript (parsed)", current.homeScriptParsedKb, committed.homeScriptParsedKb],
    ["largest route (transfer)", current.largestRouteTransferKb, committed.largestRouteTransferKb],
  ];

  let over = false;
  for (const [label, now, budget] of budgets) {
    const ceiling = budget * (1 + BUDGET_TOLERANCE);
    const verdict = now > ceiling ? "OVER BUDGET" : "ok";
    if (now > ceiling) over = true;
    console.log(`  ${verdict.padEnd(11)} ${label}: ${now}KB against ${budget}KB`);
  }

  if (over) {
    console.error(
      `\nThe payload grew by more than ${BUDGET_TOLERANCE * 100}%. Either the growth is ` +
        "justified, in which case re-run `pnpm run measure` and commit the new number with " +
        "the reason, or it is not, in which case find what was added.",
    );
    process.exitCode = 1;
  } else {
    console.log("\nWithin budget.");
  }
} else {
  await writeFile(OUT, `${JSON.stringify(current, null, 2)}\n`);
  console.log(
    `Measured ${current.routes} routes.\n` +
      `  home JavaScript   ${current.homeScriptTransferKb}KB transfer, ${current.homeScriptParsedKb}KB parsed\n` +
      `  largest route     ${current.largestRoute} at ${current.largestRouteTransferKb}KB\n` +
      `Wrote ${OUT}`,
  );
}
