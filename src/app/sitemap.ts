import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { site } from "@/lib/site";

const baseUrl = new URL(site.url).origin;

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();

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
      url: `${baseUrl}/colophon`,
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

  return [...staticRoutes, ...projectRoutes];
}
