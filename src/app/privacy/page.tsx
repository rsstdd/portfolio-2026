import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, },
};

/**
 * Privacy.
 *
 * Short because the site genuinely collects nothing: no analytics, no cookies,
 * no embedded third-party resources, and self-hosted fonts. Every sentence here
 * is a factual claim about the build, so it must be revisited the moment any of
 * that changes. Adding one script that phones home makes this page false.
 *
 * The host is read from `site.host` because it is named in the transfer
 * disclosure below. Moving to an EU host means this page gets shorter: the
 * third-country section can go entirely.
 *
 * Art. 13 GDPR wants the controller's identity, the purposes and legal bases,
 * retention, third-country transfers, and the right to complain. Each has a
 * section below rather than being left implicit.
 *
 * Written by a non-lawyer. Have the final text checked.
 */
export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header>
        <p className="text-overline uppercase text-muted">Legal</p>
        <h1 className="mt-3 display">Privacy</h1>
        <p className="mt-4 max-w-prose body-lg text-muted">
          This site sets no cookies and runs no analytics. The detail below explains precisely what
          that leaves, which is server logs and any email you choose to send.
        </p>
      </header>

      <div className="prose-datum mt-12">
        <h2>Controller</h2>
        <p>
          {site.name}, {site.address.city}, Germany. Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. The full postal address is in the{" "}
          <a href="/impressum">Impressum</a>.
        </p>

        <h2>No analytics, no cookies, no tracking</h2>
        <p>
          There is no analytics platform, no tag manager, and no advertising or tracking script on
          this site. No cookies are set, so there is no consent banner, because there is nothing to
          consent to.
        </p>

        <h2>No third-party requests</h2>
        <p>
          Fonts are self-hosted and served from this domain rather than from a font CDN, so loading
          a page does not disclose your IP address to any third party. There are no embedded videos,
          maps, social widgets, or comment systems. Every page is a static file, and nothing on it
          requests anything from anyone but this domain.
        </p>

        <h2>Hosting and server logs</h2>
        <p>
          The site is served as static files by {site.host.name}. Like any web server, theirs
          records standard access logs, which may include your IP address, the requested URL, the
          time of the request, and your browser&rsquo;s user agent. Those logs exist for security
          and operational purposes on the legal basis of legitimate interest under Art. 6(1)(f)
          GDPR. I do not analyse them, export them, or combine them with anything else, and the
          retention period is the host&rsquo;s own, because I neither control nor keep a separate
          copy.
        </p>

        <h2>Transfer outside the EU</h2>
        <p>
          {site.host.name} is based in the {site.host.country}, so serving a page to you can involve
          processing personal data outside the EU. That transfer rests on the European
          Commission&rsquo;s adequacy decision for the EU-US Data Privacy Framework where the
          provider is certified under it, and otherwise on the Commission&rsquo;s standard
          contractual clauses under Art. 46(2)(c) GDPR, together with a data processing agreement.
          The adequacy decision was upheld by the EU General Court in September 2025 and an appeal
          is pending before the Court of Justice, so this section is one of the few on the site with
          a live legal question behind it.
        </p>

        <h2>Contact</h2>
        <p>
          If you email me, I keep that correspondence in order to reply to it and for as long as the
          exchange is useful. I do not add it to any mailing list, because there is no mailing list.
        </p>

        <h2>Your rights</h2>
        <p>
          Under the GDPR you have the right to access, correct, or erase personal data held about
          you, to restrict or object to its processing, to data portability, and to lodge a
          complaint with a supervisory authority. Given that this site collects nothing, in practice
          this concerns only email correspondence you have chosen to send.
        </p>
        <p>
          The competent authority for private-sector controllers in Bavaria is the Bayerisches
          Landesamt für Datenschutzaufsicht (BayLDA), Postfach 1349, 91504 Ansbach.
        </p>
      </div>

      <p className="data-plate mt-12 max-w-prose text-muted">
        Last reviewed 2026-07-30 · Host: {site.host.name} ·{" "}
        <a
          href="/impressum"
          className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
        >
          Impressum
        </a>
      </p>
    </main>
  );
}
