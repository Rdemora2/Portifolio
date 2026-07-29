import { getTranslations } from "next-intl/server"

import type { Project } from "@/types"
import { Link } from "@/navigation"

import { ProjectGallery } from "./ProjectGallery"
import styles from "./Portfolio.module.css"

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function externalHostname(href: string): string {
  return new URL(href).hostname.replace(/^www\./, "")
}

export async function ProjectCaseStudy({
  project,
  nextProject,
}: {
  project: Project
  nextProject: Project
}) {
  const [projectsTranslations, caseTranslations] = await Promise.all([
    getTranslations("Projects"),
    getTranslations("PortfolioPages.case"),
  ])
  const itemPath = `items.${project.id}`
  const keyDecisions = stringList(
    projectsTranslations.raw(`${itemPath}.caseStudy.keyDecisions`),
  )
  const results = stringList(
    projectsTranslations.raw(`${itemPath}.caseStudy.results`),
  )
  const lessons = stringList(
    projectsTranslations.raw(`${itemPath}.caseStudy.lessonsLearned`),
  )
  const highlights = stringList(
    projectsTranslations.raw(`${itemPath}.highlights`),
  )

  return (
    <>
      <header className={styles.caseHero}>
        <div className={styles.container}>
          <Link href="/work" className={styles.caseBack}>
            <span aria-hidden="true">←</span>
            {caseTranslations("back")}
          </Link>

          <div className={styles.caseKicker}>
            <span className={styles.metaChip}>
              {caseTranslations("productionCase")}
            </span>
            {project.international ? (
              <span className={styles.metaChip}>
                {caseTranslations("internationalCase")}
              </span>
            ) : null}
          </div>

          <h1 className={styles.caseTitle}>
            {projectsTranslations(`${itemPath}.title`)}
          </h1>
          <p className={styles.caseSummary}>
            {projectsTranslations(`${itemPath}.shortDescription`)}
          </p>

          <dl className={styles.caseFacts}>
            <div className={styles.caseFact}>
              <dt className={styles.caseFactLabel}>
                {caseTranslations("client")}
              </dt>
              <dd className={styles.caseFactValue}>{project.client}</dd>
            </div>
            <div className={styles.caseFact}>
              <dt className={styles.caseFactLabel}>
                {caseTranslations("role")}
              </dt>
              <dd className={styles.caseFactValue}>
                {projectsTranslations(`${itemPath}.role`)}
              </dd>
            </div>
            <div className={styles.caseFact}>
              <dt className={styles.caseFactLabel}>
                {caseTranslations("period")}
              </dt>
              <dd className={styles.caseFactValue}>{project.period}</dd>
            </div>
          </dl>
        </div>
      </header>

      {project.caseStudy?.images && project.caseStudy.images.length > 0 ? (
        <ProjectGallery 
          images={project.caseStudy.images} 
          title={caseTranslations("gallery")} 
        />
      ) : null}

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.caseStory}>
            <div className={styles.storyBlock}>
              <h2 className={styles.storyLabel}>
                {caseTranslations("overview")}
              </h2>
              <p className={styles.storyText}>
                {projectsTranslations(`${itemPath}.description`)}
              </p>
            </div>
            <div className={styles.storyBlock}>
              <h2 className={styles.storyLabel}>
                {caseTranslations("challenge")}
              </h2>
              <p className={styles.storyText}>
                {projectsTranslations(`${itemPath}.challenge`)}
              </p>
            </div>
            <div className={styles.storyBlock}>
              <h2 className={styles.storyLabel}>
                {caseTranslations("solution")}
              </h2>
              <p className={styles.storyText}>
                {projectsTranslations(`${itemPath}.solution`)}
              </p>
            </div>
            <div className={styles.storyBlock}>
              <h2 className={styles.storyLabel}>
                {caseTranslations("impact")}
              </h2>
              <p className={styles.storyText}>
                {projectsTranslations(`${itemPath}.impact`)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {project.metrics.length > 0 ? (
        <section
          id="metrics"
          className={styles.sectionGrid}
          aria-labelledby="case-metrics-title"
        >
          <div className={styles.container}>
            <h2 id="case-metrics-title" className={styles.storyLabel}>
              {caseTranslations("metrics")}
            </h2>
            <dl className={`${styles.metricGrid} mt-8`}>
              {project.metrics.map((metric) => (
                <div key={metric.id} className={styles.metricCard}>
                  <dt className={styles.metricLabel}>
                    {projectsTranslations(
                      `${itemPath}.metrics.${metric.id}`,
                    )}
                  </dt>
                  <dd className={styles.metricValue}>
                    {metric.prefix}
                    {metric.value}
                    {metric.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.caseColumns}>
            <div>
              <h2 className={styles.storyLabel}>
                {caseTranslations("contribution")}
              </h2>
              <p className={`${styles.storyText} mt-5`}>
                {projectsTranslations(`${itemPath}.caseStudy.robertoRole`)}
              </p>

              <h2 className={`${styles.storyLabel} mt-12`}>
                {caseTranslations("decisions")}
              </h2>
              <ul className={styles.caseList}>
                {keyDecisions.map((decision) => (
                  <li key={decision} className={styles.caseListItem}>
                    {decision}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className={styles.storyLabel}>
                {caseTranslations("results")}
              </h2>
              <ul className={styles.caseList}>
                {results.map((result) => (
                  <li key={result} className={styles.caseListItem}>
                    {result}
                  </li>
                ))}
              </ul>

              <h2 className={`${styles.storyLabel} mt-12`}>
                {projectsTranslations("highlights")}
              </h2>
              <ul className={styles.caseList}>
                {highlights.map((highlight) => (
                  <li key={highlight} className={styles.caseListItem}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.caseColumns}>
            <div>
              <h2 className={styles.storyLabel}>
                {caseTranslations("lessons")}
              </h2>
              <ul className={styles.caseList}>
                {lessons.map((lesson) => (
                  <li key={lesson} className={styles.caseListItem}>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.storyLabel}>
                {caseTranslations("stack")}
              </h2>
              <ul className={styles.stackList}>
                {project.stack.map((technology) => (
                  <li key={technology} className={styles.stackPill}>
                    {technology}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {project.managedProductGroups?.length ? (
            <div className="mt-20">
              <h2 className={styles.storyLabel}>
                {caseTranslations("managedProducts")}
              </h2>
              <div className={styles.productGroups}>
                {project.managedProductGroups.map((group) => (
                  <section key={group.id} className={styles.productGroup}>
                    <h3 className={styles.productGroupTitle}>
                      {projectsTranslations(
                        `managedProducts.groups.${group.id}`,
                      )}
                    </h3>
                    <div className={styles.productLinks}>
                      {group.products.map((product) => (
                        <a
                          key={product.id}
                          href={product.href}
                          target="_blank"
                          rel="noopener noreferrer external"
                          data-managed-product-link={product.id}
                          className={styles.productLink}
                        >
                          <span>{product.name}</span>
                          <span aria-hidden="true">↗</span>
                          <span className="sr-only">
                            {" — "}
                            {externalHostname(product.href)}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <Link
            href={{
              pathname: "/work/[slug]",
              params: { slug: nextProject.slug },
            }}
            className={styles.caseNext}
          >
            <span className={styles.caseNextLabel}>
              {caseTranslations("next")}
            </span>
            <span className={styles.caseNextTitle}>
              {projectsTranslations(`items.${nextProject.id}.title`)}
            </span>
            <span className={styles.sectionAction}>
              {caseTranslations("allProjects")}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>
    </>
  )
}
