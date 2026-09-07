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
      className="relative border-t px-4 py-12 sm:px-6 sm:py-16"
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

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
          <div>
            <p
              className="mb-2 text-lg font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              RM<span style={{ color: "var(--color-signal)" }}>.</span>
            </p>
            <p
              className="text-sm leading-relaxed"
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

          <div>
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
              <ul className="grid grid-cols-2 gap-2">
                {footerNavigation.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-200 hover:text-[var(--color-signal)]"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {nav(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {footer("contact")}
            </p>
            <div className="space-y-2">
              {personalInfo.contacts.slice(0, 3).map((contact) => (
                <a
                  key={contact.type}
                  href={contact.href}
                  target={contact.type !== "email" ? "_blank" : undefined}
                  rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                  className="block text-sm transition-colors duration-200 hover:text-[var(--color-signal)]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-secondary)",
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
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:mt-12 md:flex-row"
          style={{ borderColor: "var(--color-edge)" }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-[var(--color-text-secondary)]">
            <a
              href={privacyHref}
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              {footer("privacy")}
            </a>
            <a
              href="#top"
              className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
            >
              {footer("backToTop")} <span aria-hidden="true">↑</span>
            </a>
          </div>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            © {year} · {personalInfo.name}
          </p>
          <p
            className="text-xs"
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
