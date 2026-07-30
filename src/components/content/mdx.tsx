import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

/**
 * MDX renderer.
 *
 * `next-mdx-remote/rsc` compiles on the server, so this stays a Server
 * Component and adds nothing to the client bundle.
 *
 * No components map is passed, deliberately. Element styling lives in the
 * `.prose-datum` block in globals.css, which means the MDX files stay portable
 * plain Markdown rather than acquiring a dependency on this project's component
 * names. Add a map only when a file genuinely needs a React component that
 * Markdown cannot express.
 */
type ProjectBodyProps = {
  source: string;
  className?: string;
};

export function Mdx({ source, className = "" }: ProjectBodyProps) {
  return (
    <div className={`prose-datum ${className}`}>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}
