import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  type About,
  type BlogPost,
  type Cv,
  type Home,
  type Project,
  aboutSchema,
  blogPostSchema,
  cvSchema,
  homeSchema,
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

export type LoadedProject = Project & { slug: string; body: string };
export type LoadedBlogPost = BlogPost & { slug: string; body: string };
export type LoadedAbout = About & { body: string };
export type LoadedCv = Cv & { body: string };
export interface DesignSystemContent {
  overline: string;
  title: string;
  description: string;
  updated: Date;
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

/** All blog posts, newest first. No featured concept: a blog is chronological. */
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
    .sort((a, b) => b.date.getTime() - a.date.getTime());
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
      updated: new Date(data.updated ?? Date.now()),
      body,
    };
  } catch (e) {
    return fail("design-system.mdx", e);
  }
}
