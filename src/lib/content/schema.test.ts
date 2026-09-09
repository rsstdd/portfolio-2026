import { describe, expect, it } from "vitest";
import { blogPostSchema, projectSchema } from "./schema";

/**
 * CLAUDE.md calls schema validation "a build-time hard stop": a malformed
 * `.mdx` must block the build rather than silently drop the entry or render a
 * broken card. These tests exist so that claim is checkable rather than
 * asserted. See ./index.test.ts for the loader half of it.
 */

const validProject = {
  title: "Fleet console",
  summary: "A robot telemetry console.",
  role: "Engineer",
  stack: ["TypeScript"],
  date: "2026-09-03",
};

const validPost = {
  title: "A post",
  summary: "About something.",
  tags: ["systems"],
  date: "2026-08-08",
};

describe("projectSchema", () => {
  it("accepts the minimum valid frontmatter", () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow();
  });

  it.each(["title", "summary", "role", "stack", "date"])("rejects missing %s", (field) => {
    const { [field]: _omitted, ...rest } = validProject as Record<string, unknown>;
    expect(() => projectSchema.parse(rest)).toThrow();
  });

  it("rejects a summary over 200 characters, so a card cannot overflow", () => {
    expect(() => projectSchema.parse({ ...validProject, summary: "x".repeat(201) })).toThrow();
    expect(() => projectSchema.parse({ ...validProject, summary: "x".repeat(200) })).not.toThrow();
  });

  it("rejects an empty stack", () => {
    expect(() => projectSchema.parse({ ...validProject, stack: [] })).toThrow();
  });

  it("rejects a non-URL repo, so a broken link cannot ship", () => {
    expect(() => projectSchema.parse({ ...validProject, repo: "github.com/x" })).toThrow();
  });

  it("defaults featured false and verified/complete true", () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.featured).toBe(false);
    expect(parsed.verified).toBe(true);
    expect(parsed.complete).toBe(true);
  });

  it("coerces date to a Date", () => {
    expect(projectSchema.parse(validProject).date).toBeInstanceOf(Date);
  });
});

describe("blogPostSchema", () => {
  it("accepts the minimum valid frontmatter", () => {
    expect(() => blogPostSchema.parse(validPost)).not.toThrow();
  });

  it.each(["title", "summary", "tags", "date"])("rejects missing %s", (field) => {
    const { [field]: _omitted, ...rest } = validPost as Record<string, unknown>;
    expect(() => blogPostSchema.parse(rest)).toThrow();
  });

  it("requires at least one tag", () => {
    expect(() => blogPostSchema.parse({ ...validPost, tags: [] })).toThrow();
  });

  it("defaults featured to false", () => {
    expect(blogPostSchema.parse(validPost).featured).toBe(false);
  });

  it("accepts an `about` organisation, and requires its url to be a URL", () => {
    const about = { name: "Better Stack", url: "https://betterstack.com" };
    expect(blogPostSchema.parse({ ...validPost, about }).about).toEqual(about);
    expect(() =>
      blogPostSchema.parse({ ...validPost, about: { name: "x", url: "not-a-url" } }),
    ).toThrow();
  });
});
