import { getTranslations } from "next-intl/server"

import { projects } from "@/data/portfolio"
import { isLocale, locales } from "@/i18n.config"
import { createProjectSocialImage } from "@/lib/social-image"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return projects.flatMap((project) =>
    locales.map((locale) => ({ locale, slug: project.slug })),
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isLocale(locale)) return new Response(null, { status: 404 })

  const project = projects.find((candidate) => candidate.slug === slug)
  if (!project) return new Response(null, { status: 404 })

  const t = await getTranslations({ locale, namespace: "Projects" })

  return createProjectSocialImage({
    locale,
    title: t(`items.${project.id}.title`),
    role: t(`items.${project.id}.role`),
    stack: project.stack,
  })
}
