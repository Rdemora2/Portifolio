"use client";

/**
 * ProjectDrawer — Accessible project detail modal with a responsive surface.
 *
 * Desktop behavior:
 *   - Centered modal (90% width, max 800px; 85dvh)
 *   - Enters with a subtle scale/vertical transition
 *   - Background list remains visible (blurred)
 *   - Escape key and backdrop click close it
 *
 * Mobile behavior (pointer:coarse OR width < 768px):
 *   - Full-width bottom sheet that rises from below (90dvh)
 *   - Drag handle at top for thumb-reachability cue
 *   - Does NOT use glass-panel backdrop-filter (stripped by CSS @media pointer:coarse)
 *   - Background is made inert and scroll-locked while open
 *
 * Accessibility:
 *   - role="dialog", aria-modal="true", aria-labelledby from project title
 *   - Focus trapped inside while open (first focusable element auto-focused)
 *   - Escape closes
 *   - Body scroll locked while open via overflow:hidden on <html>
 *
 * Performance:
 *   - GSAP lazy-imported
 *   - will-change:transform applied only during animation, removed after
 *   - CountUp triggers only when drawer is open (trigger=isOpen)
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CountUp } from "@/components/shared/CountUp";
import type { ProjectViewModel } from "@/types";

const LiquidPortal = dynamic(
  () =>
    import("@/components/shared/LiquidPortal").then((module) => ({
      default: module.LiquidPortal,
    })),
  { ssr: false },
);

interface ProjectDrawerProps {
  project: ProjectViewModel | null;
  isOpen: boolean;
  onClose: () => void;
}

const mobileDrawerQuery = "(pointer: coarse), (max-width: 767px)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMobileDrawer(onChange: () => void) {
  const query = window.matchMedia(mobileDrawerQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getMobileDrawerSnapshot() {
  return window.matchMedia(mobileDrawerQuery).matches;
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function ProjectDrawer({ project, isOpen, onClose }: ProjectDrawerProps) {
  const t = useTranslations("Projects");
  const projectTitle = project ? t(`items.${project.id}.title`) : null;
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [portalReady, setPortalReady] = useState(false);

  const handleDrawerRef = useCallback((node: HTMLDivElement | null) => {
    drawerRef.current = node;
    setPortalReady(node !== null);
  }, []);

  const isMobile = useSyncExternalStore(
    subscribeToMobileDrawer,
    getMobileDrawerSnapshot,
    () => false,
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const canRenderPortal =
    typeof window !== "undefined" &&
    !isMobile &&
    !prefersReducedMotion &&
    !(navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Capture the opener independently from portal readiness. Callback refs can
  // cause an extra render when the portal mounts, but that must never replace
  // the original trigger with the drawer's close button.
  useEffect(() => {
    if (!isOpen) return;

    const activeElement =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
    const matchingTrigger = project?.id
      ? Array.from(
          document.querySelectorAll<HTMLElement>("[data-project-trigger]"),
        ).find((element) =>
          element.getAttribute("data-project-trigger") === project.id,
        )
      : null;

    previousFocusRef.current = activeElement ?? matchingTrigger ?? null;

    return () => {
      const focusTarget = previousFocusRef.current;
      previousFocusRef.current = null;
      requestAnimationFrame(() => {
        if (focusTarget?.isConnected) {
          focusTarget.focus({ preventScroll: true });
        }
      });
    };
  }, [isOpen, project?.id, projectTitle]);

  // ── GSAP entrance / exit ──────────────────────────────────────────────────
  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    const applyWithoutMotion = () => {
      drawer.style.opacity = isOpen ? "1" : "0";
      drawer.style.transform = isMobile
        ? "none"
        : "translate(-50%, -50%)";
      drawer.style.willChange = "";
      backdrop.style.opacity = isOpen ? "1" : "0";
      backdrop.style.display = isOpen ? "block" : "none";
    };

    if (prefersReducedMotion) {
      applyWithoutMotion();
      return;
    }

    let isActive = true;
    let gsapInstance: typeof import("gsap").gsap | null = null;
    let fallbackApplied = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!isActive || gsapInstance) return;
      fallbackApplied = true;
      applyWithoutMotion();
    }, 180);

    const run = async () => {
      let mod: typeof import("@/lib/gsap");
      try {
        mod = await import("@/lib/gsap");
      } catch {
        window.clearTimeout(fallbackTimer);
        if (isActive) applyWithoutMotion();
        return;
      }
      window.clearTimeout(fallbackTimer);
      if (!isActive || fallbackApplied) return;
      const { gsap } = mod;
      gsapInstance = gsap;
      gsap.killTweensOf([drawer, backdrop]);

      if (isOpen) {
        drawer.style.willChange = "transform";
        backdrop.style.display = "block";

        if (isMobile) {
          gsap.fromTo(
            drawer,
            {
              opacity: 0,
              scale: 0.95,
              xPercent: 0,
              yPercent: 0,
              y: "10%",
            },
            {
              opacity: 1,
              scale: 1,
              xPercent: 0,
              yPercent: 0,
              y: "0%",
              duration: 0.5,
              ease: "power3.out",
              onComplete: () => {
                drawer.style.willChange = "";
              },
            },
          );
        } else {
          gsap.fromTo(
            drawer,
            { opacity: 0, scale: 0.95, xPercent: -50, yPercent: -50, y: 20 },
            {
              opacity: 1,
              scale: 1,
              xPercent: -50,
              yPercent: -50,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              onComplete: () => {
                drawer.style.willChange = "";
              },
            },
          );
        }

        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
        );
      } else {
        drawer.style.willChange = "transform";

        const exitProps = isMobile
          ? {
              opacity: 0,
              scale: 0.95,
              xPercent: 0,
              yPercent: 0,
              y: "10%",
            }
          : {
              opacity: 0,
              scale: 0.95,
              xPercent: -50,
              yPercent: -50,
              y: 20,
            };

        gsap.to(drawer, {
          ...exitProps,
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => {
            drawer.style.willChange = "";
          },
        });

        gsap.to(backdrop, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            backdrop.style.display = "none";
          },
        });
      }
    };

    void run();
    return () => {
      isActive = false;
      window.clearTimeout(fallbackTimer);
      gsapInstance?.killTweensOf([drawer, backdrop]);
    };
  }, [isOpen, isMobile, portalReady, prefersReducedMotion]);

  // ── Modal focus, inert background, Escape and scroll lock ─────────────────
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const modalRoots = [drawer, backdrop];
    const backgroundElements = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !modalRoots.some(
          (modalRoot) =>
            element === modalRoot || element.contains(modalRoot),
        ),
    );
    const previousInert = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
    }));
    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    const focusDrawer = requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          !element.hidden &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      );

      event.preventDefault();

      if (focusableElements.length === 0) {
        drawer.focus({ preventScroll: true });
        return;
      }

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      );
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusableElements.length - 1
          : currentIndex - 1
        : currentIndex < 0 || currentIndex === focusableElements.length - 1
          ? 0
          : currentIndex + 1;

      focusableElements[nextIndex]?.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusDrawer);
      document.removeEventListener("keydown", handleKeyDown);
      html.style.overflow = previousOverflow;
      previousInert.forEach(({ element, inert }) => {
        element.inert = inert;
      });
    };
  }, [isOpen, portalReady, project?.id]);

  if (!project) return null;

  const drawerContent = (
    <>
      {/* Backdrop — blurs the list behind the panel */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[9998]"
        style={{
          display: "none",
          backgroundColor: "rgba(5, 10, 18, 0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={handleDrawerRef}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
        aria-labelledby={
          isOpen ? `project-drawer-title-${project.id}` : undefined
        }
        aria-hidden={!isOpen}
        inert={!isOpen}
        tabIndex={-1}
        className={`
          fixed z-[9999] glass-panel overflow-hidden shadow-2xl
          ${isMobile
            ? "bottom-0 left-0 right-0 rounded-t-[1.5rem]"
            : "top-1/2 left-1/2 rounded-[1.5rem]"
          }
        `}
        style={{
          width: isMobile ? "100%" : "90%",
          maxWidth: isMobile ? "100%" : "800px",
          height: isMobile ? "90dvh" : "85dvh",
          opacity: 0,
        }}
      >
        {/* Fixed Background Layer (won't scroll) */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: "var(--color-void)" }}>
          {canRenderPortal && isOpen ? <LiquidPortal /> : null}
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        {/* Scrollable Content Layer */}
        <div 
          className="relative z-10 h-full w-full overflow-y-auto overscroll-contain"
        >
          {/* Drag handle (mobile only) */}
          {isMobile && (
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: "var(--glass-border-focused)" }}
              />
            </div>
          )}

          {/* Header */}
          <div
            className="sticky top-0 z-20 flex items-start justify-between gap-4 px-6 py-4 sm:px-8 sm:py-6"
            style={{
              borderBottom: "1px solid var(--glass-border)",
              backgroundColor: "rgba(5, 10, 18, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
          <div className="min-w-0 flex-1">
            <p
              className="mb-1 text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {project.client}
            </p>
            <h2
              id={`project-drawer-title-${project.id}`}
              className="text-xl font-bold leading-tight sm:text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              {t(`items.${project.id}.title`)}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200 hover:border-[var(--color-signal)]"
            style={{
              borderColor: "var(--glass-border)",
              color: "var(--color-text-secondary)",
            }}
            aria-label={t("closeDrawer")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">

          {/* Metrics */}
          {project.metrics.length > 0 && (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
              {project.metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-xl border p-4 text-center"
                  style={{
                    borderColor: "var(--glass-border)",
                    backgroundColor: "rgba(99, 102, 241, 0.04)",
                  }}
                >
                  <div
                    className="text-2xl font-extrabold leading-none sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-signal)" }}
                  >
                    <CountUp
                      end={metric.value}
                      suffix={metric.suffix}
                      trigger={isOpen}
                      duration={2}
                    />
                  </div>
                  <p
                    className="mt-2 text-[0.625rem] uppercase tracking-wider sm:text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                  >
                    {t(`items.${project.id}.metrics.${metric.id}`)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Case Study */}
          {project.hasCaseStudy && (
            <div
              className="rounded-xl border p-4 sm:p-6"
              style={{
                borderColor: "rgba(99,102,241,0.2)",
                backgroundColor: "rgba(99,102,241,0.03)",
              }}
            >
              <h3
                className="mb-3 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-widest sm:text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-signal)" }} />
                {t("caseStudyLabel")}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                {t(`items.${project.id}.caseStudy.robertoRole`)}
              </p>
            </div>
          )}

          {/* Challenge & Solution */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                {t("challenge")}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                {t(`items.${project.id}.challenge`)}
              </p>
            </div>
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                {t("solution")}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
              >
                {t(`items.${project.id}.solution`)}
              </p>
            </div>
          </div>

          {/* Key Decisions */}
          {project.keyDecisionCount > 0 && (
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                {t("keyDecisions")}
              </h3>
              <ul className="space-y-2">
                {Array.from({ length: project.keyDecisionCount }, (_, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--color-highlight)" }}>◆</span>
                    {t(`items.${project.id}.caseStudy.keyDecisions.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlights */}
          <div>
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
            >
              {t("highlights")}
            </h3>
            <ul className="space-y-2">
              {Array.from({ length: project.highlightCount }, (_, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                >
                  <span aria-hidden="true" style={{ color: "var(--color-matrix)" }}>▸</span>
                  {t(`items.${project.id}.highlights.${idx}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Learned */}
          {project.lessonsLearnedCount > 0 && (
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
              >
                {t("lessonsLearned")}
              </h3>
              <ul className="space-y-2">
                {Array.from({ length: project.lessonsLearnedCount }, (_, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm italic"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>→</span>
                    {t(`items.${project.id}.caseStudy.lessonsLearned.${idx}`)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stack */}
          <div>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: "var(--glass-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom padding for mobile scroll comfort */}
          <div className="h-8" aria-hidden="true" />
        </div>
        {/* End of Scrollable Content Layer */}
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
