"use client";

import { useRef, useEffect } from "react";
import { experience } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import BorderGlow from "@/components/shared/BorderGlow";
import { useTranslations } from "next-intl";

export function Experience() {
  const lineRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations("Experience");

  useEffect(() => {
    if (!lineRef.current || !sectionRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    let ctx: { revert: () => void } | null = null;
    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
            },
          },
        );
      }, sectionRef);
    };

    run();

    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {t("title_small") || "Onde trabalhei"}
          </p>
          <h2
            className="mb-12 font-bold sm:mb-20"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="relative">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 hidden h-full w-[2px] origin-top md:left-1/2 md:block md:-translate-x-1/2"
            style={{
              backgroundColor: "var(--color-edge)",
              transformOrigin: "top center",
            }}
          />

          <div className="space-y-12 sm:space-y-16 md:space-y-24">
            {experience.map((entry, idx) => (
              <ScrollReveal
                key={entry.id}
                animation={idx % 2 === 0 ? "slide-left" : "slide-right"}
                delay={0.1}
              >
                <div
                  className={`relative flex flex-col md:flex-row md:items-center ${
                    idx % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex flex-1 justify-center md:justify-start">
                    <div
                      className={`relative w-full max-w-lg rounded-2xl border p-6 transition-all duration-300 hover:border-[var(--color-signal)] sm:p-8 ${
                        idx % 2 === 0 ? "md:mr-12" : "md:ml-12"
                      }`}
                      style={{
                        borderColor: "var(--color-edge)",
                        backgroundColor: "rgba(10,16,24,0.4)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className="text-xl font-bold"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {t(`items.${entry.id}.role`)}
                        </h3>
                        <span
                          className="text-xs font-medium"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-signal)",
                          }}
                        >
                          {entry.period.replace("Presente", t("present"))}
                        </span>
                      </div>

                      <p
                        className="mb-4 text-sm font-semibold uppercase tracking-wider"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {t(`items.${entry.id}.company`)}
                      </p>

                      <p
                        className="mb-6 text-sm leading-relaxed"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {t(`items.${entry.id}.description`)}
                      </p>

                      <div className="mb-6 space-y-2">
                        {(t.raw(`items.${entry.id}.highlights`) as string[]).map(
                          (highlight: string, hIdx: number) => (
                            <div
                              key={hIdx}
                              className="flex items-start gap-2 text-xs"
                              style={{
                                fontFamily: "var(--font-body)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              <span
                                className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                                style={{ backgroundColor: "var(--color-signal)" }}
                              />
                              {highlight}
                            </div>
                          ),
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border px-2 py-0.5 text-[10px]"
                            style={{
                              borderColor: "var(--color-edge)",
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex h-12 w-12 items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div
                      className="absolute h-full w-full rounded-full border border-[var(--color-signal)] opacity-20"
                      style={{
                        backgroundColor: "var(--color-void)",
                        boxShadow: "0 0 20px var(--color-signal)",
                      }}
                    />
                    <div
                      className="h-3 w-3 rounded-full bg-[var(--color-signal)]"
                      style={{
                        boxShadow: "0 0 10px var(--color-signal)",
                      }}
                    />
                  </div>

                  <div className="hidden flex-1 md:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-signal)] opacity-[0.03] blur-[120px]" />
    </section>
  );
}
