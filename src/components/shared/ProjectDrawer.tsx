"use client";

/**
 * ProjectDrawer — Glass overlay that "reveals depth" for a project.
 *
 * Desktop behavior:
 *   - Fixed overlay panel (right 40% of viewport, full height)
 *   - Slides in from right with glass-panel class
 *   - Background list remains visible (blurred)
 *   - Escape key and backdrop click close it
 *
 * Mobile behavior (pointer:coarse OR width < 768px):
 *   - Bottom sheet that rises from below (max 85dvh)
 *   - Drag handle at top for thumb-reachability cue
 *   - Does NOT use glass-panel backdrop-filter (stripped by CSS @media pointer:coarse)
 *   - Background scrolls to top and is locked (scroll-lock on open)
 *
 * Accessibility:
 *   - role="dialog", aria-modal="true", aria-label from project title
 *   - Focus trapped inside while open (first focusable element auto-focused)
 *   - Escape closes
 *   - Body scroll locked while open via overflow:hidden on <html>
 *
 * Performance:
 *   - GSAP lazy-imported
 *   - will-change:transform applied only during animation, removed after
 *   - CountUp triggers only when drawer is open (trigger=isOpen)
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { CountUp } from "@/components/shared/CountUp";
import type { Project } from "@/types";
import { LiquidPortal } from "@/components/three/LiquidPortal";

interface ProjectDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDrawer({ project, isOpen, onClose }: ProjectDrawerProps) {
  const t = useTranslations("Projects");
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isAnimatingRef = useRef(false);

  // ── Determine if we're on mobile (bottom-sheet mode) ──────────────────────
  // Note: this runs client-side only. SSR always returns false (no drawer shown).
  const isMobile = typeof window !== "undefined"
    ? window.matchMedia("(pointer: coarse), (max-width: 767px)").matches
    : false;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // ── Scroll lock & Global State ─────────────────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      html.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
    }
    
    // Dispatch global event so WebGL canvases can unmount to save context budget
    window.dispatchEvent(new CustomEvent("drawerStateChange", { detail: { isOpen } }));
    
    return () => { 
      html.style.overflow = ""; 
      window.dispatchEvent(new CustomEvent("drawerStateChange", { detail: { isOpen: false } }));
    };
  }, [isOpen]);

  // ── GSAP entrance / exit ──────────────────────────────────────────────────
  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;

      if (isOpen) {
        isAnimatingRef.current = true;
        drawer.style.willChange = "transform";
        backdrop.style.display = "block";

        if (isMobile) {
          gsap.fromTo(
            drawer,
            { opacity: 0, scale: 0.95, y: "10%" },
            {
              opacity: 1,
              scale: 1,
              y: "0%",
              duration: 0.5,
              ease: "power3.out",
              onComplete: () => {
                isAnimatingRef.current = false;
                closeButtonRef.current?.focus();
              },
            }
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
                isAnimatingRef.current = false;
                closeButtonRef.current?.focus();
              },
            }
          );
        }

        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 }
        );
      } else {
        isAnimatingRef.current = true;
        
        const exitProps = isMobile 
          ? { opacity: 0, scale: 0.95, y: "10%" }
          : { opacity: 0, scale: 0.95, xPercent: -50, yPercent: -50, y: 20 };

        gsap.to(drawer, {
          ...exitProps,
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => {
            isAnimatingRef.current = false;
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

    run();
    return () => { isActive = false; };
  }, [isOpen, isMobile]);

  // ── Escape key ─────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!project || !mounted) return null;

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
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(`items.${project.id}.title`)}
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
          <LiquidPortal />
          {/* Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        {/* Scrollable Content Layer */}
        <div 
          className="relative z-10 h-full w-full overflow-y-auto overscroll-contain"
          data-lenis-prevent="true"
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
              className="text-xl font-bold leading-tight sm:text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              {t(`items.${project.id}.title`)}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 hover:border-[var(--color-signal)]"
            style={{
              borderColor: "var(--glass-border)",
              color: "var(--color-text-secondary)",
            }}
            aria-label={t("closeDrawer") || "Fechar"}
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
                  key={metric.label}
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
                    {t(`items.${project.id}.metrics.${metric.label.replace(/\s+/g, "").toLowerCase()}`, {
                      defaultValue: metric.label,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Case Study */}
          {project.caseStudy && (
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
          {project.caseStudy?.keyDecisions && (
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                {t("keyDecisions")}
              </h3>
              <ul className="space-y-2">
                {project.caseStudy.keyDecisions.map((_, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                  >
                    <span style={{ color: "var(--color-highlight)" }}>◆</span>
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
              {project.highlights.map((h, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                >
                  <span style={{ color: "var(--color-matrix)" }}>▸</span>
                  {t(`items.${project.id}.highlights.${idx}`, { defaultValue: h })}
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Learned */}
          {project.caseStudy?.lessonsLearned && (
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
              >
                {t("lessonsLearned")}
              </h3>
              <ul className="space-y-2">
                {project.caseStudy.lessonsLearned.map((_, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm italic"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>→</span>
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
