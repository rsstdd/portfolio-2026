import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * The documented hard stop.
 *
 * CLAUDE.md: "A malformed `projects/foo.mdx` blocks the build rather than
 * silently dropping the entry or rendering a broken card. This is intentional:
 * a portfolio that silently omits work is worse than one that refuses to
 * compile." That is the load-bearing claim of the whole content pipeline, and
 * nothing proved it.
 *
 * A temp content directory rather than a mocked `node:fs`: the loader resolves
 * `CONTENT_DIR` from `process.cwd()` at module load, so pointing the process at
 * a fixture tree exercises the real read-and-parse path instead of a stand-in
 * for it. The module is imported after the chdir for the same reason.
 */
const originalCwd = process.cwd();
let fixture: string;

beforeAll(() => {
  fixture = mkdtempSync(join(tmpdir(), "content-hard-stop-"));
  mkdirSync(join(fixture, "content", "projects"), { recursive: true });
  mkdirSync(join(fixture, "content", "blog"), { recursive: true });

  // Valid YAML, invalid frontmatter: every required field but `title` missing.
  const broken = "---\ntitle: Only a title\n---\n\nBody.\n";
  writeFileSync(join(fixture, "content", "projects", "broken.mdx"), broken);
  writeFileSync(join(fixture, "content", "blog", "broken.mdx"), broken);

  process.chdir(fixture);
  vi.resetModules();
});

afterAll(() => {
  process.chdir(originalCwd);
  rmSync(fixture, { recursive: true, force: true });
});

describe("malformed frontmatter", () => {
  it("throws rather than dropping the project silently", async () => {
    const { getProjects } = await import("./index");
    expect(() => getProjects()).toThrow();
  });

  it("names the offending file, not just the failing field", async () => {
    const { getProjects } = await import("./index");
    expect(() => getProjects()).toThrow(/content\/projects\/broken\.mdx/);
  });

  it("includes the underlying validation detail", async () => {
    const { getProjects } = await import("./index");
    expect(() => getProjects()).toThrow(/Invalid frontmatter/);
  });

  it("applies to blog posts too", async () => {
    const { getBlogPosts } = await import("./index");
    expect(() => getBlogPosts()).toThrow(/content\/blog\/broken\.mdx/);
  });

  it("never returns a partial list with the bad entry filtered out", async () => {
    const { getProjects } = await import("./index");
    let outcome: unknown;
    try {
      outcome = getProjects();
    } catch {
      outcome = "threw";
    }
    expect(outcome).toBe("threw");
  });
});
