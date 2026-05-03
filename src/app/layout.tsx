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
    default: "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    template: "%s | Roberto Zarzur",
  },
  description: "Gerente de TI e engenheiro de software. Lidero times, construo backends de alta performance em Go, e cuido de infra cloud na AWS e GCP.",
  keywords: ["Gerente de TI", "Engenheiro de Software", "Go", "Golang", "Next.js", "Backend", "Cloud", "AWS", "GCP", "Kotlin"],
  authors: [{ name: "Roberto de Moraes Zarzur" }],
  creator: "Roberto de Moraes Zarzur",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    description: "Lidero times de tecnologia, codifico backends pesados em Go e cuido de infra cloud.",
    siteName: "Roberto Zarzur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roberto Zarzur",
    description: "Gerente de TI & Engenheiro de Software: Go, Next.js, Kotlin, AWS, GCP",
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
  jobTitle: "Gerente de TI & Engenheiro de Software",
  description: "Líder técnico e engenheiro com foco em backend de alta performance, cloud e gestão de times",
  url: "https://robertozarzur.dev",
  sameAs: [
    "https://www.linkedin.com/in/robertomoraeszarzur/",
    "https://github.com/Rdemora2",
  ],
  knowsAbout: ["Go", "Golang", "Next.js", "TypeScript", "AWS", "GCP", "Kotlin", "Gestão de TI"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
