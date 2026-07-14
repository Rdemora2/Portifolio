"use client"

import { useEffect, useRef, useState } from "react"

type TocSection = {
  id: string
  title: string
}

export function ArticleProgress({
  sections,
  label,
}: {
  sections: TocSection[]
  label: string
}) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      const article = document.getElementById("article-content")
      if (!article) return

      const bounds = article.getBoundingClientRect()
      const articleTop = window.scrollY + bounds.top
      const scrollable = Math.max(article.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(
        Math.max((window.scrollY - articleTop) / scrollable, 0),
        1,
      )

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`
      }
      frame = 0
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        const current = visible[0]?.target.id
        if (current) setActiveSection(current)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 1] },
    )

    for (const section of sections) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[200] h-0.5 bg-[rgba(99,102,241,0.12)]"
      >
        <div
          ref={progressRef}
          className="h-full origin-left scale-x-0 bg-gradient-to-r from-[var(--color-signal)] via-[var(--color-highlight)] to-[var(--color-matrix)] shadow-[0_0_18px_rgba(99,102,241,0.55)]"
        />
      </div>

      <aside className="sticky top-28 hidden self-start xl:block" aria-label={label}>
        <p
          className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </p>
        <ol className="space-y-1 border-l border-[var(--color-edge)]">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className="group flex min-h-11 w-full items-center gap-3 border-l-2 px-4 py-2 text-left text-xs transition-colors"
                  style={{
                    borderColor: isActive ? "var(--color-signal)" : "transparent",
                    color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="text-[10px] tabular-nums text-[var(--color-signal)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2 group-hover:text-[var(--color-text-primary)]">
                    {section.title}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </aside>
    </>
  )
}
