import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeControl } from "./theme-control";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
];

/**
 * Site header. Sticky, translucent, one hairline.
 *
 * No active-page marker. Reading the current route needs `usePathname`, which
 * needs a client boundary, and the colophon claims zero client components. A
 * four-item nav on a site this small can carry the cost. If the nav grows past
 * six items, revisit the trade rather than the implementation, because at that
 * point a nav island is the defensible answer.
 *
 * The nav wraps rather than collapsing into a menu, because four short labels
 * fit on one line at every realistic width and a hamburger would introduce the
 * client component this file exists to avoid.
 *
 * The theme control sits here rather than on /design because the dark palette
 * is a first-class theme in DESIGN_SYSTEM.md 7, and a theme reachable from one
 * page is a theme nobody sees. It is also a Server Component: see
 * ./theme-control.tsx for why radios and what the approach cannot do.
 */
export function SiteHeader() {
  return (
    <>
      {/*
        Skip link. Required rather than optional here: the header is sticky, so
        a keyboard user without it tabs through five links on every single page
        before reaching content.
      */}
      <a
        href="#main"
        className="text-overline uppercase sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 md:px-8 lg:px-10"
        >
          <Link
            href="/"
            className="text-overline uppercase transition-colors duration-(--duration-fast) hover:text-accent-text"
          >
            {site.name}
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-overline uppercase text-muted transition-colors duration-(--duration-fast) hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Hairline divider: the theme control is chrome, not navigation. */}
            <span aria-hidden className="hidden h-3 w-px bg-line sm:block" />

            <ThemeControl />
          </div>
        </nav>
      </header>
    </>
  );
}
