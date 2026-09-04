import { z } from "zod";

/**
 * Content contracts.
 *
 * Every schema here validates at build time and throws on failure, deliberately.
 * A malformed content file should fail the build rather than render a blank
 * card, because a portfolio that silently drops a project is worse than one
 * that refuses to compile.
 */

/** One entry in content/projects/*.mdx */
export const projectSchema = z.object({
  title: z.string(),
  summary: z.string().max(200),
  role: z.string(),
  stack: z.array(z.string()).min(1),
  repo: z.url().optional(),
  live: z.url().optional(),
  featured: z.boolean().default(false),
  /**
   * Explicit position among featured projects, 1 being first. Optional: a
   * featured project without one sorts after every ranked project, by date.
   *
   * This exists because recency is a poor proxy for strength. The newest
   * project is not reliably the best evidence of what someone can do, and
   * encoding a judgment in the date field would mean falsifying when the work
   * happened. Ranking is a separate claim from chronology, so it gets a
   * separate field.
   */
  featuredRank: z.number().int().positive().optional(),
  date: z.coerce.date(),
  /**
   * False for anything not substantiated from source. Rendered in the data
   * plate so the claim level is visible rather than implied, and required by
   * the home page: an unchecked claim does not belong on the front page.
   *
   * This asks one question only, "has someone read the code and confirmed what
   * this page says". It deliberately says nothing about whether the project is
   * finished, which is `complete` below.
   */
  verified: z.boolean().default(true),
  /**
   * False while the project is still being built.
   *
   * Split from `verified` because the two came apart in practice: a page can
   * describe an unfinished system accurately, and conflating the two forced a
   * choice between calling checked work unchecked and calling unfinished work
   * finished. Ranked, checked, in-progress work now reaches the front page
   * while still being labelled honestly wherever a status is shown.
   */
  complete: z.boolean().default(true),
  ogImage: z.string().optional(),
});

/** One entry in content/blog/*.mdx */
export const blogPostSchema = z.object({
  title: z.string(),
  summary: z.string().max(200),
  tags: z.array(z.string()).min(1),
  date: z.coerce.date(),
  /** Set only when a post is revised after its original publish date. */
  updated: z.coerce.date().optional(),
});

/**
 * content/home.mdx — every string on the home page.
 *
 * Copy lives in content rather than in JSX so that editing a sentence is a
 * content change rather than a code change. Optional fields collapse their
 * section instead of rendering empty, which is why the footnote group is
 * optional as a set.
 */
export const homeSchema = z.object({
  headline: z.string(),
  intro: z.string(),
  workLabel: z.string().default("Selected work"),
  ctaLabel: z.string().default("View the work"),
  ctaHref: z.string().default("/projects"),
  footnote: z.string().optional(),
  footnoteLinkLabel: z.string().optional(),
  footnoteLinkHref: z.string().optional(),
});

/** content/about.mdx */
export const aboutSchema = z.object({
  title: z.string().default("About"),
  description: z.string().max(200),
  portrait: z.string().optional(),
  portraitAlt: z.string().optional(),
  updated: z.coerce.date(),
});

/** content/cv.mdx — single source for both the /cv page and the exported PDF. */
export const cvSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  workAuthorization: z.string(),
  email: z.email(),
  github: z.url(),
  linkedin: z.url().optional(),
  site: z.url().optional(),
  languages: z.string(),
  updated: z.coerce.date(),
});

export type Home = z.infer<typeof homeSchema>;
export type Project = z.infer<typeof projectSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type About = z.infer<typeof aboutSchema>;
export type Cv = z.infer<typeof cvSchema>;
