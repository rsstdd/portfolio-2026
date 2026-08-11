import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/content/mdx";
import { getProject, getProjectSlugs } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

/**
 * Every project is known at build time, so every page is static.
 */
export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const url = `/projects/${project.slug}`;
  const image = project.ogImage ?? "/images/og/default.png";

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [image],
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <Link
        href="/projects"
        className="mono uppercase text-muted transition-colors duration-(--duration-fast)"
      >
        ← All projects
      </Link>

      <header className="mt-8 max-w-prose">
        <p className="mono text-overline uppercase text-muted">{project.stack.join(" · ")}</p>

        <h1 className="h1 mt-2 text-balance">
          {project.title}
        </h1>

        <p className="mt-4 text-body-lg text-muted">{project.summary}</p>

        {/*
          Data plate. Renders the `verified` flag rather than hiding it, because
          the site claims its project pages are checkable and a status that only
          exists in frontmatter is not checkable by a reader.
        */}
        <dl className="data-plate mono mt-8 flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-2">
            <dt className="sr-only">Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Year</dt>
            <dd>{project.date.toISOString().slice(0, 10)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Status</dt>
            <dd>{project.verified ? "code-verified" : "in progress"}</dd>
          </div>
          {project.repo ? (
            <div className="flex gap-2">
              <dt className="sr-only">Repository</dt>
              <dd>
                <a
                  href={project.repo}
                  className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
                >
                  Source
                </a>
              </dd>
            </div>
          ) : null}
          {project.live ? (
            <div className="flex gap-2">
              <dt className="sr-only">Live site</dt>
              <dd>
                <a
                  href={project.live}
                  className="underline decoration-1 underline-offset-[3px] hover:decoration-accent hover:decoration-2"
                >
                  Live
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <article className="prose-datum mt-16">
        <Mdx source={project.body} />
      </article>
    </main>
  );
}
