import type { Dictionary } from "@/i18n/types";
import styles from "./Faq.module.css";

const LINKS = {
  email: "mailto:paulpupaza004@gmail.com",
  linkedin: "https://www.linkedin.com/in/paul-adrian-pupaza",
  github: "https://github.com/PaulAdrianPupaza",
};

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
            </details>
          ))}
        </div>

        <h2 className={styles.contactTitle}>{dict.contact.title}</h2>
        <ul className={styles.contact}>
          <li>
            <a href={LINKS.email}>{dict.contact.email}</a>
          </li>
          <li>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
              {dict.contact.linkedin}
            </a>
          </li>
          <li>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              {dict.contact.github}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
