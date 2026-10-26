import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <a href="#faq" className={styles.pill}>
          {dict.nav.faq}
        </a>
        <div className={styles.switch} role="group" aria-label={dict.nav.languageLabel}>
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              hrefLang={l}
              aria-current={l === locale ? "true" : undefined}
              className={styles.lang}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
