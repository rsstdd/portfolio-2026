import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Minimal ESLint config. Formatting, imports, and general lint are Biome's job.
 * This config exists only for the hooks rules and the React Compiler
 * diagnostics, which Biome does not implement. Treat those diagnostics as a
 * tutor rather than as noise.
 *
 * "recommended-latest" is deliberate: in eslint-plugin-react-hooks v6 it is the
 * preset carrying the compiler-powered rules (purity, refs, set-state-in-effect,
 * preserve-manual-memoization, and friends). The preset is preferred over
 * listing rules by name, because the compiler rule names are still settling
 * between plugin releases and an unknown rule name is a hard error that breaks
 * lint entirely.
 */
/*
 * Flattened, because these presets are arrays.
 *
 * `configs["recommended-latest"]` is an array of one config object. Spreading
 * it into an object literal, as this file used to do, produced
 * `{ "0": { plugins, rules } }`, and ESLint rejected the whole config with
 * `Unexpected key "0" found` — so lint has not run at all since. Flat config
 * wants preset entries spread into the top-level array instead.
 */
const presets = [
  reactHooks.configs?.["recommended-latest"] ??
    reactHooks.configs?.flat?.["recommended-latest"] ??
    reactHooks.configs?.recommended ??
    [],
].flat();

const FILES = ["**/*.{js,jsx,ts,tsx}"];

export default [
  { ignores: ["dist/", ".next/", ".astro/", "node_modules/", "e2e/", "playwright-report/"] },
  ...presets.map((config) => ({ ...config, files: FILES })),
  {
    files: FILES,
    // espree cannot parse TypeScript, so without an explicit parser this config
    // would error on every .ts/.tsx file in the repo.
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
