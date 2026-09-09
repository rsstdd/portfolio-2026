import rehypeShiki from "@shikijs/rehype";
import type { MDXComponents } from "mdx/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import {
  ControlsDemo,
  DataDemo,
  DataPlate,
  ElevationDemo,
  Section,
  SectionRule,
  SwatchGrid,
  Term,
} from "@/components/ui";

// Default registry for the Datum system
const registry = {
  Section,
  SwatchGrid,
  DataPlate,
  ControlsDemo,
  ElevationDemo,
  DataDemo,
  SectionRule,
  Term,
};

type MdxProps = {
  source: string;
  className?: string;
  /*
   * `MDXComponents` from `mdx/types` rather than the `ComponentType<any>` this
   * used to be, which switched off checking for every component in the map.
   * This is the type MDX itself publishes for a component registry, so it
   * accepts the varied prop shapes in `registry` without an escape hatch.
   */
  components?: MDXComponents;
};

export function Mdx({ source, className = "", components = {} }: MdxProps) {
  // Debug check: If source is missing, this will let you know immediately.
  if (!source) {
    console.warn("Mdx component received an empty source string.");
    return null;
  }

  return (
    <div className={`prose-datum ${className}`}>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            /*
             * Heading ids, so every section in a post or a project is a link
             * and Google can offer a jump to one.
             *
             * `rehype-slug` only. `rehype-autolink-headings` would wrap each
             * heading in an anchor, and `.prose-datum a` in prose.css carries
             * an underline, so every heading on the site would gain one. The
             * ids are the whole payload; a visible anchor affordance is a
             * separate design decision that needs a carve-out in that rule.
             */
            rehypePlugins: [
              rehypeSlug,
              /*
               * Highlighting runs here, at build time, inside the same rehype
               * pass. No client JavaScript, so the zero-client-components rule
               * is untouched and a code block costs the reader nothing.
               *
               * `min-light`/`min-dark` because DESIGN_SYSTEM.md allows one
               * accent per view: a saturated theme would put ten more in every
               * code block and fight the monochrome chrome around it.
               *
               * `defaultColor: false` emits `--shiki-light` and `--shiki-dark`
               * as CSS variables rather than baking one theme into the markup,
               * which is what lets prose.css follow the theme control.
               */
              [
                rehypeShiki,
                {
                  themes: { light: "min-light", dark: "min-dark" },
                  defaultColor: false,
                },
              ],
            ],
          },
        }}
        components={{ ...registry, ...components }}
      />
    </div>
  );
}
