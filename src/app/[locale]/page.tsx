import { notFound } from "next/navigation";
import { Faq } from "@/components/Faq";
import { SiteHeader } from "@/components/SiteHeader";
import { StoryCanvas } from "@/components/StoryCanvas";
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
        <StoryCanvas copy={dict.earth} scrollHint={dict.nav.scrollHint} />
        <Faq dict={dict} />
      </main>
    </>
  );
}
