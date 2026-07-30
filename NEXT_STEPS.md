# portfolio: next steps

## The constraint that makes this project worth building

Server Components are the default. Every `"use client"` you write must be
defensible in one sentence. If you cannot defend it, the boundary is in the
wrong place. That discipline is the entire pedagogical value here.

## Build order

1. Static `/` and `/projects` from the MDX loader. No client components at all.
2. `/projects/[slug]` with `generateStaticParams` and `generateMetadata`.
3. `opengraph-image.tsx` rendering social cards at build time with JSX.
4. Exactly one client island (theme toggle or filter chips). Justify it in a comment.
5. `/cv` from a single MDX source, so the page and the PDF never disagree.

## Content

Point `content/projects/*.mdx` at the real repositories. Do not restate anything
Portfolio_Deep_Dive_Report.md flagged as unverifiable. Specifically: do not claim
working auth on rusti_aircraft_api, because that code is commented out.
