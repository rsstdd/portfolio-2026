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

test("an explicit theme survives navigation and refresh", async ({ page }) => {
  await page.goto("/");
  await page.locator('label[for="theme-dark"]').click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();
});

test("a stored light theme overrides a dark system preference on load", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "light"));

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("radio", { name: "Light" })).toBeChecked();
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
    ),
  ).toBe("#f5f2ec");
});

test("system clears the stored override and follows operating-system changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.locator('label[for="theme-dark"]').click();
  await page.locator('label[for="theme-system"]').click();

  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  await expect(page.getByRole("radio", { name: "System" })).toBeChecked();

  const lightBackground = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
      ),
    )
    .not.toBe(lightBackground);
});

test("an invalid stored theme falls back to system", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "sepia"));
  await page.goto("/");

  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  await expect(page.getByRole("radio", { name: "System" })).toBeChecked();
});

/*
 * The closing block is markup with no behaviour, which is exactly the kind of
 * thing that disappears in a refactor without anything failing. It exists so a
 * reader who has just been convinced has somewhere to go, so its absence is a
 * silent regression in the only part of this site with a commercial job.
 */
test("every page that argues for the work ends with a way to reach me", async ({ page }) => {
  /*
   * The blog paths are here because the first version of this test omitted
   * them, and so did the commit it was guarding: the closing block shipped to
   * /projects, /about and the project pages while blog posts, the only pages
   * strangers reach from search, kept having no exit. A guard is only as good
   * as its list.
   */
  for (const path of [
    "/projects",
    "/about",
    "/projects/fleet-console",
    "/blog/cors",
    "/blog/interview-question-bank",
  ]) {
    await page.goto(path);
    const contact = page.getByRole("navigation", { name: "Contact" });
    await expect(contact, `no contact block on ${path}`).toBeVisible();
    await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(contact.locator('a[href="/cv"]')).toHaveCount(1);
  }
});

/*
 * The CV PDF is a committed artifact, so the link can point at a file that was
 * never rendered or was deleted, and the page would look perfectly correct
 * while the download 404s. render-cv.mjs --check proves the file is current;
 * this proves it is actually served at the URL the page offers.
 */
test("the CV offers a PDF that is really there", async ({ page, request }) => {
  await page.goto("/cv");

  const link = page.locator('a[href$=".pdf"]');
  await expect(link).toHaveCount(1);
  const href = await link.getAttribute("href");
  if (!href) throw new Error("The CV download link has no href.");

  const res = await request.get(href);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
  // A PDF that is present but empty is the failure a status check alone misses.
  expect(Number(res.headers()["content-length"] ?? 0)).toBeGreaterThan(20_000);
});

/*
 * Printing from the dark theme.
 *
 * The print stylesheet forces a white page, and prose sets its own
 * `color: var(--text)` rather than inheriting the black forced onto <body>. So
 * while the dark mappings applied in print media, choosing dark and pressing
 * print produced near-white text on white: an invisible CV, not a dark one.
 * Nothing about the screen looking right says anything about this, and
 * render-cv.mjs cannot cover it because it renders in the browser's default
 * light state.
 */
test("the CV prints legibly after choosing the dark theme", async ({ page }) => {
  await page.goto("/cv");

  const bg = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());

  // Confirm the click really switched the theme, so the print assertion below
  // is about print media rather than about a click that silently did nothing.
  const before = await bg();
  await page.locator('label[for="theme-dark"]').click();
  await expect.poll(bg).not.toBe(before);

  await page.emulateMedia({ media: "print" });

  const luminances = await page.evaluate(() => {
    const relative = (color: string) => {
      const [r = 0, g = 0, b = 0] = (color.match(/\d+/g) ?? []).map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };
    return [...document.querySelectorAll("article p, article li, article h2")].map((el) =>
      relative(getComputedStyle(el).color),
    );
  });

  expect(luminances.length).toBeGreaterThan(0);
  // Ink on paper. Anything above 0.5 is lighter than mid-grey and vanishes.
  expect(Math.max(...luminances)).toBeLessThan(0.5);
});

/*
 * Security headers.
 *
 * A header that stops being sent looks exactly like one that is working: the
 * page renders, nothing errors, and the only symptom is a scan the site owner
 * never runs. Production shipped for months with only the HSTS header Vercel
 * adds, which is how this went unnoticed in the first place.
 *
 * The CSP assertion checks the two directives that do real work on a static
 * document site rather than the whole string, so tightening img-src or adding a
 * source does not break the test for no reason.
 */
test("every response carries the security headers", async ({ request }) => {
  for (const path of ["/", "/cv", "/feed.xml"]) {
    const res = await request.get(path);
    const headers = res.headers();

    expect(headers["x-content-type-options"], path).toBe("nosniff");
    expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"], path).toBe("DENY");

    const csp = headers["content-security-policy"];
    expect(csp, `no CSP on ${path}`).toBeTruthy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("default-src 'self'");
  }
});

/*
 * Related posts.
 *
 * The heading is the assertion. Relatedness is shared tags, and when a post
 * shares none the block falls back to recent posts rather than rendering a dead
 * end. Presenting those as "related" would be a small lie told automatically,
 * which is the kind this site exists to avoid, so the heading has to move with
 * the content.
 */
test("a post offers somewhere to go next, labelled honestly", async ({ page }) => {
  await page.goto("/blog/cors");

  const section = page.locator("section", { has: page.getByRole("heading", { level: 2 }) });
  const heading = page.getByRole("heading", { name: /Related notes|Recent notes/ });
  await expect(heading).toHaveCount(1);

  // cors carries security, web, http and browsers, which other posts share, so
  // this one must be the related case rather than the fallback.
  await expect(page.getByRole("heading", { name: "Related notes" })).toHaveCount(1);

  const links = section.locator('a[href^="/blog/"]');
  expect(await links.count()).toBeGreaterThan(0);
  // Never links to itself.
  await expect(page.locator('a[href="/blog/cors"]')).toHaveCount(0);
});
