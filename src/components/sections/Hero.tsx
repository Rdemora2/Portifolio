import { useTranslations } from "next-intl";
import { personalInfo } from "@/data/portfolio";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { HeroClientWrapper, HeroCompanionInjector } from "./HeroClient";

export function Hero({ isLoaded = true }: { isLoaded?: boolean }) {
  const t = useTranslations("Hero");

  return (
    <HeroClientWrapper isLoaded={isLoaded}>
      {/* Main content layout — text left, 3D companion right on desktop */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 lg:gap-16">
          {/* Glass content card — text + CTAs */}
          <div
            className="glass-card max-w-2xl rounded-2xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
            style={{ borderRadius: "1.5rem" }}
          >
            <h1
              className="hero-name mb-4 font-extrabold leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-hero)",
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              {personalInfo.name}
            </h1>

            <p
              className="hero-title mb-4 font-semibold uppercase"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-signal)",
                clipPath: "inset(0 100% 0 0)",
                fontSize: "clamp(0.875rem, 1vw + 0.5rem, var(--text-lg))",
                letterSpacing: "0.15em",
              }}
            >
              {t("title")}
            </p>

            <p
              className="hero-subtitle mb-8 tracking-widest opacity-0 sm:mb-10"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
                fontSize: "clamp(0.75rem, 0.5vw + 0.625rem, 1rem)",
              }}
            >
              <span className="typewriter">{t("subtitle")}</span>
              <span
                className="ml-0.5 inline-block h-5 w-[2px] animate-blink align-text-bottom"
                style={{ backgroundColor: "var(--color-signal)" }}
              />
            </p>

            <div className="hero-cta flex flex-wrap gap-3 opacity-0 sm:gap-4">
              <MagneticButton
                href="#projects"
                className="rounded-full border border-[var(--color-signal)] text-[var(--color-signal)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)] sm:px-8 sm:py-3 sm:text-sm"
                style={{ fontFamily: "var(--font-body)" }}
                ariaLabel={t("viewProjects")}
              >
                {t("viewProjects")}
              </MagneticButton>
              <MagneticButton
                href="#contact"
                className="rounded-full border border-[var(--color-edge)] text-[var(--color-text-secondary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:border-[var(--color-text-secondary)] sm:px-8 sm:py-3 sm:text-sm"
                style={{ fontFamily: "var(--font-body)" }}
                ariaLabel={t("contact")}
              >
                {t("contact")}
              </MagneticButton>
            </div>
          </div>

          <HeroCompanionInjector />
        </div>
      </div>
    </HeroClientWrapper>
  );
}
