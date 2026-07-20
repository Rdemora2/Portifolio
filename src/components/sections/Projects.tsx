import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { projects } from "@/data/portfolio";
import type { ProjectViewModel } from "@/types";
import { ProjectsClient } from "./ProjectsClient";

export function Projects() {
  const t = useTranslations("Projects");
  const projectViewModels: ProjectViewModel[] = projects.map((project) => ({
    id: project.id,
    roleType: project.roleType,
    client: project.client,
    international: project.international,
    metrics: project.metrics.map(({ id, value, suffix }) => ({
      id,
      value,
      suffix,
    })),
    stack: project.stack,
    highlightCount: project.highlights.length,
    keyDecisionCount: project.caseStudy?.keyDecisions.length ?? 0,
    lessonsLearnedCount: project.caseStudy?.lessonsLearned.length ?? 0,
    hasCaseStudy: Boolean(project.caseStudy),
    managedProductGroups: project.managedProductGroups ?? [],
  }));

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

        <ProjectsClient projects={projectViewModels} />
      </div>
    </section>
  );
}
