import { techStack } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { TECH_CATEGORY_COLORS } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

import LogoLoop from "@/components/shared/LogoLoop";
import { FaAws } from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiGo,
  SiKotlin,
  SiGooglecloud,
  SiDocker,
  SiPostgresql,
  SiVuedotjs,
} from "react-icons/si";

const techLogos = [
  { node: <SiReact size={36} color="#61DAFB" /> },
  { node: <SiNextdotjs size={36} color="var(--color-text-primary)" /> },
  { node: <SiVuedotjs size={36} color="#4FC08D" /> },
  { node: <SiGo size={36} color="#00ADD8" /> },
  { node: <SiKotlin size={36} color="#7F52FF" /> },
  { node: <SiGooglecloud size={36} color="#4285F4" /> },
  { node: <SiDocker size={36} color="#2496ED" /> },
  { node: <FaAws size={36} color="#FF9900" /> },
  { node: <SiPostgresql size={36} color="#4169E1" /> },
];

export async function TechStack() {
  const [t, tn, page] = await Promise.all([
    getTranslations("About.pillars"),
    getTranslations("Nav"),
    getTranslations("PortfolioPages.about"),
  ])

  const grouped = techStack.reduce<Record<string, typeof techStack>>(
    (acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category]?.push(tech);
      return acc;
    },
    {},
  );

  return (
    <section
      id="tech"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="title">
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {tn("tech_small")}
          </p>
          <h2
            className="mb-8 font-bold sm:mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {tn("tech")}
          </h2>
        </ScrollReveal>

        {/* Endless Logo Loop */}
        <div className="mb-12 sm:mb-20">
          <LogoLoop
            logos={techLogos}
            pauseLabel={page("motionPause")}
            resumeLabel={page("motionResume")}
            speed={60}
            direction="left"
            logoHeight={48}
            gap={40}
            fadeOut={true}
            fadeOutColor="var(--color-deep)"
            scaleOnHover={true}
          />
        </div>

        {/* Technology groups stay stable; hover feedback is handled in CSS. */}
        <div>
          <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).map(([category, items], idx) => (
              <ScrollReveal key={category} delay={idx * 0.1}>
                <div>
                  <h3
                    className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          TECH_CATEGORY_COLORS[category as keyof typeof TECH_CATEGORY_COLORS] ?? "#6366f1",
                      }}
                    />
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {t(category) || category}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((tech) => (
                      <span
                        key={tech.name}
                        className="tech-tag cursor-default rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          borderColor: tech.featured
                            ? "var(--color-edge)"
                            : "rgba(26,40,64,0.5)",
                          color: tech.featured
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                          backgroundColor: tech.featured
                            ? "rgba(99,102,241,0.05)"
                            : "transparent",
                        }}
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
