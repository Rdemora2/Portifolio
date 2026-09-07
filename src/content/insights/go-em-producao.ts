import type { Locale } from "@/i18n.config"
import type {
  ArticleSceneVisual,
  InsightArticle,
  InsightArticleSectionCopy,
} from "./types"

const sharedDate = "2025-03-20"

const productionScenes = [
  { kind: "ingress", focusNode: 0, metricIndex: 0 },
  { kind: "boundaries", focusNode: 1 },
  { kind: "hot-path", focusNode: 1, metricIndex: 1 },
  { kind: "cache-fallback", focusNode: 2, metricIndex: 2 },
  { kind: "telemetry", focusNode: 5 },
  { kind: "security", focusNode: 0 },
  { kind: "recovery", focusNode: 4 },
  { kind: "release", focusNode: 5, metricIndex: 3 },
] as const satisfies readonly ArticleSceneVisual[]

type GoProductionArticleCopy = Omit<InsightArticle, "sections"> & {
  sections: InsightArticleSectionCopy[]
}

const articles = {
  pt: {
    seo: {
      title: "Go em Produção: Arquitetura de Alto Desempenho e Resiliência Hospitalar",
      description:
        "Decisões de arquitetura, cache híbrido (Redis + memória local), RBAC de 4 níveis, observabilidade e alta disponibilidade no backend Go (Fiber/FastHTTP) do Hospital Sírio-Libanês.",
    },
    eyebrow: "Case técnico · Engenharia de backend",
    title: "Go em produção: o que ninguém te conta",
    subtitle:
      "Como projetamos o backend Go (Fiber v2 / FastHTTP) do Hospital Sírio-Libanês para rodar sob carga real com resposta média de 6ms, resiliência no cache e alta disponibilidade.",
    backLabel: "Voltar aos insights",
    publishedLabel: "Publicado em",
    publishedDate: sharedDate,
    readTime: "8 min de leitura",
    tocLabel: "Neste artigo",
    experience: {
      coreLabel: "GO",
      coreCaption: "runtime",
      traceLabel: "Flight recorder · produção",
      chapterLabel: "Cena",
      scrollLabel: "Role para acompanhar a requisição",
      progressLabel: "Progresso de leitura",
      topologyLabel: "Topologia do sistema",
      traceCoordinateLabel: "rastro",
    },
    intro:
      "Este backend foi desenvolvido para sustentar todo o sistema de IPTV e atendimento nos leitos do Hospital Sírio-Libanês (unidades SP e Brasília). Integrando as Smart TVs dos quartos, o ERP hospitalar TASY (via barramento ESB HSL) e a infraestrutura de streaming, o sistema precisava responder em milissegundos sem margem para quedas. Alcançamos isso combinando Fiber/FastHTTP, cache híbrido em duas camadas com fallback transparente, pools de conexão otimizados (pgxpool + sqlc) e uma política rígida de controle de acesso (RBAC).",
    metricsLabel: "Escala observada em produção",
    metrics: [
      { value: "20M+", label: "requisições por mês" },
      { value: "6 ms", label: "tempo médio de resposta" },
      { value: "92%", label: "taxa de acerto no cache (hit rate)" },
      { value: "1k+", label: "commits de engenharia no backend" },
    ],
    architectureLabel: "Visão do sistema",
    architectureTitle: "Uma arquitetura com caminhos de degradação claros",
    architectureDescription:
      "Cada dependência possui timeout, limite de concorrência e alternativa operacional. Se o Redis oscilar, a memória local assume; se o ERP demorar a responder, retentativas inteligentes protegem o sistema.",
    architectureNodes: [
      "Borda HTTP (Fiber v2)",
      "API Go Core",
      "Cache Híbrido (Redis + sync.Map)",
      "PostgreSQL (pgxpool/sqlc)",
      "Plataformas Externas (TASY / IPTV)",
      "Prometheus & Dashboard",
    ],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Contexto",
        title: "Desafios de um ambiente hospitalar crítico",
        intro:
          "Em um hospital, qualquer instabilidade na TV do quarto vira um chamado imediato e afeta a experiência do paciente. O backend precisava integrar o ERP hospitalar e o streaming de vídeo mantendo o sistema leve, rápido e extremamente previsível.",
        items: [
          "Integração bidirecional com o ERP TASY (via ESB HSL) para cadastro, ativação e troca de leitos.",
          "Orquestração de streaming com geração dinâmica de tokens MD5 com salt para liberação de acesso.",
          "Navegação fluida nas Smart TVs Android TV com cache inteligente por endereço MAC.",
          "Painel administrativo interno com autenticação segura via cookies JWT HttpOnly e auditoria detalhada.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Arquitetura",
        title: "Inicialização previsível e limites claros",
        intro:
          "Optamos pelo Fiber v2 (construído sobre FastHTTP) por sua alta capacidade de processamento e baixo consumo de memória. Toda a configuração da aplicação é definida de forma determinística logo na inicialização, antes de abrir o servidor para receber tráfego.",
        items: [
          "Uso de Fiber v2 e FastHTTP com foco em evitar alocações desnecessárias no heap e reaproveitar buffers.",
          "Acesso concorrente ao PostgreSQL via pgx/v5 e pgxpool, usando sqlc para queries tipadas no core e GORM no módulo admin.",
          "Timeouts explícitos em todas as pontas: conexões HTTP, consultas ao banco e chamadas para serviços externos.",
          "Checagens de prontidão (readiness probes) que validam banco e cache antes de liberar a instância para o tráfego.",
        ],
        note:
          "Rejeitar requisições de forma rápida sob sobrecarga extrema é muito melhor do que acumular goroutines até estourar a memória do container.",
      },
      {
        id: "performance",
        eyebrow: "03 · Performance",
        title: "Eficiência máxima na rota principal",
        intro:
          "A rota principal da API (que entrega o catálogo e dados do leito para a TV) responde em menos de 10ms. Conseguimos isso reduzindo alocações de memória e mantendo conexões persistentes abertas.",
        items: [
          "Cliente HTTP customizado (FastHTTP) com pool de conexões por host e limite de 3 tentativas com retentativa inteligente.",
          "Parsing de JSON otimizado com Sonic JSON e código gerado pelo sqlc, eliminando reflexão (reflection) em tempo de execução.",
          "Compressão seletiva e cabeçalhos ETag para economizar banda na rede interna do hospital.",
          "Dashboard de monitoramento e páginas de administração embarcados diretamente no binário compilado do Go via embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Cache",
        title: "Cache híbrido em duas camadas (Redis + sync.Map)",
        intro:
          "O Redis é a nossa primeira camada de cache, mas uma oscilação no Redis jamais pode derrubar o sistema. Por isso, criamos uma arquitetura híbrida com transição automática para memória local.",
        items: [
          "Redis v8 como camada principal, com tempos de expiração (TTL) definidos pela volatilidade de cada dado (ex: 4 min para sessão da TV).",
          "Fallback automático para sync.Map local com rotina de limpeza (janitor) quando o Redis falha ou demora mais de 500ms.",
          "Processo em segundo plano (goroutine) para limpeza preventiva diária no horário de menor movimento (entre 03h e 04h).",
          "Métricas em tempo real acompanhando acertos (hits), erros e latência separados por camada (Redis vs Memória local).",
        ],
        note:
          "Se o Redis oscilar no meio da madrugada, a TV do leito continua funcionando normalmente usando o cache em memória da própria aplicação.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observabilidade",
        title: "Métricas que ajudam a tomar decisões",
        intro:
          "Toda a telemetria é exportada nativamente para o Prometheus e exibida em tempo real em um painel interno servido pelo próprio binário em Go.",
        items: [
          "Histogramas de latência (http_request_duration_seconds) de 0.5ms a 30s com rotas normalizadas.",
          "Métricas específicas para tempo de consulta no banco (db_query_duration_seconds) e chamadas para APIs externas.",
          "Acompanhamento de recursos em tempo real: CPU, memória heap/stack, quantidade de goroutines e pausagens do Garbage Collector.",
          "Painel web responsivo em /pkg/dashboard embutido via embed.FS, sem depender de ferramentas de terceiros.",
        ],
        note:
          "Normalizar os parâmetros das URLs no middleware foi fundamental para evitar o estouro de métricas (cardinalidade) no Prometheus.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Segurança",
        title: "Controle de acesso por papéis (RBAC) e auditoria",
        intro:
          "A segurança é tratada na camada de rotas via middlewares (JWTMiddleware e AuthorizeMiddleware), com papéis de acesso bem definidos e registro imutável de alterações.",
        items: [
          "Sessões administrativas protegidas por cookies HTTP-only, Secure e SameSite, assinadas com JWT (golang-jwt/jwt/v5).",
          "Hierarquia de permissões em 4 níveis (Dev, Suporte, Gestor, Analista) com travas no código para impedir elevação indevida de privilégios.",
          "Histórico detalhado de auditoria (activity_log) no PostgreSQL registrando quem fez a alteração, o tipo de ação e o valor antigo/novo.",
          "Senhas criptografadas com Bcrypt (golang.org/x/crypto/bcrypt) e políticas de rotação de chaves.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Aprendizados práticos tirados da produção",
        intro:
          "Cada ajuste na arquitetura foi fruto de observação e aprendizado prático durante a operação em ambiente hospitalar.",
        items: [
          "Estouro de métricas no Prometheus -> Solução: middleware com padronização rígida do formato das URLs.",
          "Pequenas quedas de conexão com o Redis -> Solução: cache híbrido transparente com fallback imediato para memória local.",
          "Tentativas excessivas de conexão com APIs externas -> Solução: cliente HTTP otimizado com limite de retentativas e tempo de espera gradual.",
          "Inconsistências ao trocar o aparelho de TV -> Solução: verificação prévia do MAC address antes de salvar no banco.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "O que verificar antes de um novo deploy",
        intro:
          "Manter um serviço em Go respondendo em 6ms exige consistência e testes automatizados a cada entrega.",
        items: [
          "Limites dos pools de conexão (banco e Redis) ajustados de acordo com os núcleos de CPU alocados no container.",
          "Teste do mecanismo de fallback do cache simulando a indisponibilidade total do Redis.",
          "Verificação das métricas do Prometheus para garantir que não há parâmetros dinâmicos vazando nas rotas.",
          "Compilação Docker multi-estágio otimizada (-ldflags='-s -w') e testes de carga executados antes da publicação.",
        ],
      },
    ],
    authorRole: "Engenheiro de Software",
    ctaEyebrow: "Arquitetura precisa funcionar fora do diagrama",
    ctaTitle: "A arquitetura fica mais clara quando decisões e resultados aparecem juntos.",
    ctaDescription:
      "Continue pelos estudos de caso para ver como esses mesmos critérios aparecem em outros contextos de produção.",
    ctaLabel: "Explorar projetos",
  },
  en: {
    seo: {
      title: "Go in Production: High-Performance Architecture & Hospital Resilience",
      description:
        "Architecture decisions, two-tier hybrid caching (Redis + sync.Map), 4-tier RBAC, observability, and resilience in Hospital Sírio-Libanês' Go backend (Fiber/FastHTTP) handling over 20M requests/month.",
    },
    eyebrow: "Technical Case Study · Backend Engineering",
    title: "Go in production: what nobody tells you",
    subtitle:
      "How we designed Hospital Sírio-Libanês' Go backend (Fiber v2 / FastHTTP) to operate under real load with 6ms average latency, hybrid cache resilience, and zero downtime.",
    backLabel: "Back to insights",
    publishedLabel: "Published on",
    publishedDate: sharedDate,
    readTime: "8 min read",
    tocLabel: "In this article",
    experience: {
      coreLabel: "GO",
      coreCaption: "runtime",
      traceLabel: "Production flight recorder",
      chapterLabel: "Scene",
      scrollLabel: "Scroll to follow the request",
      progressLabel: "Reading progress",
      topologyLabel: "System topology",
      traceCoordinateLabel: "trace",
    },
    intro:
      "This backend was built to power the bedside IPTV and digital hospitality ecosystem for Hospital Sírio-Libanês (São Paulo and Brasília units). Connecting Android TV Set-Top Boxes, the TASY hospital ERP (via HSL ESB), and the IPTV streaming middleware, the platform required sub-10ms response times without tolerating systemic downtime. The result was achieved through Fiber v2/FastHTTP, a two-tier hybrid cache with graceful fallback, optimized connection pooling (pgxpool + sqlc), and a strict RBAC security matrix.",
    metricsLabel: "Observed production scale",
    metrics: [
      { value: "20M+", label: "requests per month" },
      { value: "6 ms", label: "average response latency" },
      { value: "92%", label: "sustained cache hit rate" },
      { value: "1k+", label: "backend engineering commits" },
    ],
    architectureLabel: "System view",
    architectureTitle: "An architecture with clear degradation paths",
    architectureDescription:
      "Every dependency has an explicit timeout, concurrency limit, and operational fallback. If Redis fails, local memory takes over; if the hospital ERP stumbles, bounded retries protect the service.",
    architectureNodes: [
      "HTTP Edge (Fiber v2)",
      "Go Core API",
      "Hybrid Cache (Redis + sync.Map)",
      "PostgreSQL (pgxpool/sqlc)",
      "External Platforms (TASY / IPTV)",
      "Prometheus & Dashboard",
    ],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Context",
        title: "Real challenges of a hospital ecosystem",
        intro:
          "In a critical hospital setting, bedside TV instability triggers immediate support tickets and impacts patient experience. The backend had to integrate TASY ERP and IPTV streaming middleware while guaranteeing rock-solid predictability.",
        items: [
          "Bidirectional integration with TASY ERP via HSL ESB for patient bed activation, deactivation, and device swap.",
          "IPTV streaming middleware orchestration with dynamic salted MD5 authentication tokens.",
          "Continuous Android TV navigation backed by aggressive MAC address caching.",
          "Internal admin panel secured by HttpOnly JWT cookies with comprehensive audit logging.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Architecture",
        title: "Predictable bootstrap and strict boundaries",
        intro:
          "We chose Fiber v2 (FastHTTP) for its exceptional throughput and near-zero memory allocations. The entire application lifecycle is deterministically configured before accepting incoming traffic.",
        items: [
          "Fiber v2 on FastHTTP leveraging zero-allocation techniques and buffer reuse.",
          "High-concurrency PostgreSQL access via pgx/v5 and pgxpool, using sqlc for core type-safe queries and GORM for admin.",
          "Explicit timeouts at every layer (HTTP Read/Write, DB connection lifetime, and dial timeouts).",
          "Readiness probes validating PostgreSQL and Redis health before routing traffic to new instances.",
        ],
        note:
          "Failing fast under extreme load is far superior to accumulating goroutines until an OOM container kill occurs.",
      },
      {
        id: "performance",
        eyebrow: "03 · Performance",
        title: "Zero-allocation on the hot path",
        intro:
          "The hot read path (delivering IPTV catalogue and bed profiles to Smart TVs) operates in sub-10ms by eliminating heap allocations and reusing persistent connections.",
        items: [
          "Custom high-performance HTTP client (FastHTTP) with per-host connection pools and a 3-retry limit.",
          "Fast JSON parsing via Sonic JSON and sqlc code generation to prevent runtime reflection overhead.",
          "Selective compression and ETag headers to conserve internal hospital network bandwidth.",
          "Monitoring dashboard and HTML templates compiled directly into the Go binary via embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caching",
        title: "Two-Tier Hybrid Caching (Redis + sync.Map)",
        intro:
          "Redis acts as the primary cache layer, but Redis downtime can never bring down patient services. We designed a two-tier hybrid cache with instant local fallback.",
        items: [
          "Primary Redis (v8) pool with volatility-driven TTLs (e.g., 4 min for MAC login cache).",
          "Automatic fallback to local sync.Map with a TTL janitor routine when Redis fails or exceeds 500ms.",
          "Dedicated background goroutine executing daily preventive purges between 03:00 and 04:00 AM.",
          "Real-time hit/miss/error telemetry broken down by tier (Redis vs Local).",
        ],
        note:
          "If the Redis server drops in the middle of the night, bedside TVs keep functioning without disruption using local memory cache.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observability",
        title: "Normalized metrics and embedded Live Dashboard",
        intro:
          "Full telemetry exported natively for Prometheus and visualized in a real-time system dashboard served directly by the Go binary.",
        items: [
          "http_request_duration_seconds histograms with custom latency buckets (0.5ms to 30s) and normalized routes.",
          "Dedicated metrics for database queries (db_query_duration_seconds) and external integrations (ESB/IPTV).",
          "Real-time infrastructure metrics: CPU utilization, heap/stack memory, goroutines, and active pool connections.",
          "Responsive web dashboard served at /pkg/dashboard embedded via embed.FS with zero external dependencies.",
        ],
        note:
          "Mandatory route parameter normalization in middleware prevented metric cardinality explosion in Prometheus.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Security",
        title: "4-Tier RBAC Matrix and Audit Trail",
        intro:
          "Access control is enforced via middleware (JWTMiddleware and AuthorizeMiddleware) with strict roles and immutable audit logging.",
        items: [
          "Admin session cookies (admin_token) protected with HttpOnly, Secure, SameSite, and signed via golang-jwt/jwt/v5.",
          "4-tier RBAC matrix (Dev, Support, Manager, Analyst) with technical guardrails preventing managers from escalating privileges.",
          "PostgreSQL audit log (activity_log) recording actor ID, action type (CREATE/UPDATE/DELETE), target entity, and field deltas.",
          "Employee passwords hashed with Bcrypt (golang.org/x/crypto/bcrypt) and secret rotation policies.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidents",
        title: "Practical lessons learned in production",
        intro:
          "Every bottleneck encountered during hospital operations led to a definitive architectural refactoring.",
        items: [
          "Prometheus metric cardinality explosion -> Solution: strict endpoint normalization middleware.",
          "Redis network blips -> Solution: transparent hybrid cache with instant sync.Map local fallback.",
          "Unbounded ESB retries -> Solution: encapsulated FastHTTP client with exponential backoff and finite attempts.",
          "Bedside TV swap race conditions -> Solution: atomic MAC validation against IPTV middleware API prior to DB persistence.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "What to verify before the next deployment",
        intro:
          "Maintaining a Go API running at 6ms latency requires engineering discipline and continuous automated verification.",
        items: [
          "pgxpool and Redis connection limits tuned against available CPU container cores.",
          "Cache fallback mechanism verified under fault injection (simulated Redis outage).",
          "Prometheus metrics audited for normalized routes with zero dynamic ID leakage in labels.",
          "Multi-stage Docker build compiled with -ldflags='-s -w' and load-tested prior to release.",
        ],
      },
    ],
    authorRole: "Software Engineer",
    ctaEyebrow: "Architecture has to work beyond the diagram",
    ctaTitle: "Architecture becomes clearer when decisions and outcomes appear together.",
    ctaDescription:
      "Continue through the case studies to see how the same criteria appear across other production contexts.",
    ctaLabel: "Explore work",
  },
  es: {
    seo: {
      title: "Go en Producción: Arquitectura de Alto Rendimiento y Resiliencia Hospitalaria",
      description:
        "Decisiones de arquitectura, caché híbrida (Redis + sync.Map), RBAC de 4 niveles, observabilidad y resiliencia en el backend Go (Fiber/FastHTTP) del Hospital Sírio-Libanês que procesa más de 20M de peticiones al mes.",
    },
    eyebrow: "Caso Técnico · Ingeniería Backend",
    title: "Go en producción: lo que nadie te cuenta",
    subtitle:
      "Cómo diseñamos el backend Go (Fiber v2 / FastHTTP) del Hospital Sírio-Libanês para operar bajo carga real con 6ms de latencia media, caché híbrida resiliente y cero downtime.",
    backLabel: "Volver a insights",
    publishedLabel: "Publicado el",
    publishedDate: sharedDate,
    readTime: "8 min de lectura",
    tocLabel: "En este artículo",
    experience: {
      coreLabel: "GO",
      coreCaption: "runtime",
      traceLabel: "Flight recorder · producción",
      chapterLabel: "Escena",
      scrollLabel: "Desplázate para seguir la petición",
      progressLabel: "Progreso de lectura",
      topologyLabel: "Topología del sistema",
      traceCoordinateLabel: "traza",
    },
    intro:
      "Este backend fue diseñado para sostener el ecosistema de IPTV y habitaciones del Hospital Sírio-Libanês (unidades SP y Brasília). Conectando Smart TVs de habitación, el ERP hospitalario TASY (vía ESB HSL) y el middleware de streaming IPTV, la plataforma debía responder en milisegundos sin tolerar fallos sistémicos. El resultado se logró mediante Fiber v2/FastHTTP, caché híbrida de dos capas con fallback degradado, pool de conexiones optimizado (pgxpool + sqlc) y una estricta matriz de seguridad RBAC.",
    metricsLabel: "Escala observada en producción",
    metrics: [
      { value: "20M+", label: "peticiones por mes" },
      { value: "6 ms", label: "latencia media de respuesta" },
      { value: "92%", label: "tasa de acierto de caché sostenida" },
      { value: "1k+", label: "commits de ingeniería backend" },
    ],
    architectureLabel: "Visión del sistema",
    architectureTitle: "Una arquitectura con degradación controlada",
    architectureDescription:
      "Cada dependencia tiene timeout, límite de concurrencia y alternativa operativa. Si Redis falla, la memoria local asume el tráfico; si el ERP hospitalario oscila, los retries con backoff protegen el sistema.",
    architectureNodes: [
      "Borde HTTP (Fiber v2)",
      "API Go Core",
      "Caché Híbrida (Redis + sync.Map)",
      "PostgreSQL (pgxpool/sqlc)",
      "Plataformas Externas (TASY / IPTV)",
      "Prometheus & Dashboard",
    ],
    sections: [
      {
        id: "contexto",
        eyebrow: "01 · Contexto",
        title: "Desafíos reales del ecosistema hospitalario",
        intro:
          "En un entorno hospitalario crítico, la inestabilidad en la TV de habitación genera incidencias inmediatas e impacta la experiencia del paciente. El backend debía integrar el ERP TASY y el middleware de streaming IPTV garantizando la máxima previsibilidad.",
        items: [
          "Integración bidireccional con ERP TASY vía ESB HSL para activación, inactivación y cambio de habitaciones.",
          "Orquestación del middleware IPTV con generación dinámica de tokens MD5 con salt.",
          "Navegación continua en Smart TVs Android TV respaldada por caché agresiva por dirección MAC.",
          "Panel administrativo interno protegido por cookies HTTP-only JWT con auditoría completa.",
        ],
      },
      {
        id: "arquitetura",
        eyebrow: "02 · Arquitectura",
        title: "Bootstrap predecible y límites estrictos",
        intro:
          "Elegimos Fiber v2 (FastHTTP) por su altísimo rendimiento y bajísima asignación de memoria. Todo el ciclo de vida de la aplicación se configura de forma determinista antes de aceptar conexiones.",
        items: [
          "Fiber v2 sobre FastHTTP aprovechando técnicas de zero-allocation y reutilización de buffers.",
          "Acceso a PostgreSQL de alta concurrencia vía pgx/v5 y pgxpool, usando sqlc para consultas type-safe y GORM en admin.",
          "Timeouts explícitos en todas las capas (HTTP Read/Write, vida útil de conexiones DB y timeouts de dial).",
          "Readiness probes verificando la salud de PostgreSQL y Redis antes de enviar tráfico a las nuevas instancias.",
        ],
        note:
          "Rechazar peticiones rápidamente bajo sobrecarga extrema es infinitamente superior a acumular goroutines hasta el OOM kill del contenedor.",
      },
      {
        id: "performance",
        eyebrow: "03 · Rendimiento",
        title: "Zero-allocation en la ruta crítica",
        intro:
          "La ruta rápida de lectura (entregar catálogo y perfil de habitación a las Smart TVs) opera en sub-10ms al eliminar asignaciones de memoria en el heap y reutilizar conexiones.",
        items: [
          "Cliente HTTP de alto rendimiento (FastHTTP) encapsulado con pools por host y límite de 3 reintentos.",
          "Parsing JSON optimizado con Sonic JSON y generadores de código de sqlc para evitar reflexión en runtime.",
          "Soporte para compresión selectiva y cabeceras ETag para ahorrar ancho de banda en la red hospitalaria.",
          "Dashboard de monitoreo y plantillas HTML integrados directamente en el binario Go mediante embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caché",
        title: "Caché híbrida en dos capas (Redis + sync.Map)",
        intro:
          "Redis actúa como capa primaria, pero la caída de Redis nunca debe tumbar la aplicación. Diseñamos un sistema de caché híbrida de dos capas con fallback local instantáneo.",
        items: [
          "Capa primaria en Redis (v8) con TTLs ajustados por volatilidad (ej. 4 min para caché de login MAC).",
          "Fallback automático a sync.Map local con rutina janitor de TTL cuando Redis falla o supera los 500ms.",
          "Goroutine dedicada en background para limpieza preventiva diaria entre las 03:00 y 04:00 AM.",
          "Métricas en tiempo real de aciertos, fallos y errores segregadas por capa (Redis vs Local).",
        ],
        note:
          "Si el servidor Redis cae en mitad de la noche, las TVs de habitación siguen funcionando sin interrupción gracias a la caché local en memoria.",
      },
      {
        id: "observabilidade",
        eyebrow: "05 · Observabilidad",
        title: "Métricas normalizadas y Dashboard integrado",
        intro:
          "Telemetría completa exportada nativamente para Prometheus y visualizada en un panel de control en tiempo real servido por el propio binario Go.",
        items: [
          "Histogramas http_request_duration_seconds con buckets personalizados (0.5ms a 30s) y rutas normalizadas.",
          "Métricas dedicadas de base de datos (db_query_duration_seconds) e integraciones externas (ESB/IPTV).",
          "Métricas de infraestructura en tiempo real: uso de CPU, memoria heap/stack, goroutines y conexiones de pool.",
          "Dashboard web responsivo servido en /pkg/dashboard integrado mediante embed.FS sin dependencias externas.",
        ],
        note:
          "La normalización obligatoria de parámetros de ruta en middleware evitó la explosión de cardinalidad en Prometheus.",
      },
      {
        id: "seguranca",
        eyebrow: "06 · Seguridad",
        title: "Matriz RBAC de 4 niveles y Trilogía de Auditoría",
        intro:
          "El control de acceso se aplica mediante middlewares (JWTMiddleware y AuthorizeMiddleware) con roles estrictos e historial inmutable de acciones.",
        items: [
          "Cookies de sesión admin_token protegidas con HttpOnly, Secure, SameSite y firmadas con golang-jwt/jwt/v5.",
          "Matriz RBAC en 4 niveles (Dev, Soporte, Gestor, Analista) con restricciones técnicas para impedir elevación de privilegios.",
          "Historial de auditoría (activity_log) en PostgreSQL registrando colaborador, acción (CREATE/UPDATE/DELETE), entidad y deltas.",
          "Contraseñas de colaboradores cifradas con Bcrypt (golang.org/x/crypto/bcrypt) y políticas de rotación de claves.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Lecciones prácticas extraídas de producción",
        intro:
          "Cada cuello de botella encontrado durante la operación del sistema hospitalario resultó en una refactorización arquitectónica definitiva.",
        items: [
          "Explosión de cardinalidad en Prometheus -> Solución: middleware de normalización estricta de endpoints.",
          "Caídas de red en Redis -> Solución: caché híbrida transparente con fallback instantáneo a sync.Map local.",
          "Reintentos desordenados en el ESB -> Solución: cliente FastHTTP encapsulado con backoff exponencial y límite finito.",
          "Conflictos en cambio de TV -> Solución: validación atómica de MACs en el middleware de streaming previa a la persistencia.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Lista de Verificación",
        title: "Qué validar antes del próximo despliegue",
        intro:
          "Mantener una API Go operando a 6ms de latencia requiere disciplina e ingeniería de verificación automatizada continua.",
        items: [
          "Límites de pgxpool y conexiones Redis ajustados al número de núcleos CPU disponibles en el contenedor.",
          "Mecanismo de fallback de caché verificado mediante inyección de fallos (caída de Redis simulada).",
          "Métricas de Prometheus auditadas con rutas normalizadas y sin fuga de IDs dinámicos en labels.",
          "Compilación Docker multi-stage optimizada con -ldflags='-s -w' y pruebas de carga previa al lanzamiento.",
        ],
      },
    ],
    authorRole: "Ingeniero de Software",
    ctaEyebrow: "La arquitectura debe funcionar fuera del diagrama",
    ctaTitle: "La arquitectura se vuelve más clara cuando decisiones y resultados aparecen juntos.",
    ctaDescription:
      "Continúa por los casos de estudio para ver cómo estos mismos criterios aparecen en otros contextos de producción.",
    ctaLabel: "Explorar proyectos",
  },
} satisfies Record<Locale, GoProductionArticleCopy>

export function getGoProductionArticle(locale: Locale): InsightArticle {
  const article = articles[locale]

  return {
    ...article,
    seo: { ...article.seo },
    experience: { ...article.experience },
    metrics: article.metrics.map((metric) => ({ ...metric })),
    architectureNodes: [...article.architectureNodes],
    sections: article.sections.map((section, index) => {
      const visual = productionScenes[index]
      if (!visual) {
        throw new Error(`Missing visual scene for article section: ${section.id}`)
      }

      return {
        ...section,
        items: [...section.items],
        visual: { ...visual },
      }
    }),
  }
}
