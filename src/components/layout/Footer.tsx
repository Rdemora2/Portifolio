import { getLocale, getTranslations } from "next-intl/server"

import { personalInfo } from "@/data/portfolio"
import { footerNavigation } from "@/data/site-navigation"
import { isLocale } from "@/i18n.config"
import { getLocalizedPath } from "@/lib/constants"
import { Link } from "@/navigation"

export async function Footer() {
  const [footer, nav, locale] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getLocale(),
  ])
  // A document navigation avoids duplicate alternate metadata on the privacy route.
  const privacyHref = getLocalizedPath(isLocale(locale) ? locale : "pt", "/privacy")
  const year = new Date().getFullYear()
  return (
    <footer
      className="relative overflow-hidden border-t px-4 py-12 sm:px-6 sm:py-16"
      style={{
        backgroundColor: "var(--color-void)",
        borderColor: "var(--color-edge)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-signal), var(--color-matrix), var(--color-signal), transparent)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-48 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: "var(--color-signal)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-12">
          <div className="md:col-span-5 md:pr-8">
            <p
              className="mb-4 text-lg font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              RM<span style={{ color: "var(--color-signal)" }}>.</span>
            </p>
            <p
              className="max-w-md text-base leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
              }}
            >
              {footer("descriptionLine1")}
              <br />
              {footer("descriptionLine2")}
            </p>
          </div>

          <div className="md:col-span-3">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {footer("navigation")}
            </p>
            <nav aria-label={footer("navAriaLabel")}>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
                {footerNavigation.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="inline-flex min-h-11 items-center rounded-md text-sm transition-colors duration-200 hover:text-[var(--color-signal)] focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                        outlineColor: "var(--color-highlight)",
                      }}
                    >
                      {nav(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="md:col-span-4 md:justify-self-end">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {footer("contact")}
            </p>
            <div className="space-y-1">
              {personalInfo.contacts.map((contact) => (
                <a
                  key={contact.type}
                  href={contact.href}
                  target={contact.type !== "email" ? "_blank" : undefined}
                  rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                  className="flex min-h-11 items-center rounded-md text-sm transition-colors duration-200 hover:text-[var(--color-signal)] focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-secondary)",
                    outlineColor: "var(--color-highlight)",
                  }}
                >
                  {contact.label}
                  {contact.type !== "email" && (
                    <span className="sr-only"> {footer("opensNewTab")}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-10 grid gap-4 border-t pt-7 text-center sm:mt-14 md:grid-cols-[1fr_auto_1fr] md:items-center md:text-left"
          style={{ borderColor: "var(--color-edge)" }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-[var(--color-text-secondary)] md:justify-start">
            <a
              href={privacyHref}
              className="inline-flex min-h-11 items-center rounded-md underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-highlight)]"
            >
              {footer("privacy")}
            </a>
            <a
              href="#top"
              className="inline-flex min-h-11 items-center gap-2 rounded-md underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-highlight)]"
            >
              {footer("backToTop")} <span aria-hidden="true">↑</span>
            </a>
          </div>
          <p
            className="text-xs md:text-center"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            © {year} · {personalInfo.name}
          </p>
          <p
            className="text-xs md:text-right"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            {footer("signature")}
          </p>
        </div>
      </div>
    </footer>
  )
}
