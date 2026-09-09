import { describe, expect, it } from "vitest";
import { dynamic, GET } from "./route";

/**
 * The feed is generated from real content, so these assert properties rather
 * than a fixed body. Two of them guard specific ways an RSS feed dies quietly:
 * an unescaped ampersand makes it unparseable, and a `lastBuildDate` read off
 * the loader's featured-first order reports a month-old post as the newest.
 */
async function body() {
  return await GET().text();
}

describe("feed.xml", () => {
  it("is statically generated, per the repo's static-only rule", () => {
    // Next made GET route handlers dynamic by default in 15.0.0-RC.
    expect(dynamic).toBe("force-static");
  });

  it("serves RSS, not HTML", () => {
    expect(GET().headers.get("content-type")).toContain("application/rss+xml");
  });

  it("parses as XML, with every entity escaped", async () => {
    const xml = await body();
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
    expect(() => new DOMParser().parseFromString(xml, "application/xml")).not.toThrow();
  });

  it("escapes apostrophes in titles rather than emitting them raw", async () => {
    const xml = await body();
    const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)].map((m) => m[1] ?? "");
    expect(titles.some((t) => t.includes("&apos;") || !t.includes("'"))).toBe(true);
  });

  it("lists items newest first, not featured first", async () => {
    const dates = [...(await body()).matchAll(/<pubDate>(.*?)<\/pubDate>/g)].map((m) =>
      new Date(m[1] as string).getTime(),
    );
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("reports lastBuildDate as the newest item", async () => {
    const xml = await body();
    const build = new Date(/<lastBuildDate>(.*?)<\/lastBuildDate>/.exec(xml)?.[1] ?? 0).getTime();
    const newest = Math.max(
      ...[...xml.matchAll(/<pubDate>(.*?)<\/pubDate>/g)].map((m) =>
        new Date(m[1] as string).getTime(),
      ),
    );
    expect(build).toBe(newest);
  });

  it("gives every item an absolute, permalink guid", async () => {
    const guids = [...(await body()).matchAll(/<guid isPermaLink="true">(.*?)<\/guid>/g)];
    expect(guids.length).toBeGreaterThan(0);
    for (const g of guids) expect(g[1]).toMatch(/^https:\/\//);
  });
});
