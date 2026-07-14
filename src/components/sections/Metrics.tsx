"use client";

import { metrics } from "@/data/portfolio";
import BorderGlow from "@/components/shared/BorderGlow";
import { CountUp } from "@/components/shared/CountUp";
import { useInView } from "@/hooks/useInView";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { useTranslations } from "next-intl";

export function Metrics() {
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.3 });
  const t = useTranslations("Projects.items.hospital-sirio-libanes");
  const ts = useTranslations("Stats");

  return (
    <section
      id="metrics"
      ref={sectionRef}
      className="relative overflow-hidden py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <DataflowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-center text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {ts("title_small")}
          </p>
          <h2
            className="mb-4 text-center font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {t("title")}
          </h2>
          <p
            className="mx-auto mb-12 max-w-xl text-center text-sm sm:mb-16 md:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-secondary)",
            }}
          >
            {t("shortDescription")}
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {metrics.map((metric, idx) => {
            return (
              <ScrollReveal
                key={metric.id}
                animation="stat"
                delay={idx * 0.15}
                className="h-full"
              >
                <BorderGlow
                  className="h-full w-full"
                  edgeSensitivity={30}
                  glowColor="40 80 80"
                  backgroundColor="#0a1018"
                  borderRadius={16}
                  glowRadius={40}
                  glowIntensity={1}
                  coneSpread={25}
                  colors={["#c084fc", "#f472b6", "#38bdf8"]}
                >
                  <div className="h-full rounded-2xl p-5 text-center sm:p-6 md:p-8">
                    <div
                      className="font-extrabold leading-none"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-signal)",
                        fontSize: "var(--text-5xl)",
                      }}
                    >
                      <CountUp
                        end={metric.value}
                        suffix={metric.suffix}
                        trigger={isInView}
                        duration={2.5}
                      />
                    </div>
                    <p
                      className="mt-4 text-[0.625rem] uppercase tracking-widest sm:text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {ts(`metrics.${metric.id}.label`)}
                    </p>
                    <p
                      className="mt-2 text-sm"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ts(`metrics.${metric.id}.description`)}
                    </p>
                  </div>
                </BorderGlow>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DataflowBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-35"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent 0 42px, rgba(99,102,241,0.07) 43px), linear-gradient(90deg, transparent, rgba(99,102,241,0.07), transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
      }}
      aria-hidden="true"
    />
  );
}
