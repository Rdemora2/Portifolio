"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeSection = useActiveSection();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 80);
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
        className="fixed top-0 left-0 w-full z-[100] transition-all duration-300"
        style={{
          backgroundColor: isScrolled ? "rgba(2,4,8,0.85)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled
            ? "1px solid var(--color-edge)"
            : "1px solid transparent",
        }}
        role="navigation"
        aria-label="Navegação principal"
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
            aria-label="Roberto Zarzur, ir ao início"
          >
            RZ<span style={{ color: "var(--color-signal)" }}>.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.slice(1).map(({ id, label }) => (
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
                {label}
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
          </div>

          <button
            className="relative z-[110] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
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
      </nav>

      <div
        ref={mobileMenuRef}
        className="fixed top-0 left-0 z-[90] flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden md:hidden"
        style={{
          backgroundColor: "var(--color-void)",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {navLinks.slice(1).map(({ id, label }, i) => (
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
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
