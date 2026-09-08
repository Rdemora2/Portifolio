import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import styles from "@/components/portfolio/Portfolio.module.css"
import workStyles from "@/components/portfolio/Work.module.css"
import { ProjectGrid } from "@/components/portfolio/ProjectGrid"
import { SectionHeading } from "@/components/portfolio/SectionHeading"
import { WebsiteShowcase } from "@/components/sections/WebsiteShowcase"
import { isLocale } from "@/i18n.config"
import { buildPageMetadata } from "@/lib/page-metadata"
import { projects } from "@/data/portfolio"
import { Link } from "@/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  const t = await getTranslations({
    locale: candidate,
    namespace: "PortfolioPages.work",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/work",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("PortfolioPages.work")
  const projectText = await getTranslations("Projects")

  return (
    <main id="main-content">
      <header className={workStyles.hero} data-page-hero>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <div className={workStyles.heroLayout}>
            <div>
              <h1 className={workStyles.title}>{t("title")}</h1>
              <p className={workStyles.lead}>{t("description")}</p>
            </div>
            <div className={workStyles.caseIndex}>
              <p>{t("caseCount", { count: projects.length })}</p>
              <ol>
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link href={{ pathname: "/work/[slug]", params: { slug: project.slug } }}>
                      {projectText(`items.${project.id}.title`)}<span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <nav className={workStyles.jumpLinks} aria-label={t("navigation")}>
            <a href="#production-cases">{t("casesEyebrow")}<span aria-hidden="true">↓</span></a>
            <a href="#web">{t("labEyebrow")}<span aria-hidden="true">↓</span></a>
          </nav>
        </div>
      </header>

      <section id="production-cases" className={`${styles.section} ${workStyles.cases}`} data-work-cases>
        <div className={styles.container}>
          <div className={workStyles.sectionHeading}><SectionHeading
            eyebrow={t("casesEyebrow")}
            title={t("casesTitle")}
            description={t("casesDescription")}
            split
          /></div>
          <ProjectGrid variant="work" />
        </div>
      </section>

      <WebsiteShowcase variant="lab" />
    </main>
  )
}
