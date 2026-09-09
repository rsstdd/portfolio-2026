import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  type About,
  aboutSchema,
  type BlogPost,
  blogPostSchema,
  type Cv,
  cvSchema,
  type Home,
  homeSchema,
  type Project,
  projectSchema,
} from "./schema";

/**
 * Content loader.
 *
 * Roughly a hundred lines this project owns outright, rather than a content
 * library it would have to debug through. At this scale that is the correct
 * trade, because the whole build is legible in one file.
 *
 * Server-only: it reads the filesystem, so it must never be imported into a
 * client component. Every consumer is a Server Component, which is the point
 * of the project.
 *
 * Content lives at the repository root rather than under src/, because it is
 * data rather than code. Keeping it out of src/ means the TypeScript, Biome,
 * and Vitest globs never have to special-case prose.
 */
const CONTENT_DIR = join(process.cwd(), "content");
const PROJECTS_DIR = join(CONTENT_DIR, "projects");
const BLOG_DIR = join(CONTENT_DIR, "blog");

/**
 * Minimum posts before a tag gets its own listing page. See `getTags`.
 * Named rather than inlined because the number is a judgement, not a fact.
 */
const TAG_PAGE_THRESHOLD = 2;

/**
 * Tags are authored already lowercase and hyphenated, so this is a guard
 * against a future one that is not, rather than a transformation.
 */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}

export type LoadedProject = Project & { slug: string; body: string };
export type LoadedBlogPost = BlogPost & { slug: string; body: string };
export type LoadedAbout = About & { body: string };
export type LoadedCv = Cv & { body: string };
export interface DesignSystemContent {
  overline: string;
  title: string;
  description: string;
  updated: Date | undefined;
  body: string;
}

function read(path: string) {
  /*
   * A missing content file is a setup mistake, not a runtime condition, so the
   * error names the file and says what to do. The raw ENOENT points at this
   * line instead, which tells the reader nothing useful.
   */
  if (!existsSync(path)) {
    const relative = path.slice(path.indexOf("content"));
    throw new Error(
      `Missing content file: ${relative}\n` +
        `Create it, or remove the page that reads it. Expected under ${CONTENT_DIR}.`,
    );
  }
  const { data, content } = matter(readFileSync(path, "utf8"));
  return { data, body: content };
}

/**
 * Zod names the field but not the file, and "Expected string, received
 * undefined" with no filename is a poor thing to debug at 11pm.
 */
function fail(file: string, error: unknown): never {
  const detail = error instanceof Error ? error.message : String(error);
  throw new Error(`Invalid frontmatter in content/${file}:\n${detail}`);
}

/** All projects: featured first, ranked before unranked, then newest. */
export function getProjects(): LoadedProject[] {
  return readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const { data, body } = read(join(PROJECTS_DIR, file));
      try {
        return {
          ...projectSchema.parse(data),
          slug: file.replace(/\.mdx$/, ""),
          body,
        };
      } catch (e) {
        return fail(`projects/${file}`, e);
      }
    })
    .sort((a, b) => {
      // Ordering lives here rather than in each page, because every consumer
      // wants the same order and duplicating it invites them to drift.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;

      // Among featured projects an explicit rank wins, because recency does
      // not track strength and the date field must keep saying when the work
      // happened. A featured project with no rank sorts after every ranked
      // one rather than interleaving, so adding a rank is what promotes a
      // project and forgetting one never silently demotes another.
      if (a.featured && a.featuredRank !== b.featuredRank) {
        if (a.featuredRank === undefined) return 1;
        if (b.featuredRank === undefined) return -1;
        return a.featuredRank - b.featuredRank;
      }

      return b.date.getTime() - a.date.getTime();
    });
}

export function getProject(slug: string): LoadedProject | undefined {
  return getProjects().find((p) => p.slug === slug);
}

/** For generateStaticParams, which needs slugs without parsing every body. */
export function getProjectSlugs(): string[] {
  return readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * All blog posts, featured first and then newest.
 *
 * Same rule as `getProjects`, and it lives here for the same reason: a page
 * that re-sorted would be a second copy of the rule, free to drift.
 */
export function getBlogPosts(): LoadedBlogPost[] {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const { data, body } = read(join(BLOG_DIR, file));
      try {
        return { ...blogPostSchema.parse(data), slug: file.replace(/\.mdx$/, ""), body };
      } catch (e) {
        return fail(`blog/${file}`, e);
      }
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.date.getTime() - a.date.getTime();
    });
}

export function getBlogPost(slug: string): LoadedBlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

/** For generateStaticParams, which needs slugs without parsing every body. */
export function getBlogPostSlugs(): string[] {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Tags that earn a page of their own.
 *
 * A tag carried by one post produces a listing with one link on it, which is a
 * worse destination than the post itself and a page search engines are right to
 * treat as thin. So the threshold is two, and it is enforced here rather than in
 * the route for the same reason the sort order is: one rule, one place.
 *
 * Sorted by count and then alphabetically, so the ordering is stable across
 * builds rather than dependent on which file the reader happened to hit first.
 */
export function getTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const post of getBlogPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= TAG_PAGE_THRESHOLD)
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts carrying one tag, in `getBlogPosts` order. Empty for an unknown slug. */
export function getPostsByTag(slug: string): LoadedBlogPost[] {
  return getBlogPosts().filter((post) => post.tags.some((tag) => tagSlug(tag) === slug));
}

/** The display name for a tag slug, or undefined when the tag has no page. */
export function getTagName(slug: string): string | undefined {
  return getTags().find((t) => t.slug === slug)?.tag;
}

/** Home page copy. Frontmatter only; the body is unused. */
export function getHome(): Home {
  const { data } = read(join(CONTENT_DIR, "home.mdx"));
  try {
    return homeSchema.parse(data);
  } catch (e) {
    return fail("home.mdx", e);
  }
}

export function getAbout(): LoadedAbout {
  const { data, body } = read(join(CONTENT_DIR, "about.mdx"));
  try {
    return { ...aboutSchema.parse(data), body };
  } catch (e) {
    return fail("about.mdx", e);
  }
}

export function getCv(): LoadedCv {
  const { data, body } = read(join(CONTENT_DIR, "cv.mdx"));
  try {
    return { ...cvSchema.parse(data), body };
  } catch (e) {
    return fail("cv.mdx", e);
  }
}

export function getDesignSystem(): DesignSystemContent {
  const { data, body } = read(join(CONTENT_DIR, "design-system.mdx"));
  try {
    return {
      overline: String(data.overline ?? ""),
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      /*
       * Undefined when the frontmatter omits it, never `Date.now()`. The old
       * fallback produced a fresh timestamp on every build, which the sitemap
       * then published as a modification date for a file nobody had touched.
       */
      updated: data.updated ? new Date(String(data.updated)) : undefined,
      body,
    };
  } catch (e) {
    return fail("design-system.mdx", e);
  }
}
