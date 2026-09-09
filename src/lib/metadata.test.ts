import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";

/**
 * `pageMetadata` exists to prevent a specific, documented canonical-URL defect
 * (see the docstring on the function). These tests pin the behaviours that
 * defect and its two follow-ups depended on, all three of which were live bugs:
 * a missing canonical, an `openGraph` object that silently dropped the root
 * layout's `siteName`/`locale`, and an `alternates` object that dropped the
 * feed link.
 */
describe("pageMetadata", () => {
  it("always states a canonical, which is the whole reason it exists", () => {
    expect(pageMetadata({ path: "/cv" }).alternates?.canonical).toBe("/cv");
  });

  it("keeps the feed discoverable, because setting alternates replaces the layout's", () => {
    const types = pageMetadata({ path: "/" }).alternates?.types;
    expect(types?.["application/rss+xml"]).toContain("/feed.xml");
  });

  it("restates siteName and locale, because setting openGraph replaces the layout's", () => {
    const og = pageMetadata({ path: "/" }).openGraph;
    expect(og?.siteName).toBeTruthy();
    expect(og && "locale" in og ? og.locale : undefined).toBe("en_US");
  });

  it("defaults to a website, not an article", () => {
    // `OpenGraph` is a discriminated union, so `type` needs narrowing to read.
    const og = pageMetadata({ path: "/" }).openGraph;
    expect(og && "type" in og ? og.type : undefined).toBe("website");
  });

  it("emits article dates only when the type is article", () => {
    const published = new Date("2026-08-08T00:00:00.000Z");
    const article = pageMetadata({ path: "/blog/x", type: "article", publishedTime: published });
    const og = article.openGraph;
    expect(og && "type" in og ? og.type : undefined).toBe("article");
    expect(og && "publishedTime" in og ? og.publishedTime : undefined).toBe(
      published.toISOString(),
    );

    const site = pageMetadata({ path: "/", publishedTime: published });
    expect(site.openGraph && "publishedTime" in site.openGraph).toBe(false);
  });

  it("falls back to the default social card but honours an explicit one", () => {
    const fallback = pageMetadata({ path: "/" }).openGraph?.images;
    expect(JSON.stringify(fallback)).toContain("/images/og/default.png");

    const explicit = pageMetadata({ path: "/p", image: "/images/og/cv.png" }).openGraph?.images;
    expect(JSON.stringify(explicit)).toContain("/images/og/cv.png");
  });

  it("omits title and description rather than emitting empty ones", () => {
    const meta = pageMetadata({ path: "/" });
    expect("title" in meta).toBe(false);
    expect("description" in meta).toBe(false);
  });
});
