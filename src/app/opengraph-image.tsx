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
          backgroundColor: "#020408",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <h1
          style={{
            color: "#e8f4f8",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Roberto de Moraes Zarzur
        </h1>
        <p
          style={{
            color: "#00d4ff",
            fontSize: "32px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          Gerente de TI & Engenheiro de Software
        </p>
        <p
          style={{
            color: "#6b8fa8",
            fontSize: "20px",
            letterSpacing: "2px",
          }}
        >
          Go · Next.js · Kotlin · AWS · GCP
        </p>
      </div>
    ),
    { ...size }
  )
}
