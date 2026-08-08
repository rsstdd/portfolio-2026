<!-- BEGIN:nextjs-agent-rules -->
# Claude Instructions
A Next.js 13+ App Router portfolio site with MDX content, static generation, and the Datum design system.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.



## Codebase description

Single-page portfolio showcasing engineering work across hardware sensors, backend systems, frontend platforms, and full-stack projects. Entirely server-side: zero client components, no hydration, no island architecture. Content is prose, not code: `.mdx` files live at the repository root under `content/`, not in `src/`. All pages are statically generated at build time via `generateStaticParams` and `generateMetadata`. Every page loads content through a single loader (`src/lib/content/index.ts`) so ordering, metadata, and schema validation are centralized and cannot drift across pages.

## Rules

### Content and data

- **Content lives at the repository root.** `content/projects/`, `content/blog/`, `content/home.mdx`, etc. are data, not code. Editing an MDX file should feel like editing prose, not editing the application. Prose does not belong in `src/`.
- **One loader, one source of truth.** All content loads through `src/lib/content/index.ts`. No page imports `.mdx` files directly. No in-page fetch. If a third page needs the same data, the loader owns the order, schema, and deduplication.
- **Schema validation is a build-time hard stop.** Zod schemas in `src/lib/content/schema.ts` validate frontmatter. A malformed `projects/foo.mdx` blocks the build rather than silently dropping the entry or rendering a broken card. This is intentional: a portfolio that silently omits work is worse than one that refuses to compile.
- **Describe limits as explicitly as code.** If something is unfinished, unverified, or scaffolded-but-inactive, name it on the page. See `projects/[slug]/page.tsx` for the `verified` field and `VOICE.md` §2.4 for the tone. No feature should hide incompleteness behind future tense.

### Architecture and structure

- **No client components.** Everything in this site is a Server Component. If a future feature requires client interactivity, add it at the narrowest scope (one `"use client"` island, not the whole page) and track it in `REPO_LAYOUT.md` §4 before committing.
- **Content and UI are separate.** `src/components/content/` owns MDX-rendering concerns like `Mdx.tsx`. `src/components/layout/` owns site structure. `src/components/ui/` owns primitives. Do not put a typography preset in layout and a different one in content.
- **Site identity is centralized.** `src/lib/site.ts` owns the site URL, name, and social links. Every place that needs the canonical URL (layout metadata, OG images, JSON-LD, sitemap, footer) reads from this file, not from scattered constants.
- **Metadata is generated from schema.** `pageMetadata()` in `src/lib/metadata.ts` requires an explicit `path` argument to prevent a documented canonical-URL bug. Use it in every page that needs metadata, including those with dynamic `generateMetadata` functions.

### Page generation

- **Static generation is the only mode.** Every page calls `generateStaticParams` at build time. Routes are known and finite. No dynamic fallbacks, no ISR, no `revalidate`. If a new post ships, rebuild the entire site.
- **Ordering logic lives in the loader.** `getProjects()` sorts featured-first, then newest. `getBlogPosts()` does the same. Pages do not re-sort, do not apply filters, do not duplicate the rule. This prevents drift and keeps every consumer in agreement.
- **Featured content is a first-class flag.** Projects and blog posts can have `featured: true` in their frontmatter. The loader sorts them first. A page's index shows featured content prominently and in the same visual treatment as other content, not in a separate "Hero" section. The feature is there, not hidden behind scarcity.

### Voice and copy

See `VOICE.md` for the full ruleset. TL;DR:

- No contractions, anywhere.
- No exclamation points.
- Sentence case always. Never title case.
- Claims need checkable anchors: repo links, explicit mechanisms, or honest "not yet measured" labels.
- Limitations are stated plainly, no apology theater.
- Adjectives do not stand in for mechanisms: "robust" is not a claim unless you explain what makes it robust.
- First person (reflective pages like `/about`) sounds like you talking directly. Technical explanation (buttons, errors, project cards) sounds like a tool labeling itself.

Read everything aloud before shipping. If it sounds like a marketing brochure or portfolio template, it is not ready.

### Testing and build discipline

- **Every content file is built once.** If you add `content/projects/foo.mdx`, the build parses it once via `matter()`, validates it once via Zod, and caches the parsed result. Do not import the same file twice.
- **Type safety on the schema.** Adding a field to `projectSchema` or `blogPostSchema` requires updating all the type exports. Running `tsc --noEmit` catches mismatches before a page fails at runtime. Run it before pushing.
- **Verify page counts in PDF.** When exporting resumes or CVs to PDF for inclusion in `/cv`, render to PDF and assert 1 page. Five of the original ten "finished" resumes were silently 2 pages. A page-count bug is silent until someone opens it.

