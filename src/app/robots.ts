import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Search crawlers may index the public site.
 *
 * The legal pages carry `noindex` metadata but remain crawlable so search
 * engines can read that directive. AI crawler exclusions express a preference;
 * enforcement depends on crawler compliance.
 */
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "CCBot",
  "Applebot-Extended",
  "PerplexityBot",
  "Bytespider",
  "meta-externalagent",
] as const;

export default function robots(): MetadataRoute.Robots {
  const baseUrl = new URL(site.url).origin;

  const rules = [
    {
      userAgent: "*",
      allow: "/",
    },
    {
      userAgent: [...aiCrawlers],
      disallow: "/",
    },
  ] satisfies MetadataRoute.Robots["rules"];

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
