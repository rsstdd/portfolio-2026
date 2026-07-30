# Portfolio

My portfolio site. Next.js 16 App Router, statically generated, content as MDX files in git, zero database.

<!-- Screenshot of the projects page here once the design settles. -->
<!-- Live at: add URL once deployed. -->

> **Status: in active development (July 2026).**
>

## The constraint that shapes the codebase

Server Components are the default and every `"use client"` directive must be defensible in one sentence, written as a
comment above the directive. At the time of writing the site has one client island. If that number grows, each addition
carries its justification with it. This constraint exists because the RSC boundary is the hardest part of the App Router
to reason about, and a small site is the right place to practice being strict about it.

## How content works

There is no CMS. Content is MDX files in git, parsed by roughly forty lines of code I own outright:

```
content/
  projects/*.mdx     one file per portfolio piece, frontmatter validated by Zod
  posts/*.mdx        writing, when it exists
  cv.mdx             single source for the CV page, so the page and the PDF never disagree
```

Frontmatter is parsed with `gray-matter` and validated against a Zod schema at build time. A malformed file fails the
build, because a portfolio that renders blank cards is worse than one that refuses to compile. Content libraries
(Contentlayer and its successors) would save those forty lines and cost the understanding of the build; at this scale,
owning the code is the correct trade.

The project schema includes a `verified` flag. Anything I cannot substantiate from source code I either mark accordingly
or leave out, because a portfolio is a claims document and claims should be checkable.

## Key decisions

| Decision                                       | Reasoning                                                                                                                                                                                                   |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Next.js 16, App Router, static-first           | SEO, link previews, and crawlability are the actual product requirements of a portfolio, and static generation serves all three at zero runtime cost. Dynamic rendering requires a stated reason per route. |
| React Compiler enabled (`reactCompiler: true`) | Stable in Next 16. Slower builds, accepted, because the point is writing post-compiler React everywhere.                                                                                                    |
| Social cards rendered at build                 | `opengraph-image.tsx` generates OG images from JSX per page, so every project link unfurls with its own card and nothing is hand-exported from a design tool.                                               |
| No database, no CMS                            | One author, content in version control, review via diff. Infrastructure would be cosplay.                                                                                                                   |
| Biome + minimal ESLint, Vitest, Playwright     | Same baseline as my other projects; the tooling is boring on purpose. Server Components are covered by the Playwright smoke suite because unit-testing them through a mock pipeline tests the mock.         |

## Running locally

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev            # localhost:3000
pnpm verify         # lint, typecheck, test, build
```

The production build is fully static except where a route states its reason not to be. It deploys to anything that
serves a Next build; no platform-specific features are used, deliberately, because the site should outlive any
particular host.

## Author

Ross Todd, senior software engineer in Munich.

- [GitHub](https://github.com/rsstdd)
- [LinkedIn](https://linkedin.com/in/rsstdd)

## License

MIT for the code. Written content and images are not licensed for reuse.
