import type { Metadata } from "next"
import { headers } from "next/headers"

import {
  defaultLocale,
  getDocumentLanguage,
  isLocale,
  type Locale,
} from "@/i18n.config"
import { getLocalizedPath } from "@/lib/constants"

import "./fallback.css"

type NotFoundCopy = {
  metadataTitle: string
  metadataDescription: string
  eyebrow: string
  description: string
  back: string
  languageNavigation: string
  languages: Record<Locale, string>
}

const copy: Record<Locale, NotFoundCopy> = {
  pt: {
    metadataTitle: "Página não encontrada | Roberto Moraes",
    metadataDescription: "A página solicitada no portfólio não foi encontrada.",
    eyebrow: "Rota não encontrada",
    description:
      "Esta página não existe ou mudou de endereço. Volte ao portfólio para continuar a navegação.",
    back: "Voltar ao portfólio",
    languageNavigation: "Seleção de idioma",
    languages: { pt: "Português", en: "Inglês", es: "Espanhol" },
  },
  en: {
    metadataTitle: "Page not found | Roberto Moraes",
    metadataDescription: "The requested portfolio page could not be found.",
    eyebrow: "Route not found",
    description:
      "This page does not exist or has moved. Return to the portfolio to continue exploring.",
    back: "Back to portfolio",
    languageNavigation: "Language selection",
    languages: { pt: "Portuguese", en: "English", es: "Spanish" },
  },
  es: {
    metadataTitle: "Página no encontrada | Roberto Moraes",
    metadataDescription: "No se encontró la página solicitada del portafolio.",
    eyebrow: "Ruta no encontrada",
    description:
      "Esta página no existe o cambió de dirección. Vuelve al portafolio para continuar navegando.",
    back: "Volver al portafolio",
    languageNavigation: "Selección de idioma",
    languages: { pt: "Portugués", en: "Inglés", es: "Español" },
  },
}

async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers()
  const candidate = requestHeaders.get("X-NEXT-INTL-LOCALE") ?? ""
  return isLocale(candidate) ? candidate : defaultLocale
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const content = copy[locale]

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
  }
}

export default async function GlobalNotFound() {
  const locale = await getRequestLocale()
  const content = copy[locale]

  return (
    <html lang={getDocumentLanguage(locale)}>
      <body className="fallback-body">
        <main className="fallback-shell">
          <div className="fallback-grid" aria-hidden="true" />
          <section className="fallback-card" aria-labelledby="not-found-title">
            <p className="fallback-eyebrow">{content.eyebrow}</p>
            <h1 id="not-found-title" className="fallback-title">
              404
            </h1>
            <p className="fallback-copy">{content.description}</p>
            <a className="fallback-action" href={getLocalizedPath(locale)}>
              {content.back}
            </a>
            <nav
              className="fallback-locales"
              aria-label={content.languageNavigation}
            >
              {(["pt", "en", "es"] as const).map((availableLocale) => (
                <a
                  key={availableLocale}
                  className="fallback-locale"
                  href={getLocalizedPath(availableLocale)}
                  hrefLang={getDocumentLanguage(availableLocale)}
                  aria-label={content.languages[availableLocale]}
                >
                  <span lang={getDocumentLanguage(availableLocale)}>
                    {availableLocale.toUpperCase()}
                  </span>
                </a>
              ))}
            </nav>
          </section>
        </main>
      </body>
    </html>
  )
}
