import { defineConfig } from "@playwright/test";

/**
 * One critical-path spec per project. The goal is not coverage; it is proving
 * the app boots and the primary flow works, and keeping the muscle memory alive.
 *
 * The port is deliberately not 3000.
 *
 * It used to be, alongside `reuseExistingServer`, which meant a `pnpm dev`
 * left running in another terminal silently became the server under test. That
 * is not a hypothetical: a stale server produced three false failures in one
 * afternoon, including a 404 for a route that existed, because the suite was
 * exercising a build from an hour earlier. Reading the port from an
 * environment variable would not have helped, since it would still default to
 * the one `pnpm dev` takes and still rely on someone remembering to set it.
 *
 * Defaulting to a port the dev server does not use removes the collision
 * instead of asking people to avoid it. Override with `E2E_PORT` when 3100 is
 * itself busy.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: `pnpm run dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
