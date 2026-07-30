import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Next.js does not expose a Vite pipeline, so Vitest supplies its own React
 * transform here. Only client components are unit-testable this way; Server
 * Components are covered by the Playwright spec instead, which is the correct
 * split rather than a workaround.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/e2e/**"],
  },
});
