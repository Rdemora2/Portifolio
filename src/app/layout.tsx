import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { SuppressWarnings } from "@/components/shared/SuppressWarnings";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Noise } from "@/components/layout/Noise";
import { GlobalProviders } from "@/components/layout/GlobalProviders";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://robertozarzur.dev"),
  title: {
    default: "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    template: "%s | Roberto Zarzur",
  },
  description:
    "Gerente de TI e líder técnico com perfil hands-on. Lidero times, construo backends de alta performance em Go, gerencio infraestrutura cloud (AWS, GCP) e garanto observabilidade e DevOps em sistemas de missão crítica.",
  keywords: [
    "Gerente de TI",
    "Líder Técnico",
    "IT Manager",
    "Tech Lead",
    "Engenheiro de Software",
    "Go",
    "Golang",
    "Next.js",
    "Backend de Alta Performance",
    "Cloud",
    "AWS",
    "GCP",
    "DevOps",
    "Observabilidade",
    "Kotlin",
    "Gestão de Times",
    "Liderança Técnica",
    "Infraestrutura Cloud",
    "Arquitetura de Software",
  ],
  authors: [{ name: "Roberto de Moraes Zarzur" }],
  creator: "Roberto de Moraes Zarzur",
  alternates: {
    canonical: "https://robertozarzur.dev",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    description:
      "Lidero times de tecnologia com perfil hands-on: backends em Go, infra cloud AWS/GCP e sistemas de missão crítica para empresas como Hospital Sírio-Libanês e Grupo Bandeirantes.",
    siteName: "Roberto Zarzur",
    url: "https://robertozarzur.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    description:
      "Gerente de TI & Engenheiro de Software: Go, Next.js, Kotlin, AWS, GCP. Hands-on em produção.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://robertozarzur.dev/#person",
      name: "Roberto de Moraes Zarzur",
      jobTitle: "Gerente de TI & Engenheiro de Software",
      description:
        "Gerente de TI com perfil hands-on, atuando na interseção entre liderança estratégica e engenharia de software avançada. Especialista em backends de alta performance, infraestrutura cloud e DevOps.",
      url: "https://robertozarzur.dev",
      image: "https://robertozarzur.dev/opengraph-image",
      sameAs: [
        "https://www.linkedin.com/in/robertomoraeszarzur/",
        "https://github.com/Rdemora2",
      ],
      knowsAbout: [
        "Go (Golang)",
        "Next.js",
        "TypeScript",
        "Kotlin",
        "AWS",
        "GCP",
        "Cloud Architecture",
        "DevOps",
        "Observabilidade",
        "Prometheus",
        "PostgreSQL",
        "Redis",
        "Gestão de TI",
        "Liderança Técnica",
        "Arquitetura de Software",
        "Android TV",
        "Widevine DRM",
      ],
      worksFor: {
        "@type": "Organization",
        name: "Empresa atual",
        url: "https://robertozarzur.dev",
      },
      hasOccupation: [
        {
          "@type": "Occupation",
          name: "Gerente de TI",
          occupationLocation: {
            "@type": "City",
            name: "São Paulo",
          },
          skills: "Go, AWS, GCP, Kotlin, Next.js, DevOps, Cloud Architecture",
        },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://robertozarzur.dev/#service",
      name: "Roberto Zarzur | Consultoria Técnica",
      provider: { "@id": "https://robertozarzur.dev/#person" },
      description:
        "Consultoria em arquitetura de software, infraestrutura cloud, DevOps e liderança técnica para projetos de larga escala.",
      areaServed: ["BR", "US", "MX"],
      serviceType: [
        "Arquitetura de Software",
        "Infraestrutura Cloud",
        "DevOps",
        "Backend Engineering",
        "Liderança Técnica",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://robertozarzur.dev/#website",
      url: "https://robertozarzur.dev",
      name: "Roberto Zarzur | Portfólio",
      author: { "@id": "https://robertozarzur.dev/#person" },
      inLanguage: "pt-BR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GlobalProviders>
          <SuppressWarnings />
          <Noise />
          <CustomCursor />
          <Navigation />
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Pular para o conteúdo principal
          </a>
          {children}
          <Footer />
        </GlobalProviders>
      </body>
    </html>
  );
}
