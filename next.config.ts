import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const config: NextConfig = {
  // Promoted from experimental to stable in Next 16. Not on by default because
  // builds are slower (the compiler runs through Babel). Learning what it does
  // is the point of this project, so it is on.
  reactCompiler: true,
  images: { formats: ["image/avif", "image/webp"] },
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["next-mdx-remote"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [],
  },
});

export default withMDX(config);
