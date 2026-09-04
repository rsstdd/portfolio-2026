import Link from "next/link";
import { GitHubMark } from "@/components/ui";
import type { LoadedProject } from "@/lib/content";

/**
 * A project card. Server Component, like everything else on this site.
 *
 * The card is an `<article>` whose title link carries an `::after` overlay
 * spanning the whole card, rather than a single `<Link>` wrapped around
 * everything. The wrapping version was simpler but could hold only one link,
 * and nesting an `<a>` inside an `<a>` is invalid HTML that browsers recover
 * from by closing the outer one, which loses the card target entirely. The
 * overlay keeps one large click target and leaves room for the repository link
 * to be a real, separately focusable second target.
 *
 * The data plate carries the state the frontmatter already knows: the year or
 * "in progress", whether the claims were checked against source, and a link to
 * that source. The project pages have said this since they were written; saying
 * it here means a reader sees the verification system without a click, which is
 * the point of having one.
 *
 * The hover lift is CSS. `.data-plate` owns the hairline and mono treatment, so
 * the motif has one definition rather than being rebuilt from utilities.
 */
export function ProjectCard({ project }: { project: LoadedProject }) {
  return (
    <article className="group relative flex w-full flex-col border border-line bg-surface p-6 transition-[transform,box-shadow] duration-(--duration-fast) ease-(--ease-standard) hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-overline uppercase text-muted">
        {project.stack.slice(0, 2).join(" · ")}
      </p>

      <h3 className="mt-1.5 h3">
        <Link
          href={`/projects/${project.slug}`}
          className="transition-colors duration-(--duration-fast) after:absolute after:inset-0 after:content-[''] group-hover:text-accent-text"
        >
          {project.title}
        </Link>
      </h3>

      <p className="mt-2 flex-1 small text-muted">{project.summary}</p>

      <p className="data-plate mt-6 flex flex-wrap items-center gap-x-2 uppercase">
        <span>{project.complete ? project.date.getUTCFullYear() : "in progress"}</span>
        <span aria-hidden>·</span>
        <span>{project.verified ? "code-verified" : "unverified"}</span>

        {project.repo ? (
          <>
            <span aria-hidden>·</span>
            {/*
              `relative` lifts this above the title link's overlay, which is
              what makes it clickable rather than decorative.
            */}
            <a
              href={project.repo}
              className="relative inline-flex items-center gap-1.5 underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
            >
              <GitHubMark />
              Source
            </a>
          </>
        ) : null}
      </p>
    </article>
  );
}
