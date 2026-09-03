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

## Imported Claude Cowork project instructions

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

# Voice

**Companion to:** `DESIGN_SYSTEM.md` §6 (Microcopy), which is this document's one-paragraph summary, and `DESIGN_PHILOSOPHY.md`, which argues the personality this voice is built from.
**Scope:** prose and copy on the portfolio site itself. Not the resume variants, which the Job Search `CLAUDE.md` governs under a different, ATS-facing set of rules, and not correspondence, which follows your own writing rules directly. All three are siblings rather than the same document three times: one set of values, aimed at three different registers.
**Written:** 30 July 2026.

---

## 0. Where this voice comes from, and where it differs

Your own writing rules already specify most of what follows: state the controlling claim directly, fold concession into the claim itself rather than hedging in front of it, assert personal judgment flatly, reserve hedging for genuinely ambiguous material, no contractions, "because" for causation, "however" and "although" for a turn into complication or concession. That ruleset also names its own gap: its context table covers academic writing, technical explanation, email and memo, professional chat, informal messages, executive summaries, instructions, and reflective or narrative writing, and then states a residual rule for anything else: apply the core voice and sentence rules, follow the target format's own structural convention, and do not invent warmth, humor, or slang beyond what is specified. A public marketing and portfolio site is exactly that uncovered case, so this document is the residual rule worked out in full rather than left implicit.

In practice the site's copy splits across two of the registers your ruleset already names, depending on which part of the page you are reading. The first-person narrative passages, `/about` and the reflective parts of the colophon, are reflective and narrative: direct first person, plain stated judgment, hedging reserved for genuinely uncertain claims. Everything structural, buttons, errors, empty states, navigation, data plates, project claims, reads as technical explanation or instructions: point first, short, causal, no subordination for its own sake. That split is intentional. `/about` sounds like you talking. A button label sounds like a tool labeling itself. Both are correct, and neither should sound like the other.

---

## 1. The non-negotiables

These apply everywhere on the site, in every register, with no exception:

No contractions, anywhere, including casual-reading pages like `/about`. No exclamation points. Sentence case everywhere, including headings and button labels; never title case. No filler enthusiasm and no unsolicited encouragement in interface copy: a save either succeeded, in which case it says "Saved," or it did not, in which case the error rules in Section 2.6 apply. Numbers stay exactly as precise as the source material, never rounded or swapped for convenience: the home page intro says "a decade," counting from entering the field in 2016, while the figure that belongs anywhere precision matters, starting with the CV, is "~9 years," measured instead from the first paid engineering role in 2017. The two are not interchangeable even though both are defensible, because they answer slightly different questions. Every claim about your work carries a checkable anchor, a repo link, a named mechanism, or an explicit "not yet measured" placeholder, rather than resting on an adjective alone. No stock evaluative phrasing: "it's worth noting that," "overall, this demonstrates," and similar filler do not appear in copy any more than they should appear in speech to you directly.

---

## 2. Register by content type

### 2.1 Hero and headline

Point first, no subordinate clauses, twelve words or fewer, per the constraint `PORTFOLIO_PLAN.md` already sets. The model is already written: "Sensors first. Then products. Then platforms." Three words, three words, two words. The rhythm is the argument for breadth. A sentence that instead claimed "I have broad experience across hardware and software" would be asserting the same fact and proving none of it, which is the exact failure mode Section 3 of `DESIGN_PHILOSOPHY.md` names.

### 2.2 Supporting prose: `/about`, colophon, intros

First person, direct, judgments stated flatly with no disclaimer in front of them. This is the one place on the site built for the long cumulative sentence, one main clause carrying two or three subordinate clauses toward a concrete payoff, followed by something short to close it. The model is already written, in `about.mdx`: "I prefer boring tooling, and I would rather check something than reason about it." A flat opinion, no "I could be wrong, but," no "I tend to." A hedged rewrite, "I tend to lean toward simpler tools where possible," would violate your own rule against softening a stated personal judgment, and it would also be a worse sentence.

### 2.3 Project claims: one sentence, sourced

