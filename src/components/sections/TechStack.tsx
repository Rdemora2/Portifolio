import { FaAws } from "react-icons/fa"
import {
  SiDocker,
  SiGo,
  SiGooglecloud,
  SiKotlin,
  SiNextdotjs,
  SiPostgresql,
  SiReact,
  SiVuedotjs,
} from "react-icons/si"
import { getTranslations } from "next-intl/server"

import LogoLoop from "@/components/shared/LogoLoop"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { projects, techStack } from "@/data/portfolio"
import { TECH_CATEGORY_COLORS } from "@/lib/constants"
import { Link } from "@/navigation"

import styles from "./TechStack.module.css"

const techLogos = [
  { node: <SiGo title="Go" /> },
  { node: <SiGooglecloud title="Google Cloud" /> },
  { node: <FaAws title="AWS" /> },
  { node: <SiDocker title="Docker" /> },
  { node: <SiPostgresql title="PostgreSQL" /> },
  { node: <SiKotlin title="Kotlin" /> },
  { node: <SiNextdotjs title="Next.js" /> },
  { node: <SiReact title="React" /> },
  { node: <SiVuedotjs title="Vue.js" /> },
]

const categoryOrder = [
  "backend",
  "cloud",
  "devops",
  "frontend",
  "mobile",
  "video",
  "ai",
] as const

const evidenceProjectIds = [
  "hospital-sirio-libanes",
  "band-news-bandsports",
] as const

export async function TechStack() {
  const [t, nav, page, projectT, projectPage] = await Promise.all([
    getTranslations("About.pillars"),
    getTranslations("Nav"),
    getTranslations("PortfolioPages.about"),
    getTranslations("Projects"),
    getTranslations("PortfolioPages.home.projects"),
  ])

  const grouped = new Map(
    categoryOrder.map((category) => [
      category,
      techStack.filter((technology) => technology.category === category),
    ]),
  )
  const evidenceProjects = evidenceProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is (typeof projects)[number] => Boolean(project))

  return (
    <section id="tech" className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal animation="title" className={styles.heading}>
          <p className={styles.eyebrow}>{nav("tech_small")}</p>
          <h2 className={styles.title}>{nav("tech")}</h2>
        </ScrollReveal>

        <div className={styles.content}>
          <div className={styles.capabilities}>
            {Array.from(grouped).map(([category, items], index) => (
              <ScrollReveal
                key={category}
                delay={Math.min(index * 0.04, 0.16)}
                className={styles.category}
              >
                <header className={styles.categoryHeader}>
                  <span className={styles.categoryIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{t(category)}</h3>
                  <span
                    className={styles.categorySignal}
                    style={{
                      backgroundColor:
                        TECH_CATEGORY_COLORS[category] ?? "var(--color-signal)",
                    }}
                    aria-hidden="true"
                  />
                </header>
                <div className={styles.tags}>
                  {items.map((technology) => (
                    <span
                      key={technology.name}
                      className={`tech-tag ${styles.tag}`}
                      data-featured={technology.featured || undefined}
                    >
                      {technology.name}
                    </span>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <aside className={styles.evidence} aria-label={projectPage("eyebrow")}>
            <p className={styles.evidenceEyebrow}>{projectPage("eyebrow")}</p>
            {evidenceProjects.map((project) => (
              <Link
                key={project.id}
                href={{ pathname: "/work/[slug]", params: { slug: project.slug } }}
                className={styles.evidenceLink}
                aria-label={`${projectPage("openCase")}: ${projectT(`items.${project.id}.title`)}`}
              >
                <span className={styles.evidenceTitle}>
                  {projectT(`items.${project.id}.title`)}
                </span>
                <span className={styles.evidenceStack}>
                  {project.stack.slice(0, 4).join(" · ")}
                </span>
                <span className={styles.evidenceAction} aria-hidden="true">
                  {projectT("viewCaseStudy")} ↗
                </span>
              </Link>
            ))}
          </aside>
        </div>

        <div className={styles.logoBand}>
          <LogoLoop
            logos={techLogos}
            pauseLabel={page("motionPause")}
            resumeLabel={page("motionResume")}
            speed={52}
            logoHeight={32}
            gap={52}
            fadeOut
            fadeOutColor="var(--color-deep)"
          />
        </div>
      </div>
    </section>
  )
}
