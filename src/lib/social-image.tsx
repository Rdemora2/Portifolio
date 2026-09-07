import { ImageResponse } from "next/og"

import { getGoProductionArticle } from "@/content/insights/go-em-producao"
import type { Locale } from "@/i18n.config"
import { SITE_URL } from "@/lib/constants"

const size = { width: 1200, height: 630 }

const copy: Record<Locale, { eyebrow: string; role: string }> = {
  pt: {
    eyebrow: "Engenharia · Cloud · Liderança",
    role: "Engenheiro de Software",
  },
  en: {
    eyebrow: "Engineering · Cloud · Leadership",
    role: "Software Engineer",
  },
  es: {
    eyebrow: "Ingeniería · Cloud · Liderazgo",
    role: "Ingeniero de Software",
  },
}

export function createSocialImage(locale: Locale) {
  const hostname = new URL(SITE_URL).hostname
  const content = copy[locale]

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          padding: "80px",
          background:
            "radial-gradient(circle at 84% 18%, rgba(99,102,241,0.25), transparent 28%), radial-gradient(circle at 20% 92%, rgba(0,212,255,0.13), transparent 30%), linear-gradient(135deg, #020408 0%, #0a1018 48%, #0d1520 100%)",
          color: "#e8f4f8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.18,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.22) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #6366f1, #00d4ff, #00ff88, transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
            color: "#00ff88",
            fontSize: "15px",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              display: "flex",
              width: "9px",
              height: "9px",
              borderRadius: "999px",
              background: "#00ff88",
              boxShadow: "0 0 18px rgba(0,255,136,0.65)",
            }}
          />
          {content.eyebrow}
        </div>

        <h1
          style={{
            maxWidth: "900px",
            margin: 0,
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-3px",
          }}
        >
          Roberto Moraes
        </h1>
        <p
          style={{
            maxWidth: "900px",
            margin: "22px 0 0",
            color: "#a5b4fc",
            fontSize: "29px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {content.role}
        </p>
        <p
          style={{
            margin: "32px 0 0",
            color: "#7e9bb0",
            fontSize: "19px",
            letterSpacing: "4px",
            fontFamily: "monospace",
          }}
        >
          Go · Next.js · Kotlin · AWS · GCP
        </p>

        <span
          style={{
            position: "absolute",
            right: "80px",
            bottom: "48px",
            color: "#818cf8",
            fontSize: "15px",
            letterSpacing: "2px",
          }}
        >
          {hostname}
        </span>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  )
}

type ProjectSocialImageInput = {
  locale: Locale
  title: string
  role: string
  stack: readonly string[]
}

export function createProjectSocialImage({
  locale,
  title,
  role,
  stack,
}: ProjectSocialImageInput) {
  const hostname = new URL(SITE_URL).hostname
  const eyebrow =
    locale === "pt"
      ? "Estudo de caso · Software em produção"
      : locale === "es"
        ? "Caso de estudio · Software en producción"
        : "Case study · Production software"

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "72px 76px 58px",
          background:
            "radial-gradient(circle at 84% 18%, rgba(99,102,241,0.26), transparent 30%), radial-gradient(circle at 12% 94%, rgba(0,212,255,0.15), transparent 32%), linear-gradient(135deg, #020408 0%, #08111c 52%, #0b1420 100%)",
          color: "#edf2ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(rgba(129,140,248,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.2) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "4px",
            background: "linear-gradient(#818cf8, #00d4ff, #00ff88)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#00ff88",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "flex",
                width: "38px",
                height: "2px",
                background: "#00ff88",
              }}
            />
            {eyebrow}
          </div>

          <h1
            style={{
              maxWidth: "1040px",
              margin: "38px 0 0",
              fontSize: "66px",
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-2.5px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              maxWidth: "980px",
              margin: "24px 0 0",
              color: "#a5b4fc",
              fontSize: "25px",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {role}
          </p>
          <p
            style={{
              margin: "28px 0 0",
              color: "#7e9bb0",
              fontSize: "17px",
              letterSpacing: "2px",
              fontFamily: "monospace",
            }}
          >
            {stack.slice(0, 5).join(" · ")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#818cf8",
            fontSize: "16px",
            letterSpacing: "2px",
          }}
        >
          <span>Roberto Moraes</span>
          <span>{hostname}</span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  )
}

export function createArticleSocialImage(locale: Locale) {
  const article = getGoProductionArticle(locale)
  const hostname = new URL(SITE_URL).hostname
  const eyebrow =
    locale === "pt"
      ? "Insights · Engenharia de produção"
      : locale === "es"
        ? "Insights · Ingeniería de producción"
        : "Insights · Production engineering"

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "72px 76px 58px",
          background:
            "radial-gradient(circle at 82% 14%, rgba(0,212,255,0.17), transparent 28%), radial-gradient(circle at 10% 92%, rgba(99,102,241,0.25), transparent 32%), linear-gradient(135deg, #020408 0%, #07101a 52%, #0a1018 100%)",
          color: "#edf2ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.15,
            backgroundImage:
              "linear-gradient(rgba(129,140,248,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.2) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "4px",
            background: "linear-gradient(#818cf8, #00d4ff, #00ff88)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#00ff88",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "flex",
                width: "38px",
                height: "2px",
                background: "#00ff88",
              }}
            />
            {eyebrow}
          </div>

          <h1
            style={{
              maxWidth: "1040px",
              margin: "34px 0 0",
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-2.5px",
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              maxWidth: "940px",
              margin: "24px 0 0",
              color: "#9fb4c8",
              fontSize: "23px",
              lineHeight: 1.35,
            }}
          >
            {article.subtitle}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#818cf8",
            fontSize: "16px",
            letterSpacing: "2px",
          }}
        >
          <span>Roberto Moraes</span>
          <span>{hostname}</span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  )
}
