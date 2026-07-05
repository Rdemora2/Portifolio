"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { navLinks } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Navigation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeSection = useActiveSection();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const pathname = usePathname();
  const t = useTranslations("Nav");

  // Interpolate glass blur across first 120px of scroll (no snap)
  useEffect(() => {
    const handler = () => {
      const progress = Math.min(window.scrollY / 120, 1);
      setScrollProgress(progress);
      if (navRef.current) {
        navRef.current.style.setProperty("--nav-progress", String(progress));
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      if (!mobileMenuRef.current) return;
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;
      if (isMobileOpen) {
        gsap.to(mobileMenuRef.current, {
          opacity: 1,
          visibility: "visible",
          duration: 0.3,
        });
        linksRef.current.forEach((link, i) => {
          if (link) {
            gsap.fromTo(
              link,
              { x: 40, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.4, delay: i * 0.06 },
            );
          }
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            if (mobileMenuRef.current)
              mobileMenuRef.current.style.visibility = "hidden";
          },
        });
      }
    };

    run();
    return () => {
      isActive = false;
    };
  }, [isMobileOpen]);

  const handleNavClick = (id: string) => {
    setIsMobileOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  if (pathname?.startsWith("/insights")) return null;

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-[100] transition-all duration-500 glass-nav"
        style={{
          // Progressive border opacity driven by --nav-progress CSS variable
          borderBottomColor: `rgba(255, 255, 255, ${scrollProgress * 0.07})`,
          // Allow glass-nav to handle backdrop-filter; supplement with bg opacity
          backgroundColor: `rgba(5, 10, 18, ${scrollProgress * 0.72})`,
        }}
        aria-label={t("ariaLabel")}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("hero");
            }}
            className="text-lg font-bold tracking-tight transition-colors duration-200"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
            aria-label={`Roberto Zarzur, ${t("hero").toLowerCase()}`}
          >
            RZ<span style={{ color: "var(--color-signal)" }}>.</span>
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
                className="relative text-sm font-medium transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  color:
                    activeSection === id
                      ? "var(--color-signal)"
                      : "var(--color-text-secondary)",
                }}
              >
                {t(id)}
                <span
                  className="absolute -bottom-1 left-0 h-[1px] origin-left transition-transform duration-300"
                  style={{
                    backgroundColor: "var(--color-signal)",
                    width: "100%",
                    transform: activeSection === id ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </a>
            ))}
            <div className="ml-4 h-4 w-[1px] bg-[var(--color-edge)]" aria-hidden="true" />
            <LocaleSwitcher />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <LocaleSwitcher />
            <button
              className="relative z-[110] flex h-10 w-10 flex-col items-center justify-center gap-1.5"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMobileOpen}
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
        ref={mobileMenuRef}
        className="fixed top-0 left-0 z-[90] flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden md:hidden"
        style={{
          backgroundColor: "var(--color-void)",
          opacity: 0,
          visibility: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t("mobileMenuLabel")}
      >
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
            className="text-2xl font-bold transition-colors duration-200 sm:text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              color:
                activeSection === id
                  ? "var(--color-signal)"
                  : "var(--color-text-primary)",
            }}
          >
            {t(id)}
          </a>
        ))}
      </div>
    </>
  );
}
