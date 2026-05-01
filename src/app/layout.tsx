import type { Metadata } from "next"
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://robertozarzur.dev"),
  title: {
    default: "Roberto de Moraes Zarzur — Gestor de TI & Engenheiro de Software",
    template: "%s | Roberto Zarzur",
  },
  description: "Gestor de TI e Engenheiro de Software especializado em arquiteturas de missão crítica, ultra-baixa latência e liderança de times de alto desempenho.",
  keywords: ["Gestor de TI", "Engenheiro de Software", "Go", "Golang", "Next.js", "Arquitetura de Software", "Backend", "Cloud", "AWS", "GCP"],
  authors: [{ name: "Roberto de Moraes Zarzur" }],
  creator: "Roberto de Moraes Zarzur",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Roberto de Moraes Zarzur — Gestor de TI & Engenheiro de Software",
    description: "Arquiteturas de missão crítica. Liderança de alto desempenho. Ultra-baixa latência.",
    siteName: "Roberto Zarzur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roberto de Moraes Zarzur",
    description: "Gestor de TI & Engenheiro de Software — Arquiteturas de Missão Crítica",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Roberto de Moraes Zarzur",
  jobTitle: "Gestor de TI & Engenheiro de Software",
  description: "Especializado em arquiteturas de missão crítica e liderança de times de alto desempenho",
  url: "https://robertozarzur.dev",
  sameAs: [
    "https://www.linkedin.com/in/robertomoraeszarzur/",
    "https://github.com/Rdemora2",
  ],
  knowsAbout: ["Go", "Golang", "Next.js", "TypeScript", "AWS", "GCP", "Kotlin", "Gestão de TI", "Arquitetura de Software"],
  worksFor: {
    "@type": "Organization",
    name: "Valiant Group",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only"
        >
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  )
}
