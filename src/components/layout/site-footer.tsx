import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line md:mt-32">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-5 py-8 md:flex-row md:items-baseline md:justify-between md:px-8 lg:px-10">
        <p className="font-mono text-caption tabular-nums text-muted">
          {site.name} · {site.location} · {new Date().getUTCFullYear()}
        </p>

        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { href: site.github, label: "GitHub" },
            { href: site.linkedin, label: "LinkedIn" },
            { href: `mailto:${site.email}`, label: "Email" },
            { href: "/impressum", label: "Impressum" },
            { href: "/privacy", label: "Privacy" },
          ].map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-mono text-caption uppercase tracking-[0.08em] text-muted transition-colors duration-[--duration-fast] hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
