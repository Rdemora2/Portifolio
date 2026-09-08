import { personalInfo } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { useLocale, useTranslations } from "next-intl"
import { ContactFormLoader } from "./ContactFormLoader"
import { ContactBackground } from "./ContactBackground"
import { isLocale } from "@/i18n.config"
import { getLocalizedPath } from "@/lib/constants"
import { FiGithub, FiLinkedin, FiMail, FiMessageCircle } from "react-icons/fi"

const contactIcons = {
  email: FiMail,
  whatsapp: FiMessageCircle,
  linkedin: FiLinkedin,
  github: FiGithub,
} as const

export function Contact() {
  const t = useTranslations("Contact")
  const tNav = useTranslations("Nav")
  const locale = useLocale()
  // Load privacy as a full document, as in Footer, to replace the complete head.
  const privacyHref = getLocalizedPath(isLocale(locale) ? locale : "pt", "/privacy")

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <ContactBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ScrollReveal animation="fade-up">
            <div>
              <p
                className="mb-2 text-xs font-normal uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.25em",
                }}
              >
                {tNav("contact")}
              </p>
              <h2
                className="mb-6 font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-3xl)",
                }}
              >
                {t("title")}
              </h2>
              <p
                className="mb-8 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-md)",
                }}
              >
                {t("subtitle")}
              </p>

              <div className="space-y-4">
                {personalInfo.contacts.map((contact) => {
                  const Icon = contactIcons[contact.type]

                  return (
                    <a
                      key={contact.type}
                      href={contact.href}
                      target={contact.type !== "email" ? "_blank" : undefined}
                      rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                      className="group flex min-h-12 items-center gap-3 rounded-xl px-1 text-sm transition-colors duration-200 hover:text-[var(--color-signal)] focus-visible:outline-2 focus-visible:outline-offset-4"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-secondary)",
                        outlineColor: "var(--color-highlight)",
                      }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white/[0.015] transition-colors duration-200 group-hover:border-[var(--color-signal)]"
                        style={{ borderColor: "var(--color-edge)" }}
                        aria-hidden="true"
                      >
                        <Icon className="h-[1.125rem] w-[1.125rem]" />
                      </span>
                      <span className="min-w-0 break-all">{contact.label}</span>
                      {contact.type !== "email" && (
                        <span className="sr-only"> {t("opensNewTab")}</span>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="card" delay={0.2}>
            <div className="rounded-2xl border border-[var(--color-edge)] bg-[var(--color-deep)] p-5 sm:p-8" style={{ borderRadius: "1.5rem" }}>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">{t("formTitle")}</h2>
              <p className="mb-8 text-sm leading-6 text-[var(--color-text-secondary)]">{t("formDescription")}</p>
              <ContactFormLoader />
              <p className="mt-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t("privacyNotice")} {" "}
                <a
                  href={privacyHref}
                  className="inline-flex min-h-12 items-center rounded-md text-[var(--color-text-secondary)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-highlight)]"
                >
                  {t("privacyLink")}
                </a>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
