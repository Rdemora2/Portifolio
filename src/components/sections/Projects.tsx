"use client";

import { useState, useRef, useEffect } from "react";
import { projects } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { CountUp } from "@/components/shared/CountUp";
import BorderGlow from "@/components/shared/BorderGlow";
import type { Project, ProjectCategory, RoleType } from "@/types";

type FilterType = "all" | "engineering" | "management" | "international";

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "engineering", label: "Engenharia" },
  { key: "management", label: "Gestão" },
  { key: "international", label: "Internacional" },
];

function matchesFilter(project: Project, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "international") return project.international === true;
  if (filter === "engineering")
    return project.roleType === "engineering" || project.roleType === "hybrid";
  if (filter === "management")
    return project.roleType === "management" || project.roleType === "hybrid";
  return true;
}

function getCategoryLabel(cat: ProjectCategory): string {
  const map: Record<ProjectCategory, string> = {
    infrastructure: "Infraestrutura",
    backend: "Backend",
    frontend: "Frontend",
    mobile: "Mobile",
    fullstack: "Full Stack",
    leadership: "Liderança",
    management: "Gestão",
  };
  return map[cat];
}

function getRoleLabel(role: RoleType): string {
  const map: Record<RoleType, string> = {
    engineering: "Engenharia",
    management: "Gestão",
    hybrid: "Híbrido",
  };
  return map[role];
}

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter));

  const loadGsap = async () => {
    if (gsapRef.current) return gsapRef.current;
    const mod = await import("@/lib/gsap");
    gsapRef.current = mod;
    return mod;
  };

  const handleFilterChange = async (filter: FilterType) => {
    const mod = await loadGsap();
    const gsap = mod?.gsap;
    if (!gsap || !listRef.current) {
      setActiveFilter(filter);
      return;
    }

    gsap.to(listRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      stagger: 0.03,
      onComplete: () => {
        setActiveFilter(filter);
        setExpandedId(null);
        if (listRef.current) {
          gsap.fromTo(
            listRef.current.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power3.out",
            },
          );
        }
      },
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section
      id="projects"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
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
            Projetos
          </p>
          <h2
            className="mb-8 font-bold sm:mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            O que eu fiz
          </h2>
        </ScrollReveal>

        <div className="mb-8 flex flex-wrap gap-2 sm:mb-12">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 sm:px-6 sm:py-2 sm:text-sm"
              style={{
                fontFamily: "var(--font-mono)",
                borderColor:
                  activeFilter === key
                    ? "var(--color-signal)"
                    : "var(--color-edge)",
                backgroundColor:
                  activeFilter === key ? "rgba(99,102,241,0.1)" : "transparent",
                color:
                  activeFilter === key
                    ? "var(--color-signal)"
                    : "var(--color-text-secondary)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div ref={listRef} className="space-y-0">
          {filtered.map((project, idx) => (
            <ProjectItem
              key={project.id}
              project={project}
              index={idx}
              isExpanded={expandedId === project.id}
              onToggle={() => toggleExpand(project.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectItem({
  project,
  index,
  isExpanded,
  onToggle,
}: {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const detailsRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);

  useEffect(() => {
    if (!detailsRef.current) return;
    let isActive = true;

    const run = async () => {
      if (!gsapRef.current) {
        gsapRef.current = await import("@/lib/gsap");
      }
      if (!isActive || !gsapRef.current) return;
      const { gsap } = gsapRef.current;
      if (isExpanded) {
        gsap.fromTo(
          detailsRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.6, ease: "power3.out" },
        );
      } else {
        gsap.to(detailsRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [isExpanded]);

  return (
    <ScrollReveal delay={index * 0.1}>
      <BorderGlow
        className="w-full mb-4"
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
      >
        <div
          ref={itemRef}
          className="border-b cursor-pointer group px-4 bg-void/30 backdrop-blur-sm rounded-2xl sm:px-6"
          style={{
            borderColor: "var(--color-edge)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={() => {
            if (itemRef.current) {
              itemRef.current.style.backgroundColor = "rgba(99,102,241,0.08)";
            }
          }}
          onMouseLeave={() => {
            if (itemRef.current) {
              itemRef.current.style.backgroundColor = "transparent";
            }
          }}
        >
          <div
            className="relative flex items-center gap-4 py-6 transition-all sm:gap-6 sm:py-8 lg:gap-10"
            onClick={onToggle}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle();
              }
            }}
          >
          <div
            className="absolute left-0 top-0 h-full w-[2px] origin-top transition-transform duration-500 group-hover:scale-y-100"
            style={{
              backgroundColor: "var(--color-signal)",
              transform: isExpanded ? "scaleY(1)" : "scaleY(0)",
            }}
            aria-hidden="true"
          />

          <span
            className="hidden text-[60px] font-extrabold leading-none transition-all duration-500 lg:block lg:text-[120px]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-muted)",
              WebkitTextStroke: isExpanded ? "1px var(--color-signal)" : "none",
              transition: "color 0.5s ease, -webkit-text-stroke 0.5s ease",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3
                className="text-lg font-bold transition-all duration-200 group-hover:translate-x-2 sm:text-xl md:text-2xl lg:text-3xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="group-hover:text-[var(--color-signal)] transition-colors duration-200">
                  {project.title}
                </span>
              </h3>
              <span
                className="rounded-full border px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  borderColor: "var(--color-edge)",
                  color: "var(--color-text-muted)",
                }}
              >
                {project.client}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "rgba(99,102,241,0.1)",
                  color: "var(--color-signal)",
                }}
              >
                {getRoleLabel(project.roleType)}
              </span>
              {project.international && (
                <span
                  className="rounded-full px-2 py-0.5 text-[0.625rem] uppercase tracking-wider sm:px-3 sm:text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    backgroundColor: "rgba(255,107,53,0.1)",
                    color: "var(--color-alert)",
                  }}
                >
                  Internacional 🌍
                </span>
              )}
            </div>
            <p
              className="text-sm md:text-base"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-secondary)",
              }}
            >
              {project.shortDescription}
            </p>
          </div>

          <div className="flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-200"
              style={{
                color: "var(--color-text-secondary)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div
          ref={detailsRef}
          className="overflow-hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <div className="pb-6 pl-0 sm:pb-8 lg:pl-[170px]">
            {project.metrics.length > 0 && (
              <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border p-4 text-center sm:p-6"
                    style={{
                      borderColor: "var(--color-edge)",
                      backgroundColor: "rgba(99,102,241,0.03)",
                    }}
                  >
                    <div
                      className="text-xl font-extrabold sm:text-2xl md:text-3xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-signal)",
                      }}
                    >
                      <CountUp
                        end={metric.value}
                        suffix={metric.suffix}
                        trigger={isExpanded}
                        duration={2}
                      />
                    </div>
                    <p
                      className="mt-2 text-[0.625rem] uppercase tracking-wider sm:text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {project.caseStudy && (
              <div
                className="mb-6 rounded-xl border p-4 sm:mb-8 sm:p-6 md:p-8"
                style={{
                  borderColor: "rgba(99,102,241,0.2)",
                  backgroundColor: "rgba(99,102,241,0.03)",
                }}
              >
                <h4
                  className="mb-4 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-widest sm:text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-signal)",
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--color-signal)" }}
                  />
                  Meu papel neste projeto
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {project.caseStudy.robertoRole}
                </p>
              </div>
            )}

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              <div>
                <h4
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-signal)",
                  }}
                >
                  Desafio
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {project.challenge}
                </p>
              </div>
              <div>
                <h4
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-signal)",
                  }}
                >
                  Solução
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {project.solution}
                </p>
              </div>
            </div>

            {project.caseStudy?.keyDecisions && (
              <div className="mt-6 sm:mt-8">
                <h4
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-signal)",
                  }}
                >
                  Decisões-chave
                </h4>
                <ul className="space-y-2">
                  {project.caseStudy.keyDecisions.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-sm"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--color-highlight)" }}>◆</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 sm:mt-8">
              <h4
                className="mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-signal)",
                }}
              >
                Destaques
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span style={{ color: "var(--color-matrix)" }}>▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {project.caseStudy?.lessonsLearned && (
              <div className="mt-6 sm:mt-8">
                <h4
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Lições aprendidas
                </h4>
                <ul className="space-y-2">
                  {project.caseStudy.lessonsLearned.map((l) => (
                    <li
                      key={l}
                      className="flex items-start gap-2 text-sm italic"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>→</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: "var(--color-edge)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        </div>
      </BorderGlow>
    </ScrollReveal>
  );
}
