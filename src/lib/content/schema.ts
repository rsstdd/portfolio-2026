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
  date: z.coerce.date(),
  /**
   * False for anything not substantiated from source. Rendered in the data
   * plate so the claim level is visible rather than implied, and used by the
   * home page to keep unfinished work off the front page automatically.
   */
  verified: z.boolean().default(true),
  ogImage: z.string().optional(),
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
  location: z.string().optional(),
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
export type About = z.infer<typeof aboutSchema>;
export type Cv = z.infer<typeof cvSchema>;
