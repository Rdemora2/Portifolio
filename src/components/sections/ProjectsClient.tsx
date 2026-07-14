"use client";

import {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { ProjectViewModel, RoleType } from "@/types";

const ProjectDrawer = dynamic(() =>
  import("@/components/shared/ProjectDrawer").then((module) => module.ProjectDrawer),
);

type FilterType = "all" | "engineering" | "management" | "international";

function matchesFilter(project: ProjectViewModel, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "international") return project.international === true;
  if (filter === "engineering")
    return project.roleType === "engineering" || project.roleType === "hybrid";
  if (filter === "management")
    return project.roleType === "management" || project.roleType === "hybrid";
  return true;
}

const ProjectItem = memo(function ProjectItem({
  project,
  index,
  onOpen,
}: {
  project: ProjectViewModel;
  index: number;
  onOpen: (project: ProjectViewModel) => void;
}) {
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
        <div
          className="group cursor-pointer rounded-2xl px-4 transition-colors duration-300 hover:bg-[rgba(99,102,241,0.06)] sm:px-6"
        >
          <button
            type="button"
            className="relative flex w-full items-center gap-4 py-6 text-left transition-all sm:gap-6 sm:py-8 lg:gap-10"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
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

export function ProjectsClient({ projects }: { projects: ProjectViewModel[] }) {
  const t = useTranslations("Projects");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [drawerProject, setDrawerProject] = useState<ProjectViewModel | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);
  const gsapPromiseRef = useRef<Promise<{ gsap: typeof import("gsap").gsap }> | null>(null);
  const filterOperationRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryAnimationFrameRef = useRef(0);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearCloseTimer();
      cancelAnimationFrame(entryAnimationFrameRef.current);
    },
    [clearCloseTimer],
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "engineering", label: t("filters.engineering") },
    { key: "management", label: t("filters.management") },
    { key: "international", label: t("filters.international") },
  ];

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter));

  const loadGsap = async () => {
    if (gsapRef.current) return gsapRef.current;
    if (!gsapPromiseRef.current) {
      gsapPromiseRef.current = import("@/lib/gsap").then((mod) => {
        gsapRef.current = mod;
        return mod;
      }).catch((error: unknown) => {
        gsapPromiseRef.current = null;
        throw error;
      });
    }
    return gsapPromiseRef.current;
  };

  const handleFilterChange = async (filter: FilterType) => {
    const operation = ++filterOperationRef.current;
    clearCloseTimer();
    cancelAnimationFrame(entryAnimationFrameRef.current);

    const applyFilterWithoutAnimation = () => {
      if (operation !== filterOperationRef.current) return;
      setActiveFilter(filter);
      setDrawerProject(null);
      setIsDrawerOpen(false);
    };

    if (filter === activeFilter) {
      if (listRef.current && gsapRef.current) {
        const elements = listRef.current.children;
        gsapRef.current.gsap.killTweensOf(elements);
        gsapRef.current.gsap.set(elements, {
          clearProps: "opacity,transform",
        });
      }
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (listRef.current && gsapRef.current) {
        gsapRef.current.gsap.killTweensOf(listRef.current.children);
      }
      applyFilterWithoutAnimation();
      return;
    }

    let mod: { gsap: typeof import("gsap").gsap };
    try {
      mod = await loadGsap();
    } catch {
      applyFilterWithoutAnimation();
      return;
    }

    if (operation !== filterOperationRef.current) return;
    const gsap = mod?.gsap;
    if (!gsap || !listRef.current) {
      applyFilterWithoutAnimation();
      return;
    }

    gsap.to(listRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      stagger: 0.03,
      onComplete: () => {
        if (operation !== filterOperationRef.current) return;
        setActiveFilter(filter);
        setDrawerProject(null);
        setIsDrawerOpen(false);
        entryAnimationFrameRef.current = requestAnimationFrame(() => {
          if (operation !== filterOperationRef.current || !listRef.current) return;
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
        });
      },
    });
  };

  const openDrawer = useCallback(
    (project: ProjectViewModel) => {
      clearCloseTimer();
      setDrawerProject(project);
      setIsDrawerOpen(true);
    },
    [clearCloseTimer],
  );

  const closeDrawer = useCallback(() => {
    clearCloseTimer();
    setIsDrawerOpen(false);
    // Keep project in state during exit animation, clear after
    closeTimerRef.current = setTimeout(() => {
      setDrawerProject(null);
      closeTimerRef.current = null;
    }, 500);
  }, [clearCloseTimer]);

  return (
    <>
      {/* Filter buttons with glass-card active state */}
      <div
        className="mb-8 flex flex-wrap gap-2 sm:mb-12"
        role="group"
        aria-label={t("filters.label")}
      >
        {filters.map(({ key, label }) => (
          <button
            key={key}
            id={`project-filter-${key}`}
            aria-controls="project-list"
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
      <div id="project-list" ref={listRef} className="space-y-0">
        {filtered.map((project, idx) => (
          <ProjectItem
            key={project.id}
            project={project}
            index={idx}
            onOpen={openDrawer}
          />
        ))}
      </div>

      {/* Keep lazy loading local so the route fallback never replaces the page. */}
      {drawerProject ? (
        <Suspense fallback={null}>
          <ProjectDrawer
            project={drawerProject}
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
          />
        </Suspense>
      ) : null}
    </>
  );
}
