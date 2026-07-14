import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { Link } from "@/navigation"
import { getGoProductionArticle } from "@/content/insights/go-em-producao"
import { getDocumentLanguage, isLocale } from "@/i18n.config"
import { AUTHOR_NAME, getLocalizedUrl, SITE_URL } from "@/lib/constants"

import { ArticleProgress } from "./ArticleProgress"

const articlePath = "/insights/go-em-producao"

export default async function GoEmProducaoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params

  if (!isLocale(candidate)) notFound()

  const locale = candidate
  setRequestLocale(locale)

  const article = getGoProductionArticle(locale)
  const documentLanguage = getDocumentLanguage(locale)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${article.publishedDate}T00:00:00Z`))
  const canonical = getLocalizedUrl(locale, articlePath)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.seo.description,
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    inLanguage: documentLanguage,
    mainEntityOfPage: canonical,
    image: `${SITE_URL}/opengraph-image/article/${locale}`,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: getLocalizedUrl(locale),
    },
  }
  const serializedJsonLd = JSON.stringify(articleJsonLd).replace(/</g, "\\u003c")

  return (
    <main id="main-content" className="relative overflow-clip bg-[var(--color-void)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
      />

      <section className="relative isolate border-b border-[var(--color-edge)] px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_18%,rgba(99,102,241,0.2),transparent_30%),radial-gradient(circle_at_20%_68%,rgba(0,212,255,0.1),transparent_28%),linear-gradient(180deg,#050a12_0%,#020408_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.12)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="mx-auto max-w-5xl">
          <Link
            href="/#insights"
            prefetch={false}
            className="mb-12 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-edge)] bg-[rgba(5,10,18,0.72)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-signal)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span aria-hidden="true">←</span>
            {article.backLabel}
          </Link>

          <p
            className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-matrix)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {article.eyebrow}
          </p>
          <h1
            className="max-w-4xl text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] text-[var(--color-text-primary)] sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {article.title}
          </h1>
          <p
            className="mt-8 max-w-3xl text-pretty text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {article.subtitle}
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>{AUTHOR_NAME}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--color-signal)]" />
            <time dateTime={article.publishedDate}>
              {article.publishedLabel} {formattedDate}
            </time>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--color-signal)]" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-edge)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p
            className="max-w-4xl text-pretty text-xl leading-9 text-[var(--color-text-secondary)] sm:text-2xl sm:leading-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {article.intro}
          </p>

          <div className="mt-14">
            <p
              className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {article.metricsLabel}
            </p>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-[var(--color-edge)] bg-[var(--color-edge)] sm:grid-cols-2 lg:grid-cols-4">
              {article.metrics.map((metric) => (
                <div key={metric.label} className="bg-[rgba(5,10,18,0.96)] p-6 sm:p-7">
                  <dt
                    className="text-xs leading-5 text-[var(--color-text-muted)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {metric.label}
                  </dt>
                  <dd
                    className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl xl:grid xl:grid-cols-[minmax(0,820px)_260px] xl:justify-between xl:gap-20">
          <div>
            <section className="mb-24 rounded-3xl border border-[var(--color-edge)] bg-[linear-gradient(145deg,rgba(13,21,32,0.88),rgba(5,10,18,0.72))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:p-10">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-highlight)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {article.architectureLabel}
              </p>
              <h2
                className="mt-4 text-balance text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {article.architectureTitle}
              </h2>
              <p
                className="mt-5 max-w-2xl leading-7 text-[var(--color-text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {article.architectureDescription}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {article.architectureNodes.map((node, index) => (
                  <div
                    key={node}
                    role="listitem"
                    className="group relative min-h-24 overflow-hidden rounded-xl border border-[var(--color-edge)] bg-[rgba(2,4,8,0.62)] p-4"
                  >
                    <span
                      aria-hidden="true"
                      className="text-[10px] tabular-nums text-[var(--color-signal)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p
                      className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {node}
                    </p>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--color-signal)] to-[var(--color-highlight)] transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </div>
                ))}
              </div>
            </section>

            <article id="article-content" className="space-y-24">
              {article.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-signal)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {section.eyebrow}
                  </p>
                  <h2
                    className="mt-4 text-balance text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {section.title}
                  </h2>
                  <p
                    className="mt-6 text-pretty text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {section.intro}
                  </p>

                  <ul className="mt-8 space-y-3">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-4 rounded-xl border border-transparent px-4 py-3 text-sm leading-7 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-edge)] hover:bg-[rgba(99,102,241,0.025)] sm:text-base"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-matrix)] shadow-[0_0_10px_rgba(0,255,136,0.45)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {section.note ? (
                    <blockquote className="mt-8 border-l-2 border-[var(--color-highlight)] bg-gradient-to-r from-[rgba(0,212,255,0.06)] to-transparent py-5 pl-6 pr-4 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                      {section.note}
                    </blockquote>
                  ) : null}
                </section>
              ))}
            </article>
          </div>

          <ArticleProgress
            label={article.tocLabel}
            sections={article.sections.map(({ id, title }) => ({ id, title }))}
          />
        </div>
      </section>

      <section className="border-t border-[var(--color-edge)] bg-[var(--color-deep)] px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-matrix)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {article.ctaEyebrow}
          </p>
          <h2
            className="mt-5 text-balance text-3xl font-bold text-[var(--color-text-primary)] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {article.ctaTitle}
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-pretty leading-7 text-[var(--color-text-secondary)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {article.ctaDescription}
          </p>
          <Link
            href="/#contact"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-signal)] bg-[var(--color-signal)] px-7 py-3 text-sm font-semibold text-[var(--color-void)] shadow-[0_12px_40px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 hover:bg-[#a5b4fc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-signal)] motion-reduce:transform-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {article.ctaLabel}
          </Link>
          <p
            className="mt-8 text-xs text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {AUTHOR_NAME} · {article.authorRole}
          </p>
        </div>
      </section>
    </main>
  )
}
