import Link from "next/link";
import { ProjectCard } from "@/components/content/project-card";
import { SectionRule } from "@/components/ui/section-rule";
import { getHome, getProjects } from "@/lib/content";
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
   * Featured and verified, capped at three. The `verified` filter keeps
   * unfinished work off the front page automatically: when aircraft ships and
   * its frontmatter flips, it takes the top slot with no edit here, because
   * getProjects sorts featured first and then newest.
   */
  const featured = getProjects()
    .filter((p) => p.featured && p.verified)
    .slice(0, 3);

  return (
    <main id="main" className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
      <section className="pt-16 pb-24 md:pt-32 md:pb-32">
        <p className="font-mono text-overline uppercase text-muted">
          {site.name} · {site.role} · {site.location}
        </p>

        <h1 className="mt-3 max-w-[20ch] font-display text-display-xl font-semibold text-balance">
          {home.headline}
        </h1>

        <p className="mt-6 max-w-prose text-body-lg text-muted">{home.intro}</p>

        {site.availability ? (
          <p className="mt-4 font-mono text-caption text-accent-text">{site.availability}</p>
        ) : null}

        <Link
          href={home.ctaHref}
          className="group mt-10 inline-flex items-center gap-3 font-mono text-overline uppercase text-accent-text"
        >
          <span
            aria-hidden
            className="h-0.5 w-4 bg-accent transition-[width] duration-(--duration-base) ease-(--ease-standard) group-hover:w-7"
          />
          {home.ctaLabel}
        </Link>
      </section>

      <section className="pb-24 md:pb-32">
        <SectionRule label={home.workLabel} />

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>

        <Link
          href="/projects"
          className="mt-8 inline-block font-mono text-overline uppercase text-muted transition-colors duration-(--duration-fast) hover:text-ink"
        >
          All projects
        </Link>
      </section>

      {home.footnote ? (
        <section className="pb-8">
          <p className="data-plate max-w-prose">
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
