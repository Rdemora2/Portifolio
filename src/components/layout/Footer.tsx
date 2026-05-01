import { personalInfo } from "@/data/portfolio"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer
      className="border-t px-6 py-8 text-center"
      style={{
        backgroundColor: "var(--color-void)",
        borderColor: "var(--color-edge)",
      }}
    >
      <p
        className="text-sm"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        © {year} · {personalInfo.name}
      </p>
    </footer>
  )
}
