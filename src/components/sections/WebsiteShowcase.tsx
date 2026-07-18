import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { websiteExperiences } from "@/data/showcase-sites"

import styles from "./WebsiteShowcase.module.css"

export async function WebsiteShowcase() {
  const t = await getTranslations("WebsiteShowcase")

  return (
    <section
      id="sites"
      aria-labelledby="website-showcase-title"
      className={styles.section}
      data-website-showcase
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${styles.container}`}>
        <div className={styles.header}>
          <ScrollReveal animation="title" className={styles.headingBlock}>
            <p className={styles.eyebrow}>{t("eyebrow")}</p>
            <h2 id="website-showcase-title" className={styles.title}>
              {t("title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="body" delay={0.06} className={styles.intro}>
            <p className={styles.description}>{t("description")}</p>
            <p className={styles.publishedCount}>
              <span className={styles.liveDot} aria-hidden="true" />
              {t("publishedCount", { count: websiteExperiences.length })}
            </p>
          </ScrollReveal>
        </div>

        <div className={styles.grid} data-website-grid>
          {websiteExperiences.map((site, index) => (
            <ScrollReveal
              key={site.id}
              animation="card"
              delay={index * 0.08}
              threshold={0.12}
              className={styles.reveal}
            >
              <article className={styles.card} data-website-card={site.id}>
                <a
                  href={site.href}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className={styles.cardLink}
                  data-website-link
                >
                  <div className={styles.browserFrame}>
                    <div className={styles.browserBar} aria-hidden="true">
                      <span className={styles.browserDots}>
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className={styles.domain}>{site.domain}</span>
                      <span className={styles.secureMark}>HTTPS</span>
                    </div>

                    <div className={styles.thumbnail} data-website-thumbnail>
                      <Image
                        src={site.image.src}
                        width={site.image.width}
                        height={site.image.height}
                        sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), (max-width: 1279px) calc(50vw - 3rem), 608px"
                        alt={t(`items.${site.id}.imageAlt`)}
                        className={styles.image}
                        loading="lazy"
                        decoding="async"
                        placeholder="blur"
                        blurDataURL={site.image.blurDataURL}
                      />
                      <span className={styles.imageVeil} aria-hidden="true" />
                      <span className={styles.projectIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className={styles.content}>
                    <div className={styles.meta}>
                      <span className={styles.category}>
                        {t(`items.${site.id}.category`)}
                      </span>
                      <span className={styles.liveStatus}>
                        <span className={styles.liveDot} aria-hidden="true" />
                        {t("live")}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>
                      {t(`items.${site.id}.title`)}
                    </h3>
                    <p className={styles.cardDescription}>
                      {t(`items.${site.id}.description`)}
                    </p>

                    <div className={styles.cardFooter}>
                      <ul className={styles.tags} aria-label={t("deliverablesLabel")}>
                        {site.tagIds.map((tagId) => (
                          <li key={tagId} className={styles.tag}>
                            {t(`tags.${tagId}`)}
                          </li>
                        ))}
                      </ul>

                      <span className={styles.cta}>
                        {t("visit")}
                        <svg
                          viewBox="0 0 20 20"
                          width="18"
                          height="18"
                          fill="none"
                          aria-hidden="true"
                          className={styles.externalIcon}
                        >
                          <path
                            d="M7 5h8v8M15 5 5 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="sr-only"> — {t("newTab")}</span>
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="ambient" delay={0.12} className={styles.pipeline}>
          <span className={styles.pipelineLine} aria-hidden="true" />
          <span className={styles.pipelineDot} aria-hidden="true" />
          <p>{t("inDevelopment")}</p>
          <span className={styles.pipelineLine} aria-hidden="true" />
        </ScrollReveal>
      </div>
    </section>
  )
}
