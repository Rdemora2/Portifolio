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
      title: "Go em produção: arquitetura, cache e operação",
      description:
        "Decisões de arquitetura, cache híbrido (Redis + memória local), RBAC de 4 níveis, observabilidade e alta disponibilidade no backend Go (Fiber/FastHTTP) do Hospital Sírio-Libanês.",
    },
    eyebrow: "Case técnico · Engenharia de backend",
    title: "Go em produção: arquitetura, cache e operação",
    subtitle:
      "As escolhas de arquitetura, cache e observabilidade no backend Go do Hospital Sírio-Libanês, que registra mais de 20 milhões de requisições por mês.",
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
      "O backend integra as TVs dos quartos, o ERP Tasy e a infraestrutura de streaming nas unidades de São Paulo e Brasília. Este artigo descreve as decisões para limitar o custo das requisições, lidar com falhas nas integrações e acompanhar o serviço em produção. A resposta média de 6 ms se refere à API, não ao tempo completo de navegação ou reprodução na TV.",
    metricsLabel: "Escala observada em produção",
    metrics: [
      { value: "20M+", label: "requisições por mês" },
      { value: "6 ms", label: "resposta média da API" },
      { value: "92%", label: "taxa de acerto no cache (hit rate)" },
      { value: "1k+", label: "commits de engenharia no backend" },
    ],
    architectureLabel: "Visão do sistema",
    architectureTitle: "Uma arquitetura com caminhos de degradação claros",
    architectureDescription:
      "Timeouts e limites de retentativa delimitam o tempo gasto nas integrações. O cache combina Redis e memória local para reduzir a dependência de uma única camada durante falhas.",
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
        title: "Menos trabalho na rota principal",
        intro:
          "A rota que entrega o catálogo e os dados do leito concentra o esforço de otimização. Reduzimos alocações de memória, reutilizamos conexões e acompanhamos a latência para avaliar o resultado.",
        items: [
          "Cliente HTTP customizado (FastHTTP) com pool de conexões por host e limite de 3 tentativas com retentativa inteligente.",
          "Processamento de JSON com Sonic JSON e consultas tipadas geradas pelo sqlc, reduzindo trabalho repetitivo no caminho da requisição.",
          "Compressão seletiva e cabeçalhos ETag para economizar banda na rede interna do hospital.",
          "Dashboard de monitoramento e páginas de administração embarcados diretamente no binário compilado do Go via embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Cache",
        title: "Cache híbrido em duas camadas (Redis + sync.Map)",
        intro:
          "O Redis é a camada principal de cache. Para lidar com indisponibilidade ou respostas lentas, a aplicação também utiliza memória local, com regras de expiração e limpeza.",
        items: [
          "Redis v8 como camada principal, com tempos de expiração (TTL) definidos pela volatilidade de cada dado (ex: 4 min para sessão da TV).",
          "Fallback automático para sync.Map local com rotina de limpeza (janitor) quando o Redis falha ou demora mais de 500ms.",
          "Processo em segundo plano (goroutine) para limpeza preventiva diária no horário de menor movimento (entre 03h e 04h).",
          "Métricas em tempo real acompanhando acertos (hits), erros e latência separados por camada (Redis vs Memória local).",
        ],
        note:
          "O fallback reduz a dependência do Redis, mas a memória pertence a cada instância. A validade dos dados e a capacidade dessa camada também precisam entrar na análise de falhas.",
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
          "Acompanhamento de CPU, memória heap/stack, quantidade de goroutines e pausas do coletor de lixo.",
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
          "O controle de acesso fica nos middlewares JWTMiddleware e AuthorizeMiddleware. Os papéis delimitam as ações permitidas, e os registros de auditoria ajudam a investigar alterações.",
        items: [
          "Sessões administrativas protegidas por cookies HTTP-only, Secure e SameSite, assinadas com JWT (golang-jwt/jwt/v5).",
          "Hierarquia de permissões em 4 níveis (Dev, Suporte, Gestor, Analista) com travas no código para impedir elevação indevida de privilégios.",
          "Histórico detalhado de auditoria (activity_log) no PostgreSQL registrando quem fez a alteração, o tipo de ação e o valor antigo/novo.",
          "Senhas armazenadas como hashes bcrypt (golang.org/x/crypto/bcrypt), com políticas de rotação de chaves para os demais segredos.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Aprendizados práticos tirados da produção",
        intro:
          "Cada ajuste na arquitetura foi fruto de observação e aprendizado prático durante a operação em ambiente hospitalar.",
        items: [
          "Estouro de métricas no Prometheus → Solução: middleware com padronização rígida do formato das URLs.",
          "Pequenas quedas de conexão com o Redis → Solução: cache híbrido transparente com fallback automático para memória local.",
          "Tentativas excessivas de conexão com APIs externas → Solução: cliente HTTP otimizado com limite de retentativas e tempo de espera gradual.",
          "Inconsistências ao trocar o aparelho de TV → Solução: verificação prévia do MAC address antes de salvar no banco.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "O que verificar antes de um novo deploy",
        intro:
          "Antes de publicar, revisamos os limites operacionais, simulamos falhas e verificamos o comportamento sob carga. A média de latência, sozinha, não descreve todos os cenários do serviço.",
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
      title: "Go in production: architecture, caching, and operations",
      description:
        "Architecture decisions, two-tier hybrid caching (Redis + sync.Map), 4-tier RBAC, observability, and resilience in Hospital Sírio-Libanês' Go backend (Fiber/FastHTTP) handling over 20M requests/month.",
    },
    eyebrow: "Technical Case Study · Backend Engineering",
    title: "Go in production: architecture, caching, and operations",
    subtitle:
      "Architecture, caching, and observability choices in Hospital Sírio-Libanês’ Go backend, which handles over 20 million requests per month.",
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
      "The backend connects bedside TVs, the Tasy ERP, and streaming infrastructure at the São Paulo and Brasília sites. This article covers decisions to limit request cost, handle integration failures, and observe the service in production. The 6 ms average response refers to the API, not the complete TV navigation or playback experience.",
    metricsLabel: "Observed production scale",
    metrics: [
      { value: "20M+", label: "requests per month" },
      { value: "6 ms", label: "average API response" },
      { value: "92%", label: "sustained cache hit rate" },
      { value: "1k+", label: "backend engineering commits" },
    ],
    architectureLabel: "System view",
    architectureTitle: "An architecture with clear degradation paths",
    architectureDescription:
      "Timeouts and retry limits bound the time spent on integrations. The cache combines Redis and local memory to reduce dependence on a single layer during failures.",
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
          "An unstable bedside TV creates support work and affects the patient experience. The backend needed to integrate Tasy and IPTV streaming while keeping resource use and failure behavior predictable.",
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
          "We chose Fiber v2 and FastHTTP with a focus on throughput and memory use. Application configuration is established at startup, before the service accepts traffic.",
        items: [
          "Fiber v2 and FastHTTP with buffer reuse to reduce unnecessary allocations.",
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
        title: "Less work on the main request path",
        intro:
          "The route serving the catalogue and bed data is the focus of optimization. We reduced memory allocations, reused connections, and tracked latency to evaluate the result.",
        items: [
          "Custom high-performance HTTP client (FastHTTP) with per-host connection pools and a 3-retry limit.",
          "JSON processing with Sonic JSON and typed queries generated by sqlc, reducing repetitive work on the request path.",
          "Selective compression and ETag headers to conserve internal hospital network bandwidth.",
          "Monitoring dashboard and HTML templates compiled directly into the Go binary via embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caching",
        title: "Two-Tier Hybrid Caching (Redis + sync.Map)",
        intro:
          "Redis is the primary cache layer. To handle outages or slow responses, the application also uses local memory, with expiration and cleanup rules.",
        items: [
          "Primary Redis (v8) pool with volatility-driven TTLs (e.g., 4 min for MAC login cache).",
          "Automatic fallback to local sync.Map with a TTL janitor routine when Redis fails or exceeds 500ms.",
          "Dedicated background goroutine executing daily preventive purges between 03:00 and 04:00 AM.",
          "Real-time hit/miss/error telemetry broken down by tier (Redis vs Local).",
        ],
        note:
          "Fallback reduces dependence on Redis, but memory belongs to each instance. Data validity and the capacity of this layer also need to be considered when evaluating failures.",
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
          "JWTMiddleware and AuthorizeMiddleware enforce access control. Roles define permitted actions, and audit records support investigations into changes.",
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
          "Production incidents informed changes to request limits, caching, and instrumentation. These are the issues and responses that shaped the service.",
        items: [
          "Prometheus metric cardinality explosion → Solution: strict endpoint normalization middleware.",
          "Redis network blips → Solution: transparent hybrid cache with automatic sync.Map local fallback.",
          "Unbounded ESB retries → Solution: encapsulated FastHTTP client with exponential backoff and finite attempts.",
          "Inconsistencies when replacing a TV → response: check the MAC address before persisting the device in the database.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Checklist",
        title: "What to verify before the next deployment",
        intro:
          "Before release, we review operational limits, simulate failures, and check behavior under load. Average latency alone does not describe every service condition.",
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
      title: "Go en producción: arquitectura, caché y operación",
      description:
        "Decisiones de arquitectura, caché híbrida (Redis + sync.Map), RBAC de 4 niveles, observabilidad y resiliencia en el backend Go (Fiber/FastHTTP) del Hospital Sírio-Libanês que procesa más de 20M de peticiones al mes.",
    },
    eyebrow: "Caso Técnico · Ingeniería Backend",
    title: "Go en producción: arquitectura, caché y operación",
    subtitle:
      "Decisiones de arquitectura, caché y observabilidad en el backend Go de Hospital Sírio-Libanês, que registra más de 20 millones de solicitudes al mes.",
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
      "El backend conecta las TVs de las habitaciones, el ERP Tasy y la infraestructura de streaming en São Paulo y Brasília. Este artículo describe decisiones para limitar el costo de las solicitudes, tratar fallos en las integraciones y observar el servicio en producción. La respuesta media de 6 ms corresponde a la API, no a toda la experiencia de navegación o reproducción en la TV.",
    metricsLabel: "Escala observada en producción",
    metrics: [
      { value: "20M+", label: "peticiones por mes" },
      { value: "6 ms", label: "respuesta media de la API" },
      { value: "92%", label: "tasa de acierto de caché sostenida" },
      { value: "1k+", label: "commits de ingeniería backend" },
    ],
    architectureLabel: "Visión del sistema",
    architectureTitle: "Una arquitectura con degradación controlada",
    architectureDescription:
      "Los timeouts y los límites de reintentos acotan el tiempo dedicado a las integraciones. La caché combina Redis y memoria local para reducir la dependencia de una sola capa durante fallos.",
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
          "La inestabilidad en la TV de la habitación genera trabajo de soporte y afecta la experiencia del paciente. El backend debía integrar Tasy y el streaming IPTV con un uso de recursos y un comportamiento ante fallos previsibles.",
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
          "Elegimos Fiber v2 y FastHTTP con foco en el rendimiento y el uso de memoria. La configuración de la aplicación se establece al iniciar, antes de aceptar tráfico.",
        items: [
          "Fiber v2 y FastHTTP con reutilización de buffers para reducir asignaciones innecesarias.",
          "Acceso a PostgreSQL de alta concurrencia vía pgx/v5 y pgxpool, usando sqlc para consultas type-safe y GORM en admin.",
          "Timeouts explícitos en todas las capas (HTTP Read/Write, vida útil de conexiones DB y timeouts de dial).",
          "Readiness probes verificando la salud de PostgreSQL y Redis antes de enviar tráfico a las nuevas instancias.",
        ],
        note:
          "Rechazar solicitudes rápidamente bajo sobrecarga limita la acumulación de goroutines y ayuda a controlar el uso de memoria del contenedor.",
      },
      {
        id: "performance",
        eyebrow: "03 · Rendimiento",
        title: "Menos trabajo en la ruta principal",
        intro:
          "La ruta que entrega el catálogo y los datos de la habitación concentra el esfuerzo de optimización. Redujimos asignaciones de memoria, reutilizamos conexiones y seguimos la latencia para evaluar el resultado.",
        items: [
          "Cliente HTTP de alto rendimiento (FastHTTP) encapsulado con pools por host y límite de 3 reintentos.",
          "Procesamiento de JSON con Sonic JSON y consultas tipadas generadas por sqlc, reduciendo trabajo repetitivo en la ruta de la solicitud.",
          "Soporte para compresión selectiva y cabeceras ETag para ahorrar ancho de banda en la red hospitalaria.",
          "Dashboard de monitoreo y plantillas HTML integrados directamente en el binario Go mediante embed.FS.",
        ],
      },
      {
        id: "cache",
        eyebrow: "04 · Caché",
        title: "Caché híbrida en dos capas (Redis + sync.Map)",
        intro:
          "Redis es la capa principal de caché. Para tratar caídas o respuestas lentas, la aplicación también utiliza memoria local, con reglas de expiración y limpieza.",
        items: [
          "Capa primaria en Redis (v8) con TTLs ajustados por volatilidad (ej. 4 min para caché de login MAC).",
          "Fallback automático a sync.Map local con rutina janitor de TTL cuando Redis falla o supera los 500ms.",
          "Goroutine dedicada en background para limpieza preventiva diaria entre las 03:00 y 04:00 AM.",
          "Métricas en tiempo real de aciertos, fallos y errores segregadas por capa (Redis vs Local).",
        ],
        note:
          "El fallback reduce la dependencia de Redis, pero la memoria pertenece a cada instancia. La validez de los datos y la capacidad de esta capa también deben considerarse al evaluar fallos.",
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
        title: "Control de acceso por roles y registros de auditoría",
        intro:
          "JWTMiddleware y AuthorizeMiddleware aplican el control de acceso. Los roles definen las acciones permitidas y los registros de auditoría ayudan a investigar cambios.",
        items: [
          "Cookies de sesión admin_token protegidas con HttpOnly, Secure, SameSite y firmadas con golang-jwt/jwt/v5.",
          "Matriz RBAC en 4 niveles (Dev, Soporte, Gestor, Analista) con restricciones técnicas para impedir elevación de privilegios.",
          "Historial de auditoría (activity_log) en PostgreSQL registrando colaborador, acción (CREATE/UPDATE/DELETE), entidad y deltas.",
          "Contraseñas almacenadas como hashes bcrypt (golang.org/x/crypto/bcrypt), con políticas de rotación de claves para los demás secretos.",
        ],
      },
      {
        id: "erros",
        eyebrow: "07 · Incidentes",
        title: "Lecciones prácticas extraídas de producción",
        intro:
          "Los incidentes en producción orientaron cambios en los límites de solicitudes, la caché y la instrumentación. Estos son los problemas y las respuestas que dieron forma al servicio.",
        items: [
          "Explosión de cardinalidad en Prometheus → Solución: middleware de normalización estricta de endpoints.",
          "Caídas de red en Redis → Solución: caché híbrida transparente con fallback automático a sync.Map local.",
          "Reintentos desordenados en el ESB → Solución: cliente FastHTTP encapsulado con backoff exponencial y límite finito.",
          "Inconsistencias al cambiar una TV → respuesta: verificar la dirección MAC antes de guardar el dispositivo en la base de datos.",
        ],
      },
      {
        id: "checklist",
        eyebrow: "08 · Lista de Verificación",
        title: "Qué validar antes del próximo despliegue",
        intro:
          "Antes de publicar, revisamos los límites operativos, simulamos fallos y verificamos el comportamiento bajo carga. La latencia media, por sí sola, no describe todos los escenarios del servicio.",
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
