# portfolio-2026: repository layout

**Written:** 29 July 2026, after the first successful scaffold.

---

## 0. The problem to fix first

The current tree has content in two places:

```
content/projects/plane-scraper.mdx     <- what loader.ts actually reads
src/content/about.mdx                  <- where the copied files landed
src/content/cv.mdx
src/content/projects/
src/content/loader.ts
src/content/schema.ts
```

That is why `/about` 404s. Nothing is reading `src/content`, and the loader points at `content/projects` from `process.cwd()`.

## 1. The rule

**Content is data and lives at the repository root. Code lives in `src/`.**

Three reasons, in order of weight:

1. Prose is not TypeScript, and keeping it out of `src/` means the tsconfig, Biome, and Vitest globs never need a special case for it. Every exclusion rule you avoid writing is a rule that cannot go stale.
2. `src/` in a Next project means application code by convention, and a reviewer reading the repo should not have to work out which of two `content` directories is authoritative.
3. Editing an MDX file should not feel like editing the application. The separation is a small, daily ergonomic win.

The loader and schema are code, so they move to `src/lib/content/`, which is where the rest of the non-component logic will live.

## 2. Fixing it

```bash
cd ~/dev/portfolio-2026

# The scaffold's placeholder is superseded by the real plane-scraper.mdx.
rm -f content/projects/plane-scraper.mdx

# Content to the root.
mv src/content/about.mdx src/content/cv.mdx content/
mv src/content/projects/*.mdx content/projects/

# Code to src/lib. The old loader/schema are replaced wholesale by the versions
# in React_Cookbook/src/lib/content/ (index.ts and schema.ts), which add the
# about and cv singletons, sort featured-first, and name the offending file in
# validation errors.
mkdir -p src/lib/content
rm -rf src/content

# Then copy React_Cookbook/src/lib/content/{index.ts,schema.ts} into src/lib/content/
# and React_Cookbook/design-tokens.css into src/styles/.

grep -rn "@/content" src/ || echo "no stale imports"
```

Verify with `ls content/projects` showing eight files, then `pnpm typecheck`.

Imports become `@/lib/content` rather than `@/content/loader`, which reads better at the call site anyway.

## 3. Target tree

```
portfolio-2026/
├── content/                      # data. Not code. Edited like prose.
│   ├── projects/*.mdx
│   ├── about.mdx
│   └── cv.mdx
│
├── public/
│   ├── fonts/                    # self-hosted IBM Plex woff2
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # fonts, Datum tokens, nav, footer
│   │   ├── page.tsx              # /
│   │   ├── opengraph-image.tsx   # build-time social card
│   │   ├── not-found.tsx         # "No entry at this datum."
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── projects/
│   │   │   ├── page.tsx          # /projects
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # generateStaticParams + generateMetadata
│   │   │       └── opengraph-image.tsx
│   │   ├── about/page.tsx
│   │   ├── cv/page.tsx
│   │   ├── colophon/page.tsx
│   │   ├── impressum/page.tsx
│   │   └── privacy/page.tsx
│   │
│   ├── components/
│   │   ├── layout/               # SiteHeader, SiteFooter
│   │   ├── content/              # ProjectCard, DataPlate, Placard, mdx-components
│   │   └── ui/                   # Button, Tag, SectionRule (the datum tick)
│   │
│   ├── lib/
│   │   ├── content/              # index.ts, schema.ts
│   │   └── site.ts               # name, url, socials. One source for metadata.
│   │
│   ├── styles/
│   │   ├── globals.css           # @import "tailwindcss" then the tokens
│   │   └── design-tokens.css     # Datum, copied from React_Cookbook
│   │
│   └── test/setup.ts
│
├── e2e/smoke.spec.ts
└── (configs at root)
```

### Why `components/` splits three ways

`layout/`, `content/`, and `ui/` rather than one flat directory or a strict atomic-design hierarchy. Flat stops scaling around fifteen files. Atomic design imposes a taxonomy argument (is a card a molecule or an organism?) that produces no benefit at this size. Three buckets answers the only question that actually recurs, which is whether a component is page furniture, content rendering, or a primitive.

### Why `lib/site.ts`

Site name, canonical URL, and social links appear in the layout metadata, the OG images, the JSON-LD, the sitemap, and the footer. Five copies of a URL is four opportunities to update it in only four places.

## 4. Client-component budget

Track it in one place, and the place is this file:

| Island | Status |
|---|---|
| — | none |

Every addition gets a row here and a one-sentence justification comment above its `"use client"`. The colophon claims zero client components, so the claim needs somewhere to be checked.

## 5. Import conventions

- `@/lib/...`, `@/components/...` for everything crossing a directory. Relative imports only within the same directory.
- Content is imported through `@/lib/content` and nowhere else, so the filesystem access has exactly one entry point.
- `src/lib/content/index.ts` is server-only. If a client component ever needs project data, it receives it as props from a Server Component rather than importing the loader.

## 6. On the wider `~/dev` directory

Three project repositories (`aircraft`, `portfolio-2026`, `photography`) plus your existing work is correct as it stands. Do not consolidate them into a monorepo: they share a design system and nothing else, and a Turborepo across three unrelated deployables is infrastructure cosplay.

Share the design system by copying `design-tokens.css` into each project. It is roughly 200 lines and it changes rarely, so a published package would cost a release cycle per tweak and buy very little. Revisit only if the file starts drifting between projects, and treat that drift as the signal rather than guessing in advance.

One loose end: `bootstrap.mjs` currently sits in `~/dev` as an untracked file. It is a real tool with real bug-fix history behind it, so move it into a repository, whether that is your `notes` repo or its own.
