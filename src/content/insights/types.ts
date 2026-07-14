export const articleSceneKinds = [
  "ingress",
  "boundaries",
  "hot-path",
  "cache-fallback",
  "telemetry",
  "security",
  "recovery",
  "release",
] as const

export type ArticleSceneKind = (typeof articleSceneKinds)[number]

export type ArticleSceneVisual = {
  kind: ArticleSceneKind
  focusNode: number
  metricIndex?: number
}

export type InsightArticleSectionCopy = {
  id: string
  eyebrow: string
  title: string
  intro: string
  items: string[]
  note?: string
}

export type InsightArticleSection = InsightArticleSectionCopy & {
  visual: ArticleSceneVisual
}

export type InsightArticle = {
  seo: {
    title: string
    description: string
  }
  eyebrow: string
  title: string
  subtitle: string
  backLabel: string
  publishedLabel: string
  publishedDate: string
  readTime: string
  tocLabel: string
  experience: {
    coreLabel: string
    coreCaption: string
    traceLabel: string
    chapterLabel: string
    scrollLabel: string
    progressLabel: string
    topologyLabel: string
    traceCoordinateLabel: string
  }
  intro: string
  metricsLabel: string
  metrics: Array<{ value: string; label: string }>
  architectureLabel: string
  architectureTitle: string
  architectureDescription: string
  architectureNodes: string[]
  sections: InsightArticleSection[]
  authorRole: string
  ctaEyebrow: string
  ctaTitle: string
  ctaDescription: string
  ctaLabel: string
}
