import { notFound } from "next/navigation";
import { Faq } from "@/components/Faq";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryCanvas } from "@/components/StoryCanvas";
import { storyLinks } from "@/content/storyLinks";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main>
        <h1 className="sr-only">{dict.story.heading}</h1>
        <div className="sr-only">
          {dict.story.summary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <StoryCanvas
          copy={dict.journey}
          scrollHint={dict.nav.scrollHint}
          chaptersLabel={dict.nav.chaptersLabel}
          chapters={[
            { id: "about", label: dict.nav.about },
            { id: "projects", label: dict.nav.projects },
            { id: "skills", label: dict.nav.skills },
            { id: "contact", label: dict.nav.contact },
          ]}
          links={storyLinks(dict)}
          fallback={dict.story}
        />
        <Faq dict={dict} />
      </main>
    </>
  );
}
