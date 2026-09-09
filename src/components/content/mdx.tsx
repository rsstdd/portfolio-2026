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
  components?: Record<string, React.ComponentType<any>>;
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
            rehypePlugins: [rehypeSlug],
          },
        }}
        components={{ ...registry, ...components }}
      />
    </div>
  );
}
