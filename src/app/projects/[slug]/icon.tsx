import { ImageResponse } from "next/og";
import type { JSX } from "react/jsx-runtime";
import { getProjectSlugs } from "@/lib/content";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Without this, the icon is the one route on the site rendered on demand.
 *
 * An icon in a static segment is prerendered by default, but this one sits
 * under [slug] and Next cannot enumerate a dynamic segment on its own, so it
 * shipped as a live route handler. The colophon claims every route is
 * statically generated, and until this existed that claim was false and a
 * reviewer could see it in the first screen of `pnpm build` output.
 *
 * Same source as the page in this segment, so the two cannot disagree about
 * which projects exist.
 */
export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

const BG = "#f5f2ec";
const INK = "#221f1a";
const ORANGE = "#dd4e12";

/**
 * Per-project tab icon, keyed by slug. Anything not listed renders the
 * default datum-tick mark. Built from divs rather than inline SVG, because
 * ImageResponse renders through Satori, which has solid, well-tested support
 * for flexbox and border-radius shapes and shakier support for arbitrary
 * nested <svg> children.
 */
function OrchardMark() {
  return (
    <div style={{ position: "relative", width: 22, height: 15, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `2.4px solid ${INK}`,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: -2,
          right: -2,
          height: 2.4,
          background: ORANGE,
        }}
      />
    </div>
  );
}

function DefaultMark() {
  return (
    <div style={{ position: "relative", width: 22, height: 20, display: "flex" }}>
      <div
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2.4, background: INK }}
      />
      <div
        style={{ position: "absolute", left: 0, top: 0, width: 9, height: 2.4, background: ORANGE }}
      />
    </div>
  );
}

const marks: Record<string, () => JSX.Element> = {
  "orchard-robotics": OrchardMark,
};

export default async function Icon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Mark = marks[slug] ?? DefaultMark;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
      }}
    >
      <Mark />
    </div>,
    size,
  );
}
