import { CONTACT, PROJECT_LINKS, type ProjectId } from "@/content/links";
import { contactLinks, projectLinks } from "@/content/storyLinks";
import type { Dictionary } from "@/i18n/types";
import styles from "./Faq.module.css";

export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.inner}>
        <h2 id="faq-title" className={styles.title}>
          {dict.faq.title}
        </h2>
        <div className={styles.list}>
          {dict.faq.items.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.question}>{item.q}</summary>
              <p className={styles.answer}>{item.a}</p>
              {item.projects && (
                <ul className={styles.projects}>
                  {(Object.keys(PROJECT_LINKS) as ProjectId[]).map((id) => (
                    <li key={id}>
                      <span>{dict.projects[id]}</span>
                      {projectLinks(dict, id).map((link) => (
                        <a key={link.href + link.label} href={link.href} target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
        </div>

        <h2 id="contact" className={styles.contactTitle}>
          {dict.contact.title}
        </h2>
        <ul className={styles.contact}>
          {contactLinks(dict).map((link) => (
            <li key={link.href}>
              <a href={link.href} {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.email}>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
      </div>
    </section>
  );
}
