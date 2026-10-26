import Link from "next/link";
import { CV_URL } from "@/content/links";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <a href="#projects" className={`${styles.link} ${styles.wide}`}>
          {dict.nav.projects}
        </a>
        <a href="#skills" className={`${styles.link} ${styles.wide}`}>
          {dict.nav.skills}
        </a>
        <a href="#faq" className={styles.link}>
          {dict.nav.faq}
        </a>
        <a href="#contact" className={styles.link}>
          {dict.nav.contact}
        </a>
        {CV_URL && (
          <a href={CV_URL} target="_blank" rel="noreferrer" className={styles.cv}>
            {dict.actions.cv}
          </a>
        )}
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
