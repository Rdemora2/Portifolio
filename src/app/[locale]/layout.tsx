import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { SuppressWarnings } from "@/components/shared/SuppressWarnings";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Noise } from "@/components/layout/Noise";
import { GlobalProviders } from "@/components/layout/GlobalProviders";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "../globals.css";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://robertomoraes.dev"),
    title: {
      default: t("title"),
      template: "%s | Roberto Moraes",
    },
    description: t("description"),
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
    authors: [{ name: "Roberto Moraes" }],
    creator: "Roberto Moraes",
    alternates: {
      canonical: `https://robertomoraes.dev/${locale}`,
      languages: {
        pt: "https://robertomoraes.dev/pt",
        en: "https://robertomoraes.dev/en",
        es: "https://robertomoraes.dev/es",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
      title: t("title"),
      description: t("description"),
      siteName: "Roberto Moraes",
      url: `https://robertomoraes.dev/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Nav" });
  const tm = await getTranslations({ locale, namespace: "Metadata" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `https://robertomoraes.dev/${locale}#person`,
        name: "Roberto Moraes",
        jobTitle: tm("title"),
        description: tm("description"),
        url: `https://robertomoraes.dev/${locale}`,
        image: "https://robertomoraes.dev/opengraph-image",
        sameAs: [
          "https://www.linkedin.com/in/robertomoraes/",
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
          name: "Valiant Group do Brasil",
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
        "@id": `https://robertomoraes.dev/${locale}#service`,
        name: `${tm("title")} | Consultoria Técnica`,
        provider: { "@id": `https://robertomoraes.dev/${locale}#person` },
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
        "@id": `https://robertomoraes.dev/${locale}#website`,
        url: `https://robertomoraes.dev/${locale}`,
        name: `Roberto Moraes | ${locale === "pt" ? "Portfólio" : locale === "es" ? "Portafolio" : "Portfolio"}`,
        author: { "@id": `https://robertomoraes.dev/${locale}#person` },
        inLanguage: locale,
      },
    ],
  };

  return (
    <html
      lang={locale}
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <GlobalProviders>
            <a href="#main-content" className="sr-only focus:not-sr-only">
              {t("skipToContent")}
            </a>
            <SuppressWarnings />
            <Noise />
            <CustomCursor />
            <Navigation />
            {children}
            <Footer />
          </GlobalProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
