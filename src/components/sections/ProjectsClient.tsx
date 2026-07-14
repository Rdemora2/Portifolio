"use client";

import {
  Component,
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import type { ProjectViewModel, RoleType } from "@/types";

type ProjectDrawerModule = typeof import("@/components/shared/ProjectDrawer");

let projectDrawerModulePromise: Promise<ProjectDrawerModule> | null = null;
const drawerRetryStorageKey = "portfolio:project-drawer-retry";

function requestProjectDrawerModule() {
  if (!projectDrawerModulePromise) {
    projectDrawerModulePromise = import("@/components/shared/ProjectDrawer").catch(
      (error: unknown) => {
        projectDrawerModulePromise = null;
        throw error;
      },
    );
  }

  return projectDrawerModulePromise;
}

function createLazyProjectDrawer() {
  return lazy(() => requestProjectDrawerModule().then((module) => ({
    default: module.ProjectDrawer,
  })));
}

function preloadProjectDrawer() {
  void requestProjectDrawerModule().catch(() => undefined);
}

type ProjectDrawerBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class ProjectDrawerBoundary extends Component<
  ProjectDrawerBoundaryProps,
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type ProjectDrawerShellProps = {
  mode: "loading" | "error";
  projectTitle: string;
  loadingLabel: string;
  errorTitle: string;
  errorMessage: string;
  retryLabel: string;
  closeLabel: string;
  onRetry?: () => void;
  onClose: () => void;
};

function ProjectDrawerShell({
  mode,
  projectTitle,
  loadingLabel,
  errorTitle,
  errorMessage,
  retryLabel,
  closeLabel,
  onRetry,
  onClose,
}: ProjectDrawerShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousInert = Array.from(document.body.children)
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && !element.contains(shell),
      )
      .map((element) => ({ element, inert: element.inert }));

    html.style.overflow = "hidden";
    previousInert.forEach(({ element }) => {
      element.inert = true;
    });

    const focusFrame = requestAnimationFrame(() => {
      primaryActionRef.current?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const actions = Array.from(
        shell.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
      );
      if (actions.length === 0) return;

      const currentIndex = actions.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? actions.length - 1
          : currentIndex - 1
        : currentIndex < 0 || currentIndex === actions.length - 1
          ? 0
          : currentIndex + 1;

      event.preventDefault();
      actions[nextIndex]?.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      html.style.overflow = previousOverflow;
      previousInert.forEach(({ element, inert }) => {
        element.inert = inert;
      });
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const isError = mode === "error";
  const titleId = `project-drawer-${mode}-title`;
  const descriptionId = `project-drawer-${mode}-description`;

  return createPortal(
    <div
      ref={shellRef}
      id="project-drawer"
      role={isError ? "alertdialog" : "dialog"}
      aria-modal="true"
      aria-busy={isError ? undefined : "true"}
      aria-labelledby={titleId}
      aria-describedby={isError ? descriptionId : undefined}
      className="fixed inset-0 z-[9999] grid place-items-center bg-[rgba(5,10,18,0.82)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--glass-border)] bg-[rgba(10,16,24,0.98)] p-6 shadow-2xl sm:p-8">
        <p
          className="text-xs uppercase tracking-[0.2em] text-[var(--color-signal)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {projectTitle}
        </p>
        <h2
          id={titleId}
          aria-live={isError ? undefined : "polite"}
          className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isError ? errorTitle : loadingLabel}
        </h2>
        {isError ? (
          <p
            id={descriptionId}
            className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {errorMessage}
          </p>
        ) : null}

        {isError ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              ref={primaryActionRef}
              type="button"
              onClick={onRetry}
              className="min-h-11 rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-semibold text-[var(--color-void)]"
            >
              {retryLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full border border-[var(--glass-border)] px-5 py-2 text-sm font-semibold text-[var(--color-text-secondary)]"
            >
              {closeLabel}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between gap-4">
            <span
              aria-hidden="true"
              className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--color-edge)] border-t-[var(--color-signal)] motion-reduce:animate-none"
            />
            <button
              ref={primaryActionRef}
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full border border-[var(--glass-border)] px-5 py-2 text-sm font-semibold text-[var(--color-text-secondary)]"
            >
              {closeLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

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
  isExpanded,
  onOpen,
  onPreload,
}: {
  project: ProjectViewModel;
  index: number;
  isExpanded: boolean;
  onOpen: (project: ProjectViewModel) => void;
  onPreload: () => void;
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

export function ProjectsClient({ projects }: { projects: ProjectViewModel[] }) {
  const t = useTranslations("Projects");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [drawerProject, setDrawerProject] = useState<ProjectViewModel | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ProjectDrawer, setProjectDrawer] = useState(createLazyProjectDrawer);
  const [drawerBoundaryKey, setDrawerBoundaryKey] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);
  const gsapPromiseRef = useRef<Promise<{ gsap: typeof import("gsap").gsap }> | null>(null);
  const filterOperationRef = useRef(0);
  const entryAnimationFrameRef = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(entryAnimationFrameRef.current);
    },
    [],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // A DOM-only hydration sentinel keeps cross-browser E2E synchronization
    // explicit without introducing state, an extra render, or layout movement.
    list.dataset.hydrated = "true";
    return () => {
      delete list.dataset.hydrated;
    };
  }, []);

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
      setDrawerProject(project);
      setIsDrawerOpen(true);
    },
    [],
  );

  const focusProjectTrigger = useCallback((projectId: string) => {
    requestAnimationFrame(() => {
      const trigger = Array.from(
        document.querySelectorAll<HTMLElement>("[data-project-trigger]"),
      ).find(
        (element) => element.getAttribute("data-project-trigger") === projectId,
      );
      trigger?.focus({ preventScroll: true });
    });
  }, []);

  const resetDrawerLoader = useCallback(() => {
    projectDrawerModulePromise = null;
    setProjectDrawer(() => createLazyProjectDrawer());
    setDrawerBoundaryKey((attempt) => attempt + 1);
  }, []);

  const retryFailedDrawer = useCallback(() => {
    if (!drawerProject) return;

    try {
      sessionStorage.setItem(drawerRetryStorageKey, drawerProject.id);
    } catch {
      // Storage can be unavailable in hardened browsing modes. A reload still
      // clears the failed module map and leaves the user anchored in projects.
    }

    const retryUrl = new URL(window.location.href);
    retryUrl.hash = "projects";
    window.history.replaceState(
      window.history.state,
      "",
      `${retryUrl.pathname}${retryUrl.search}${retryUrl.hash}`,
    );
    window.location.reload();
  }, [drawerProject]);

  const closeDeferredDrawer = useCallback(() => {
    const projectId = drawerProject?.id;
    setIsDrawerOpen(false);
    setDrawerProject(null);
    if (projectId) focusProjectTrigger(projectId);
  }, [drawerProject?.id, focusProjectTrigger]);

  const closeFailedDrawer = useCallback(() => {
    resetDrawerLoader();
    closeDeferredDrawer();
  }, [closeDeferredDrawer, resetDrawerLoader]);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const finishDrawerExit = useCallback(() => {
    setDrawerProject(null);
  }, []);

  useEffect(() => {
    let projectId: string | null = null;
    try {
      projectId = sessionStorage.getItem(drawerRetryStorageKey);
    } catch {
      return;
    }

    if (!projectId) return;
    const project = projects.find(({ id }) => id === projectId);
    if (!project) return;

    const openFrame = requestAnimationFrame(() => {
      try {
        sessionStorage.removeItem(drawerRetryStorageKey);
      } catch {
        // The stored retry is best-effort; opening the recovered drawer is not.
      }
      openDrawer(project);
    });
    return () => cancelAnimationFrame(openFrame);
  }, [openDrawer, projects]);

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
      <div
        id="project-list"
        ref={listRef}
        className="space-y-0"
        data-projects-client
      >
        {filtered.map((project, idx) => (
          <ProjectItem
            key={project.id}
            project={project}
            index={idx}
            isExpanded={
              isDrawerOpen && drawerProject?.id === project.id
            }
            onOpen={openDrawer}
            onPreload={preloadProjectDrawer}
          />
        ))}
      </div>

      {/* Keep lazy loading local so the route fallback never replaces the page. */}
      {drawerProject ? (
        <ProjectDrawerBoundary
          key={drawerBoundaryKey}
          fallback={
            <ProjectDrawerShell
              mode="error"
              projectTitle={t(`items.${drawerProject.id}.title`)}
              loadingLabel={t("drawerLoading", {
                project: t(`items.${drawerProject.id}.title`),
              })}
              errorTitle={t("drawerLoadErrorTitle")}
              errorMessage={t("drawerLoadErrorMessage", {
                project: t(`items.${drawerProject.id}.title`),
              })}
              retryLabel={t("retryDrawer")}
              closeLabel={t("closeDrawer")}
              onRetry={retryFailedDrawer}
              onClose={closeFailedDrawer}
            />
          }
        >
          <Suspense
            fallback={
              <ProjectDrawerShell
                mode="loading"
                projectTitle={t(`items.${drawerProject.id}.title`)}
                loadingLabel={t("drawerLoading", {
                  project: t(`items.${drawerProject.id}.title`),
                })}
                errorTitle={t("drawerLoadErrorTitle")}
                errorMessage={t("drawerLoadErrorMessage", {
                  project: t(`items.${drawerProject.id}.title`),
                })}
                retryLabel={t("retryDrawer")}
                closeLabel={t("closeDrawer")}
                onClose={closeDeferredDrawer}
              />
            }
          >
            <ProjectDrawer
              project={drawerProject}
              isOpen={isDrawerOpen}
              onClose={closeDrawer}
              onExitComplete={finishDrawerExit}
            />
          </Suspense>
        </ProjectDrawerBoundary>
      ) : null}
    </>
  );
}
