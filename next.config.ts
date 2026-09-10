import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Production previously sent only the HSTS header Vercel adds, on a site that
 * publishes a post reconstructing XSS and CSRF by hand and an interview log
 * about a web-security screen. Anyone impressed enough by that writing to check
 * is exactly the person who runs a header scan.
 *
 * Everything can be `'self'` because the site genuinely loads nothing else:
 * next/font self-hosts IBM Plex at build time, there is no analytics or tag
 * manager, and `grep -r 'process.env' src/ scripts/` returns nothing. The
 * privacy page's "no third-party requests" claim and this policy are the same
 * fact stated twice, and a CSP violation would mean one of them became false.
 *
 * THE WEAK DIRECTIVE, NAMED RATHER THAN HIDDEN
 *
 * `script-src` carries 'unsafe-inline' and cannot avoid it here, for two
 * reasons rather than one. Next emits inline flight-data scripts, and the theme
 * control's own inline script restores a stored choice before first paint,
 * which is the whole point of it being inline. The alternative, a per-request
 * nonce, needs dynamic rendering. Every route is statically generated and
 * CLAUDE.md makes that a rule, so buying a strict script-src would cost the
 * property the whole site is built on, and would also cost a theme that does
 * not flash on load. The directives that do real work for a static document site
 * are frame-ancestors, object-src, base-uri and form-action, and those are
 * strict.
 *
 * 'unsafe-inline' on style-src is Next's inlined critical CSS. Both were
 * confirmed by loading every route with the console open, not by reasoning.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No route asks for any of these, so refusing them costs nothing and makes an
  // injected script's options smaller.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Redundant with frame-ancestors for current browsers, kept for old ones.
  { key: "X-Frame-Options", value: "DENY" },
];

const config: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

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
