/**
 * Capture screenshots of fleet-console for its project page.
 *
 * Until now this site contained no images at all: not one screenshot, diagram
 * or photograph across eleven project pages. A portfolio that asks a reader to
 * take an entire body of work on prose alone spends credibility it does not
 * have to spend, and fleet-console is the one project here that actually runs
 * on a laptop.
 *
 * WHY THE SCREENSHOT IS STAGED, AND WHY THAT IS NOT CHEATING
 *
 * The project's claim is that it "treats silence as an event". A screenshot of
 * the console with all 24 robots reading LIVE demonstrates none of that; it is
 * a table. So the simulator runs with four robots silenced, and the console
 * shows what the server does about robots it has never heard from.
 *
 * It shows them as UNKNOWN, which is the documented decision rather than a
 * gap: "A robot nobody has heard from reads `unknown` rather than a guess,
 * which is why a cold start with dropped robots leaves them `unknown` instead
 * of degrading them." The screenshot is evidence for that sentence.
 *
 * WHY NOT THE MORE OBVIOUS SCREENSHOT
 *
 * The better image would show the freshness sweep mid-degradation: robots that
 * did report, then went quiet, walking live -> stale -> unreachable. Producing
 * it means running the simulator, stopping it, and restarting it with drops.
 *
 * That cannot work, and the reason is the server being right. Telemetry carries
 * a sequence number, a restarted simulator starts its sequences again from
 * zero, and the server rejects anything below what it has already accepted:
 * `telemetry.sequence_regression`. Every post from the second phase is refused
 * as a replay. The visible symptom was a fleet frozen at 8 live that no amount
 * of waiting fixed, which reads like a broken simulator and is in fact replay
 * protection doing its job.
 *
 * Demonstrating the sweep therefore needs a server restart between phases, and
 * that is more orchestration across two repositories than one screenshot is
 * worth. The cold-start behaviour is a real claim on the page and this is real
 * evidence for it.
 *
 * THE CAPTION CANNOT LIE
 *
 * The script asserts the summary counts before it writes anything. If the fleet
 * does not read exactly EXPECTED, nothing is written and the run fails. That is
 * what makes it safe for the caption in fleet-console.mdx to state the numbers
 * in prose: a re-capture that produced a different fleet would refuse rather
 * than quietly leave the caption describing an older image.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *
 * There is no `--check` mode and no CI step, unlike render-og.mjs and
 * render-cv.mjs. Those regenerate from sources inside this repository;
 * fleet-console is a different repository that is not on the CI runner, so a
 * check here could only ever fail for the wrong reason. These screenshots are
 * committed artifacts with no automated guard, and this script exists so they
 * can be regenerated deliberately rather than reconstructed by guesswork.
 *
 * PREREQUISITES
 *
 * fleet-console requires Node >= 24.15 while this repository pins 22, so the
 * simulator is spawned with its own PATH. The server and the Vite client must
 * already be running:
 *
 *   cd ~/dev/fleet-console
 *   pnpm --filter server start     # http://127.0.0.1:8080
 *   pnpm --filter web dev          # http://127.0.0.1:5173
 *
 * The server must be freshly started for each run. This script brings up its
 * own simulator, whose telemetry sequences begin at zero, and a server that
 * has already accepted higher ones will refuse every post as a regression.
 *
 * Then, from this repository: pnpm run capture
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "images", "screens");

const FLEET_DIR = process.env.FLEET_CONSOLE_DIR ?? join(homedir(), "dev", "fleet-console");
/** fleet-console needs Node >= 24.15; this repository pins 22. */
const NODE_BIN =
  process.env.FLEET_NODE_BIN ??
  join(homedir(), ".local", "share", "fnm", "node-versions", "v24.15.0", "installation", "bin");

const SERVER = "http://127.0.0.1:8080";
const WEB = "http://127.0.0.1:5173";

/** Never allowed to report. Spread across sites so the table shows a mix. */
const DROPPED = ["R-003", "R-009", "R-016", "R-021"];

/** The fleet the caption in fleet-console.mdx describes. */
const EXPECTED = { robots: 24, live: 20, unknown: 4 };

/**
 * The capture waits on the page's own summary rather than on a clock.
 *
 * The first attempt slept a fixed ten seconds and photographed a fleet that had
 * not settled, because how long that takes depends on the simulator rate, the
 * robot count, and whatever state the server was already in. Polling the thing
 * being waited for is faster when it settles early and correct when it does not.
 */
const SETTLE_TIMEOUT_MS = 45_000;

const VIEWPORT = { width: 1280, height: 820 };

