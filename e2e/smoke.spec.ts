import { expect, test } from "@playwright/test";

test("the application boots and renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

/*
 * Discoverability markup is invisible in the browser, so nothing about the page
 * looking correct proves it is still there. Every assertion below is something
 * that was silently missing before and would go missing again unnoticed.
 */
test("a blog post carries the structured data search engines read", async ({ page }) => {
  await page.goto("/blog/cors");

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  expect(types).toContain("BlogPosting");
  expect(types).toContain("BreadcrumbList");

  const raw = blocks[types.indexOf("BlogPosting")];
  if (!raw) throw new Error("No BlogPosting block on the page.");
  const posting = JSON.parse(raw);
  expect(posting.datePublished).toBeTruthy();
  // The author is an @id reference to the Person the home page declares, not an
  // inline object. An inline author would be a second, unlinked entity.
  expect(posting.author["@id"]).toContain("#person");

  await expect(page.locator("time[datetime]").first()).toBeVisible();
  await expect(page.locator('meta[property="og:type"][content="article"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:locale"][content="en_US"]')).toHaveCount(1);
  await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveCount(1);
  await expect(page.locator("header .text-overline a.prose-link").first()).toBeVisible();

  // rehype-slug: every section is a link, and eligible for a jump-to result.
  expect(await page.locator("article h2[id]").count()).toBeGreaterThan(0);
});

test("the blog is reachable from the primary nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('nav[aria-label="Primary"] a[href="/blog"]')).toHaveCount(1);
});

test("the feed is served and well formed", async ({ request }) => {
  const res = await request.get("/feed.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/rss+xml");

  const xml = await res.text();
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain("<item>");
  // Unescaped ampersands are the classic way a feed stops parsing.
  expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);

  const publicationDates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((match) =>
    Date.parse(match[1] ?? ""),
  );
  expect(publicationDates.length).toBeGreaterThan(1);
  expect(publicationDates).toEqual([...publicationDates].sort((a, b) => b - a));

  const lastBuildDate = xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/)?.[1];
  if (!lastBuildDate) throw new Error("The feed has no lastBuildDate.");
  expect(Date.parse(lastBuildDate)).toBeGreaterThanOrEqual(Math.max(...publicationDates));
});

/*
 * The theme control is the one thing on this site that can look perfect and do
 * nothing. It is three radios styled with icons, and the switching is done by
 * `:root:has(#theme-dark:checked)` in CSS — so renaming an id, or restructuring
 * the labels, leaves a control that still renders and still highlights and no
 * longer changes anything. Nothing else would catch that.
 */
test("the theme control actually switches the theme", async ({ page }) => {
  await page.goto("/");

  /*
   * Reads the token rather than `body`'s computed background. The body carries
   * `transition-colors`, so sampling the rendered colour straight after a click
   * catches it mid-transition and compares two intermediate greys. The custom
   * property flips instantly, and it is also the thing actually under test:
   * whether the `:has()` selector matched.
   */
  const bg = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());

  const system = await bg();

  /*
   * Clicks the label, not the input. The radio is `sr-only` and one pixel wide,
   * so a pointer cannot reach it and its wrapper intercepts the event; the
   * label is the visible control and is what a person actually clicks.
   */
  await page.locator('label[for="theme-dark"]').click();
  const dark = await bg();
  expect(dark).not.toBe(system);

  await page.locator('label[for="theme-light"]').click();
  expect(await bg()).not.toBe(dark);
});

test("each theme glyph still names itself for a screen reader", async ({ page }) => {
  await page.goto("/");

  // The visible label is an icon, so the name comes from sr-only text. Losing
  // it would leave three unnamed radios and no way to tell them apart.
  for (const name of ["System", "Light", "Dark"]) {
    await expect(page.getByRole("radio", { name })).toHaveCount(1);
  }
  await expect(page.getByRole("group", { name: "Theme" })).toBeVisible();
});
