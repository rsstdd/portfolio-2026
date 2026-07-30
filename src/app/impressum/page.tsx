import type { Metadata } from "next";
import { addressIncomplete, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

/**
 * Impressum.
 *
 * A personal site operated from Germany that functions as professional
 * self-promotion is generally treated as business-like under § 5 DDG (the
 * successor to § 5 TMG since 2024), which triggers the disclosure obligation.
 * The safest reading is to provide it.
 *
 * Three notes for whoever edits this next:
 *
 *   1. The address comes from `site.address` and appears twice below. Edit it
 *      there, not here.
 *   2. Email is the only mandatory contact channel. Case law diverges on
 *      whether a telephone number is also required; this page deliberately
 *      omits one, which carries a small residual risk that is documented in
 *      PORTFOLIO_PLAN § 8 rather than left as an accident.
 *   3. Do NOT add a link to the EU online dispute resolution platform. It was
 *      shut down on 20 July 2025, and continuing to reference it is itself an
 *      Abmahnung risk. Generators written before that date still emit it.
 *
 * The "Haftung für Inhalte" and "Haftung für Links" blocks that generators
 * produce were removed on purpose: German courts treat them as decorative
 * rather than as an effective limitation of liability, and this site does not
 * publish filler. The copyright note stays, because the MIT statement does real
 * work.
 *
 * Written by a non-lawyer. Have the final text checked.
 */
export default function ImpressumPage() {
  const { address } = site;

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <p className="font-mono text-overline uppercase text-muted">Legal</p>
        <h1 className="mt-2 font-display text-display font-semibold">Impressum</h1>
      </header>

      {/*
       * A build-time reminder rendered as page content, because a placeholder
       * address on a live Impressum is a legal problem and a TODO comment in a
       * file nobody reopens is not a safeguard.
       */}
      {addressIncomplete ? (
        <p className="mt-8 max-w-prose border border-error px-4 py-3 font-mono text-caption text-error">
          Not ready to deploy: the address below is still a placeholder. § 5 DDG requires a full
          street address, and a P.O. box does not satisfy it. Set it in src/lib/site.ts.
        </p>
      ) : null}

      <div className="prose-datum mt-12">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          {site.name}
          <br />
          {address.street}
          <br />
          {address.postalCode} {address.city}
          <br />
          {address.country}
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          {site.name}
          <br />
          {address.street}
          <br />
          {address.postalCode} {address.city}
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Der Quellcode dieser Website steht unter der MIT-Lizenz zur
          Verfügung; Texte und Bilder sind davon ausgenommen.
        </p>
      </div>

      <p className="data-plate mt-12 max-w-prose">
        Zuletzt geprüft: 2026-07-30 · Der deutsche Text ist maßgeblich ·{" "}
        <a
          href="/privacy"
          className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
        >
          Datenschutz
        </a>
      </p>
    </main>
  );
}
