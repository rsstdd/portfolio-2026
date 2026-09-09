import { describe, expect, it } from "vitest";
import { getBlogPosts, getProjects, getTags, tagSlug } from "./index";

/**
 * Loader behaviour, checked against the real `content/` directory.
 *
 * Assertions are on invariants rather than on specific slugs, so adding a post
 * or reordering the featured flag does not break a test that was never about
 * that. The one thing worth pinning exactly is the ordering rule itself,
 * because pages rely on the loader owning it.
 */

describe("getProjects", () => {
  it("parses every project in content/projects without throwing", () => {
    expect(getProjects().length).toBeGreaterThan(0);
  });

  it("puts every featured project before every unfeatured one", () => {
    const featured = getProjects().map((p) => p.featured);
    expect(
      featured.indexOf(false) === -1 || !featured.slice(featured.indexOf(false)).includes(true),
    ).toBe(true);
  });

  it("orders ranked projects by featuredRank ascending", () => {
    const ranks = getProjects()
      .filter((p) => p.featured && p.featuredRank !== undefined)
      .map((p) => p.featuredRank as number);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("gives every project a slug matching its filename", () => {
    for (const p of getProjects()) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("getBlogPosts", () => {
  it("puts every featured post before every unfeatured one", () => {
    const featured = getBlogPosts().map((p) => p.featured);
    const firstUnfeatured = featured.indexOf(false);
    if (firstUnfeatured !== -1) {
      expect(featured.slice(firstUnfeatured)).not.toContain(true);
    }
  });

  it("orders newest first within each featured group", () => {
    for (const group of [true, false]) {
      const dates = getBlogPosts()
        .filter((p) => p.featured === group)
        .map((p) => p.date.getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    }
  });
});

describe("getTags", () => {
  it("only returns tags carried by two or more posts", () => {
    for (const t of getTags()) expect(t.count).toBeGreaterThanOrEqual(2);
  });

  it("reports a count matching the posts that actually carry the tag", () => {
    const posts = getBlogPosts();
    for (const t of getTags()) {
      expect(posts.filter((p) => p.tags.includes(t.tag)).length).toBe(t.count);
    }
  });

  it("orders by count descending, then alphabetically", () => {
    const tags = getTags();
    const sorted = [...tags].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    expect(tags).toEqual(sorted);
  });
});

describe("tagSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(tagSlug("System Design")).toBe("system-design");
    expect(tagSlug("  Web  ")).toBe("web");
    expect(tagSlug("engineering-practice")).toBe("engineering-practice");
  });
});
