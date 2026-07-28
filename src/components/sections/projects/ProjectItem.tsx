"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { ProjectViewModel, RoleType } from "@/types";

type ProjectItemProps = {
  project: ProjectViewModel;
  index: number;
  isExpanded: boolean;
  onOpen: (project: ProjectViewModel) => void;
  onPreload: () => void;
};

export const ProjectItem = memo(function ProjectItem({
  project,
  index,
  isExpanded,
  onOpen,
  onPreload,
}: ProjectItemProps) {
  const t = useTranslations("Projects");

  const getRoleLabel = (role: RoleType): string => {
    const map: Record<RoleType, string> = {
      engineering: t("roles.engineering"),
      management: t("roles.management"),
      hybrid: t("roles.hybrid"),
    };
    return map[role];
  };

  return (
    <ScrollReveal animation="card" delay={index * 0.08} className="mb-4">
      <div className="glass-card w-full rounded-[28px]">
        <div className="group cursor-pointer rounded-2xl px-4 transition-colors duration-300 hover:bg-[rgba(99,102,241,0.06)] sm:px-6">
          <button
            type="button"
            className="relative flex w-full items-center gap-4 py-6 text-left transition-all sm:gap-6 sm:py-8 lg:gap-10"
            onClick={() => onOpen(project)}
            onFocus={onPreload}
            onPointerEnter={onPreload}
            aria-haspopup="dialog"
            aria-controls="project-drawer"
            aria-expanded={isExpanded}
            data-project-trigger={project.id}
          >
            {/* Signal bar — slides in on hover */}
            <div
              className="absolute left-0 top-1/4 bottom-1/4 w-[4px] origin-center scale-y-0 rounded-r-full opacity-0 shadow-[0_0_15px_var(--color-signal)] transition-all duration-500 ease-out group-hover:scale-y-100 group-hover:opacity-100"
              style={{ backgroundColor: "var(--color-signal)" }}
              aria-hidden="true"
            />

            {/* Index number */}
            <span
              className="ml-2 hidden text-[60px] font-extrabold leading-none transition-colors duration-500 lg:block lg:text-[100px]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-muted)",
                transition: "color 0.5s ease",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3
                  className="text-lg font-bold transition-all duration-200 group-hover:translate-x-2 sm:text-xl md:text-2xl lg:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <span className="group-hover:text-[var(--color-signal)] transition-colors duration-200">
                    {t(`items.${project.id}.title`)}
                  </span>
                </h3>
                <span
                  className="rounded-full border px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: "var(--glass-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {project.client}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    backgroundColor: "rgba(99,102,241,0.1)",
                    color: "var(--color-signal)",
                  }}
                >
                  {getRoleLabel(project.roleType)}
                </span>
                {project.international && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      backgroundColor: "rgba(255,107,53,0.1)",
                      color: "var(--color-alert)",
                    }}
                  >
                    {t("internationalTag")} 🌍
                  </span>
                )}
              </div>
              <p
                className="text-sm md:text-base"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t(`items.${project.id}.shortDescription`)}
              </p>
            </div>

            {/* Arrow icon — "open" cue */}
            <div className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1">
              <svg
                aria-hidden="true"
                focusable="false"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ color: "var(--color-text-muted)" }}
              >
                <path
                  d="M4 10h12M10 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="sr-only"> — {t("openDrawer")}</span>
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
});
