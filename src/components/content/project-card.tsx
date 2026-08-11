import Link from "next/link";
import type { LoadedProject } from "@/lib/content";

/**
 * A project card. Server Component, like everything else on this site.
 *
 * The card is a single wrapping link rather than a div with an onClick, because
 * a link is keyboard-navigable, middle-clickable, and needs no JavaScript. The
 * hover lift is CSS.
 *
 * The footer uses `.data-plate` from design-tokens.css rather than rebuilding
 * the hairline-plus-mono treatment with utilities, so the motif has one
 * definition shared with the Astro site.
 */
export function ProjectCard({ project }: { project: LoadedProject }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border bg-surface p-6 transition-[transform,box-shadow] duration-(--duration-fast) ease-(--ease-standard) hover:-translate-y-0.5 hover:shadow-md border-[var(--color-line)]"
    >
      <p className="mono uppercase text-muted">
        {project.stack.slice(0, 2).join(" · ")}
      </p>

      <h3 className="mt-1.5 font-sans text-h3 font-semibold group-hover:text-accent-text">
        {project.title}
      </h3>

      <p className="mt-2 flex-1 text-sm text-muted">{project.summary}</p>

      <p className="mono data-plate mt-6">
        {project.date.getUTCFullYear()}
        {project.verified ? null : " · in progress"}
      </p>
    </Link>
  );
}
