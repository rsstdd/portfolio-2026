import type { Metadata } from "next";
import { cache } from "react";
import { Mdx } from "@/components/content/mdx";
import { ContactCta } from "@/components/layout/contact-cta";
import { SectionRule } from "@/components/ui/section-rule";
import { getAbout } from "@/lib/content";
import { JsonLd, personJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

const getAboutContent = cache(getAbout);

export function generateMetadata(): Metadata {
  const about = getAboutContent();

  /*
   * The social card is the 1200x630 plate, not `about.portrait`. The portrait
   * is a different aspect ratio and every platform would crop it differently.
   */
  return pageMetadata({
    title: about.title,
    description: about.description,
    path: "/about",
    image: "/images/og/about.png",
    type: "profile",
  });
}

export default function AboutPage() {
  const about = getAboutContent();

  return (
    <main id="main" className="mx-auto max-w-content px-5 pt-12 pb-8 md:px-8 md:pt-16 lg:px-10">
      <JsonLd data={personJsonLd()} />

      <header>
        <p className="text-overline uppercase text-muted">About</p>

        <h1 className="mt-3 display">{site.name}</h1>

        <p className="mt-4 max-w-prose body-lg text-muted">{about.description}</p>
      </header>

      <section className="mt-16">
        <SectionRule index="01" label="Profile" as="h2" />

        <div className={"mt-8 grid items-start gap-1 max-w-prose"}>
          <div>
            <article className="max-w-prose text-muted">
              <Mdx source={about.body} />
            </article>
          </div>
        </div>
      </section>

      <ContactCta />
    </main>
  );
}
