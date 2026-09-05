import { getTranslations } from "next-intl/server"

import { projects } from "@/data/portfolio"
import { Link } from "@/navigation"

import styles from "./Portfolio.module.css"

const selectedProjectIds = [
  "hospital-sirio-libanes",
  "band-news-bandsports",
  "fiesta-americana",
] as const

const projectAccents: Record<(typeof selectedProjectIds)[number], string> = {
  "hospital-sirio-libanes": "green",
  "band-news-bandsports": "indigo",
  "fiesta-americana": "orange",
}

export async function ProjectGrid() {
  const [projectsTranslations, pageTranslations] = await Promise.all([
    getTranslations("Projects"),
    getTranslations("PortfolioPages.home.projects"),
  ])
  const selectedProjects = selectedProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is (typeof projects)[number] =>
      Boolean(project),
    )

  return (
    <div className={styles.projectGrid} data-project-grid>
      {selectedProjects.map((project, index) => (
        <article
          key={project.id}
          className={styles.projectCard}
          data-accent={projectAccents[project.id as keyof typeof projectAccents]}
          data-project-card={project.id}
        >
          <Link
            href={{
              pathname: "/work/[slug]",
              params: { slug: project.slug },
            }}
            className={styles.projectLink}
            data-project-link={project.id}
            aria-label={`${pageTranslations("openCase")}: ${projectsTranslations(
              `items.${project.id}.title`,
            )}`}
          >
            <div className={styles.projectMeta}>
              <span className={styles.projectIndex}>
                Case {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.projectRole}>
                {projectsTranslations(`items.${project.id}.role`)}
              </span>
            </div>

            <h3 className={styles.projectTitle}>
              {projectsTranslations(`items.${project.id}.title`)}
            </h3>
            <p className={styles.projectDescription}>
              {projectsTranslations(
                `items.${project.id}.shortDescription`,
              )}
            </p>

            {project.metrics.length > 0 ? (
              <dl className={styles.projectMetrics}>
                {project.metrics.map((metric) => (
                  <div key={metric.id} className={styles.projectMetric}>
                    <dt className={styles.projectMetricLabel}>
                      {projectsTranslations(
                        `items.${project.id}.metrics.${metric.id}`,
                      )}
                    </dt>
                    <dd className={styles.projectMetricValue}>
                      {metric.prefix}
                      {metric.value}
                      {metric.suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className={styles.projectFooter}>
              <div className={styles.stackPreview} aria-hidden="true">
                {project.stack.slice(0, 4).map((technology) => (
                  <span key={technology} className={styles.stackToken}>
                    {technology}
                  </span>
                ))}
              </div>
              <span className={styles.projectArrow} aria-hidden="true">
                →
              </span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}
