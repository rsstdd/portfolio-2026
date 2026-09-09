import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Search crawlers may index the public site.
 *
 * The legal pages carry `noindex` metadata but remain crawlable so search
 * engines can read that directive. AI crawler exclusions express a preference;
 * enforcement depends on crawler compliance.
 */

/**
 * Agents that fetch a page in order to cite it back to a reader.
 *
 * These are allowed, because blocking them removes the site from ChatGPT
 * search, Perplexity, and Claude the same way a `noindex` removes it from
 * Google, and for the same audience. A citation is a link, which is the thing
 * the rest of this site's SEO work exists to earn.
 *
 * The distinction below is not visible in the agent names, which is why it is
 * written down: `ClaudeBot` and `ChatGPT-User` fetch on behalf of a person
 * asking a question, while `anthropic-ai` and `GPTBot` crawl to build a corpus.
 */
const citationCrawlers = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot"] as const;

/**
 * Agents that crawl to assemble training data, which returns nothing.
 *
 * `Google-Extended` belongs here and costs nothing: it gates Gemini training
 * only and has never affected Google Search indexing, which Googlebot handles
 * under the `*` rule above.
 */
const trainingCrawlers = [
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "anthropic-ai",
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
      userAgent: [...citationCrawlers],
      allow: "/",
    },
    {
      userAgent: [...trainingCrawlers],
      disallow: "/",
    },
  ] satisfies MetadataRoute.Robots["rules"];

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
