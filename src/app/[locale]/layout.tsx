import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Footer } from "@/components/layout/Footer"
import { Navigation } from "@/components/layout/Navigation"
import { WebVitals } from "@/components/layout/WebVitals"
import {
  getDocumentLanguage,
  isLocale,
  locales,
  type Locale,
} from "@/i18n.config"
import {
  AUTHOR_NAME,
  getLocalizedUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants"

import "../globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const localizedServiceDescriptions: Record<Locale, string> = {
  pt: "Consultoria em arquitetura de software, cloud, DevOps e liderança técnica para produtos de larga escala.",
  en: "Consulting in software architecture, cloud, DevOps, and technical leadership for large-scale products.",
  es: "Consultoría en arquitectura de software, cloud, DevOps y liderazgo técnico para productos a gran escala.",
}

export const dynamicParams = false

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050a12",
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: candidate } = await params

  if (!isLocale(candidate)) notFound()

  const locale = candidate
  const t = await getTranslations({ locale, namespace: "Metadata" })
  const canonical = getLocalizedUrl(locale)
  const socialImage = `${SITE_URL}/opengraph-image/${locale}`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s | ${SITE_NAME}`,
    },
    description: t("description"),
    keywords: [
      "Software Engineer",
      "IT Manager",
      "Tech Lead",
      "Go",
      "Golang",
      "Next.js",
      "TypeScript",
      "Cloud Architecture",
      "AWS",
      "GCP",
      "DevOps",
      "Observability",
      "Kotlin",
      "Technical Leadership",
    ],
    authors: [{ name: AUTHOR_NAME, url: canonical }],
    creator: AUTHOR_NAME,
    alternates: {
      canonical,
      languages: {
        [getDocumentLanguage("pt")]: getLocalizedUrl("pt"),
        [getDocumentLanguage("en")]: getLocalizedUrl("en"),
        [getDocumentLanguage("es")]: getLocalizedUrl("es"),
        "x-default": getLocalizedUrl("pt"),
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "pt" ? "pt_BR" : locale === "es" ? "es_MX" : "en_US",
      title: t("title"),
      description: t("description"),
      siteName: SITE_NAME,
      url: canonical,
      images: [{ url: socialImage, width: 1200, height: 630, alt: t("title") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [{ url: socialImage, alt: t("title") }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params

  if (!isLocale(candidate)) notFound()

  const locale = candidate
  setRequestLocale(locale)

  const [messages, nav, metadata, hero] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Metadata" }),
    getTranslations({ locale, namespace: "Hero" }),
  ])
  const layoutMessages = {
    Nav: messages.Nav,
    Error: messages.Error,
    Loading: messages.Loading,
  }
  const webVitalsEndpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT
  const validWebVitalsEndpoint =
    webVitalsEndpoint?.startsWith("/") &&
    !webVitalsEndpoint.startsWith("//") &&
    !webVitalsEndpoint.includes("\\")
      ? webVitalsEndpoint
      : null
  const canonical = getLocalizedUrl(locale)
  const personId = `${SITE_URL}/#person`
  const documentLanguage = getDocumentLanguage(locale)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: AUTHOR_NAME,
        jobTitle: hero("title"),
        description: metadata("description"),
        url: canonical,
        image: `${SITE_URL}/opengraph-image/${locale}`,
        sameAs: [
          "https://www.linkedin.com/in/robertomoraes/",
          "https://github.com/Rdemora2",
        ],
        knowsAbout: [
          "Go",
          "Next.js",
          "TypeScript",
          "Kotlin",
          "AWS",
          "GCP",
          "Cloud Architecture",
          "DevOps",
          "Observability",
          "PostgreSQL",
          "Redis",
          "Technical Leadership",
        ],
        worksFor: {
          "@type": "Organization",
          name: "Valiant Group do Brasil",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          addressCountry: "BR",
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${canonical}#service`,
        name: `${metadata("title")} | Consulting`,
        provider: { "@id": personId },
        description: localizedServiceDescriptions[locale],
        areaServed: ["BR", "US", "MX"],
        serviceType: [
          "Software Architecture",
          "Cloud Infrastructure",
          "DevOps",
          "Backend Engineering",
          "Technical Leadership",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${canonical}#website`,
        url: canonical,
        name: `${SITE_NAME} | Portfolio`,
        author: { "@id": personId },
        inLanguage: documentLanguage,
      },
    ],
  }
  const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c")

  return (
    <html
      lang={documentLanguage}
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={layoutMessages}>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            {nav("skipToContent")}
          </a>
          {validWebVitalsEndpoint ? (
            <WebVitals endpoint={validWebVitalsEndpoint} />
          ) : null}
          <Navigation />
          {children}
          <Footer />
          {process.env.VERCEL === "1" && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