Third person or no person at all; this is technical-explanation register, so lead with the claim and use "because" for mechanism rather than for justification. The model, already decided in `PORTFOLIO_PLAN.md`: "Concurrent async scraping pipeline with backpressure, graceful shutdown, and rate-limit-aware retry." Notice what is absent: no adjective is standing in for a mechanism it has not named. Nothing here reads "robust" or "powerful" or "scalable," because every word names something a reviewer could open the repository and go check.

### 2.4 Honest limits

This is the section most portfolios get wrong by instinct, so name the failure before showing the pattern. The ordinary move is to bury a limitation in future tense: "authentication is planned for an upcoming release." Here it is stated in the same flat register as any other fact, no apology in front of it and no redeeming clause after it. The models are already decided in `PORTFOLIO_PLAN.md`: "auth is scaffolded but commented out and not claimed," and, for the chat feature, "std TCP, not WebSockets." The shape is always the same: name the limit, name the actual current state, stop. A sentence that adds "but this is easy to fix" or "for now" is doing exactly the softening this section exists to refuse.

### 2.5 Data plates and captions

Mono, terse, and not a sentence, because a caption is a nameplate rather than a claim and should not apologize for being one. The model, from `DESIGN_SYSTEM.md`: `X-T5 · 23mm · f/8 · 1/250 · ISO 160 · 2026-07-29`. No verb, no article, no punctuation beyond the separators. If a caption needs a verb to make sense, it is carrying more than a caption should.

### 2.6 UI microcopy: buttons, errors, empty states, navigation

Short and imperative, the instructions register, which is the one place subordination should drop out almost entirely. Buttons open with a verb: "View the work," never "Click here to view the work" or the passive "The work can be viewed here." Errors state what happened and then what to do about it, in that order, one plain sentence each, with no apology theater in front of either clause. Applying that rule to a build failure produces something in this shape: "The build could not read `content/cv.mdx`. Check the frontmatter against the schema in `src/lib/content/schema.ts`," rather than "Oops, something went wrong." Empty states say what belongs in the empty space and how to fill it, in one sentence: "No posts yet. Add one under `content/posts`." Neither of these two examples is copy that exists in the app today; they illustrate the rule rather than quote a screen, and should be treated as a pattern to build toward rather than as text already shipped.

### 2.7 System pages: 404, robots stance, license note

One line, on voice, no exception. The 404 line is already decided: "No entry at this datum." It is worth noticing why this particular sentence earns its place rather than merely fitting the rule: it reads as a dry joke only to someone who already knows what a datum is, it is also a literally true statement (there is genuinely no reference point at this URL), and it does all of that without an exclamation point, a shrug emoji, or the word "oops."

---

## 3. Contrast, to make the difference concrete

| Instead of (the brochure register) | The site's register |
|---|---|
| "Passionate full-stack engineer with a proven track record of delivering high-impact solutions!" | "Sensors first. Then products. Then platforms." |
| "Expertly architected a robust, scalable platform" | "Architected Borealis, a framework-agnostic Lit and Web Components platform adopted by four to five product teams across Next.js, Svelte, React, Vue, and .NET" |
| "Authentication coming soon!" | "Auth is scaffolded but commented out and not claimed." |
| "Successfully saved!" | "Saved." |
| "Oops, something went wrong. Please try again." | States what failed and what to do next, in that order, and stops there. |

Every row on the left asks a reader to believe something. Every row on the right gives a reader something to check instead, which is the entire argument of `DESIGN_PHILOSOPHY.md` §3 restated at the sentence level.

---

## 4. Final check before publishing any new copy

Read it aloud before it ships. If a contraction, an exclamation point, or title case slipped in anywhere, including a button label, fix it before anything else.

Take every claim about your work and ask whether a reader could verify it from something linked on the same page. If not, cut the claim or mark it unverified rather than leaving it to stand on tone.

Take every limitation you already know about and ask whether it is worse to state it or worse to let a reviewer find it first. It is almost always worse to let them find it first, and stating it plainly is what makes the rest of the page believable.

Find every adjective doing a mechanism's job and replace it with the mechanism: not "robust," but what specifically makes it hold up under failure.

Read the sentence back as if the reader already dislikes portfolio sites and has seen a hundred of them. That reader, skeptical by default and unmoved by tone, is the actual audience this voice is built for.
