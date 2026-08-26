import { personalInfo } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { useTranslations } from "next-intl"
import { ContactFormLoader } from "./ContactFormLoader"
import { ContactBackground } from "./ContactBackground"

export function Contact() {
  const t = useTranslations("Contact")
  const tNav = useTranslations("Nav")

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <ContactBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[2fr_3fr]">
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
                {personalInfo.contacts.map((contact) => (
                  <a
                    key={contact.type}
                    href={contact.href}
                    target={contact.type !== "email" ? "_blank" : undefined}
                    rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 text-sm transition-colors duration-200 hover:text-[var(--color-signal)]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200"
                      style={{ borderColor: "var(--color-edge)" }}
                      aria-hidden="true"
                    >
                      {contact.type === "email" && "✉"}
                      {contact.type === "whatsapp" && "💬"}
                      {contact.type === "linkedin" && "in"}
                      {contact.type === "github" && "gh"}
                    </span>
                    {contact.label}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="card" delay={0.2}>
            <div className="glass-panel rounded-2xl p-6 sm:p-8" style={{ borderRadius: "1.5rem" }}>
              <ContactFormLoader />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
