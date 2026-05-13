import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Go em Produção",
  description:
    "O que eu aprendi depois de rodar uma API Go com milhões de requests/mês. Decisões de arquitetura, cache, observabilidade e os erros que quase custaram caro.",
  openGraph: {
    title: "Go em Produção | Roberto Zarzur",
    description:
      "Decisões de arquitetura, cache em camadas, observabilidade e performance real em Go processando 20M+ requests/mês.",
    type: "article",
  },
}

export default function InsightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
