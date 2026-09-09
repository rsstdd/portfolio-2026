import type { MetadataRoute } from "next";
import { getAbout, getBlogPosts, getCv, getDesignSystem, getProjects, getTags } from "@/lib/content";
import { site } from "@/lib/site";

const baseUrl = new URL(site.url).origin;

/*
 * Every indexable route, generated from the loader rather than listed by hand.
 *
 * /privacy and /impressum are deliberately absent: both set
 * `robots: { index: false }`, so listing them here would ask search engines to
 * index pages the pages themselves decline.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();
  const posts = getBlogPosts();

  /*
   * `lastModified` on the index pages is the newest thing they list, not the
   * build clock. A date that moves on every deploy tells a crawler the page
   * changed when nothing on it did, and it stops being a signal worth reading.
   */
  /*
   * Reduced rather than read off `posts[0]`. `getBlogPosts` sorts featured
   * first, so the head of that array is whichever post carries the flag, not
   * the newest one — and a `lastmod` taken from it would move backwards the
   * first time a non-featured post shipped.
   */
  const newestPost = posts.reduce<Date | undefined>((newest, post) => {
    const stamp = post.updated ?? post.date;
    return !newest || stamp > newest ? stamp : newest;
  }, undefined);
  // These three carry their own `updated` in frontmatter, so the sitemap can
  // state a real date rather than omitting one.
  const about = getAbout();
  const cv = getCv();
  const design = getDesignSystem();
  const newestProject = projects.reduce<Date | undefined>(
    (newest, p) => (!newest || p.date > newest ? p.date : newest),
    undefined,
  );

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: newestProject,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: newestProject,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: about.updated,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cv`,
      lastModified: cv.updated,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPost,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/colophon`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/design`,
      lastModified: design.updated,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ] satisfies MetadataRoute.Sitemap;

  const projectRoutes = projects.map((project): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.date,
    changeFrequency: "yearly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  const postRoutes = posts.map((post): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "yearly",
    priority: post.featured ? 0.8 : 0.6,
  }));

  /*
   * Only tags with a page. `getTags` applies the two-post threshold, so a tag
   * listed here always resolves to a route `generateStaticParams` built.
   */
  const tagRoutes = getTags().map((tag): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}/blog/tags/${tag.slug}`,
    lastModified: newestPost,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...tagRoutes];
}
