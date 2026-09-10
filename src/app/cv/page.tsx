import type { Metadata } from "next";
import { Mdx } from "@/components/content/mdx";
import { getCv } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const cv = getCv();
  return pageMetadata({
    title: "CV",
    description: `${cv.name}, ${cv.title}, ${cv.location}.`,
    path: "/cv",
    image: "/images/og/cv.png",
  });
}

/**
 * CV.
 *
 * Rendered from content/cv.mdx, which is also the source for the PDF that
 * scripts/render-cv.mjs writes to public/cv, so the page and the document
 * cannot disagree. That claim sat in this docstring for months while no export
 * existed; the script is what made it true.
 *
 * The export drives this page through the `@media print` block in
 * components.css, which hides the nav and footer. That block is the thing here
 * that can break without anyone noticing, because nobody prints a page they did
 * not change, so the script asserts the chrome is actually hidden rather than
 * trusting it.
 */
export default function CvPage() {
  const cv = getCv();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 md:px-8 md:pt-16 lg:px-10">
      <header>
        <h1 className="display">{cv.name}</h1>
        <p className="mt-2 max-w-prose body-lg text-muted">{cv.title}</p>

        <dl className="data-plate mt-6 grid max-w-prose gap-x-8 gap-y-1 sm:grid-cols-2">
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

        {/*
          `.no-print` because a printed page offering a download is addressing a
          reader who is not there. The file is rendered from this page, so the
          two cannot drift.
        */}
        <p className="no-print mt-6 max-w-prose mono caption text-muted">
          <a
            href="/cv/ross-todd.pdf"
            download
            className="underline decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-(--duration-fast) hover:decoration-accent hover:decoration-2"
          >
            Download as PDF
          </a>{" "}
          — rendered from this page, so the document and the page cannot disagree. Printing works
          too.
        </p>
      </header>

      <article className="mt-16">
        <Mdx source={cv.body} />
      </article>

      <p className="data-plate mt-16 max-w-prose text-muted">
        Updated {cv.updated.toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
