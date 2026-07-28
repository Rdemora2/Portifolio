"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ProjectViewModel } from "@/types";

import { ProjectFilters } from "./projects/ProjectFilters";
import { ProjectItem } from "./projects/ProjectItem";
import {
  ProjectDrawerBoundary,
  ProjectDrawerShell,
  createLazyProjectDrawer,
  drawerRetryStorageKey,
  preloadProjectDrawer,
  resetProjectDrawerModulePromise,
} from "./projects/ProjectDrawerShell";
import { matchesFilter, type FilterType } from "./projects/types";

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
      gsapPromiseRef.current = import("@/lib/gsap")
        .then((mod) => {
          gsapRef.current = mod;
          return mod;
        })
        .catch((error: unknown) => {
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

  const openDrawer = useCallback((project: ProjectViewModel) => {
    setDrawerProject(project);
    setIsDrawerOpen(true);
  }, []);

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
    resetProjectDrawerModulePromise();
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
      <ProjectFilters
        activeFilter={activeFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        label={t("filters.label")}
      />

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
            isExpanded={isDrawerOpen && drawerProject?.id === project.id}
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
