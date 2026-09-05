"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import type {
  ArticleSceneVisual,
  InsightArticleSection,
} from "@/content/insights/types"

import styles from "./ImmersiveArticle.module.css"

type ExperienceSection = Pick<
  InsightArticleSection,
  "id" | "title" | "visual"
>

type Metric = {
  value: string
  label: string
}

type ArticleExperienceProps = {
  rootId: string
  sections: ExperienceSection[]
  systemNodes: string[]
  metrics: Metric[]
  labels: {
    navigation: string
    trace: string
    chapter: string
    progress: string
    core: string
    coreCaption: string
  }
}

type SceneGeometry = {
  top: number
  height: number
}

type ExperienceGeometry = {
  rootTop: number
  rootRange: number
  heroTop: number
  heroHeight: number
  heroRange: number
  viewportHeight: number
  scenes: SceneGeometry[]
}

type StageStyle = CSSProperties & {
  "--active-angle": string
  "--orbit-step": string
  "--scene-tone": string
}

const sceneTones: Record<ArticleSceneVisual["kind"], string> = {
  ingress: "#00d4ff",
  boundaries: "#818cf8",
  "hot-path": "#00ff88",
  "cache-fallback": "#fbbf24",
  telemetry: "#22d3ee",
  security: "#a78bfa",
  recovery: "#ff6b35",
  release: "#00ff88",
}

const HERO_MOTION_PROPERTIES = [
  "--hero-progress",
  "--hero-signal",
  "--hero-pulse",
  "--hero-type",
  "--hero-orbit",
  "--hero-handoff",
] as const

type TraceNode = { x: number; y: number }

function createTraceNodes(count: number): TraceNode[] {
  const nodeCount = Math.max(count, 1)
  const startX = 38
  const endX = 338
  const step = (endX - startX) / Math.max(nodeCount - 1, 1)

  return Array.from({ length: nodeCount }, (_, index) => ({
    x: nodeCount === 1 ? (startX + endX) / 2 : startX + step * index,
    y: index % 2 === 0 ? 116 : 74,
  }))
}

function createTracePath(nodes: TraceNode[]): string {
  const first = nodes[0]
  if (!first) return ""

  return nodes.slice(1).reduce((path, node, index) => {
    const previous = nodes[index]
    if (!previous) return path

    const midpoint = (previous.x + node.x) / 2
    return `${path}C${midpoint} ${previous.y} ${midpoint} ${node.y} ${node.x} ${node.y}`
  }, `M${first.x} ${first.y}`)
}

