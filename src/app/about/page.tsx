import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { Mdx } from "@/components/content/mdx";
import { SectionRule } from "@/components/ui/section-rule";
import { getAbout } from "@/lib/content";
import { site } from "@/lib/site";

const getAboutContent = cache(getAbout);

export function generateMetadata(): Metadata {
  const about = getAboutContent();

  return {
    title: about.title,
    description: about.description,
    openGraph: {
      title: about.title,
      description: about.description,
      type: "profile",
      images: about.portrait
        ? [
            {
              url: about.portrait,
              alt: about.portraitAlt ?? site.name,
            },
          ]
        : undefined,
    },
  };
}

export default function AboutPage() {
  const about = getAboutContent();
  const updated = about.updated.toISOString().slice(0, 10);

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 pb-8 md:px-8 md:pt-16 lg:px-10">
      <header className="max-w-prose">
        <p className="font-mono text-overline uppercase text-muted">About</p>

        <h1 className="mt-2 text-balance font-display text-display font-semibold">{site.name}</h1>

        <p className="mt-4 text-body-lg text-muted">{about.description}</p>
      </header>

      <section className="mt-16">
        <SectionRule index="01" label="Profile" />

        <div className={"mt-8 grid items-start gap-1 max-w-prose"}>
          <div>
            <article className="max-w-prose text-muted">
              <Mdx source={about.body} />
            </article>

            <nav
              aria-label="Profile links"
              className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6"
            >
              <Link href="/cv" className="font-mono text-overline uppercase text-accent-text">
                View CV
              </Link>

              <a href={site.github} className="font-mono text-overline uppercase text-accent-text">
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </section>
    </main>
  );
}
