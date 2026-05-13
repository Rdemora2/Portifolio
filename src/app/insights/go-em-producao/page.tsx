"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

const ArticleCanvas = dynamic(() => import("./ArticleCanvas").then(m => ({ default: m.ArticleCanvas })), { ssr: false })

const SECTIONS = [
  {
    id: "contexto",
    title: "Contexto real (não de laboratório)",
    accent: "#6366f1",
    content: `Escolhi Fiber sobre fasthttp para privilegiar throughput e previsibilidade. O sistema precisa lidar com:`,
    bullets: [
      "Integração com APIs externas de catálogo/streaming e autenticação.",
      "Camada administrativa com JWT por cookie e controle fino de permissões.",
      "Observabilidade detalhada para explicar o que acontece, não só mostrar gráfico bonito.",
      "Cache híbrido para reduzir custo no read path e evitar dependência total do Redis.",
    ],
  },
  {
    id: "arquitetura",
    title: "Arquitetura que aguenta a pressão",
    accent: "#00d4ff",
    content: `O bootstrap é curto, mas cada linha tem motivo. No start eu:`,
    ordered: [
      "Ajusto GOMAXPROCS de acordo com o número de CPUs.",
      "Subo o GC percent e limito threads para reduzir overhead em pico.",
      "Inicializo pool de conexões Postgres com limites e health checks.",
      "Inicio cache (Redis + fallback local) e programo limpeza periódica.",
      "Ativo métricas e dashboard interno para observabilidade contínua.",
      "Inicio o servidor com timeouts e limites agressivos.",
    ],
    extra: "Na borda HTTP, o Fiber roda com body limit, buffers bem definidos, timeouts e concorrência calculada por CPU. Isso corta o efeito de fila infinita quando o load vira spike. Outro detalhe que eu não abro mão: o servidor não só expõe métricas, ele observa CPU, heap e goroutines. Isso fecha o ciclo de diagnóstico, e evita conclusões erradas quando o gráfico sobe sem explicação.",
  },
  {
    id: "performance",
    title: "Performance sem truques",
    accent: "#00ff88",
    content: "Em Go, performance de verdade não é só handler rápido. O que fez diferença:",
    bullets: [
      "JSON de alta performance com Sonic, validação controlada e buffer pool para reduzir alocação.",
      "HTTP client com pooling, timeouts e tentativas controladas para evitar travas em API lenta.",
      "Streaming de request body e compressão de resposta com ETag no pipeline.",
      "Timeouts com intenção: read/write/idle agressivos para matar conexão zumbi cedo.",
      "Pool de banco com limites claros para não colapsar quando o tráfego dobra.",
    ],
  },
  {
    id: "cache",
    title: "Cache em camadas, porque Redis falha",
    accent: "#f59e0b",
    content: "Cache não é luxo, é linha de defesa. O desenho ficou assim:",
    bullets: [
      "Redis como cache primário com expiração controlada.",
      "Fallback local em memória quando o Redis falha, mantendo disponibilidade.",
      "TTL cache para dados muito acessados (ex: mídia filtrada) e janelas curtas.",
      "Limpeza programada para evitar acúmulo e corrigir edge cases.",
    ],
    extra: "A diferença é simples: eu não quis ficar refém de um único componente. Quando Redis oscila, o sistema continua respondendo, só com menor hit rate. Isso salva incidentes.",
  },
  {
    id: "observabilidade",
    title: "Observabilidade que explica, não enfeita",
    accent: "#6366f1",
    content: "Métrica sem contexto vira superstição. Eu montei uma stack que cobre:",
    bullets: [
      "Contadores e histogramas de latência por rota.",
      "Tamanho de request/response para detectar payloads anormais.",
      "Cache hit/miss e latência de chamadas externas.",
      "Erros de negócio e sucesso por operação.",
      "CPU, heap, goroutines, GC e sinais de estresse do runtime.",
    ],
    extra: "Um detalhe técnico que me salvou: rotas são normalizadas antes de virar label, reduzindo a explosão de séries. Sem isso, Prometheus vira um buraco negro de séries. E por cima disso ainda tenho um middleware de validação de resposta, que avisa quando um JSON válido chega com campos nulos inesperados. Esse tipo de alerta impede regressão silenciosa.",
  },
  {
    id: "seguranca",
    title: "Segurança sem fricção",
    accent: "#00d4ff",
    content: "A área admin usa JWT em cookie seguro (HTTPOnly + SameSite) com RBAC por permissão explícita. Isso me deu:",
    bullets: [
      "Separação clara de poderes entre perfis.",
      "Trilha de auditoria para operações administrativas.",
      "Endpoints sensíveis protegidos sem poluir handlers com ifs.",
    ],
    extra: "Em ambiente de desenvolvimento, pprof habilitado para diagnóstico. Em produção, headers de segurança e políticas mais rígidas.",
  },
  {
    id: "erros",
    title: "Erros que quase me custaram caro",
    accent: "#ff6b35",
    content: "O aprendizado de verdade vem de onde dói:",
    bullets: [
      "Cardinalidade alta em métricas derrubou meu monitoramento; normalizar rotas resolveu.",
      "Dependência total do Redis criou ponto único de falha; o fallback local manteve a API viva.",
      "Sem tuning de GC, picos de tráfego geravam pausas; ajustar GOMAXPROCS e GC estabilizou.",
      "Retries cegos em APIs externas criaram tempestade; controlar tentativas e timeout foi decisivo.",
      "Log verboso em produção virou gargalo; logging assíncrono e seletivo reduziu custo.",
    ],
  },
  {
    id: "checklist",
    title: "Checklist do que realmente segura produção",
    accent: "#00ff88",
    content: "",
    bullets: [
      "Cache híbrido com TTL e fallback local.",
      "Observabilidade de latência, payload e runtime.",
      "Pool de conexões com limites e health check.",
      "JSON rápido, validado e com buffers reutilizáveis.",
      "Normalização de rotas para não explodir o número de séries.",
    ],
  },
]

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function RevealBlock({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ── Floating metrics bar ── */
function MetricsBar() {
  const metrics = [
    { label: "Requests/mês", value: "20M+" },
    { label: "Latência", value: "6ms" },
    { label: "Cache hit", value: "92%" },
    { label: "Commits", value: "1k+" },
  ]
  const { ref, visible } = useScrollReveal()

  return (
    <div ref={ref} className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border p-6 text-center transition-all duration-500 hover:border-[var(--color-signal)] hover:bg-[rgba(99,102,241,0.02)]"
          style={{
            borderColor: "var(--color-edge)",
            backgroundColor: "rgba(5,10,18,0.6)",
            backdropFilter: "blur(12px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
            transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.1}s`,
          }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
          <p className="relative text-2xl font-extrabold md:text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>{m.value}</p>
          <p className="relative mt-2 text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{m.label}</p>
        </div>
      ))}
    </div>
  )
}

export default function GoEmProducaoPage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("")
  const [showCanvas, setShowCanvas] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setShowCanvas(true), 600)
    return () => clearTimeout(t)
  }, [])

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
    const doc = document.documentElement
    const winH = doc.scrollHeight - doc.clientHeight
    const pct = winH > 0 ? (window.scrollY / winH) * 100 : 0
    if (progressRef.current) progressRef.current.style.width = `${pct}%`

    const sectionEls = document.querySelectorAll("[data-section]")
    let current = ""
    sectionEls.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.4) current = el.getAttribute("data-section") || ""
    })
    setActiveSection(current)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const heroOpacity = Math.max(0, 1 - scrollY / 600)
  const heroScale = 1 + scrollY * 0.0003
  const heroBlur = Math.min(scrollY / 100, 8)

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-[200] h-[3px] w-full" style={{ backgroundColor: "rgba(5,10,18,0.5)" }}>
        <div ref={progressRef} className="h-full" style={{ background: "linear-gradient(90deg, var(--color-signal), var(--color-highlight), var(--color-matrix))", width: 0, transition: "width 80ms linear", boxShadow: "0 0 12px rgba(99,102,241,0.5), 0 0 30px rgba(0,212,255,0.2)" }} />
      </div>

      {/* Back nav */}
      <nav className="fixed top-4 left-4 z-[150]">
        <Link href="/#insights" className="group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-signal)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]" style={{ borderColor: "var(--color-edge)", backgroundColor: "rgba(5,10,18,0.7)", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="M10 7H4M4 7l3-3M4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Voltar
        </Link>
      </nav>

      {/* Side TOC with glow */}
      <aside className="fixed top-1/2 right-6 z-[100] hidden -translate-y-1/2 xl:flex flex-col gap-3">
        {SECTIONS.map(s => (
          <a key={s.id} href={`#${s.id}`} onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }) }} className="group flex items-center gap-3 transition-all duration-300" title={s.title}>
            <span className="text-[10px] uppercase tracking-widest transition-all duration-300" style={{ fontFamily: "var(--font-mono)", color: activeSection === s.id ? "var(--color-signal)" : "transparent", maxWidth: 130, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: activeSection === s.id ? 1 : 0, transform: activeSection === s.id ? "translateX(0)" : "translateX(8px)" }}>
              {s.title.split(" ").slice(0, 3).join(" ")}
            </span>
            <span className="block rounded-full transition-all duration-500" style={{ width: activeSection === s.id ? 4 : 2, height: activeSection === s.id ? 20 : 8, backgroundColor: activeSection === s.id ? s.accent : "var(--color-edge)", boxShadow: activeSection === s.id ? `0 0 8px ${s.accent}40` : "none" }} />
          </a>
        ))}
      </aside>

      {/* Hero */}
      <header className="relative flex min-h-dvh items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--color-void)" }}>
        {showCanvas && <ArticleCanvas />}
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(5,10,18,0.3) 0%, rgba(5,10,18,0.85) 60%, rgba(5,10,18,1) 100%)" }} />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center" style={{ opacity: heroOpacity, transform: `scale(${heroScale})`, filter: `blur(${heroBlur}px)` }}>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl lg:text-8xl animate-fade-in-up" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-signal) 40%, var(--color-highlight) 80%, var(--color-matrix) 100%)", backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" as const, animation: "gradient-shift 8s ease infinite, fade-in-up 1s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}>
            Go em Produção
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed md:text-xl animate-fade-in-up" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", animationDelay: "0.6s" }}>
            O que eu aprendi depois de rodar uma API Go com milhões de requests/mês
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            {["Go", "Fiber", "Redis", "Prometheus", "PostgreSQL", "GCP"].map((t, i) => (
              <span key={t} className="rounded-full border px-4 py-1.5 text-xs transition-all duration-300 hover:border-[var(--color-signal)] hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]" style={{ fontFamily: "var(--font-mono)", borderColor: "var(--color-edge)", color: "var(--color-text-muted)", animationDelay: `${0.8 + i * 0.05}s` }}>{t}</span>
            ))}
          </div>

          <div className="mt-16 animate-bounce" style={{ color: "var(--color-text-muted)" }}>
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none" className="mx-auto"><rect x="1" y="1" width="18" height="28" rx="9" stroke="currentColor" strokeWidth="2"/><circle cx="10" cy="10" r="2" fill="currentColor" className="animate-scroll-indicator"/></svg>
          </div>
        </div>
      </header>

      {/* Article body */}
      <article ref={articleRef} className="relative" style={{ backgroundColor: "var(--color-void)" }}>
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-32">

          {/* Intro card */}
          <RevealBlock>
            <div className="mb-16 rounded-2xl border p-8 md:p-12 relative overflow-hidden group" style={{ borderColor: "var(--color-edge)", backgroundColor: "rgba(10,16,24,0.6)", backdropFilter: "blur(20px)" }}>
              <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)" }} />
              <p className="relative text-base leading-[1.9] md:text-lg" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                Este backend eu construí do zero e hoje passa de <strong className="font-bold" style={{ color: "var(--color-signal)" }}>1k commits</strong>. Ele roda em um domínio sensível (fluxos de mídia e gestão administrativa em ambiente hospitalar), integra com serviços externos, expõe rotas públicas e um backoffice com RBAC. O que segura a operação não é milagre nem framework: são <strong className="font-bold" style={{ color: "var(--color-highlight)" }}>decisões pequenas, consistentes</strong>, e um cuidado quase obsessivo com latência, carga e custo por request.
              </p>
            </div>
          </RevealBlock>

          {/* Metrics */}
          <MetricsBar />

          {/* Sections */}
          {SECTIONS.map((section, sIdx) => (
            <section key={section.id} id={section.id} data-section={section.id} className="mb-28 last:mb-0">
              <RevealBlock>
                <div className="mb-8 flex items-center gap-4">
                  <span className="text-xs font-bold tabular-nums" style={{ fontFamily: "var(--font-mono)", color: section.accent }}>{String(sIdx + 1).padStart(2, "0")}</span>
                  <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, ${section.accent}, transparent)` }} />
                </div>
              </RevealBlock>

              <RevealBlock delay={0.1}>
                <h2 className="mb-6 text-2xl font-bold md:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>{section.title}</h2>
              </RevealBlock>

              {section.content && (
                <RevealBlock delay={0.15}>
                  <p className="mb-6 text-sm leading-[1.9] md:text-base" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>{section.content}</p>
                </RevealBlock>
              )}

              {section.ordered ? (
                <ol className="mb-6 space-y-3 pl-0 list-none">
                  {section.ordered.map((item, i) => (
                    <RevealBlock key={i} delay={0.2 + i * 0.06}>
                      <li className="group flex items-start gap-4 rounded-xl border p-4 transition-all duration-500 hover:border-transparent hover:shadow-[0_0_25px_rgba(99,102,241,0.08)]" style={{ borderColor: "var(--color-edge)", backgroundColor: "rgba(5,10,18,0.4)" }}>
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${section.accent}20`, color: section.accent, fontFamily: "var(--font-mono)", boxShadow: `0 0 12px ${section.accent}15` }}>{i + 1}</span>
                        <span className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>{item}</span>
                      </li>
                    </RevealBlock>
                  ))}
                </ol>
              ) : section.bullets ? (
                <ul className="mb-6 space-y-3 pl-0 list-none">
                  {section.bullets.map((item, i) => (
                    <RevealBlock key={i} delay={0.2 + i * 0.06}>
                      <li className="group flex items-start gap-3 rounded-lg px-3 py-2 text-sm leading-relaxed transition-all duration-300 hover:bg-[rgba(99,102,241,0.03)]" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                        <span className="mt-2 block h-2 w-2 shrink-0 rounded-full transition-all duration-300 group-hover:scale-125" style={{ backgroundColor: section.id === "checklist" ? "var(--color-matrix)" : section.accent, boxShadow: `0 0 6px ${section.id === "checklist" ? "rgba(0,255,136,0.3)" : section.accent + "40"}` }} />
                        <span>{item}</span>
                      </li>
                    </RevealBlock>
                  ))}
                </ul>
              ) : null}

              {section.extra && (
                <RevealBlock delay={0.4}>
                  <div className="mt-6 rounded-xl border-l-2 bg-gradient-to-r from-[rgba(99,102,241,0.04)] to-transparent py-5 pl-6 pr-4" style={{ borderColor: section.accent }}>
                    <p className="text-sm leading-[1.9]" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>{section.extra}</p>
                  </div>
                </RevealBlock>
              )}

              {/* Section divider glow */}
              {sIdx < SECTIONS.length - 1 && (
                <div className="mt-16 flex justify-center">
                  <div className="h-12 w-[1px]" style={{ background: `linear-gradient(180deg, ${section.accent}40, transparent)` }} />
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <RevealBlock>
          <div className="border-t py-20 text-center" style={{ borderColor: "var(--color-edge)", backgroundColor: "var(--color-deep)" }}>
            <p className="mb-2 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>Roberto de Moraes</p>
            <p className="mb-8 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>Gerente de TI & Engenheiro de Software · Go · Next.js · Kotlin · AWS · GCP</p>
            <Link href="/#contact" className="inline-flex rounded-full border px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]" style={{ borderColor: "var(--color-signal)", color: "var(--color-signal)", fontFamily: "var(--font-body)" }}>
              Entrar em contato
            </Link>
          </div>
        </RevealBlock>
      </article>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </>
  )
}
