/**
 * Score the deployed site with Lighthouse, several times, and record the spread.
 *
 * The colophon's measurements section carried "Lighthouse: not yet measured"
 * from the day it was written. Honest about being empty, but a promise of a
 * checkable anchor, on the page that makes the strongest claims about this site.
 *
 * WHY IT MEASURES PRODUCTION RATHER THAN A LOCAL BUILD
 *
 * The first version started `next start` and scored localhost. It reported
 * performance 72 while the same commit deployed scored 99. A local Node process
 * with `max-age=0, must-revalidate` is not what a visitor gets, and the number
 * on a public page should describe the site people actually load. So this scores
 * the deployed origin, which also removes any question about which build was
 * measured.
 *
 * WHY IT RUNS MORE THAN ONCE
 *
 * Because the answer moved. Three runs against the same URL on the same
 * afternoon produced performance scores of 99, 85 and 80, while accessibility,
 * best practices and SEO returned exactly 100 every time. Those three are
 * deterministic audits of the document; performance is a simulation whose result
 * depends on how busy the machine running it is, and this machine had builds and
 * browsers on it.
 *
 * Reporting the median of that as a fact would be publishing a property of my
 * laptop as a property of the site. So the script records the range, and the
 * colophon prints a range wherever one exists and says what a range means. A
 * single number appears only where the runs agreed.
 *
 * There is deliberately no --check and no CI step. measure-payload.mjs gates on
 * bytes because bytes are deterministic. Gating on this would fail whenever a
 * runner was busy, and a check that cries wolf gets deleted.
 *
 * Usage: pnpm run lighthouse [origin]     default: the production URL
 */
import { spawn } from "node:child_process";
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "lib", "lighthouse.json");

/** The page a first-time visitor lands on. */
const PATH = "/";
const RUNS = 3;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

/** Read from site.ts so the measured origin cannot drift from the canonical one. */
async function productionOrigin() {
  const source = await readFile(join(ROOT, "src", "lib", "site.ts"), "utf8");
  const match = source.match(/url:\s*"([^"]+)"/);
  if (!match?.[1]) throw new Error("Could not read `url` from src/lib/site.ts.");
  return match[1];
}

/** Finds the Chromium Playwright installed, since this machine has no Chrome. */
async function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const base = join(homedir(), ".cache", "ms-playwright");
  const entries = await readdir(base).catch(() => []);
  const chromiums = entries
    .filter((entry) => entry.startsWith("chromium-"))
    .sort()
    .reverse();

  for (const dir of chromiums) {
    const candidate = join(base, dir, "chrome-linux64", "chrome");
    const exists = await readFile(candidate).then(
      () => true,
      () => false,
    );
    if (exists) return candidate;
  }

  throw new Error(
    "No Chrome found, and Lighthouse says only 'Unable to connect to Chrome' about it.\n" +
      "  pnpm exec playwright install chromium\n" +
      "or set CHROME_PATH to a Chrome or Chromium binary.",
  );
}

function lighthouse(url, reportPath, chrome) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "lighthouse",
      [
        url,
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
        "--output=json",
        `--output-path=${reportPath}`,
        `--only-categories=${CATEGORIES.join(",")}`,
      ],
      {
        cwd: ROOT,
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, CHROME_PATH: chrome },
      },
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) =>
      reject(
        error.code === "ENOENT"
          ? new Error(
              "`lighthouse` is not installed. It is a global tool here rather than a " +
                "dependency, because this script runs by hand a few times a year:\n" +
                "  npm i -g lighthouse",
            )
          : error,
      ),
    );
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`lighthouse exited ${code}.\n${stderr.slice(-800)}`)),
    );
  });
}

async function main() {
  const origin = process.argv[2] ?? (await productionOrigin());
  const url = `${origin}${PATH}`;
  const chrome = await findChrome();

  console.log(`Scoring ${url}, ${RUNS} runs`);

  const runs = [];
  let version = "";

  for (let i = 1; i <= RUNS; i += 1) {
    const reportPath = join(ROOT, ".next", `lighthouse-${i}.json`);
    await lighthouse(url, reportPath, chrome);
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    await unlink(reportPath).catch(() => {});

    version = report.lighthouseVersion;
    const scores = Object.fromEntries(
      CATEGORIES.map((key) => [key, Math.round(report.categories[key].score * 100)]),
    );
    runs.push(scores);
    console.log(`  run ${i}: ${CATEGORIES.map((k) => `${k} ${scores[k]}`).join(", ")}`);
  }

  const categories = Object.fromEntries(
    CATEGORIES.map((key) => {
      const values = runs.map((run) => run[key]).sort((a, b) => a - b);
      return [key, { min: values[0], max: values[values.length - 1] }];
    }),
  );

  const measured = {
    url,
    measuredAt: new Date().toISOString().slice(0, 10),
    runs: RUNS,
    categories,
    /*
     * Named rather than left implicit: Lighthouse's default preset is a mobile
     * viewport with simulated network and CPU throttling. A desktop run scores
     * higher and would be the flattering number rather than the representative
     * one.
     */
    profile: "simulated mobile throttling, Lighthouse default preset",
    lighthouseVersion: version,
  };

  await writeFile(OUT, `${JSON.stringify(measured, null, 2)}\n`);

  console.log("");
  for (const key of CATEGORIES) {
    const { min, max } = categories[key];
    console.log(`  ${key.padEnd(16)} ${min === max ? min : `${min}-${max}`}`);
  }
  console.log(`\nWrote ${OUT}`);
}

await main();
