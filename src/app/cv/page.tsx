import type { Metadata } from "next";
import { Mdx } from "@/components/content/mdx";
import { getCv } from "@/lib/content";

export function generateMetadata(): Metadata {
  const cv = getCv();
  return {
    title: "CV",
    description: `${cv.name}, ${cv.title}, ${cv.location}.`,
  };
}

/**
 * CV.
 *
 * Rendered from content/cv.mdx, which is also the source for the exported PDF,
 * so the page and the document cannot disagree. The print stylesheet in
 * globals.css hides the nav and footer, which is what makes browser print an
 * acceptable export path rather than a compromise.
 */
export default function CvPage() {
  const cv = getCv();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <h1 className="font-display text-display font-semibold">{cv.name}</h1>
        <p className="mt-2 text-body-lg text-muted">{cv.title}</p>

        <dl className="data-plate mt-6 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-muted">Location</dt>
            <dd>{cv.location}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Work authorization</dt>
            <dd>{cv.workAuthorization}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Languages</dt>
            <dd>{cv.languages}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Email</dt>
            <dd>
              <a
                href={`mailto:${cv.email}`}
                className="underline decoration-1 underline-offset-[3px]"
              >
                {cv.email}
              </a>
            </dd>
          </div>
        </dl>

        <p className="no-print mt-6 font-mono text-caption text-muted">
          Print this page for a PDF. Layout and content come from one source, so the document
          matches what you see.
        </p>
      </header>

      <article className="mt-16">
        <Mdx source={cv.body} />
      </article>

      <p className="data-plate mt-16 max-w-prose">
        Updated {cv.updated.toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
