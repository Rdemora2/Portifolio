import { getTranslations } from "next-intl/server"

import type { Project } from "@/types"
import { Link } from "@/navigation"
import { ProjectGallery } from "./ProjectGallery"
import styles from "./CaseStudy.module.css"

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

export async function ProjectCaseStudy({ project, nextProject }: { project: Project; nextProject: Project }) {
  const [t, labels] = await Promise.all([getTranslations("Projects"), getTranslations("PortfolioPages.case")])
  const item = `items.${project.id}`
  const decisions = stringList(t.raw(`${item}.caseStudy.keyDecisions`))
  const results = stringList(t.raw(`${item}.caseStudy.results`))
  const lessons = stringList(t.raw(`${item}.caseStudy.lessonsLearned`))
  const architecture = t.raw(`${item}.architecture`) as { title: string; detail: string }[]
  const sections = [
    { id: "context", label: labels("overview") },
    { id: "architecture", label: labels("solution") },
    { id: "contribution", label: labels("contribution") },
    { id: "outcomes", label: labels("results") },
    { id: "lessons", label: labels("lessons") },
    ...(project.managedProductGroups?.length ? [{ id: "products", label: labels("managedProducts") }] : []),
  ]

  return (
    <article className={styles.case} data-case-study={project.id}>
      <header className={styles.hero} data-case-hero>
        <div className={styles.container}>
          <Link href="/work" className={styles.back}><span aria-hidden="true">←</span>{labels("back")}</Link>
          <div className={styles.heroLayout}>
            <div>
              <p className={styles.eyebrow}>{labels("productionCase")}{project.international ? ` / ${labels("internationalCase")}` : ""}</p>
              <h1 className={styles.title}>{t(`${item}.title`)}</h1>
              <p className={styles.summary}>{t(`${item}.shortDescription`)}</p>
            </div>
            <dl className={styles.facts}>
              <div><dt>{labels("role")}</dt><dd>{t(`${item}.role`)}</dd></div>
              <div><dt>{labels("client")}</dt><dd>{project.client}</dd></div>
              <div><dt>{labels("period")}</dt><dd>{project.period}</dd></div>
            </dl>
          </div>
        </div>
      </header>

      {project.metrics.length > 0 ? (
        <section id="metrics" className={styles.evidence} aria-labelledby="case-metrics-title">
          <div className={styles.container}>
            <h2 id="case-metrics-title" className={styles.eyebrow}>{labels("metrics")}</h2>
            <dl className={styles.metrics}>
              {project.metrics.map((metric) => (
                <div key={metric.id} className={styles.metric}>
                  <dt>{t(`${item}.metrics.${metric.id}`)}</dt>
                  <dd className={styles.metricValue}>{metric.prefix}{metric.value}{metric.suffix}</dd>
                  <dd className={styles.metricContext}>{t(`${item}.metricContext.${metric.id}`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {project.caseStudy?.images?.length ? (
        <ProjectGallery images={project.caseStudy.images} title={labels("gallery")} labels={{
          close: labels("galleryClose"), dialog: labels("galleryDialog"), goTo: labels("galleryGoTo"),
          next: labels("galleryNext"), open: labels("galleryOpen"), pause: labels("galleryPause"),
          previous: labels("galleryPrevious"), resume: labels("galleryResume"),
        }} />
      ) : null}

      <div className={`${styles.container} ${styles.readingLayout}`}>
        <aside className={styles.sidebar}>
          <nav aria-label={labels("contents")} className={styles.contents}>
            <p className={styles.eyebrow}>{labels("contents")}</p>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}><a href={`#${section.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.label}</a></li>
              ))}
            </ol>
          </nav>
        </aside>
        <div className={styles.narrative}>
          <section id="context" className={styles.chapter} aria-labelledby="context-title">
            <p className={styles.chapterNumber} aria-hidden="true">01 / {labels("contextLabel")}</p>
            <h2 id="context-title">{labels("overview")}</h2>
            <p>{t(`${item}.description`)}</p>
            <div className={styles.challenge}>
              <h3>{labels("challenge")}</h3>
              <p>{t(`${item}.challenge`)}</p>
            </div>
          </section>

          <section id="architecture" className={styles.chapter} aria-labelledby="architecture-title">
            <p className={styles.chapterNumber} aria-hidden="true">02 / {labels("engineeringLabel")}</p>
            <h2 id="architecture-title">{labels("solution")}</h2>
            <p>{t(`${item}.solution`)}</p>
            <dl className={styles.architecture}>
              {architecture.map((layer, index) => (
                <div key={layer.title}>
                  <dt><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{layer.title}</dt>
                  <dd>{layer.detail}</dd>
                </div>
              ))}
            </dl>
            <h3 className={styles.subheading}>{labels("decisions")}</h3>
            <ol className={styles.decisions}>
              {decisions.map((decision) => <li key={decision}>{decision}</li>)}
            </ol>
          </section>

          <section id="contribution" className={styles.chapter} aria-labelledby="contribution-title">
            <p className={styles.chapterNumber} aria-hidden="true">03 / {labels("ownershipLabel")}</p>
            <h2 id="contribution-title">{labels("contribution")}</h2>
            <p>{t(`${item}.caseStudy.robertoRole`)}</p>
          </section>

          <section id="outcomes" className={styles.chapter} aria-labelledby="outcomes-title">
            <p className={styles.chapterNumber} aria-hidden="true">04 / {labels("deliveryLabel")}</p>
            <h2 id="outcomes-title">{labels("results")}</h2>
            <p>{t(`${item}.impact`)}</p>
            <ul className={styles.resultList}>{results.map((result) => <li key={result}>{result}</li>)}</ul>
          </section>

          <section id="lessons" className={styles.chapter} aria-labelledby="lessons-title">
            <p className={styles.chapterNumber} aria-hidden="true">05 / {labels("practiceLabel")}</p>
            <h2 id="lessons-title">{labels("lessons")}</h2>
            <ul className={styles.lessonList}>{lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul>
            <h3 className={styles.subheading}>{labels("stack")}</h3>
            <ul className={styles.stack}>{project.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
          </section>

          {project.managedProductGroups?.length ? (
            <section id="products" className={styles.chapter} aria-labelledby="products-title">
              <p className={styles.chapterNumber} aria-hidden="true">06 / {labels("scopeLabel")}</p>
              <h2 id="products-title">{labels("managedProducts")}</h2>
              <p>{t("managedProducts.description", { count: project.managedProductGroups.reduce((total, group) => total + group.products.length, 0) })}</p>
              {project.managedProductGroups.map((group) => (
                <div key={group.id} className={styles.productGroup}>
                  <h3>{t(`managedProducts.groups.${group.id}`)}</h3>
                  <ul className={styles.products}>
                    {group.products.map((product) => (
                      <li key={product.id}>
                        <a href={product.href} target="_blank" rel="noopener noreferrer external" data-managed-product-link={product.id}>
                          <span>{product.name}</span><span aria-hidden="true">↗</span>
                          <span className="sr-only"> — {t("managedProducts.newTab")}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      </div>

      <footer className={styles.nextSection}>
        <div className={styles.container}>
          <Link href={{ pathname: "/work/[slug]", params: { slug: nextProject.slug } }} className={styles.next}>
            <span className={styles.eyebrow}>{labels("next")}</span>
            <span className={styles.nextTitle}>{t(`items.${nextProject.id}.title`)}</span>
            <span className={styles.nextSummary}>{t(`items.${nextProject.id}.shortDescription`)}</span>
            <span className={styles.nextAction}>{labels("openNext")}<span aria-hidden="true">↗</span></span>
          </Link>
          <Link href="/work" className={styles.allProjects}>{labels("allProjects")}<span aria-hidden="true">→</span></Link>
        </div>
      </footer>
    </article>
  )
}
