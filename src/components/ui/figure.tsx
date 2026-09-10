import Image from "next/image";
import { DataPlate } from "./data-plate";

/**
 * A figure: an image that closes with a data plate.
 *
 * DESIGN_SYSTEM.md 5 has specified this component since it was written --
 * "Radius zero, no border on light; optional 1px dark-line frame on dark.
 * Caption is a data plate: hairline, then EXIF in mono" -- and section 6.2
 * names figures as one of the three places the data-plate motif appears. It was
 * designed and never built, because until now the site had no images at all:
 * not one screenshot, diagram, or photograph across eleven project pages. A
 * portfolio that asks a reader to take an entire body of work on prose alone is
 * spending credibility it does not need to spend.
 *
 * The caption reuses `DataPlate` rather than restating the hairline-and-mono
 * treatment, so the motif keeps one definition.
 *
 * The dark frame is conditional in the spec and unconditional here: a
 * screenshot of a dark interface has no edge against the dark theme's paper,
 * and a photograph does not need one but is not harmed by it. `border` on both
 * themes with a line that is nearly invisible on light gets the same result
 * without a second rule.
 *
 * WHY next/image
 *
 * `next.config.ts` has declared `formats: ["image/avif", "image/webp"]` since
 * the project started and nothing has ever used it, so responsive `srcset` and
 * format negotiation are already paid for.
 *
 * Two costs, both measured rather than assumed, because /colophon now publishes
 * the payload and a cost that hides under a tolerance is still a cost:
 *
 * 1. The Image runtime lands in the shared chunk, so every route pays for it.
 *    Adding it moved the home page from 134KB to 139KB transferred and 453KB to
 *    467KB parsed. That is 5KB on 31 routes to serve two screenshots on one,
 *    bought because the alternative ships a 250KB PNG uncompressed to everyone
 *    who opens that page, and AVIF takes it to roughly a quarter of that.
 * 2. On Vercel this routes through the image optimization service, the first
 *    runtime dependency on a site whose colophon says every route is static.
 *    The HTML is still prerendered and the claim stays true, but "static" now
 *    carries one asterisk, and an asterisk stated here beats one discovered.
 *
 * `alt` is required by the type rather than optional, because a decorative
 * screenshot is a contradiction: if it is worth the bytes it is worth
 * describing. DESIGN_SYSTEM.md 8 already requires schema-enforced alt text for
 * photography, and this is the same rule one level down.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Set on the first figure above the fold, and nowhere else. */
  priority?: boolean;
}) {
  return (
    <figure className="mt-8 max-w-prose">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 100vw, 65ch"
        className="w-full rounded-none border border-line"
      />
      <figcaption>
        <DataPlate>{caption}</DataPlate>
      </figcaption>
    </figure>
  );
}
