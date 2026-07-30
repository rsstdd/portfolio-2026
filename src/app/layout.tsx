import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Root layout.
 *
 * next/font downloads IBM Plex at build time and serves it from this origin,
 * so there is no request to a font CDN at runtime. That is what makes the
 * privacy page's "no third-party requests" claim true rather than aspirational,
 * and it removes a render-blocking round trip as a side effect.
 *
 * Each family is exposed as a CSS variable that globals.css maps onto the
 * Datum font tokens. Weights are pinned to the three the design system defines,
 * because every extra weight is a font file a visitor pays for.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Ross Todd — Senior Software Engineer",
    template: "%s — Ross Todd",
  },
  description:
    "Senior software engineer in Munich working across platform engineering, distributed systems, and full-stack products.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ross Todd",
    title: "Ross Todd — Senior Software Engineer",
    description:
      "Platform engineering, distributed systems, and full-stack products.",
    url: site.url,
    locale: "en_US",
    images: [
      {
        url: "/images/og/default.png",
        width: 1200,
        height: 630,
        alt: "Ross Todd, senior software engineer, Munich",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ross Todd — Senior Software Engineer",
    description:
      "Platform engineering, distributed systems, and full-stack products.",
    images: ["/images/og/default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-bg text-ink antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
