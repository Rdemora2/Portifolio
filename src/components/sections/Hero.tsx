"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { gsap } from "@/lib/gsap"
import { personalInfo } from "@/data/portfolio"
import { MagneticButton } from "@/components/shared/MagneticButton"

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => ({ default: m.HeroCanvas })),
  { ssr: false }
)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    setShowCanvas(true)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2 })



      if (nameRef.current) {
        const text = nameRef.current.textContent ?? ""
        nameRef.current.innerHTML = ""
        text.split("").forEach((char) => {
          const span = document.createElement("span")
          span.style.display = "inline-block"
          span.textContent = char === " " ? "\u00A0" : char
          nameRef.current?.appendChild(span)
        })
        tl.fromTo(
          nameRef.current.children,
          { y: 120, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.035, ease: "power3.out" },
          0.2
        )
      }

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.out" },
          0.8
        )
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.2)
      }

      if (ctaRef.current) {
        tl.fromTo(ctaRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.5)
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-dvh items-center overflow-hidden"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      {showCanvas && <HeroCanvas mouse={mouse} />}

      <div
        className="absolute inset-0 z-[1]"
        style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(2,4,8,0.5) 0%, rgba(2,4,8,0.85) 60%, rgba(2,4,8,0.95) 100%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">

          <h1
            ref={nameRef}
            className="mb-4 text-5xl font-extrabold leading-none tracking-tight md:text-7xl lg:text-8xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {personalInfo.name}
          </h1>

          <p
            ref={titleRef}
            className="mb-4 text-xl font-medium md:text-2xl lg:text-3xl"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-signal)",
              clipPath: "inset(0 100% 0 0)",
            }}
          >
            {personalInfo.title}
          </p>

          <p
            ref={subtitleRef}
            className="mb-10 text-sm tracking-widest opacity-0 md:text-base"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span className="typewriter">{personalInfo.subtitle}</span>
            <span
              className="ml-0.5 inline-block h-5 w-[2px] animate-blink align-text-bottom"
              style={{ backgroundColor: "var(--color-signal)" }}
            />
          </p>

          <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
            <MagneticButton
              href="#projects"
              className="rounded-full border px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--color-signal)] hover:text-[var(--color-void)]"
              style={{
                borderColor: "var(--color-signal)",
                color: "var(--color-signal)",
                fontFamily: "var(--font-body)",
              }}
              ariaLabel="Ver projetos"
            >
              Ver projetos
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="rounded-full border px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:border-[var(--color-text-secondary)]"
              style={{
                borderColor: "var(--color-edge)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-body)",
              }}
              ariaLabel="Entrar em contato"
            >
              Contato
            </MagneticButton>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ color: "var(--color-text-muted)" }}
      >
        <svg width="20" height="30" viewBox="0 0 20 30" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="18" height="28" rx="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="10" r="2" fill="currentColor" className="animate-scroll-indicator" />
        </svg>
      </div>
    </section>
  )
}
