import styles from "./SectionDivider.module.css"

interface SectionDividerProps {
  topColor?: string
  bottomColor?: string
  height?: number
}

/**
 * Server-rendered SVG divider. Native CSS scroll timelines add a short signal
 * when supported, without hydrating canvases or running requestAnimationFrame.
 */
export function SectionDivider({
  topColor = "var(--color-void)",
  bottomColor = "var(--color-deep)",
  height = 40,
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.root}
      data-section-divider
      style={{
        backgroundColor: bottomColor,
        display: "block",
        height: `${height}px`,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <path
          d="M0 0H1440V42C1200 54 1080 24 840 40C600 56 420 28 0 44Z"
          fill={topColor}
        />
        <path
          d="M0 44C420 28 600 56 840 40C1080 24 1200 54 1440 42"
          className={styles.wave}
          pathLength="1"
        />
        <path
          d="M0 44C420 28 600 56 840 40C1080 24 1200 54 1440 42"
          className={styles.signal}
          data-section-divider-signal
          pathLength="1"
        />
      </svg>
    </div>
  )
}
