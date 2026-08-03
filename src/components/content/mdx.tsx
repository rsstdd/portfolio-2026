import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  Section,
  SwatchGrid,
  DataPlate,
  ControlsDemo,
  ElevationDemo,
  DataDemo,
  SectionRule,
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
    // <div className={`prose-datum ${className}`}>
    <div className={`${className}`}>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
        components={{ ...registry, ...components }}
      />
    </div>
  );
}
