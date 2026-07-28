import { insights } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Link } from "@/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SpotlightCard } from "@/components/shared/SpotlightCard";

export async function Insights() {
  const [t, locale] = await Promise.all([
    getTranslations("Insights"),
    getLocale(),
  ]);
  const publishedInsights = insights.filter(
    (insight) => insight.hasFullArticle && insight.slug,
  );
  const rawCategories = t.raw("categories");
  const categoryLabels = (typeof rawCategories === "object" && rawCategories !== null ? rawCategories : {}) as Record<string, string>;
  const rawTags = t.raw("tags");
  const tagLabels = (typeof rawTags === "object" && rawTags !== null ? rawTags : {}) as Record<string, string>;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <section
      id="insights"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end sm:mb-20">
            <div className="max-w-2xl">
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
                className="mb-4 font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-3xl)",
                }}
              >
                {t("title")}
              </h2>
              <p
                className="text-sm sm:text-base"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid max-w-4xl gap-6">
          {publishedInsights.map((insight, idx) => (
            <ScrollReveal key={insight.id} animation="card" delay={idx * 0.1}>
              <SpotlightCard
                className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 sm:p-8"
                style={{ borderRadius: "1.5rem" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      borderColor: "rgba(99,102,241,0.2)",
                      color: "var(--color-signal)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {categoryLabels[insight.category] ?? insight.category}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <time dateTime={insight.date}>
                      {dateFormatter.format(new Date(`${insight.date}T00:00:00Z`))}
                    </time>{" "}
                    · {insight.readTime} {t("readTime")}
                  </span>
                </div>

                <h3
                  className="mb-3 text-lg font-bold leading-tight sm:text-xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t(`items.${insight.id}.title`)}
                </h3>

                <p
                  className="mb-8 line-clamp-2 text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t(`items.${insight.id}.summary`)}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {insight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                        #{tagLabels[tag] ?? tag}
                    </span>
                  ))}
                </div>

                {insight.hasFullArticle && (
                  <Link
                    href={`/insights/${insight.slug}`}
                    className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-signal)] transition-transform duration-200 group-hover:translate-x-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {t("viewArticle")}
                    <span>→</span>
                  </Link>
                )}
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
