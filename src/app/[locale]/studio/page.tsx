import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Studio } from "@/components/Studio";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };

/** Animation tooling (scrubber, contact sheet, MP4 export). Only served in development. */
export default async function StudioPage({ params }: PageProps<"/[locale]/studio">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return <Studio copy={dict.journey} locale={locale} />;
}
