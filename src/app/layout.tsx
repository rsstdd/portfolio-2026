import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/lib/site";
import "./styles/globals.css";

/**
 * Root layout.
 *
 * next/font downloads IBM Plex at build time and serves it from this origin,
 * so there is no request to a font CDN at runtime. That is what makes the
 * privacy page's "no third-party requests" claim true rather than aspirational,
 * and it removes a render-blocking round trip as a side effect.
 *
 * Each family is exposed as a CSS variable that globals.css maps onto the
 * Datum font tokens. Weights are pinned to what the design system actually
 * uses, because every extra weight is a font file a visitor pays for.
 *
 * Sans carries 500 because DESIGN_SYSTEM.md 2.1 lists it and 5 spends it on
 * buttons, input labels, and tags. Without the file those rules were being
 * synthesized or silently rounded to 400. Serif ships 600 only: 2.1 permits
 * 400, but nothing on this site sets a 400-weight serif, and an unused weight
 * is a download for nobody.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-plex-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

/*
 * Site-wide defaults only.
 *
 * Do NOT add `alternates: { canonical: ... }` here. Next inherits it into every
 * route that does not override it, so one value makes /cv, /about, /projects
 * and /colophon each declare themselves a duplicate of the home page and ask
 * search engines to index the home page instead. Canonicals are per page, via
 * `pageMetadata` in src/lib/metadata.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Ross Todd · Senior Software Engineer",
    template: "%s · Ross Todd",
  },
  description:
    "Senior software engineer in Munich. Nine years across sensors, full-stack product work, and shared frontend platforms.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ross Todd",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-bg text-ink antialiased transition-colors duration-(--duration-base)">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
