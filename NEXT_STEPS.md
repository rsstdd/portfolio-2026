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

## Standing tasks that need a Google login

These cannot be automated from this repository. Search Console has no
unauthenticated API, the sitemap ping endpoint was removed in June 2023, and
there are no credentials on the build machine. They are written down here
because the alternative is what already happened: the verification token sat in
`layout.tsx` for weeks while nobody submitted anything.

**Submit the sitemap.** Property `https://rsstdd.com/`, already verified by the
`google-site-verification` meta tag in `src/app/layout.tsx`.

    https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Frsstdd.com%2F

Enter `sitemap.xml` and submit. Note that `robots.txt` already declares the
sitemap, which Google accepts as a submission method and which its own
ping-deprecation notice recommends, so this is a reporting convenience rather
than a prerequisite for being crawled.

**Read Performance.** Queries, impressions and clicks. The useful signal is a
page with impressions and no clicks: it ranks and nobody chooses it, which is a
title or description problem rather than a content one.

**Read Pages.** Anything Google declined to index, and the reason it gives.

What the repository does guarantee, so that none of the above finds a defect:
`e2e/smoke.spec.ts` walks every URL in the sitemap and fails on a wrong `h1`
count, a canonical pointing elsewhere, a stray `noindex`, or a description past
the schema's 200-character cap.
