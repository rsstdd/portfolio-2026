import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The closing block. A Server Component with no interactivity, so the client
 * budget in REPO_LAYOUT.md 4 stays empty and /colophon's zero-island claim
 * holds.
 *
 * It exists because the site had no closing step. The funnel ran home ->
 * /projects -> a caveat about private repositories -> the footer, and a reader
 * who had just been convinced had to go hunting for an address that appeared
 * once, in the footer, behind the word "Email". Every page that argues for the
 * work now ends with a way to act on it.
 *
 * Deliberately not a `SectionRule`. That component draws the datum tick, and
 * DESIGN_SYSTEM.md 1 principle 3 allows one accent moment per view; /about
 * already spends its tick on "01 Profile". A plain hairline lets this block
 * drop onto any page without auditing what the page already marks. The
 * `link-standalone` targets match the profile nav /about already had, which is
 * the established treatment for a small group of exits.
 *
 * The address is rendered rather than labelled "Email", because a reader
 * copying it into a client should not have to open a mail handler first.
 */
export function ContactCta() {
  return (
    <section className="mt-24 border-t border-line pt-8 md:mt-32">
      <h2 className="text-overline uppercase text-muted">Contact</h2>

      {site.availability ? (
        <p className="mt-3 max-w-prose mono caption uppercase text-ink">{site.availability}</p>
      ) : null}

      <p className="mt-4 max-w-prose text-muted">Email is the fastest way to reach me.</p>

      <nav aria-label="Contact" className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
        <a href={`mailto:${site.email}`} className="link-standalone">
          {site.email}
        </a>

        <a href={site.linkedin} className="link-standalone">
          LinkedIn
        </a>

        <Link href="/cv" className="link-standalone">
          View CV
        </Link>
      </nav>
    </section>
  );
}
