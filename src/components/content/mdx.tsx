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

const datumSyntaxTheme = {
  name: "datum",
  type: "light" as const,
  colors: {
    "editor.background": "var(--well)",
    "editor.foreground": "var(--text)",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.quoted.docstring.multi"],
      settings: { foreground: "var(--text-muted)", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "storage.control",
        "entity.name.tag",
        "punctuation.definition.tag",
      ],
      settings: { foreground: "var(--accent-text)" },
    },
    {
      scope: ["string", "string.quoted", "string.regexp", "constant.numeric", "constant.language"],
      settings: { foreground: "var(--brand-hover)" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.type",
        "support.type",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "var(--text)", fontStyle: "bold" },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: "var(--text-muted)" },
    },
    {
      scope: "invalid",
      settings: { foreground: "var(--error)" },
    },
  ],
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
               * The theme emits Datum's semantic CSS variables, so the same
               * highlighted markup follows the site's light and dark modes.
               */
              [
                rehypeShiki,
                {
                  theme: datumSyntaxTheme,
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
