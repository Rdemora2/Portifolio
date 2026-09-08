import { Link } from "@/navigation"
import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
    <main
      id="main-content"
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-6 py-24"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 24%, rgba(99, 102, 241, 0.2), transparent 30%), radial-gradient(circle at 82% 72%, rgba(129, 140, 248, 0.14), transparent 34%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at center, black, transparent 72%)",
        }}
      />

      <section className="relative z-10 w-full max-w-2xl rounded-[1.75rem] border border-[var(--color-edge)] bg-[rgba(10,16,24,0.66)] px-6 py-12 text-center shadow-2xl sm:px-12 sm:py-16" aria-labelledby="not-found-title">
        <p
          className="mb-5 text-xs uppercase"
          style={{
            color: "var(--color-signal)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.28em",
          }}
        >
          {t("eyebrow")}
        </p>
        <h1
          id="not-found-title"
          className="text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          {t("title")}
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {t("description")}
        </p>

        <Link
          href="/"
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-sm font-medium transition-[color,background-color,transform] hover:-translate-y-0.5 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transform-none motion-reduce:transition-none"
          style={{
            borderColor: "var(--color-control-edge)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            outlineColor: "var(--color-signal)",
          }}
        >
          {t("back")}
        </Link>
      </section>
    </main>
  )
}
