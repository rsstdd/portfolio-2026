import { describe, expect, it } from "vitest";
import type { LoadedBlogPost } from "./content";
import { blogPostingJsonLd, breadcrumbJsonLd, personJsonLd, projectJsonLd } from "./json-ld";

/**
 * Structured data is invisible in the browser, so nothing about a page looking
 * right proves it is correct. The assertions below are the ones that carry the
 * meaning: entity identity, and honest dates.
 */
const post: LoadedBlogPost = {
  title: "A post",
  summary: "About something.",
  tags: ["security", "web"],
  date: new Date("2026-08-08T00:00:00.000Z"),
  featured: false,
  slug: "a-post",
  body: "",
};

describe("blogPostingJsonLd", () => {
  it("references the Person by @id rather than inlining a second author", () => {
    const ld = blogPostingJsonLd(post);
    expect(ld.author).toEqual({ "@id": personJsonLd()["@id"] });
    expect(ld.publisher).toEqual({ "@id": personJsonLd()["@id"] });
  });

  it("falls back dateModified to the publish date when a post was never revised", () => {
    expect(blogPostingJsonLd(post).dateModified).toBe(post.date.toISOString());
  });

  it("uses the updated date when there is one", () => {
    const updated = new Date("2026-09-01T00:00:00.000Z");
    expect(blogPostingJsonLd({ ...post, updated }).dateModified).toBe(updated.toISOString());
  });

  it("emits absolute URLs, since relative ones are meaningless to a crawler", () => {
    const ld = blogPostingJsonLd(post);
    expect(ld.url).toMatch(/^https:\/\//);
    expect(ld.image).toMatch(/^https:\/\//);
  });

  it("names the subject organisation only when the post declares one", () => {
    expect(blogPostingJsonLd(post).about).toBeUndefined();
    const about = { name: "Better Stack", url: "https://betterstack.com" };
    expect(blogPostingJsonLd({ ...post, about }).about).toMatchObject({
      "@type": "Organization",
      ...about,
    });
  });

  it("carries the tags through as keywords", () => {
    expect(blogPostingJsonLd(post).keywords).toEqual(["security", "web"]);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers positions from one and resolves each item to an absolute URL", () => {
    const ld = breadcrumbJsonLd([
      { name: "Notes", path: "/blog" },
      { name: "A post", path: "/blog/a-post" },
    ]);
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    for (const item of ld.itemListElement) expect(item.item).toMatch(/^https:\/\//);
  });
});

describe("projectJsonLd", () => {
  it("credits the same Person entity as the posts", () => {
    const ld = projectJsonLd({
      title: "Fleet console",
      summary: "A console.",
      role: "Engineer",
      stack: ["TypeScript"],
      date: new Date("2026-09-03T00:00:00.000Z"),
      featured: true,
      verified: true,
      complete: true,
      slug: "fleet-console",
      body: "",
    });
    expect(ld.creator).toEqual({ "@id": personJsonLd()["@id"] });
    expect(ld.codeRepository).toBeUndefined();
  });
});
