import type { CSSProperties, ReactNode } from "react"

import "./LogoLoop.css"

export type LogoItem = {
  node: ReactNode
}

interface LogoLoopProps {
  logos: LogoItem[]
  speed?: number
  direction?: "left" | "right"
  logoHeight?: number
  gap?: number
  fadeOut?: boolean
  fadeOutColor?: string
  scaleOnHover?: boolean
  className?: string
  style?: CSSProperties
}

export default function LogoLoop({
  logos,
  speed = 60,
  direction = "left",
  logoHeight = 32,
  gap = 32,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  className = "",
  style,
}: LogoLoopProps) {
  const duration = Math.max(14, (logos.length * 100) / Math.max(speed, 1))
  const rootClassName = [
    "logoloop",
    fadeOut && "logoloop--fade",
    scaleOnHover && "logoloop--scale-hover",
    className,
  ]
    .filter(Boolean)
    .join(" ")
  const rootStyle = {
    ...style,
    "--logoloop-gap": `${gap}px`,
    "--logoloop-logoHeight": `${logoHeight}px`,
    "--logoloop-duration": `${duration}s`,
    "--logoloop-direction": direction === "right" ? "reverse" : "normal",
    ...(fadeOutColor ? { "--logoloop-fadeColor": fadeOutColor } : {}),
  } as CSSProperties

  const renderLogo = (item: LogoItem, key: string) => {
    return (
      <li className="logoloop__item" key={key}>
        <span className="logoloop__node" aria-hidden="true">
          {item.node}
        </span>
      </li>
    )
  }

  return (
    <div className={rootClassName} style={rootStyle} aria-hidden="true">
      <div className="logoloop__track">
        {[0, 1].map((copyIndex) => (
          <ul className="logoloop__list" key={copyIndex}>
            {logos.map((logo, logoIndex) =>
              renderLogo(logo, `${copyIndex}-${logoIndex}`),
            )}
          </ul>
        ))}
      </div>
    </div>
  )
}
