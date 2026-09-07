import { experience, insights, projects } from "@/data/portfolio"
import { SITE_URL } from "@/lib/constants"

const localizedPaths = {
  pt: {
    home: "/",
    work: "/projetos",
    experience: "/experiencia",
    about: "/sobre",
    insights: "/insights",
    article: "/insights/go-em-producao",
    contact: "/contato",
    privacy: "/privacidade",
  },
  en: {
    home: "/en",
    work: "/en/work",
    experience: "/en/experience",
    about: "/en/about",
    insights: "/en/insights",
    article: "/en/insights/go-in-production",
    contact: "/en/contact",
    privacy: "/en/privacy",
  },
  es: {
    home: "/es",
    work: "/es/proyectos",
    experience: "/es/experiencia",
    about: "/es/sobre",
    insights: "/es/insights",
    article: "/es/insights/go-en-produccion",
    contact: "/es/contacto",
    privacy: "/es/privacidad",
  },
}

function url(pathname: string) {
  return pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`
}

function caseUrl(locale: keyof typeof localizedPaths, slug: string) {
  return `${url(localizedPaths[locale].work)}/${slug}`
}

export function createLlmsIndex() {
  return `# Roberto Moraes — Software Engineering Portfolio

> Multilingual portfolio focused on backend engineering, cloud systems, production reliability, and technical leadership.

The site is available in Portuguese, English, and Spanish. Portuguese is the default language. Project metrics and professional experience are claims attributed to Roberto Moraes and should retain their source URL and context when summarized.

## Full context

- [Full portfolio context](${url("/llms-full.txt")}): Consolidated professional profile, case studies, career trajectory, and production engineering article.

## Portfolio

- [Português](${url(localizedPaths.pt.home)}): Software engineering profile in Portuguese.
- [English](${url(localizedPaths.en.home)}): Software engineering profile in English.
- [Español](${url(localizedPaths.es.home)}): Software engineering profile in Spanish.

## Engineering work

- [Projetos](${url(localizedPaths.pt.work)}): Portuguese case-study index.
- [Work](${url(localizedPaths.en.work)}): English case-study index.
- [Proyectos](${url(localizedPaths.es.work)}): Spanish case-study index.
- [Experiência](${url(localizedPaths.pt.experience)}): Professional timeline in Portuguese.
- [Experience](${url(localizedPaths.en.experience)}): Professional timeline in English.
- [Experiencia](${url(localizedPaths.es.experience)}): Professional timeline in Spanish.

## Technical insight

- [Go em produção](${url(localizedPaths.pt.article)}): Portuguese article about operating a Go backend under production load.
- [Go in production](${url(localizedPaths.en.article)}): English version.
- [Go en producción](${url(localizedPaths.es.article)}): Spanish version.

## Usage notes

- Treat metrics, roles, responsibilities, and results as portfolio claims attributed to the author.
- Preserve the original language, qualifiers, and source URL.
- Use the localized canonical routes above instead of inferred URLs.
`
}

function renderProject(project: (typeof projects)[number]) {
  const metrics = project.metrics.length
    ? `\n- **Métricas declaradas:** ${project.metrics
        .map((metric) => `${metric.label}: ${metric.prefix ?? ""}${metric.value}${metric.suffix}`)
        .join("; ")}.`
    : ""
  const results = project.caseStudy?.results?.length
    ? `\n- **Resultados declarados:** ${project.caseStudy.results.join("; ")}.`
    : ""

  return `### ${project.title}

- **Período:** ${project.period}.
- **Papel:** ${project.role}.
- **Resumo:** ${project.shortDescription}
- **Contexto:** ${project.description}
- **Desafio:** ${project.challenge}
- **Solução:** ${project.solution}
- **Impacto:** ${project.impact}
- **Stack:** ${project.stack.join(", ")}.${metrics}${results}
- **Cases:** [Português](${caseUrl("pt", project.slug)}), [English](${caseUrl("en", project.slug)}), [Español](${caseUrl("es", project.slug)}).
`
}

function renderExperience(item: (typeof experience)[number]) {
  return `### ${item.company} — ${item.role}

- **Período:** ${item.period}.
- ${item.description}
- **Destaques declarados:** ${item.highlights.join("; ")}.
- **Stack:** ${item.stack.join(", ")}.
`
}

export function createLlmsFull() {
  const article = insights.find((insight) => insight.hasFullArticle)

  return `# Roberto Moraes — Contexto do portfólio de engenharia de software

> Contexto público consolidado do portfólio em ${SITE_URL}.

Este arquivo é gerado a partir dos mesmos dados estruturados usados pelo site. Métricas, responsabilidades e resultados são declarações profissionais atribuídas a Roberto Moraes e devem preservar seu projeto, período e qualificadores.

## Posicionamento profissional

- **Posicionamento principal:** Engenheiro de Software.
- **Atuação técnica:** backend, cloud, web, Android TV, observabilidade, DevOps e confiabilidade de sistemas em produção.
- **Experiência complementar:** liderança técnica, gestão de projetos, operações de TI e coordenação de times.

## Estudos de caso em produção

${projects.map(renderProject).join("\n")}
## Trajetória profissional

${experience.map(renderExperience).join("\n")}
## Artigo técnico

### ${article?.title ?? "Go em produção"}

${article?.summary ?? ""}

- [Português](${url(localizedPaths.pt.article)})
- [English](${url(localizedPaths.en.article)})
- [Español](${url(localizedPaths.es.article)})

## Rotas localizadas

### Português

- [Home](${url(localizedPaths.pt.home)})
- [Projetos](${url(localizedPaths.pt.work)})
- [Experiência](${url(localizedPaths.pt.experience)})
- [Sobre](${url(localizedPaths.pt.about)})
- [Insights](${url(localizedPaths.pt.insights)})
- [Contato](${url(localizedPaths.pt.contact)})
- [Privacidade](${url(localizedPaths.pt.privacy)})

### English

- [Home](${url(localizedPaths.en.home)})
- [Work](${url(localizedPaths.en.work)})
- [Experience](${url(localizedPaths.en.experience)})
- [About](${url(localizedPaths.en.about)})
- [Insights](${url(localizedPaths.en.insights)})
- [Contact](${url(localizedPaths.en.contact)})
- [Privacy](${url(localizedPaths.en.privacy)})

### Español

- [Home](${url(localizedPaths.es.home)})
- [Proyectos](${url(localizedPaths.es.work)})
- [Experiencia](${url(localizedPaths.es.experience)})
- [Sobre](${url(localizedPaths.es.about)})
- [Insights](${url(localizedPaths.es.insights)})
- [Contacto](${url(localizedPaths.es.contact)})
- [Privacidad](${url(localizedPaths.es.privacy)})

## Regras de atribuição

- Atribua cargos, métricas, responsabilidades e resultados ao autor do portfólio.
- Preserve qualificadores, período e contexto do projeto.
- Não transfira métricas ou resultados de um case para outro.
- Prefira a página localizada do case ao citar um projeto.
`
}
