import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ProjectCaseStudy } from "@/components/portfolio/ProjectCaseStudy"
import { projects } from "@/data/portfolio"
import { isLocale } from "@/i18n.config"
import { AUTHOR_NAME, getLocalizedUrl, SITE_URL } from "@/lib/constants"
import { buildPageMetadata } from "@/lib/page-metadata"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const project = findProject(slug)
  if (!project) notFound()

  const t = await getTranslations({
    locale: candidate,
    namespace: "Projects",
  })
  const title = `${t(`items.${project.id}.title`)} — ${t(
    `items.${project.id}.role`,
  )}`

  return buildPageMetadata({
    locale: candidate,
    pathname: `/work/${project.slug}`,
    title,
    description: t(`items.${project.id}.shortDescription`),
  })
}

export default async function ProjectCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const projectIndex = projects.findIndex((project) => project.slug === slug)
  if (projectIndex === -1) notFound()

  const project = projects[projectIndex]
  const nextProject = projects[(projectIndex + 1) % projects.length]
  if (!project || !nextProject) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("Projects")
  const canonical = getLocalizedUrl(candidate, `/work/${project.slug}`)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${canonical}#case`,
        name: t(`items.${project.id}.title`),
        description: t(`items.${project.id}.shortDescription`),
        url: canonical,
        inLanguage: candidate,
        creator: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: AUTHOR_NAME,
        },
        about: project.stack,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("navLabel"),
            item: getLocalizedUrl(candidate, "/work"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t(`items.${project.id}.title`),
            item: canonical,
          },
        ],
      },
    ],
  }
  const serializedStructuredData = JSON.stringify(structuredData).replace(
    /</g,
    "\\u003c",
  )

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedStructuredData }}
      />
      <ProjectCaseStudy project={project} nextProject={nextProject} />
    </main>
  )
}
