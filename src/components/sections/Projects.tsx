"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "@/lib/gsap"
import { projects } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import type { Project, ProjectCategory, RoleType } from "@/types"

type FilterType = "all" | "engineering" | "management" | "international"

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "engineering", label: "Engenharia" },
  { key: "management", label: "Gestão" },
  { key: "international", label: "Internacional" },
]

function matchesFilter(project: Project, filter: FilterType): boolean {
  if (filter === "all") return true
  if (filter === "international") return project.international === true
  if (filter === "engineering") return project.roleType === "engineering" || project.roleType === "hybrid"
  if (filter === "management") return project.roleType === "management" || project.roleType === "hybrid"
  return true
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
  }
  return map[cat]
}

function getRoleLabel(role: RoleType): string {
  const map: Record<RoleType, string> = {
    engineering: "Engenharia",
    management: "Gestão",
    hybrid: "Híbrido",
  }
  return map[role]
}

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = projects.filter((p) => matchesFilter(p, activeFilter))

  const handleFilterChange = (filter: FilterType) => {
    if (listRef.current) {
      gsap.to(listRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        stagger: 0.03,
        onComplete: () => {
          setActiveFilter(filter)
          setExpandedId(null)
          if (listRef.current) {
            gsap.fromTo(
              listRef.current.children,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }
            )
          }
        },
      })
    } else {
      setActiveFilter(filter)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section
      id="projects"
      className="relative py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
          >
            Projetos
          </p>
          <h2
            className="mb-12 text-3xl font-bold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Trabalhos selecionados
          </h2>
        </ScrollReveal>

        <div className="mb-12 flex flex-wrap gap-3">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300"
              style={{
                fontFamily: "var(--font-mono)",
                borderColor: activeFilter === key ? "var(--color-signal)" : "var(--color-edge)",
                backgroundColor: activeFilter === key ? "rgba(0,212,255,0.1)" : "transparent",
                color: activeFilter === key ? "var(--color-signal)" : "var(--color-text-secondary)",
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
  )
}

function ProjectItem({
  project,
  index,
  isExpanded,
  onToggle,
}: {
  project: Project
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!detailsRef.current) return
    if (isExpanded) {
      gsap.fromTo(
        detailsRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.6, ease: "power3.out" }
      )
    } else {
      gsap.to(detailsRef.current, { height: 0, opacity: 0, duration: 0.4, ease: "power3.inOut" })
    }
  }, [isExpanded])

  return (
    <ScrollReveal delay={index * 0.1}>
      <div
        className="border-b cursor-pointer group"
        style={{ borderColor: "var(--color-edge)" }}
      >
        <div
          className="flex items-center gap-6 py-8 transition-all lg:gap-10"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle() } }}
        >
          <span
            className="hidden text-[80px] font-extrabold leading-none transition-colors lg:block lg:text-[120px]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-muted)",
              WebkitTextStroke: isExpanded ? "1px var(--color-signal)" : "none",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3
                className="text-xl font-bold md:text-2xl lg:text-3xl group-hover:text-[var(--color-signal)] transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                {project.title}
              </h3>
              <span
                className="rounded-full border px-3 py-0.5 text-xs uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  borderColor: "var(--color-edge)",
                  color: "var(--color-text-muted)",
                }}
              >
                {project.client}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "rgba(0,212,255,0.1)",
                  color: "var(--color-signal)",
                }}
              >
                {getRoleLabel(project.roleType)}
              </span>
              {project.international && (
                <span
                  className="rounded-full px-3 py-0.5 text-xs uppercase tracking-wider"
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
              className="transition-transform duration-300"
              style={{
                color: "var(--color-text-secondary)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div ref={detailsRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
          <div className="pb-8 pl-0 lg:pl-[170px]">
            {project.metrics.length > 0 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border p-6 text-center"
                    style={{
                      borderColor: "var(--color-edge)",
                      backgroundColor: "rgba(0,212,255,0.03)",
                    }}
                  >
                    <div
                      className="text-4xl font-extrabold md:text-5xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-signal)",
                      }}
                    >
                      {metric.value}{metric.suffix}
                    </div>
                    <p
                      className="mt-2 text-xs uppercase tracking-wider"
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

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h4
                  className="mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
                >
                  Desafio
                </h4>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                  {project.challenge}
                </p>
              </div>
              <div>
                <h4
                  className="mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
                >
                  Solução
                </h4>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                  {project.solution}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h4
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
              >
                Destaques
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-matrix)" }}>▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

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
    </ScrollReveal>
  )
}
