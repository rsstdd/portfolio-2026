# portfolio: next steps

## The constraint that makes this project worth building

Server Components are the default. Every `"use client"` you write must be
defensible in one sentence. If you cannot defend it, the boundary is in the
wrong place. That discipline is the entire pedagogical value here.

## Build order

Every item below is done. Kept as a record of what was planned and where the
build departed from it, because two of the departures were improvements and
one of the original steps would have introduced a bug.

1. Done. Static `/` and `/projects` from the MDX loader. No client components
   at all.
2. Done. `/projects/[slug]` with `generateStaticParams` and `generateMetadata`.
3. **Superseded, and deliberately not done.** This called for
   `opengraph-image.tsx` rendering cards at build time with JSX. The cards are
   static PNGs in `public/images/og/` instead, rasterised from committed SVG
   masters by `scripts/render-og.mjs` and wired to routes through the `ogImage`
   frontmatter field. Do not add `opengraph-image.tsx`: a route carrying both a
   static image and Next's file convention emits two competing `og:image` tags.
   See `scripts/OG_CARDS.md`.
4. **Superseded.** This called for exactly one client island. There are zero,
   and the theme control gets the same result with three radio inputs and a
   `:root:has()` selector. A small inline script persists the choice without a
   hydration boundary. See `REPO_LAYOUT.md` section 4, which is where the budget
   is tracked.
5. Done, then extended. `/cv` renders from a single MDX source, and
   `scripts/render-cv.mjs` drives that same page through print media to write
   `public/cv/ross-todd.pdf`. This item used to end "no build step produces a
   PDF", which stopped being true when the script landed.

## Content

Point `content/projects/*.mdx` at the real repositories. Do not restate anything
Portfolio_Deep_Dive_Report.md flagged as unverifiable. Specifically: do not claim
working auth on rusti_aircraft_api, because that code is commented out.
