import { insights } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Link } from "@/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import styles from "./Insights.module.css"

export async function Insights() {
  const [t, locale] = await Promise.all([getTranslations("Insights"), getLocale()])
  const publishedInsights = insights.filter((insight) => insight.hasFullArticle && insight.slug)
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" })

  return (
    <section id="insights" className={styles.section} aria-labelledby="insights-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <h2 id="insights-title">{t("title")}</h2>
          <span>{String(publishedInsights.length).padStart(2, "0")}</span>
        </div>
        {publishedInsights.map((insight) => (
          <ScrollReveal key={insight.id}>
            <article className={styles.article}>
              <div className={styles.cover} aria-hidden="true">
                <span className={styles.coverLabel}>BACKEND / ENGINEERING</span>
                <strong>Go<span>_</span></strong>
                <div className={styles.pipeline}><span>API</span><i /><span>CACHE</span><i /><span>DB</span></div>
              </div>
              <div className={styles.copy}>
                <div className={styles.meta}>
                  <span>{t(`categories.${insight.category}`)}</span>
                  <time dateTime={insight.date}>{dateFormatter.format(new Date(`${insight.date}T00:00:00Z`))}</time>
                  <span>{insight.readTime} {t("readTime")}</span>
                </div>
                <h3>{t(`items.${insight.id}.title`)}</h3>
                <p>{t(`items.${insight.id}.summary`)}</p>
                <ul className={styles.tags} aria-label={t("topicsLabel")}>
                  {insight.tags.map((tag) => <li key={tag}>{t(`tags.${tag}`)}</li>)}
                </ul>
                <Link href="/insights/go-em-producao" className={styles.link}>
                  {t("viewArticle")}<span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
