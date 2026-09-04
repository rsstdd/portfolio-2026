import Link from "next/link";
import { ProjectCard } from "@/components/content/project-card";
import { SectionRule } from "@/components/ui/section-rule";
import { getHome, getProjects } from "@/lib/content";
import { JsonLd, personJsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";

/**
 * Home. A Server Component with no client boundary beneath it.
 *
 * Two sections. Every string comes from content/home.mdx, so changing the copy
 * never means opening this file. The about summary that used to sit here is
 * gone, because the nav already links to /about and repeating it was the least
 * earned thing on the page.
 */
export default function HomePage() {
  const home = getHome();

  /*
   * Featured and verified, capped at six, in the order `featuredRank` sets.
   *
   * The filter is `verified` and deliberately not `complete`: the bar for the
   * front page is that someone has checked the claims against the source, not
   * that the work is finished. Unfinished work still says so on its card, so
   * excluding it here would hide checked work to avoid a label that already
   * exists.
   *
   * The cap is a ceiling rather than a target. Fewer than six qualifying
   * projects renders fewer cards, which the three-column grid handles without
   * a change here.
   */
  const featured = getProjects()
    .filter((p) => p.featured && p.verified)
    .slice(0, 6);

  return (
    <main id="main" className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
      <JsonLd data={personJsonLd()} />

      <section className="pt-16 pb-24 md:pt-32 md:pb-32">
        <p className="text-overline uppercase text-muted">
          {site.name} · {site.role} · {site.location}
        </p>

        <h1 className="mt-3 display-xl">
          {home.headline}
        </h1>

        <p className="mt-6 max-w-prose body-lg text-muted">{home.intro}</p>

        {site.availability ? (
          <p className="mt-4 mono caption uppercase text-muted">{site.availability}</p>
        ) : null}

        <Link
          href={home.ctaHref}
          className="mt-10 link-standalone"
        >
          {home.ctaLabel}
        </Link>
      </section>

      <section className="pb-24 md:pb-32">
        <SectionRule label={home.workLabel} as="h2" />

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>

        <Link
          href="/projects"
          className="mt-8 inline-block text-overline uppercase text-muted transition-colors duration-(--duration-fast) hover:text-ink"
        >
          All projects
        </Link>
      </section>

      {home.footnote ? (
        <section className="pb-8">
          <p className="data-plate max-w-prose text-muted">
            {home.footnote}
            {home.footnoteLinkHref && home.footnoteLinkLabel ? (
              <>
                {" "}
                <Link
                  href={home.footnoteLinkHref}
                  className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
                >
                  {home.footnoteLinkLabel}
                </Link>
              </>
            ) : null}
          </p>
        </section>
      ) : null}
    </main>
  );
}