## Routing table

| Find                                      | Look here                                                          | Why                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Site identity (URL, name, email, socials) | `src/lib/site.ts`                                                  | Single source for metadata, OG, JSON-LD, footer.                                                                                             |
| Content schema (frontmatter shape)        | `src/lib/content/schema.ts`                                        | Every `.mdx` file is validated against this. Breaking it blocks the build.                                                                   |
| Content loader (reading and sorting)      | `src/lib/content/index.ts`                                         | All content loads here. No page imports files directly.                                                                                      |
| Page metadata generation                  | `src/lib/metadata.ts`                                              | Required `path` argument prevents canonical-URL bugs.                                                                                        |
| Site-wide prose rules                     | `VOICE.md`                                                         | How every sentence on the site should sound.                                                                                                 |
| Design system tokens and classes          | `design-tokens.css` and `DESIGN_SYSTEM.md`                         | Font sizes (`text-display`, `text-h2`, etc.), spacing, colors. All Tailwind.                                                                 |
| Repo structure and conventions            | `REPO_LAYOUT.md`                                                   | Why content lives at root, why components split three ways, client-component budget.                                                         |
| Project listings                          | `content/projects/*.mdx`                                           | Source of truth. One `.mdx` per project. Frontmatter: title, summary, role, stack, repo, live, featured, date, verified.                     |
| Blog posts                                | `content/blog/*.mdx`                                               | Source of truth. One `.mdx` per post. Frontmatter: title, summary, tags, date, updated (optional), featured (optional).                      |
| Home page copy                            | `content/home.mdx`                                                 | Schema in `schema.ts`: headline, intro, work label, CTA. No body content.                                                                    |
| About page                                | `content/about.mdx`                                                | Frontmatter: title, description, portrait (optional). MDX body rendered via `Mdx.tsx`.                                                       |
| CV page                                   | `content/cv.mdx`                                                   | Frontmatter: name, title, location, work authorization, email, github, linkedin, site, languages, updated. MDX body is the actual CV markup. |
| Page-specific UI                          | `src/app/projects/page.tsx`, `src/app/blog/page.tsx`               | List pages. Do not sort, do not filter, do not duplicate loader logic. Call `getProjects()` or `getBlogPosts()` and render.                  |
| Dynamic page generation                   | `src/app/projects/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx` | `generateStaticParams` from loader slugs. `generateMetadata` from loaded post. Content via `Mdx` component.                                  |
| Sitemap and robots                        | `src/app/sitemap.ts`, `src/app/robots.ts`                          | Auto-generated from content loader. No hardcoded routes.                                                                                     |
| MDX rendering                             | `src/components/content/mdx.tsx`                                   | Wraps `MDXRemote` from `next-mdx-remote/rsc`. No component map: styling lives in globals.css under `.prose-datum`.                           |

## Agent-specific notes

### When adding a new project

1. Create `content/projects/slug.mdx` with frontmatter: title (required), summary ≤200 chars (required), role (required), stack (required array), repo (optional URL), live (optional URL), featured (optional, defaults false), date (required), verified (optional, defaults true).
2. Zod validates it at build time. Malformed frontmatter fails the build with a specific error naming the file.
3. Do not edit pages to include it. `getProjects()` discovers the file automatically.
4. Run `tsc --noEmit` to catch type drift.

### When adding a new blog post

1. Create `content/blog/slug.mdx` with frontmatter: title, summary ≤200 chars, tags (required array), date, updated (optional), featured (optional, defaults false).
2. Zod validates. Featured posts sort first, same rule as projects.
3. Do not edit pages. `getBlogPosts()` discovers it automatically.

### When updating site identity

1. Edit `src/lib/site.ts`.
2. All metadata, OG images, JSON-LD, sitemap, and the footer pull from this single source.
3. Test the build. A stale URL will fail `pageMetadata()` validation if the domain no longer exists or resolves differently.

### When a build fails on content

Error message will name the file and the schema violation. Look at `src/lib/content/schema.ts` and fix the frontmatter, not the code.

### When adding client interactivity

Before writing `"use client"`, ask: can this be a Server Component that renders HTML + inline `<script>` instead? If yes, do that. If you must use a client component, add one row to `REPO_LAYOUT.md` §4 with its name and justification, then write the component as narrowly as possible. No global client wrappers.


<!-- END:nextjs-agent-rules -->
