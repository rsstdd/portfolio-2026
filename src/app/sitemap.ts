import type { MetadataRoute } from "next";
import { getBlogPosts, getProjects } from "@/lib/content";
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

  const staticRoutes = [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cv`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
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
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ] satisfies MetadataRoute.Sitemap;

  const projectRoutes = projects.map(
    (project): MetadataRoute.Sitemap[number] => ({
      url: `${baseUrl}/projects/${project.slug}`,
      changeFrequency: "yearly",
      priority: project.featured ? 0.8 : 0.6,
    }),
  );

  const postRoutes = posts.map(
    (post): MetadataRoute.Sitemap[number] => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated ?? post.date,
      changeFrequency: "yearly",
      // Flat, unlike projects: blogPostSchema has no `featured` field to rank on.
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
