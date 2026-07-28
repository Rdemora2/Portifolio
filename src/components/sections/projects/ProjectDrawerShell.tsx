"use client";

import { Component, lazy, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ProjectDrawerModule = typeof import("@/components/shared/ProjectDrawer");

let projectDrawerModulePromise: Promise<ProjectDrawerModule> | null = null;
export const drawerRetryStorageKey = "portfolio:project-drawer-retry";

export function requestProjectDrawerModule() {
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

export function resetProjectDrawerModulePromise() {
  projectDrawerModulePromise = null;
}

export function createLazyProjectDrawer() {
  return lazy(() =>
    requestProjectDrawerModule().then((module) => ({
      default: module.ProjectDrawer,
    })),
  );
}

export function preloadProjectDrawer() {
  void requestProjectDrawerModule().catch(() => undefined);
}

type ProjectDrawerBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export class ProjectDrawerBoundary extends Component<
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

export function ProjectDrawerShell({
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