function createFallbackPath(nodes: TraceNode[]): string {
  const start = nodes[Math.min(2, nodes.length - 1)]
  const end = nodes[Math.min(4, nodes.length - 1)]
  if (!start || !end) return ""

  const midpoint = (start.x + end.x) / 2
  return `M${start.x} ${start.y}C${midpoint} 152 ${midpoint} 152 ${end.x} ${end.y}`
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

function smoothstep(value: number, start: number, end: number): number {
  const progress = clamp((value - start) / Math.max(end - start, 0.001))
  return progress * progress * (3 - 2 * progress)
}

function getHeroMotion(progress: number) {
  const signal = smoothstep(progress, 0, 0.2)
  const pulseAttack = smoothstep(progress, 0.015, 0.08)
  const pulseRelease = 1 - smoothstep(progress, 0.2, 0.38)
  const typeOpen = smoothstep(progress, 0.07, 0.38)
  const orbit = smoothstep(progress, 0.24, 0.68)
  const handoff = smoothstep(progress, 0.58, 1)

  return {
    progress,
    signal,
    pulse: pulseAttack * pulseRelease,
    type: typeOpen * (1 - handoff),
    orbit,
    handoff,
  }
}

export function ArticleExperience({
  rootId,
  sections,
  systemNodes,
  metrics,
  labels,
}: ArticleExperienceProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(-1)
  const [activeIndex, setActiveIndex] = useState(0)

  const activeSection = sections[activeIndex] ?? sections[0]
  const activeVisual = activeSection?.visual
  const activeMetric =
    activeVisual?.metricIndex === undefined
      ? undefined
      : metrics[activeVisual.metricIndex]
  const activeNode = activeVisual
    ? systemNodes[activeVisual.focusNode % Math.max(systemNodes.length, 1)]
    : undefined
  const traceNodes = createTraceNodes(systemNodes.length)
  const tracePath = createTracePath(traceNodes)
  const fallbackPath = createFallbackPath(traceNodes)
  const focusedTraceNode = activeVisual
    ? activeVisual.focusNode % traceNodes.length
    : 0
  const orbitStep = 360 / Math.max(sections.length, 1)
  const stageStyle: StageStyle = {
    "--active-angle": `${activeIndex * orbitStep}deg`,
    "--orbit-step": `${orbitStep}deg`,
    "--scene-tone": activeVisual
      ? sceneTones[activeVisual.kind]
      : sceneTones.ingress,
  }

  useEffect(() => {
    const root = document.getElementById(rootId)
    const hero = root?.querySelector<HTMLElement>("[data-article-hero]")
    const story = root?.querySelector<HTMLElement>("[data-article-story]")
    const sceneElements = sections.map(({ id }) => document.getElementById(id))

    if (!root || !hero || !story || sceneElements.some((scene) => !scene)) {
      return
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const heroCapabilityQuery = window.matchMedia(
      "(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine)",
    )
    let geometry: ExperienceGeometry | null = null
    let renderFrame = 0
    let measureFrame = 0
    let lastHeroProgress = ""
    let disposed = false

    // A sentinel forces the first measured scene to synchronize React state,
    // refs and data attributes after the reusable section model changes.
    activeIndexRef.current = -1
    root.dataset.activeScene = sections[0]?.id ?? ""
    root.dataset.motion = motionQuery.matches ? "reduced" : "full"
    sceneElements.forEach((scene, index) => {
      scene?.toggleAttribute("data-active", index === 0)
    })

    const render = () => {
      renderFrame = 0
      if (!geometry) return

      const scrollY = window.scrollY
      const overallProgress = clamp(
        (scrollY - geometry.rootTop) / geometry.rootRange,
      )
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${overallProgress.toFixed(4)})`
      }

      const readingLine = scrollY + geometry.viewportHeight * 0.46
      let nextIndex = 0
      geometry.scenes.forEach((scene, index) => {
        if (readingLine >= scene.top) nextIndex = index
      })
      nextIndex = Math.min(nextIndex, sections.length - 1)

      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex
        root.dataset.activeScene = sections[nextIndex]?.id ?? ""
        sceneElements.forEach((scene, index) => {
          scene?.toggleAttribute("data-active", index === nextIndex)
        })
        setActiveIndex(nextIndex)
      }

      const activeGeometry = geometry.scenes[nextIndex]
      const sceneProgress = activeGeometry
        ? clamp(
            (readingLine - activeGeometry.top) /
              Math.max(activeGeometry.height, 1),
          )
        : 0
      stageRef.current?.style.setProperty(
        "--scene-progress",
        sceneProgress.toFixed(4),
      )

      const heroMotionEnabled =
        !motionQuery.matches && heroCapabilityQuery.matches
      const heroProgress = heroMotionEnabled
        ? clamp((scrollY - geometry.heroTop) / geometry.heroRange)
        : 0
      const heroProgressValue = heroProgress.toFixed(4)

      if (heroProgressValue !== lastHeroProgress) {
        lastHeroProgress = heroProgressValue
        const heroMotion = getHeroMotion(heroProgress)
        const motionValues = [
          ["--hero-progress", heroMotion.progress],
          ["--hero-signal", heroMotion.signal],
          ["--hero-pulse", heroMotion.pulse],
          ["--hero-type", heroMotion.type],
          ["--hero-orbit", heroMotion.orbit],
          ["--hero-handoff", heroMotion.handoff],
        ] as const

        motionValues.forEach(([property, value]) => {
          hero.style.setProperty(property, value.toFixed(4))
        })
      }

      const heroMotionExit = Math.min(
        geometry.heroTop + geometry.heroHeight,
        geometry.heroTop +
          geometry.heroRange +
          geometry.viewportHeight * 0.18,
      )
      const heroIsActive =
        heroMotionEnabled &&
        scrollY >= geometry.heroTop - geometry.viewportHeight &&
        scrollY <= heroMotionExit
      const nextHeroMotion = heroMotionEnabled ? "scroll" : "static"
      const nextHeroActive = heroIsActive ? "true" : "false"

      if (hero.dataset.heroMotion !== nextHeroMotion) {
        hero.dataset.heroMotion = nextHeroMotion
      }
      if (hero.dataset.heroActive !== nextHeroActive) {
        hero.dataset.heroActive = nextHeroActive
      }
    }

    const scheduleRender = () => {
      if (!renderFrame) renderFrame = window.requestAnimationFrame(render)
    }

    const measure = () => {
      measureFrame = 0
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const rootBounds = root.getBoundingClientRect()
      const heroBounds = hero.getBoundingClientRect()

      geometry = {
        rootTop: scrollY + rootBounds.top,
        rootRange: Math.max(root.offsetHeight - viewportHeight, 1),
        heroTop: scrollY + heroBounds.top,
        heroHeight: hero.offsetHeight,
        heroRange: Math.max(hero.offsetHeight - viewportHeight, 1),
        viewportHeight,
        scenes: sceneElements.map((scene) => {
          const bounds = scene?.getBoundingClientRect()
          return {
            top: scrollY + (bounds?.top ?? 0),
            height: bounds?.height ?? 1,
          }
        }),
      }
      render()
    }

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure)
    }

    const handleMotionChange = () => {
      const motion = motionQuery.matches ? "reduced" : "full"
      if (root.dataset.motion !== motion) root.dataset.motion = motion
      scheduleMeasure()
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(root)
    resizeObserver.observe(hero)
    resizeObserver.observe(story)
    sceneElements.forEach((scene) => {
      if (scene) resizeObserver.observe(scene)
    })

    window.addEventListener("scroll", scheduleRender, { passive: true })
    window.addEventListener("resize", scheduleMeasure)
    motionQuery.addEventListener("change", handleMotionChange)
    heroCapabilityQuery.addEventListener("change", scheduleMeasure)
    scheduleMeasure()

    void document.fonts?.ready.then(() => {
      if (!disposed) scheduleMeasure()
    })

    return () => {
      disposed = true
      resizeObserver.disconnect()
      window.removeEventListener("scroll", scheduleRender)
      window.removeEventListener("resize", scheduleMeasure)
      motionQuery.removeEventListener("change", handleMotionChange)
      heroCapabilityQuery.removeEventListener("change", scheduleMeasure)
      if (renderFrame) window.cancelAnimationFrame(renderFrame)
      if (measureFrame) window.cancelAnimationFrame(measureFrame)
      delete root.dataset.activeScene
      delete root.dataset.motion
      delete hero.dataset.heroActive
      delete hero.dataset.heroMotion
      HERO_MOTION_PROPERTIES.forEach((property) =>
        hero.style.removeProperty(property),
      )
      sceneElements.forEach((scene) => scene?.removeAttribute("data-active"))
    }
  }, [rootId, sections])

  if (!activeSection || !activeVisual) return null

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.progressTrack}
        data-article-progress
      >
        <div ref={progressRef} className={styles.progressValue} />
      </div>

      <div
        aria-hidden="true"
        className={styles.mobileTracker}
        data-article-tracker
        data-active-scene={activeSection.id}
      >
        <span className={styles.mobileTrackerIndex}>
          {String(activeIndex + 1).padStart(2, "0")}
          <span>/</span>
          {String(sections.length).padStart(2, "0")}
        </span>
        <span className={styles.mobileTrackerTitle}>{activeSection.title}</span>
      </div>

      <div
        ref={stageRef}
        className={styles.stage}
        data-article-stage
        data-active-scene={activeSection.id}
        data-scene={activeVisual.kind}
        style={stageStyle}
      >
        <div className={styles.stagePanel}>
          <div className={styles.stageHeader} aria-hidden="true">
            <span>{labels.trace}</span>
            <span className={styles.stageCounter}>
              {String(activeIndex + 1).padStart(2, "0")}/
              {String(sections.length).padStart(2, "0")}
            </span>
          </div>

          <div aria-hidden="true" className={styles.traceVisual}>
            <div className={styles.orbit} data-stage-orbit>
              {sections.map((section, index) => (
                <span
                  key={section.id}
                  className={styles.orbitNode}
                  data-current={index === activeIndex ? "true" : undefined}
                  style={{ "--orbit-index": index } as CSSProperties}
                />
              ))}
            </div>
            <div className={styles.core}>
              <span>{labels.core}</span>
              <small>{labels.coreCaption}</small>
            </div>
            <div className={styles.securityRing} data-stage-security-ring />

            <svg
              className={styles.traceMap}
              data-stage-trace-map
              viewBox="0 0 376 188"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                className={styles.traceRail}
                d={tracePath}
                pathLength="1"
              />
              <path
                className={styles.traceSignal}
                data-stage-trace-signal
                d={tracePath}
                pathLength="1"
              />
              <path
                className={styles.fallbackRail}
                data-stage-fallback-rail
                d={fallbackPath}
                pathLength="1"
              />
              {traceNodes.map((node, index) => (
                <g
                  key={`${node.x}-${node.y}`}
                  className={styles.traceNode}
                  data-current={
                    index === focusedTraceNode ? "true" : undefined
                  }
                >
                  <circle cx={node.x} cy={node.y} r="12" />
                  <circle cx={node.x} cy={node.y} r="3" />
                </g>
              ))}
            </svg>
          </div>

          <div
            key={activeSection.id}
            className={styles.stageReadout}
            data-stage-readout
            aria-hidden="true"
          >
            <span className={styles.stageEyebrow}>
              {labels.chapter} {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <strong>{activeSection.title}</strong>
            <div className={styles.stageSignals}>
              {activeNode ? <span>{activeNode}</span> : null}
              {activeMetric ? (
                <span>
                  <b>{activeMetric.value}</b> {activeMetric.label}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles.stageProgressLabel} aria-hidden="true">
            {labels.progress}
          </div>
          <nav aria-label={labels.navigation}>
            <ol className={styles.stageNavigation}>
              {sections.map((section, index) => {
                const isActive = index === activeIndex
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      aria-current={isActive ? "location" : undefined}
                      data-current={isActive ? "true" : undefined}
                    >
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>
    </>
  )
}
