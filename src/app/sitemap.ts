import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * robots.txt
 *
 * Search crawlers are welcome, because the site exists to be found. The legal
 * pages are excluded here and also carry noindex metadata, since a robots
 * disallow alone does not prevent indexing.
 *
 * The AI-training crawlers below are a stated position rather than an enforced
 * one: compliance is voluntary and unverifiable. Keep this list consistent with
 * whatever the photography site declares, because two different answers from
 * the same person is worse than either answer.
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
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/impressum", "/privacy"],
      },
      ...aiCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