function simulator(extraArgs) {
  return spawn(
    "pnpm",
    [
      "--filter",
      "server",
      "simulator",
      "--robots",
      "24",
      "--seed",
      "1",
      "--hz",
      "4",
      ...extraArgs,
      "--endpoint",
      SERVER,
    ],
    {
      cwd: FLEET_DIR,
      stdio: "ignore",
      env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` },
      /*
       * Its own process group, so `stop` below can kill the whole tree.
       *
       * `pnpm run` spawns `sh -c tsx ...`, which spawns tsx, which spawns the
       * simulator. SIGTERM to the pnpm pid alone leaves three orphans behind
       * still posting telemetry, and three overlapping simulators drive the
       * server past its concurrency limit until it sheds. The symptom was a
       * fleet stuck at 8 live that no amount of waiting fixed, which looks
       * exactly like a broken simulator and was the opposite.
       */
      detached: true,
    },
  );
}

/** Kills a simulator and everything it spawned. */
function stop(child) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    // Already gone.
  }
}

const reachable = (url) =>
  fetch(url, { signal: AbortSignal.timeout(2000) }).then(
    () => true,
    () => false,
  );

async function requireStack() {
  const [server, web] = await Promise.all([reachable(SERVER), reachable(WEB)]);
  if (server && web) return;
  throw new Error(
    `fleet-console is not running (server ${server ? "up" : "down"}, web ${web ? "up" : "down"}).\n` +
      `  cd ${FLEET_DIR}\n` +
      "  pnpm --filter server start\n" +
      "  pnpm --filter web dev\n" +
      "It needs Node >= 24.15; this repository pins 22.",
  );
}

/** Reads the summary strip, which is the page's own account of the fleet. */
const readFleet = (page) =>
  page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    const read = (label) => {
      const match = text.match(new RegExp(`${label}\\s*([0-9]+)`, "i"));
      return match ? Number(match[1]) : null;
    };
    return {
      robots: read("Robots"),
      live: read("LIVE"),
      stale: read("STALE"),
      unreachable: read("UNREACHABLE"),
      unknown: read("UNKNOWN"),
      rows: document.querySelectorAll("tbody tr").length,
    };
  });

async function main() {
  await requireStack();
  await mkdir(OUT_DIR, { recursive: true });

  const sim = simulator(["--drop", DROPPED.join(",")]);

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(WEB, { waitUntil: "networkidle" });

    /** Polls the summary strip until it matches, or gives up loudly. */
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;
    const matches = (f) =>
      f.robots === EXPECTED.robots && f.live === EXPECTED.live && f.unknown === EXPECTED.unknown;

    let fleet = await readFleet(page);
    while (Date.now() < deadline && !matches(fleet)) {
      await page.waitForTimeout(1000);
      fleet = await readFleet(page);
    }
    console.log(`  fleet reads ${JSON.stringify(fleet)}`);

    if (!matches(fleet)) {
      throw new Error(
        "The fleet did not settle where the caption says it does.\n" +
          `  expected ${JSON.stringify(EXPECTED)}\n  observed ${JSON.stringify(fleet)}\n` +
          "The usual cause is a server that has already accepted higher telemetry sequence " +
          "numbers, so this simulator's posts are refused as regressions. Restart the " +
          "fleet-console server for a clean sequence state and run this again.\n" +
          "Refusing to write a screenshot the prose in fleet-console.mdx would then describe " +
          "incorrectly.",
      );
    }

    await page.screenshot({ path: join(OUT_DIR, "fleet-console-table.png") });
    console.log("  wrote fleet-console-table.png");

    /*
     * Robot detail: the capability model, which is the other thing worth
     * showing. One vendor's robot resolves to a Dock panel and a Lidar panel
     * with vendor-specific fields, out of a normalized envelope.
     *
     * The viewport is shorter than the fleet table's, because at a normal
     * window height this page is a header, two cards, and half a screen of
     * nothing. It is not shorter still: the layout is responsive to height, and
     * at 470 the capability cards clip rather than tighten. A little empty
     * space below the content is better than a card cut in half.
     *
     * Best-effort: the fleet table is the screenshot carrying the project's
     * claim and this one is supporting evidence. An earlier run had the detail
     * screenshot time out and take the whole capture down with it, throwing
     * away a table shot that had already succeeded and leaving a simulator
     * running whose telemetry sequences then poisoned the next attempt.
     */
    try {
      const detail = await context.newPage();
      await detail.setViewportSize({ width: VIEWPORT.width, height: 660 });
      await detail.goto(`${WEB}/robots/R-001`, { waitUntil: "networkidle" });
      await detail.waitForTimeout(1200);
      await detail.screenshot({
        path: join(OUT_DIR, "fleet-console-robot.png"),
        animations: "disabled",
        timeout: 15_000,
      });
      console.log("  wrote fleet-console-robot.png");
      await detail.close();
    } catch (error) {
      console.warn(`  skipped fleet-console-robot.png: ${error.message.split("\n")[0]}`);
    }

    await context.close();
  } finally {
    await browser.close();
    stop(sim);
  }

  console.log(`\nWrote screenshots to ${OUT_DIR}`);
}

await main();
