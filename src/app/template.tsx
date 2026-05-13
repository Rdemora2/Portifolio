"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const contentRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    if (!contentRef.current || !columnsRef.current) return

    const tl = gsap.timeline()
    const columns = columnsRef.current.children

    // As colunas iniciam cobrindo 100% da tela para esconder o carregamento instantâneo
    gsap.set(columns, { height: "100%", transformOrigin: "bottom" })
    
    // O conteúdo inicia um pouco para baixo e transparente
    gsap.set(contentRef.current, { y: 100, opacity: 0, scale: 0.95, filter: "blur(10px)" })

    // 1. As colunas encolhem sequencialmente, revelando a página
    tl.to(columns, {
      height: "0%",
      duration: 1.2,
      stagger: 0.1,
      ease: "expo.inOut"
    })

    // 2. A página nova sobe suavemente enquanto ganha foco
    .to(contentRef.current, {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.4,
      ease: "expo.out",
      clearProps: "all"
    }, "-=0.8") // Intersecção com as colunas descendo

    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <>
      {/* Overlay de Transição (Colunas/Blinds) */}
      <div 
        ref={columnsRef} 
        className="fixed inset-0 z-[9999] pointer-events-none flex"
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-1 h-full bg-[var(--color-signal)]" />
        ))}
      </div>
      
      {/* Conteúdo da Página */}
      <div ref={contentRef} className="will-change-transform bg-[var(--color-void)] min-h-dvh">
        {children}
      </div>
    </>
  )
}
