import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import "../globals.css";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL("https://paulpupaza.dev"),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", es: "/es" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      siteName: "Paul Adrian Pupaza",
      locale: locale === "es" ? "es_ES" : "en_GB",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#081d2c",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  return (
    <html lang={locale} className={fredoka.variable}>
      <body>{children}</body>
    </html>
  );
}
