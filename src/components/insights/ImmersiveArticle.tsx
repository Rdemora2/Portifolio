import type { CSSProperties } from "react"

import type { InsightArticle } from "@/content/insights/types"
import { Link } from "@/navigation"

import { ArticleExperience } from "./ArticleExperience"
import styles from "./ImmersiveArticle.module.css"

type ImmersiveArticleProps = {
  article: InsightArticle
  authorName: string
  formattedDate: string
  structuredData: string
}

type IndexedStyle = CSSProperties & {
  "--item-index": number
}

type HeroWordStyle = CSSProperties & {
  "--hero-word-x": string
  "--hero-word-y": string
}

type TopologyStyle = CSSProperties & {
  "--topology-columns": number
}

function getHeroWordStyle(index: number): HeroWordStyle {
  if (index === 0) {
    return { "--hero-word-x": "-0.3rem", "--hero-word-y": "0rem" }
  }

  return {
    "--hero-word-x": `${Math.min(index * 0.2, 1.1)}rem`,
    "--hero-word-y": index % 2 === 0 ? "0.12rem" : "-0.08rem",
  }
}

export function ImmersiveArticle({
  article,
  authorName,
  formattedDate,
  structuredData,
}: ImmersiveArticleProps) {
  const titleWords = article.title.split(" ")

  return (
    <main
      id="main-content"
      className={styles.articleExperience}
      data-article-experience
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      <article aria-labelledby="article-title">
        <section className={styles.hero} data-article-hero>
          <div className={styles.heroSticky} data-hero-sticky>
            <div
              aria-hidden="true"
              className={styles.heroGrid}
              data-hero-grid
            />
            <div
              aria-hidden="true"
              className={styles.heroBeam}
              data-hero-beam
            />
            <div className={styles.heroInner}>
              <Link
                href="/insights"
                prefetch={false}
                className={styles.backLink}
              >
                <span aria-hidden="true">←</span>
                {article.backLabel}
              </Link>

              <div className={styles.heroComposition}>
                <div className={styles.heroCopy} data-hero-copy>
                  <p className={styles.eyebrow}>{article.eyebrow}</p>
                  <h1
                    id="article-title"
                    className={styles.heroTitle}
                    data-article-title
                  >
                    {titleWords.map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        data-hero-accent={
                          index === titleWords.length - 1 ? "true" : undefined
                        }
                        data-hero-word={index}
                        style={getHeroWordStyle(index)}
                      >
                        {word}
                        {index < titleWords.length - 1 ? " " : null}
                      </span>
                    ))}
                  </h1>
                  <p className={styles.heroSubtitle}>{article.subtitle}</p>
                </div>

                <div
                  aria-hidden="true"
                  className={styles.heroRecorder}
                  data-hero-recorder
                >
                  <div className={styles.heroOrbitOuter} />
                  <div className={styles.heroOrbitInner} />
                  <div className={styles.heroCore} data-hero-core>
                    <span>{article.experience.coreLabel}</span>
                    <small>{article.experience.coreCaption}</small>
                  </div>
                  {article.metrics.slice(0, 3).map((metric, index) => (
                    <div
                      key={metric.label}
                      className={styles.heroMetric}
                      data-hero-metric={index}
                      style={{ "--item-index": index } as IndexedStyle}
                    >
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.heroFooter} data-hero-footer>
                <div className={styles.articleMeta}>
                  <span>{authorName}</span>
                  <span aria-hidden="true" />
                  <time dateTime={article.publishedDate}>
                    {article.publishedLabel} {formattedDate}
                  </time>
                  <span aria-hidden="true" />
                  <span>{article.readTime}</span>
                </div>
                <div aria-hidden="true" className={styles.scrollCue}>
                  <span>{article.experience.scrollLabel}</span>
                  <i />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.telemetrySection}
          aria-labelledby="article-production-metrics"
        >
          <div className={styles.telemetryInner}>
            <p className={styles.intro}>{article.intro}</p>

            <div className={styles.telemetryHeader}>
              <h2 id="article-production-metrics">{article.metricsLabel}</h2>
              <span aria-hidden="true">{article.experience.traceLabel}</span>
            </div>
            <dl className={styles.metrics}>
              {article.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={styles.metric}
                  style={{ "--item-index": index } as IndexedStyle}
                >
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className={styles.storySection}>
          <div className={styles.storyLayout} data-article-story>
            <div className={styles.storyContent}>
              <section
                className={styles.architecture}
                aria-labelledby="article-architecture-title"
                data-article-architecture
              >
                <span aria-hidden="true" className={styles.architectureMarker}>
                  {article.experience.topologyLabel}
                </span>
                <div className={styles.architectureHeading}>
                  <p className={styles.architectureEyebrow}>
                    {article.architectureLabel}
                  </p>
                  <h2 id="article-architecture-title">
                    {article.architectureTitle}
                  </h2>
                  <p>{article.architectureDescription}</p>
                </div>

                <div
                  className={styles.topology}
                  role="list"
                  aria-label={article.experience.topologyLabel}
                  style={
                    {
                      "--topology-columns": Math.max(
                        article.architectureNodes.length,
                        1,
                      ),
                    } as TopologyStyle
                  }
                >
                  <div aria-hidden="true" className={styles.topologyRail}>
                    <span data-topology-signal />
                  </div>
                  {article.architectureNodes.map((node, index) => (
                    <div
                      key={node}
                      role="listitem"
                      className={styles.topologyNode}
                      style={{ "--item-index": index } as IndexedStyle}
                    >
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <strong>{node}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <ArticleExperience
                rootId="main-content"
                labels={{
                  navigation: article.tocLabel,
                  trace: article.experience.traceLabel,
                  chapter: article.experience.chapterLabel,
                  progress: article.experience.progressLabel,
                  core: article.experience.coreLabel,
                  coreCaption: article.experience.coreCaption,
                }}
                metrics={article.metrics}
                sections={article.sections.map(
                  ({ id, title, visual }) => ({
                    id,
                    title,
                    visual,
                  }),
                )}
                systemNodes={article.architectureNodes}
              />

              <div id="article-content" className={styles.articleBody}>
                {article.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className={styles.chapter}
                    data-article-scene
                    data-scene={section.visual.kind}
                  >
                    <span aria-hidden="true" className={styles.chapterCoordinate}>
                      {article.experience.traceCoordinateLabel}:
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.chapterFrame}>
                      <div className={styles.chapterHeader}>
                        <p>{section.eyebrow}</p>
                        <span aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}/
                          {String(article.sections.length).padStart(2, "0")}
                        </span>
                      </div>
                      <h2>{section.title}</h2>
                      <p className={styles.chapterIntro}>{section.intro}</p>

                      <ul className={styles.chapterList}>
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={item}
                            style={{ "--item-index": itemIndex } as IndexedStyle}
                          >
                            <span aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {section.note ? (
                        <blockquote className={styles.chapterNote}>
                          <span aria-hidden="true">“</span>
                          {section.note}
                        </blockquote>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section
          className={styles.ctaSection}
          aria-labelledby="article-cta-title"
          data-article-cta
        >
          <div aria-hidden="true" className={styles.ctaTrace}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.ctaInner} data-article-cta-content>
            <p>{article.ctaEyebrow}</p>
            <h2 id="article-cta-title" data-article-cta-title>
              {article.ctaTitle}
            </h2>
            <p>{article.ctaDescription}</p>
            <Link href="/work" className={styles.ctaLink}>
              <span>{article.ctaLabel}</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <small>
              {authorName} · {article.authorRole}
            </small>
          </div>
        </section>
      </article>
    </main>
  )
}
