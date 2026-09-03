import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected engineering work: concurrent Rust pipelines, sensor telemetry, full-stack systems, and shared frontend platforms.",
};

/**
 * Projects index.
 *
 * A flat list rather than a filterable grid. Eleven entries do not need
 * filtering, and filter chips would require the client component this site does
 * not have. Ordering is featured-first then newest, decided in the loader so
 * every page agrees.
 *
 * Every project is listed, including unverified ones. The home page filters on
 * `verified` and this page deliberately does not: omitting unfinished work here
 * would silently drop it from the only page that claims to list it, and the
 * date column already labels it "in progress" instead of a year.
 *
 * Rows rather than cards, because a list gives each project a full line of
 * summary, and the summary is what makes someone click.
 */
export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <p className="mono overline uppercase text-muted">Projects</p>
        <h1 className="mt-3 h1 display-xl">Selected work</h1>
        <p className="mt-4 text-body-lg text-muted">
          Unfinished work is listed here too, dated as in progress rather than
          by year. Each page states what was read in the source, what was
          measured, and what was not.
        </p>
      </header>

      <ul className="mt-16 border-t border-line">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex flex-col gap-2 border-b border-line py-6 transition-colors duration-(--duration-fast) hover:bg-well md:flex-row md:items-baseline md:gap-8"
            >
              <div className="md:w-1/3">
                <h2 className="font-display text-h2 font-semibold group-hover:text-accent-text">
                  {project.title}
                </h2>
                <p className="mt-1 mono caption uppercase text-muted">
                  {project.stack.slice(0, 3).join(" · ")}
                </p>
              </div>

              <div className="md:flex-1">
                <p className="text-muted">{project.summary}</p>
              </div>

              <p className="mono caption tabular-nums text-muted md:w-28 md:text-right">
                {project.verified ? project.date.getUTCFullYear() : "in progress"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-prose mono caption text-muted">
        Not everything I have written is included. Some repositories are private,
        and some are practice.
      </p>
    </main>
  );
}
