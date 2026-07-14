"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { navLinks } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { isLocale } from "@/i18n.config";
import { Link } from "@/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import styles from "./Navigation.module.css";

type MobileNavItemStyle = CSSProperties & {
  "--nav-item-delay": string;
};

export function Navigation() {
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const pathWithoutLocale = isLocale(pathSegments[0] ?? "")
    ? `/${pathSegments.slice(1).join("/")}`
    : (pathname ?? "");

  if (pathWithoutLocale.startsWith("/insights")) {
    return <ArticleNavigation />;
  }

  return <HomeNavigation />;
}

function ArticleNavigation() {
  const t = useTranslations("Nav");

  return (
    <nav
      data-article-navigation
      className="fixed inset-x-0 top-0 z-[100] border-b border-white/[0.06] bg-[rgba(5,10,18,0.78)] backdrop-blur-xl"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className={`${styles.brand} inline-flex min-h-11 min-w-11 items-center text-lg font-bold tracking-tight text-[var(--color-text-primary)]`}
          style={{ fontFamily: "var(--font-display)" }}
          aria-label={`RM. — Roberto Moraes, ${t("hero").toLowerCase()}`}
        >
          RM<span className="text-[var(--color-signal)]">.</span>
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  );
}

function HomeNavigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeSection = useActiveSection();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogCloseButtonRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const mobileLocaleRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const t = useTranslations("Nav");

  // Interpolate glass blur across first 120px of scroll (no snap)
  useEffect(() => {
    let animationFrame = 0;

    const handler = () => {
      if (animationFrame) return;

      animationFrame = requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / 120, 1);
        const nav = navRef.current;
        if (nav) {
          nav.style.setProperty("--nav-progress", String(progress));
          nav.style.setProperty(
            "--nav-border-opacity",
            String(progress * 0.07),
          );
          nav.style.setProperty(
            "--nav-background-opacity",
            String(progress * 0.72),
          );
        }
        animationFrame = 0;
      });
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;

    const menu = mobileMenuRef.current;
    const menuButton = menuButtonRef.current;
    const dialogCloseButton = dialogCloseButtonRef.current;
    if (!menu || !menuButton || !dialogCloseButton) return;

    // The menu button is the deterministic trigger even when a browser click
    // does not move DOM focus before React handles the event.
    lastFocusedRef.current = menuButton;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const backgroundElements = Array.from(
      new Set(
        [
          brandRef.current,
          mobileLocaleRef.current,
          document.querySelector<HTMLElement>("main"),
          document.querySelector<HTMLElement>("footer"),
          document.querySelector<HTMLElement>('a[href="#main-content"]'),
        ].filter((element): element is HTMLElement => element !== null),
      ),
    );
    const previousInert = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
    }));
    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    let focusMenuSecondFrame = 0;
    const focusMenu = requestAnimationFrame(() => {
      focusMenuSecondFrame = requestAnimationFrame(() => {
        linksRef.current[0]?.focus({ preventScroll: true });
      });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = [
        dialogCloseButton,
        ...linksRef.current,
      ].filter((element) => element.getClientRects().length > 0);
      if (focusableElements.length === 0) return;

      event.preventDefault();
      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLButtonElement | HTMLAnchorElement,
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
      cancelAnimationFrame(focusMenu);
      cancelAnimationFrame(focusMenuSecondFrame);
      document.removeEventListener("keydown", handleKeyDown);
      html.style.overflow = previousOverflow;
      previousInert.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      const focusTarget = lastFocusedRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (focusTarget?.isConnected) {
            focusTarget.focus({ preventScroll: true });
          }
        });
      });
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileOpen(false);
    };

    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    const rawId = window.location.hash.slice(1);
    let id = rawId;
    try {
      id = decodeURIComponent(rawId);
    } catch {
      // A malformed external fragment must not break navigation hydration.
    }
    if (!id || !navLinks.some((link) => link.id === id)) return;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  const handleNavClick = (id: string) => {
    setIsMobileOpen(false);
    const el = document.getElementById(id);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(window.history.state, "", `#${id}`);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-[100] transition-all duration-500 glass-nav"
        style={{
          borderBottomColor:
            "rgb(255 255 255 / var(--nav-border-opacity, 0))",
          // Allow glass-nav to handle backdrop-filter; supplement with bg opacity.
          backgroundColor:
            "rgb(5 10 18 / var(--nav-background-opacity, 0))",
        }}
        aria-label={t("ariaLabel")}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            ref={brandRef}
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("hero");
            }}
            className={`${styles.brand} inline-flex min-h-11 min-w-11 items-center text-lg font-bold tracking-tight`}
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
            aria-label={`RM. — Roberto Moraes, ${t("hero").toLowerCase()}`}
            aria-current={activeSection === "hero" ? "location" : undefined}
          >
            RM<span style={{ color: "var(--color-signal)" }}>.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.slice(1).map(({ id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(id);
                }}
                className={`${styles.desktopLink} flex min-h-11 items-center text-sm font-medium`}
                aria-current={activeSection === id ? "location" : undefined}
                style={{
                  fontFamily: "var(--font-body)",
                }}
              >
                {t(id)}
              </a>
            ))}
            <div className="ml-4 h-4 w-[1px] bg-[var(--color-edge)]" aria-hidden="true" />
            <LocaleSwitcher />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <div ref={mobileLocaleRef}>
              <LocaleSwitcher />
            </div>
            <button
              ref={menuButtonRef}
              className={`${styles.menuButton} relative z-[110] flex h-11 w-11 flex-col items-center justify-center gap-1.5 ${
                isMobileOpen ? "invisible" : ""
              }`}
              onClick={() => setIsMobileOpen((current) => !current)}
              aria-label={isMobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation-menu"
              aria-hidden={isMobileOpen}
              tabIndex={isMobileOpen ? -1 : undefined}
            >
              <span
                className="block h-[1.5px] w-6 transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-text-primary)",
                  transform: isMobileOpen
                    ? "rotate(45deg) translateY(4px)"
                    : "none",
                }}
              />
              <span
                className="block h-[1.5px] w-6 transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-text-primary)",
                  opacity: isMobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-[1.5px] w-6 transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-text-primary)",
                  transform: isMobileOpen
                    ? "rotate(-45deg) translateY(-4px)"
                    : "none",
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-navigation-menu"
        ref={mobileMenuRef}
        data-open={isMobileOpen ? "true" : "false"}
        className={`${styles.mobileMenu} fixed left-0 top-0 z-[120] flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden ${
          isMobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          backgroundColor: "var(--color-void)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t("mobileMenuLabel")}
        aria-hidden={!isMobileOpen}
      >
        <button
          ref={dialogCloseButtonRef}
          type="button"
          className={`${styles.menuCloseButton} absolute right-4 top-4 z-[130] flex h-11 w-11 flex-col items-center justify-center gap-1.5`}
          onClick={() => setIsMobileOpen(false)}
          aria-label={t("closeMenu")}
        >
          <span
            className="block h-[1.5px] w-6 rotate-45 translate-y-1"
            style={{ backgroundColor: "var(--color-text-primary)" }}
          />
          <span
            className="block h-[1.5px] w-6 -rotate-45 -translate-y-1"
            style={{ backgroundColor: "var(--color-text-primary)" }}
          />
        </button>

        {navLinks.slice(1).map(({ id }, i) => (
          <a
            key={id}
            ref={(el) => {
              if (el) linksRef.current[i] = el;
            }}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(id);
            }}
            className={`${styles.mobileLink} inline-flex min-h-11 items-center text-2xl font-bold sm:text-3xl`}
            aria-current={activeSection === id ? "location" : undefined}
            style={
              {
                fontFamily: "var(--font-display)",
                "--nav-item-delay": isMobileOpen ? `${i * 45}ms` : "0ms",
              } as MobileNavItemStyle
            }
          >
            {t(id)}
          </a>
        ))}
      </div>
    </>
  );
}
