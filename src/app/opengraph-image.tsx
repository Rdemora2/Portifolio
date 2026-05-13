import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Roberto Zarzur | Gerente de TI & Engenheiro de Software"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "80px",
          fontFamily: "sans-serif",
          background: "linear-gradient(135deg, #020408 0%, #0a1018 40%, #0d1520 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "200px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, #6366f1, #00ff88, #6366f1, transparent)",
          }}
        />

        {/* Availability badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#00ff88",
            }}
          />
          <span
            style={{
              color: "#00ff88",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
            }}
          >
            Disponível para projetos
          </span>
        </div>

        <h1
          style={{
            color: "#e8f4f8",
            fontSize: "64px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "16px",
            letterSpacing: "-1px",
          }}
        >
          Roberto de Moraes Zarzur
        </h1>
        <p
          style={{
            color: "#818cf8",
            fontSize: "28px",
            fontWeight: 600,
            marginBottom: "24px",
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
          }}
        >
          Gerente de TI & Engenheiro de Software
        </p>
        <p
          style={{
            color: "#6b8fa8",
            fontSize: "18px",
            letterSpacing: "4px",
            fontFamily: "monospace",
          }}
        >
          Go · Next.js · Kotlin · AWS · GCP
        </p>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#4f46e5",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
            }}
          >
            robertozarzur.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
