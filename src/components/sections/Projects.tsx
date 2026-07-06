import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ProjectsClient } from "./ProjectsClient";

export function Projects() {
  const t = useTranslations("Projects");

  return (
    <section
      id="projects"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="title">
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {t("navLabel")}
          </p>
          <h2
            className="mb-8 font-bold sm:mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {t("title")}
          </h2>
        </ScrollReveal>

        <ProjectsClient />
      </div>
    </section>
  );
}
