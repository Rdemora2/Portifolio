import { experience } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ExperienceTimelineLine } from "./ExperienceTimelineLine";
import { useTranslations } from "next-intl";

export function Experience() {
  const t = useTranslations("Experience");

  return (
    <section
      id="experience"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {t("title_small")}
          </p>
          <h2
            className="mb-12 font-bold sm:mb-20"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="relative">
          <ExperienceTimelineLine />

          <ol
            className="list-none space-y-12 sm:space-y-16 md:space-y-24"
            data-experience-list
          >
            {experience.map((entry, idx) => (
              <ScrollReveal
                key={entry.id}
                as="li"
                animation="card"
                delay={0.1}
              >
                <article
                  aria-labelledby={`experience-${entry.id}-title`}
                  data-experience-entry
                  className={`relative flex flex-col md:flex-row md:items-center ${
                    idx % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={
                      idx % 2 === 0
                        ? "flex flex-1 justify-center md:w-1/2 md:flex-none md:justify-start md:pl-12"
                        : "flex flex-1 justify-center md:w-1/2 md:flex-none md:justify-end md:pr-12"
                    }
                  >
                    <div
                      className="glass-card relative w-full max-w-lg rounded-2xl p-6 transition-all duration-300 sm:p-8"
                      data-experience-card
                      data-experience-side={
                        idx % 2 === 0 ? "right" : "left"
                      }
                      style={{ borderRadius: "1rem" }}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3
                          id={`experience-${entry.id}-title`}
                          className="text-xl font-bold"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {t(`items.${entry.id}.role`)}
                        </h3>
                        <span
                          className="text-xs font-medium"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-signal)",
                          }}
                        >
                          {t(`items.${entry.id}.period`)}
                        </span>
                      </div>

                      <p
                        className="mb-4 text-sm font-semibold uppercase tracking-wider"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {t(`items.${entry.id}.company`)}
                      </p>

                      <p
                        className="mb-6 text-sm leading-relaxed"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {t(`items.${entry.id}.description`)}
                      </p>

                      <ul
                        className="mb-6 list-none space-y-2"
                        data-experience-highlights
                      >
                        {(t.raw(`items.${entry.id}.highlights`) as string[]).map(
                          (highlight: string, hIdx: number) => (
                            <li
                              key={hIdx}
                              className="flex items-start gap-2 text-xs"
                              style={{
                                fontFamily: "var(--font-body)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              <span
                                aria-hidden="true"
                                className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                                style={{ backgroundColor: "var(--color-signal)" }}
                              />
                              {highlight}
                            </li>
                          ),
                        )}
                      </ul>

                      <div className="flex flex-wrap gap-2">
                        {entry.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border px-2 py-0.5 text-[10px]"
                            style={{
                              borderColor: "var(--color-edge)",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex h-12 w-12 items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div
                      className="absolute h-full w-full rounded-full border border-[var(--color-signal)] opacity-20"
                      style={{
                        backgroundColor: "var(--color-void)",
                        boxShadow: "0 0 20px var(--color-signal)",
                      }}
                    />
                    <div
                      className="h-3 w-3 rounded-full bg-[var(--color-signal)]"
                      style={{
                        boxShadow: "0 0 10px var(--color-signal)",
                      }}
                    />
                  </div>

                  <div className="hidden md:block md:w-1/2 md:flex-none" />
                </article>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </div>

      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-signal)] opacity-[0.03] blur-[120px]" />
    </section>
  );
}
