import { getBlogPosts } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * RSS 2.0 feed for the blog.
 *
 * `force-static` is not optional. Next changed the default caching for `GET`
 * route handlers from static to dynamic in 15.0.0-RC, so without this line the
 * feed would render per request — the one dynamically rendered route on a site
 * whose stated rule is that static generation is the only mode.
 */
export const dynamic = "force-static";

/**
 * Escaped rather than wrapped in CDATA, so the output stays readable in a diff
 * and a bad character shows up as a bad character rather than as a swallowed
 * block. Several titles carry apostrophes and colons, so this is load-bearing
 * rather than defensive.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  /*
   * Sorted by date here rather than reusing the loader's order. `getBlogPosts`
   * puts featured posts first, which is a navigation decision for the site; a
   * feed is a chronology, and an aggregator that renders in document order
   * would show a month-old post above a newer one.
   */
  const posts = [...getBlogPosts()].sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = posts
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${post.date.toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const newestPost = posts.reduce<Date | undefined>((newest, post) => {
    const stamp = post.updated ?? post.date;
    return !newest || stamp > newest ? stamp : newest;
  }, undefined);
  const lastBuildDate = (newestPost ?? new Date(0)).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Notes · ${site.name}`)}</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on web security, databases, concurrency, and agentic engineering practice.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
