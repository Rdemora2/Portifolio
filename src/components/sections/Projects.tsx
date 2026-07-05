"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { projects } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import BorderGlow from "@/components/shared/BorderGlow";
import { ProjectDrawer } from "@/components/shared/ProjectDrawer";
import type { Project, RoleType } from "@/types";

type FilterType = "all" | "engineering" | "management" | "international";

function matchesFilter(project: Project, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "international") return project.international === true;
  if (filter === "engineering")
    return project.roleType === "engineering" || project.roleType === "hybrid";
  if (filter === "management")
    return project.roleType === "management" || project.roleType === "hybrid";
  return true;
}

export function Projects() {
  const t = useTranslations("Projects");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "engineering", label: t("filters.engineering") },
    { key: "management", label: t("filters.management") },
    { key: "international", label: t("filters.international") },
  ];

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter));

  const loadGsap = async () => {
    if (gsapRef.current) return gsapRef.current;
    const mod = await import("@/lib/gsap");
    gsapRef.current = mod;
    return mod;
  };

  const handleFilterChange = async (filter: FilterType) => {
    const mod = await loadGsap();
    const gsap = mod?.gsap;
    if (!gsap || !listRef.current) {
      setActiveFilter(filter);
      return;
    }

    gsap.to(listRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      stagger: 0.03,
      onComplete: () => {
        setActiveFilter(filter);
        setDrawerProject(null);
        setIsDrawerOpen(false);
        if (listRef.current) {
          gsap.fromTo(
            listRef.current.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power3.out",
            },
          );
        }
      },
    });
  };

  const openDrawer = (project: Project) => {
    setDrawerProject(project);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Keep project in state during exit animation, clear after
    setTimeout(() => setDrawerProject(null), 500);
  };

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

        {/* Filter buttons with glass-card active state */}
        <div className="mb-8 flex flex-wrap gap-2 sm:mb-12">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              id={`project-filter-${key}`}
              onClick={() => handleFilterChange(key)}
              className="cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 sm:px-6 sm:py-2 sm:text-sm"
              style={{
                fontFamily: "var(--font-mono)",
                borderColor:
                  activeFilter === key
                    ? "var(--color-signal)"
                    : "var(--glass-border)",
                backgroundColor:
                  activeFilter === key
                    ? "rgba(99,102,241,0.12)"
                    : "var(--glass-surface-subtle)",
                backdropFilter:
                  activeFilter === key ? "var(--glass-blur-xs)" : "none",
                color:
                  activeFilter === key
                    ? "var(--color-signal)"
                    : "var(--color-text-secondary)",
              }}
              aria-pressed={activeFilter === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Project list */}
        <div ref={listRef} className="space-y-0">
          {filtered.map((project, idx) => (
            <ProjectItem
              key={project.id}
              project={project}
              index={idx}
              onOpen={() => openDrawer(project)}
            />
          ))}
        </div>
      </div>

      {/* Glass drawer — portal-like fixed overlay */}
      <ProjectDrawer
        project={drawerProject}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </section>
  );
}

function ProjectItem({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const t = useTranslations("Projects");
  const itemRef = useRef<HTMLDivElement>(null);

  const getRoleLabel = (role: RoleType): string => {
    const map: Record<RoleType, string> = {
      engineering: t("roles.engineering"),
      management: t("roles.management"),
      hybrid: t("roles.hybrid"),
    };
    return map[role];
  };

  return (
    <ScrollReveal animation="card" delay={index * 0.08}>
      <BorderGlow
        className="w-full mb-4"
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#0a1018"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
      >
        <div
          ref={itemRef}
          className="cursor-pointer group px-4 rounded-2xl sm:px-6"
          style={{ transition: "background-color 0.3s ease" }}
          onMouseEnter={() => {
            if (itemRef.current) {
              itemRef.current.style.backgroundColor = "rgba(99,102,241,0.06)";
            }
          }}
          onMouseLeave={() => {
            if (itemRef.current) {
              itemRef.current.style.backgroundColor = "transparent";
            }
          }}
        >
          <div
            className="relative flex items-center gap-4 py-6 transition-all sm:gap-6 sm:py-8 lg:gap-10"
            onClick={onOpen}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`${t(`items.${project.id}.title`)} — ${t("openDrawer") || "Abrir detalhes"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }}
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
          </div>
        </div>
      </BorderGlow>
    </ScrollReveal>
  );
}
