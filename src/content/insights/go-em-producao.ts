import type { Locale } from "@/i18n.config"

export type ArticleSection = {
  id: string
  eyebrow: string
  title: string
  intro: string
  items: string[]
  note?: string
}

export type GoProductionArticle = {
  seo: {
    title: string
    description: string
  }
  eyebrow: string
  title: string
  subtitle: string
  backLabel: string
  publishedLabel: string
  publishedDate: string
  readTime: string
  tocLabel: string
  intro: string
  metricsLabel: string
  metrics: Array<{ value: string; label: string }>
  architectureLabel: string
  architectureTitle: string
  architectureDescription: string
  architectureNodes: string[]
  sections: ArticleSection[]
  authorRole: string
  ctaEyebrow: string
  ctaTitle: string
  ctaDescription: string
  ctaLabel: string
}

const sharedDate = "2025-03-20"

const articles = {
  pt: {
    seo: {
      title: "Go em produção",
      description:
        "Decisões de arquitetura, cache, observabilidade e confiabilidade em uma API Go que processa mais de 20 milhões de requisições por mês.",
    },
    eyebrow: "Case técnico · Engenharia de backend",
    title: "Go em produção",
    subtitle:
      "O que aprendi operando uma API Go sob carga real — e quais decisões mantiveram latência, custo e confiabilidade sob controle.",
    backLabel: "Voltar aos insights",
    publishedLabel: "Publicado em",
    publishedDate: sharedDate,
    readTime: "8 min de leitura",
    tocLabel: "Neste artigo",
    intro:
      "Este backend nasceu para um domínio sensível de hospitalidade digital em ambiente hospitalar. A plataforma integra serviços externos, streaming protegido e um backoffice com controle granular. O resultado não veio de um truque isolado, mas de limites explícitos, observabilidade útil e decisões operacionais consistentes.",
    metricsLabel: "Escala observada em produção",
    metrics: [
      { value: "20M+", label: "requisições por mês" },
      { value: "6 ms", label: "latência média reportada" },
      { value: "92%", label: "cache hit rate" },
      { value: "1k+", label: "commits no backend" },
    ],
    architectureLabel: "Visão de sistema",
    architectureTitle: "Uma arquitetura com caminhos de degradação claros",
    architectureDescription:
      "Cada dependência tem timeout, limite e alternativa operacional. O objetivo não é impedir toda falha, mas evitar que uma falha local se transforme em indisponibilidade sistêmica.",
    architectureNodes: ["Borda HTTP", "API Go / Fiber", "Redis + cache local", "PostgreSQL", "Serviços externos", "Prometheus"],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Contexto",
        title: "Carga real muda as perguntas",
        intro:
          "Em laboratório, throughput costuma dominar a conversa. Em produção, previsibilidade e capacidade de explicar o comportamento do sistema importam tanto quanto velocidade.",
        items: [
          "Integrações externas com latências e taxas de erro fora do nosso controle.",
          "Área administrativa com autenticação por cookie e permissões explícitas.",
          "Observabilidade suficiente para diagnosticar causa, não apenas sintoma.",
          "Cache híbrido para reduzir custo sem transformar Redis em ponto único de falha.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Arquitetura",
        title: "Limites antes de escala",
        intro:
          "O bootstrap define o envelope operacional: pools, timeouts, concorrência e health checks são configurados antes que a primeira requisição seja aceita.",
        items: [
          "GOMAXPROCS e coleta de lixo ajustados ao perfil real de CPU e memória.",
          "Pool PostgreSQL com limites de abertura, ociosidade e vida útil.",
          "Servidor HTTP com body limit, buffers e timeouts deliberadamente finitos.",
          "Inicialização com readiness: a instância só recebe tráfego quando suas dependências essenciais estão prontas.",
        ],
        note:
          "Fila infinita não é resiliência. Sob pico, rejeitar cedo e recuperar rápido é melhor do que acumular trabalho até o processo colapsar.",
      },
      {
        id: "performance",
        eyebrow: "03 · Performance",
        title: "O caminho quente precisa ser simples",
        intro:
          "A maior parte do ganho veio de remover trabalho, controlar alocações e impedir que dependências lentas ocupassem recursos indefinidamente.",
        items: [
          "Serialização eficiente com validação na fronteira e buffers reutilizáveis.",
          "HTTP client compartilhado, pooling de conexões e timeouts por etapa.",
          "Compressão e ETag aplicados quando o custo total justificava o ganho.",
          "Medição por rota para otimizar somente os pontos que apareciam no perfil real.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Cache",
        title: "Cache é uma estratégia de disponibilidade",
        intro:
          "Redis reduz o read path, mas não deve controlar sozinho a disponibilidade da API. O desenho inclui fallback local e TTLs coerentes com a volatilidade de cada dado.",
        items: [
          "Redis como camada primária, com TTL e política de invalidação explícitos.",
          "Cache local limitado para manter respostas essenciais durante oscilações.",
          "Chaves versionadas e métricas de hit, miss, erro e latência.",
          "Eviction previsível para impedir crescimento silencioso de memória.",
        ],
        note:
          "Quando Redis falha, a plataforma degrada capacidade; ela não deveria desaparecer.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observabilidade",
        title: "Métricas precisam responder perguntas",
        intro:
          "Dashboards foram desenhados a partir de decisões operacionais: devo escalar, limitar, reverter ou investigar uma dependência?",
        items: [
          "Histogramas de latência e contadores de resultado por rota normalizada.",
          "Tamanho de request e response para detectar payloads anormais.",
          "Sinais do runtime: CPU, heap, goroutines e pausas de GC.",
          "SLOs e alertas orientados ao impacto, evitando ruído sem ação possível.",
        ],
        note:
          "Normalizar parâmetros de rota evitou cardinalidade descontrolada e manteve o Prometheus utilizável durante incidentes.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Segurança",
        title: "Controles próximos da fronteira",
        intro:
          "A área administrativa usa sessão protegida e RBAC explícito. Autorização permanece no servidor, próxima da operação que protege.",
        items: [
          "Cookies HttpOnly, Secure e SameSite de acordo com o fluxo.",
          "Permissões declarativas e trilha de auditoria para operações sensíveis.",
          "Limites de payload e validação antes da lógica de negócio.",
          "Ferramentas de diagnóstico expostas somente em ambientes controlados.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Os erros que mudaram o desenho",
        intro:
          "Os melhores padrões da plataforma surgiram de falhas observadas. Cada incidente virou uma mudança verificável no sistema, não apenas documentação.",
        items: [
          "Cardinalidade de métricas levou à normalização obrigatória de labels.",
          "Dependência total do Redis levou ao fallback local limitado.",
          "Retries sem orçamento levaram a backoff, jitter e limite de tentativas.",
          "Logging excessivo levou a amostragem e níveis orientados ao ambiente.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "O que eu verificaria antes do próximo deploy",
        intro:
          "Performance sustentável é uma propriedade do sistema inteiro e precisa ser protegida por automação.",
        items: [
          "Timeouts, pools e limites de corpo cobertos por testes de contrato.",
          "Cache com fallback, TTL, eviction e telemetria verificáveis.",
          "Rotas normalizadas e alertas ligados a SLOs claros.",
          "Readiness, rollback e teste de carga representativo antes do release.",
        ],
      },
    ],
    authorRole: "Engenheiro de Software & Gerente de TI",
    ctaEyebrow: "Arquitetura precisa funcionar fora do diagrama",
    ctaTitle: "Quer discutir um sistema que precisa operar com confiabilidade em produção?",
    ctaDescription:
      "Posso ajudar a transformar requisitos de escala, confiabilidade e custo em decisões de engenharia mensuráveis.",
    ctaLabel: "Conversar sobre o projeto",
  },
  en: {
    seo: {
      title: "Go in production",
      description:
        "Architecture, caching, observability, and reliability decisions behind a Go API processing over 20 million requests per month.",
    },
    eyebrow: "Technical case study · Backend engineering",
    title: "Go in production",
    subtitle:
      "What I learned operating a Go API under real load — and the decisions that kept latency, cost, and reliability under control.",
    backLabel: "Back to insights",
    publishedLabel: "Published on",
    publishedDate: sharedDate,
    readTime: "8 min read",
    tocLabel: "In this article",
    intro:
      "This backend was built for a sensitive digital hospitality domain in a hospital environment. The platform integrates external services, DRM-protected streaming, and an administrative back office with granular access control. Its performance came from explicit limits, useful observability, and consistent operational decisions—not from a single trick.",
    metricsLabel: "Observed production scale",
    metrics: [
      { value: "20M+", label: "requests per month" },
      { value: "6 ms", label: "reported average latency" },
      { value: "92%", label: "cache hit rate" },
      { value: "1k+", label: "backend commits" },
    ],
    architectureLabel: "System view",
    architectureTitle: "An architecture with clear degradation paths",
    architectureDescription:
      "Every dependency has a timeout, a limit, and an operational alternative. The goal is not to prevent every failure, but to stop a local failure from becoming systemic downtime.",
    architectureNodes: ["HTTP edge", "Go / Fiber API", "Redis + local cache", "PostgreSQL", "External services", "Prometheus"],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Context",
        title: "Real load changes the questions",
        intro:
          "In a lab, throughput tends to dominate the discussion. In production, predictability and the ability to explain system behavior matter just as much as raw speed.",
        items: [
          "External integrations with latency and error rates outside our control.",
          "An administrative area with cookie-based sessions and explicit permissions.",
          "Enough observability to diagnose causes instead of symptoms.",
          "Hybrid caching that lowers cost without turning Redis into a single point of failure.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Architecture",
        title: "Limits before scale",
        intro:
          "The bootstrap defines the operating envelope: pools, timeouts, concurrency, and health checks are configured before the first request is accepted.",
        items: [
          "GOMAXPROCS and garbage collection tuned against real CPU and memory profiles.",
          "A PostgreSQL pool with explicit open, idle, and lifetime limits.",
          "An HTTP server with finite body limits, buffers, and timeouts.",
          "Readiness gates that keep an instance out of rotation until essential dependencies are ready.",
        ],
        note:
          "An infinite queue is not resilience. Under a spike, rejecting early and recovering quickly beats accumulating work until the process collapses.",
      },
      {
        id: "performance",
        eyebrow: "03 · Performance",
        title: "Keep the hot path simple",
        intro:
          "Most gains came from removing work, controlling allocations, and preventing slow dependencies from holding resources indefinitely.",
        items: [
          "Efficient serialization with validation at the boundary and reusable buffers.",
          "Shared HTTP clients, connection pooling, and timeouts for each stage.",
          "Compression and ETag only where total cost justified the benefit.",
          "Per-route profiling so optimization followed production evidence.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caching",
        title: "Caching is an availability strategy",
        intro:
          "Redis shortens the read path, but it should not single-handedly control API availability. The design includes a bounded local fallback and TTLs aligned with data volatility.",
        items: [
          "Redis as the primary layer, with explicit TTL and invalidation policies.",
          "A bounded local cache for essential responses during instability.",
          "Versioned keys and hit, miss, error, and latency metrics.",
          "Predictable eviction to prevent silent memory growth.",
        ],
        note: "When Redis fails, the platform should lose capacity—not disappear.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observability",
        title: "Metrics must answer questions",
        intro:
          "Dashboards were designed around operational decisions: should we scale, limit, roll back, or investigate a dependency?",
        items: [
          "Latency histograms and outcome counters by normalized route.",
          "Request and response sizes to detect abnormal payloads.",
          "Runtime signals: CPU, heap, goroutines, and GC pauses.",
          "Impact-oriented SLOs and alerts that avoid unactionable noise.",
        ],
        note:
          "Normalizing route parameters prevented unbounded cardinality and kept Prometheus usable during incidents.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Security",
        title: "Controls close to the boundary",
        intro:
          "The administrative area uses protected sessions and explicit RBAC. Authorization remains on the server, close to the operation it protects.",
        items: [
          "HttpOnly, Secure, and SameSite cookies matched to the flow.",
          "Declarative permissions and an audit trail for sensitive operations.",
          "Payload limits and validation before business logic.",
          "Diagnostic tools exposed only in controlled environments.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidents",
        title: "The mistakes that changed the design",
        intro:
          "The platform's strongest patterns came from observed failures. Every incident became a verifiable system change, not just documentation.",
        items: [
          "Metric cardinality led to mandatory label normalization.",
          "Total Redis dependency led to a bounded local fallback.",
          "Unbudgeted retries led to backoff, jitter, and attempt limits.",
          "Excessive logging led to sampling and environment-aware levels.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "What I would verify before the next deploy",
        intro:
          "Sustainable performance is a property of the whole system, and automation must protect it.",
        items: [
          "Timeouts, pools, and body limits covered by contract tests.",
          "Caching with verifiable fallback, TTL, eviction, and telemetry.",
          "Normalized routes and alerts linked to clear SLOs.",
          "Readiness, rollback, and representative load testing before release.",
        ],
      },
    ],
    authorRole: "Software Engineer & IT Manager",
    ctaEyebrow: "Architecture has to work beyond the diagram",
    ctaTitle: "Need a system that stays reliable under production load?",
    ctaDescription:
      "I can help turn scale, reliability, and cost requirements into measurable engineering decisions.",
    ctaLabel: "Discuss the project",
  },
  es: {
    seo: {
      title: "Go en producción",
      description:
        "Decisiones de arquitectura, caché, observabilidad y confiabilidad detrás de una API Go que procesa más de 20 millones de peticiones al mes.",
    },
    eyebrow: "Caso técnico · Ingeniería backend",
    title: "Go en producción",
    subtitle:
      "Lo que aprendí operando una API Go con carga real y las decisiones que mantuvieron bajo control la latencia, el costo y la confiabilidad.",
    backLabel: "Volver a insights",
    publishedLabel: "Publicado el",
    publishedDate: sharedDate,
    readTime: "8 min de lectura",
    tocLabel: "En este artículo",
    intro:
      "Este backend nació para un dominio sensible de hospitalidad digital en un entorno hospitalario. La plataforma integra servicios externos, streaming protegido y un backoffice con control granular. El resultado no vino de un truco aislado, sino de límites explícitos, observabilidad útil y decisiones operativas consistentes.",
    metricsLabel: "Escala observada en producción",
    metrics: [
      { value: "20M+", label: "peticiones por mes" },
      { value: "6 ms", label: "latencia media reportada" },
      { value: "92%", label: "cache hit rate" },
      { value: "1k+", label: "commits en el backend" },
    ],
    architectureLabel: "Visión del sistema",
    architectureTitle: "Una arquitectura con degradación controlada",
    architectureDescription:
      "Cada dependencia tiene un timeout, un límite y una alternativa operativa. El objetivo no es impedir todo fallo, sino evitar que un fallo local se convierta en una indisponibilidad sistémica.",
    architectureNodes: ["Borde HTTP", "API Go / Fiber", "Redis + caché local", "PostgreSQL", "Servicios externos", "Prometheus"],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Contexto",
        title: "La carga real cambia las preguntas",
        intro:
          "En laboratorio, el throughput suele dominar la conversación. En producción, la previsibilidad y la capacidad de explicar el comportamiento importan tanto como la velocidad.",
        items: [
          "Integraciones externas con latencias y errores fuera de nuestro control.",
          "Un área administrativa con sesión por cookie y permisos explícitos.",
          "Observabilidad suficiente para diagnosticar causas y no solo síntomas.",
          "Caché híbrida que reduce costo sin convertir Redis en un punto único de fallo.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Arquitectura",
        title: "Límites antes que escala",
        intro:
          "El arranque define el espacio operativo: pools, timeouts, concurrencia y health checks se configuran antes de aceptar la primera petición.",
        items: [
          "GOMAXPROCS y garbage collection ajustados con perfiles reales de CPU y memoria.",
          "Pool PostgreSQL con límites explícitos de apertura, inactividad y vida útil.",
          "Servidor HTTP con body limit, buffers y timeouts finitos.",
          "Readiness que impide recibir tráfico antes de que las dependencias esenciales estén listas.",
        ],
        note:
          "Una cola infinita no es resiliencia. Ante un pico, rechazar pronto y recuperarse rápido es mejor que acumular trabajo hasta colapsar.",
      },
      {
        id: "performance",
        eyebrow: "03 · Rendimiento",
        title: "El camino crítico debe ser simple",
        intro:
          "La mayor parte de la mejora vino de eliminar trabajo, controlar asignaciones e impedir que dependencias lentas ocuparan recursos indefinidamente.",
        items: [
          "Serialización eficiente, validación en la frontera y buffers reutilizables.",
          "Clientes HTTP compartidos, pooling de conexiones y timeout por etapa.",
          "Compresión y ETag solo cuando el costo total justificaba el beneficio.",
          "Medición por ruta para optimizar a partir de evidencia de producción.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caché",
        title: "La caché es una estrategia de disponibilidad",
        intro:
          "Redis reduce el read path, pero no debe controlar por sí solo la disponibilidad. El diseño incluye fallback local limitado y TTLs acordes con la volatilidad de los datos.",
        items: [
          "Redis como capa principal, con TTL e invalidación explícitos.",
          "Caché local limitada para respuestas esenciales durante inestabilidad.",
          "Claves versionadas y métricas de hit, miss, error y latencia.",
          "Eviction previsible para impedir crecimiento silencioso de memoria.",
        ],
        note: "Cuando Redis falla, la plataforma debe perder capacidad, no desaparecer.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observabilidad",
        title: "Las métricas deben responder preguntas",
        intro:
          "Los dashboards fueron diseñados a partir de decisiones operativas: ¿debemos escalar, limitar, revertir o investigar una dependencia?",
        items: [
          "Histogramas de latencia y resultados por ruta normalizada.",
          "Tamaño de request y response para detectar payloads anómalos.",
          "Señales del runtime: CPU, heap, goroutines y pausas de GC.",
          "SLOs y alertas orientados al impacto, sin ruido imposible de accionar.",
        ],
        note:
          "Normalizar parámetros de ruta evitó cardinalidad descontrolada y mantuvo Prometheus utilizable durante incidentes.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Seguridad",
        title: "Controles cerca de la frontera",
        intro:
          "El área administrativa usa sesiones protegidas y RBAC explícito. La autorización permanece en el servidor, cerca de la operación que protege.",
        items: [
          "Cookies HttpOnly, Secure y SameSite adaptadas al flujo.",
          "Permisos declarativos y auditoría para operaciones sensibles.",
          "Límites de payload y validación antes de la lógica de negocio.",
          "Herramientas de diagnóstico expuestas solo en entornos controlados.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Los errores que cambiaron el diseño",
        intro:
          "Los patrones más fuertes surgieron de fallos observados. Cada incidente se convirtió en un cambio verificable, no solo en documentación.",
        items: [
          "La cardinalidad de métricas llevó a normalizar labels obligatoriamente.",
          "La dependencia total de Redis llevó a un fallback local limitado.",
          "Los retries sin presupuesto llevaron a backoff, jitter y límites.",
          "El logging excesivo llevó a muestreo y niveles según el entorno.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "Lo que verificaría antes del próximo deploy",
        intro:
          "El rendimiento sostenible es una propiedad de todo el sistema y debe estar protegido por automatización.",
        items: [
          "Timeouts, pools y body limits cubiertos por pruebas de contrato.",
          "Caché con fallback, TTL, eviction y telemetría verificables.",
          "Rutas normalizadas y alertas vinculadas a SLOs claros.",
          "Readiness, rollback y prueba de carga representativa antes del release.",
        ],
      },
    ],
    authorRole: "Ingeniero de Software & Gerente de TI",
    ctaEyebrow: "La arquitectura debe funcionar fuera del diagrama",
    ctaTitle: "¿Hablamos de un sistema que debe resistir producción?",
    ctaDescription:
      "Puedo ayudar a convertir requisitos de escala, confiabilidad y costo en decisiones de ingeniería medibles.",
    ctaLabel: "Hablar del proyecto",
  },
} satisfies Record<Locale, GoProductionArticle>

export function getGoProductionArticle(locale: Locale): GoProductionArticle {
  return articles[locale]
}
