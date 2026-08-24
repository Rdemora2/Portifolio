# Contexto técnico do portfólio

Este documento é a referência de onboarding, manutenção e operação do portfólio de Roberto Moraes. Ele descreve o comportamento que existe no repositório, os limites deliberados e os pontos que ainda dependem de infraestrutura externa.

Público-alvo:

- pessoas desenvolvedoras que precisam alterar conteúdo, interface ou arquitetura;
- revisores de segurança, acessibilidade, SEO e performance;
- responsáveis por CI, container, deploy e sustentação;
- agentes de automação que precisam trabalhar sem contexto anterior.

Escopo:

- aplicação Next.js e seus conteúdos versionados;
- API de contato e integração com Resend;
- build nativo da Vercel, standalone para self-hosting, Docker, Compose e GitHub Actions;
- critérios de qualidade e operação observáveis no repositório.

Fora de escopo:

- infraestrutura do domínio, DNS, TLS, CDN, WAF ou proxy reverso;
- conta e configuração do Resend;
- plataforma final de deploy e sua estratégia de rollback;
- coletor de Web Vitals, monitoramento externo e alertas;
- materiais locais em <code>docs/portifolio/</code>, que permanecem ignorados pelo Git.

Sempre confirme <code>package.json</code>, <code>Dockerfile</code>, arquivos Compose e workflows antes de alterar comandos deste documento. Eles são as fontes executáveis de verdade.

## 1. Visão do sistema

O portfólio é uma aplicação pública, sem autenticação e sem banco de dados próprio. Conteúdo editorial e estrutural é versionado no repositório. A única operação mutável exposta pela aplicação é o envio do formulário de contato para o Resend.

~~~mermaid
flowchart LR
    B["Navegador"] --> P["Proxy next-intl"]
    P --> L["Layout localizado"]
    L --> H["Home pré-renderizada"]
    L --> A["Artigo pré-renderizado"]
    L --> F["Fallbacks e 404"]
    B --> C["POST /api/contact"]
    C --> G["Origem, mídia, tamanho e rate limit"]
    G --> Z["Schema Zod e honeypot"]
    Z --> R["Resend"]
    B -. "opcional" .-> V["Endpoint first-party de Web Vitals"]
    S["Conteúdo + mensagens"] --> H
    S --> A
    N["next build"] --> E{"VERCEL=1?"}
    E -- "sim" --> X["Adaptador nativo da Vercel"]
    E -- "não" --> O[".next/standalone"]
    O --> D["Runner distroless Node 24"]
~~~

### 1.1 Decisões arquiteturais

| Decisão | Implementação | Consequência |
| --- | --- | --- |
| Renderização server-first | App Router, Server Components e parâmetros estáticos por locale | Conteúdo essencial chega no HTML e o JavaScript fica concentrado nas interações |
| Internacionalização na URL | next-intl com prefixo <code>as-needed</code> | Português usa a raiz; inglês e espanhol usam prefixo |
| Motion progressivo | CSS, Web Animations API, <code>requestAnimationFrame</code>, GSAP e OGL por capacidade | A experiência degrada para uma versão estática e legível |
| Conteúdo no repositório | <code>src/data</code>, <code>src/content</code> e <code>src/messages</code> | Não existe CMS nem persistência externa |
| API mínima | Um Route Handler Node.js para contato | Superfície server-side pequena, sem sessão ou autenticação |
| Deploy na Vercel | Adaptador nativo quando <code>VERCEL=1</code> | A plataforma produz as funções sem depender do rastreamento standalone |
| Produção standalone | <code>output: "standalone"</code> fora da Vercel e runner distroless | Imagem menor e sem shell; diagnóstico deve usar logs e ferramentas externas |
| CSP estática | Headers globais no Next.js | Preserva pré-renderização, mas mantém <code>unsafe-inline</code> para o bootstrap atual |
| Rate limit em memória | <code>Map</code> local ao processo | Adequado a uma instância; não coordena réplicas nem sobrevive a restart |

## 2. Rotas e ciclo de uma requisição

### 2.1 Superfícies públicas

| Rota | Tipo | Renderização e finalidade |
| --- | --- | --- |
| <code>/</code> | página | Home em português, locale padrão |
| <code>/en</code> | página | Home em inglês |
| <code>/es</code> | página | Home em espanhol |
| <code>/insights/go-em-producao</code> | página | Artigo em português |
| <code>/en/insights/go-em-producao</code> | página | Artigo em inglês |
| <code>/es/insights/go-em-producao</code> | página | Artigo em espanhol |
| <code>/api/contact</code> | API | Aceita somente o fluxo <code>POST</code> implementado |
| <code>/robots.txt</code> | metadata route | Permite rastreamento e referencia o sitemap |
| <code>/sitemap.xml</code> | metadata route | Lista home e artigo nos três idiomas |
| <code>/opengraph-image</code> | imagem | Imagem social padrão em português |
| <code>/opengraph-image/pt</code> | imagem | Imagem social localizada da home |
| <code>/opengraph-image/en</code> | imagem | Imagem social localizada da home |
| <code>/opengraph-image/es</code> | imagem | Imagem social localizada da home |
| <code>/opengraph-image/article/pt</code> | imagem | Imagem social do artigo em português |
| <code>/opengraph-image/article/en</code> | imagem | Imagem social do artigo em inglês |
| <code>/opengraph-image/article/es</code> | imagem | Imagem social do artigo em espanhol |

<code>generateStaticParams</code> cobre os três locales e <code>dynamicParams=false</code> impede locales arbitrários. O middleware do next-intl normaliza o locale padrão e não intercepta API, assets do Next.js, imagens sociais, favicon, robots, sitemap ou arquivos com extensão.

A rota explícita <code>/pt</code> é usada pelo seletor somente para permitir que o middleware atualize a preferência de idioma antes de canonicalizar para <code>/</code>. Links canônicos nunca usam <code>/pt</code>.

### 2.2 Layout localizado

<code>src/app/[locale]/layout.tsx</code>:

1. valida o locale;
2. informa o locale ao next-intl com <code>setRequestLocale</code>;
3. carrega mensagens de layout;
4. gera metadata, canonical e alternates;
5. define <code>lang</code> regional no documento;
6. inclui JSON-LD de pessoa, serviço profissional e website;
7. monta skip link, navegação, conteúdo, footer e telemetria opcional.

O provider global envia ao cliente apenas <code>Nav</code>, <code>Error</code> e <code>Loading</code>. A home cria um provider interno com os namespaces necessários às ilhas client-side: <code>Projects</code>, <code>Stats</code> e <code>Contact</code>.

### 2.3 Home

<code>src/app/[locale]/(home)/page.tsx</code> compõe, nesta ordem:

1. Hero;
2. Sobre;
3. Projetos;
4. Sites publicados;
5. Stack;
6. Métricas;
7. Experiência;
8. Insights;
9. Contato.

Divisores mantêm a transição entre os fundos. A vitrine de sites é um Server Component e entrega títulos, destinos e thumbnails no HTML inicial; somente o reveal progressivo reutiliza uma ilha compartilhada. A rota está em um grupo próprio para que seu <code>loading.tsx</code> localizado não afete o artigo. O conteúdo estrutural é renderizado no servidor; filtros, drawers, contadores, menus e efeitos são ilhas client-side.

### 2.4 Artigo

O artigo combina três camadas:

- <code>src/content/insights/go-em-producao.ts</code>: conteúdo localizado e mapeamento de cenas;
- <code>ImmersiveArticle.tsx</code>: HTML semântico, metadata visual e composição editorial;
- <code>ArticleExperience.tsx</code>: sincronização progressiva do scroll com a visualização lateral e o hero.

O texto, links, capítulos, métricas e CTA existem no HTML antes da hidratação. Sem JavaScript, em reduced motion, impressão, ponteiro coarse ou viewport restrita, CSS preserva uma leitura linear e estática.

### 2.5 Fallbacks

- <code>[locale]/error.tsx</code> é um error boundary localizado, move foco para o alerta e oferece retry.
- <code>[locale]/not-found.tsx</code> cobre 404 dentro da árvore localizada.
- <code>global-error.tsx</code> usa CSS independente para sobreviver a falhas do layout raiz.
- <code>global-not-found.tsx</code> detecta o locale informado pelo middleware, apresenta navegação de idiomas e não depende do layout localizado.

O global 404 usa headers da requisição. Essa necessidade fica isolada do grupo da home para não forçar a página principal a herdar renderização dinâmica.

### 2.6 Configuração do framework

<code>next.config.ts</code> mantém:

- React Strict Mode;
- rotas tipadas;
- remoção do header de identificação do framework;
- output standalone fora da Vercel; no deploy Vercel, o adaptador nativo controla o output;
- AVIF e WebP, com tamanhos explícitos de device e imagem;
- otimização de imports de GSAP e OGL;
- atribuição de CLS, LCP e INP;
- global not found experimental;
- headers de segurança para todas as rotas;
- cache específico do favicon por um dia, com stale-while-revalidate de sete dias.

O desenvolvimento padrão seleciona Webpack explicitamente por estabilidade de memória. Turbopack permanece opt-in e o analyzer usa sua API experimental oficial instalada nesta versão do Next.js.

## 3. Organização do código

~~~text
src/
├── app/
│   ├── [locale]/                 layout, home, artigo e fallbacks localizados
│   ├── api/contact/              Route Handler e testes
│   ├── opengraph-image/          imagens sociais geradas no servidor
│   ├── global-error.tsx
│   ├── global-not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── insights/                 experiência reutilizável do artigo
│   ├── layout/                   navegação, locale, footer e Web Vitals
│   ├── sections/                 seções da home
│   └── shared/                   motion, drawer, WebGL e UI compartilhada
├── content/insights/             contratos e conteúdo editorial
├── data/                         portfólio e sites publicados
├── hooks/                        viewport e seção ativa
├── lib/                          configuração, validação e integrações
├── messages/                     catálogos pt, en e es
├── styles/variables.css          tokens visuais
└── types/                        contratos compartilhados
~~~

Outras áreas:

| Caminho | Responsabilidade |
| --- | --- |
| <code>e2e/</code> | Regressão de navegador, a11y e progressive enhancement |
| <code>public/images/sites/</code> | Screenshots locais, aprovados e dimensionados da vitrine de sites |
| <code>scripts/</code> | Bundle gate, preparação standalone e quality hook |
| <code>.github/instructions/</code> | Guardrails de frontend, backend, motion e documentação |
| <code>.github/workflows/ci.yml</code> | Gate de integração contínua |
| <code>Dockerfile</code> | Build multi-stage e runtime |
| <code>docker-compose.yml</code> | Produção endurecida |
| <code>docker-compose.dev.yml</code> | Desenvolvimento com bind mount |

## 4. Fronteiras server/client e carregamento progressivo

### 4.1 Princípio

Um componente deve permanecer no servidor quando não precisa de estado, efeitos, DOM ou eventos do navegador. A diretiva <code>"use client"</code> é reservada às ilhas que precisam dessas capacidades.

### 4.2 Ilhas principais

| Ilha | Quando carrega ou executa | Fallback |
| --- | --- | --- |
| Terminal WebGL do hero | Desktop, ponteiro fino, aba visível, seção em viewport, sem economia de dados e fora do perfil low-power | Gradiente estático |
| Scroll reveal | Elemento entra na viewport | Conteúdo visível por padrão; reduced motion revela imediatamente |
| Filtro de projetos | Interação do usuário | Troca imediata se GSAP falhar ou motion estiver reduzido |
| Drawer de projeto | Preload em foco/hover e import na abertura | Shell local de loading e error boundary com retry |
| Liquid Portal | Drawer desktop capaz, sem reduced motion, save-data ou perfil low-power | Fundo e scrim estáticos |
| Formulário | Até 900 px antes da viewport ou hash <code>#contact</code> | Skeleton visual; links de contato continuam disponíveis |
| Contadores | Métrica entra na viewport ou drawer abre | Valor final acessível e fallback sem animação |
| Artigo imersivo | Hidratação em navegador capaz | Documento linear completo |

### 4.3 Drawer de projetos

O fluxo de abertura foi desenhado para conter falhas sem substituir a página:

1. foco ou pointer hover inicia preload do módulo;
2. clique preserva a seção de projetos e monta um shell local;
3. <code>Suspense</code> cobre o carregamento do chunk;
4. um error boundary local cobre falha de import;
5. retry grava apenas o ID do projeto em <code>sessionStorage</code>, ancora o URL em <code>#projects</code> e faz hard reload;
6. após recarregar, o ID é consumido e o drawer reabre;
7. fechar restaura foco ao trigger correto sem scroll.

Enquanto aberto ou fechando, o documento permanece scroll-locked e o fundo fica <code>inert</code>. O diálogo suporta Escape, focus trap, clique no backdrop e apresentação responsiva como modal desktop ou bottom sheet mobile.

### 4.4 Formulário

<code>ContactFormLoader</code> não inclui React Hook Form, Zod client-side ou o formulário no bundle inicial. A carga ocorre por proximidade da viewport ou navegação direta para contato. Sem JavaScript o formulário não é disponibilizado; email, WhatsApp, LinkedIn e GitHub continuam como alternativas.

## 5. Internacionalização

### 5.1 Contrato atual

| Locale | Documento | URL da home |
| --- | --- | --- |
| <code>pt</code> | <code>pt-BR</code> | <code>/</code> |
| <code>en</code> | <code>en-US</code> | <code>/en</code> |
| <code>es</code> | <code>es-MX</code> | <code>/es</code> |

Fontes de verdade:

- locales e idiomas de documento: <code>src/i18n.config.ts</code>;
- estratégia de prefixo e helpers: <code>src/navigation.ts</code>;
- carregamento de mensagens: <code>src/i18n/request.ts</code>;
- catálogos: <code>src/messages/*.json</code>;
- conteúdo editorial longo: <code>src/content/insights/go-em-producao.ts</code>.

O locale switcher:

- preserva query e hash;
- mantém links nativos funcionais;
- usa navegação client-side apenas para clique primário sem modificadores;
- desabilita prefetch para não carregar edições que o usuário não solicitou;
- expõe <code>hrefLang</code>, <code>lang</code> e labels localizadas.

O teste <code>src/i18n/messages.test.ts</code> exige a mesma forma de chaves em todos os catálogos e protege as mensagens do fluxo de contato.

### 5.2 Adicionar um locale

Uma nova tradução não é apenas um novo JSON. Execute todos os passos:

1. adicione o locale e seu idioma regional em <code>src/i18n.config.ts</code>;
2. crie o catálogo completo em <code>src/messages</code>;
3. adicione a edição do artigo em <code>src/content/insights/go-em-producao.ts</code>;
4. acrescente cópias da imagem social em <code>src/lib/social-image.tsx</code>;
5. acrescente a cópia do global 404 em <code>src/app/global-not-found.tsx</code>;
6. revise o mapeamento de locale do Open Graph em <code>[locale]/layout.tsx</code>;
7. confirme canonical, alternates e sitemap;
8. atualize testes unitários e E2E;
9. rode o gate completo.

Não use um locale novo como fallback silencioso para conteúdo não traduzido. A publicação deve ser atômica e completa.

## 6. Conteúdo e modelos

### 6.1 Portfólio

<code>src/data/portfolio.ts</code> contém:

- informações pessoais e contatos;
- estrutura dos projetos;
- tecnologias;
- experiência profissional;
- métricas;
- índice de insights;
- IDs da navegação.

Textos localizados das superfícies ficam nos catálogos. IDs são contratos: alterar um ID exige atualizar dados, mensagens, seletores, testes e links correspondentes.

Para adicionar ou alterar um projeto:

1. mantenha o contrato <code>Project</code> de <code>src/types/index.ts</code>;
2. atualize o dado estrutural em <code>src/data/portfolio.ts</code>;
3. crie as chaves <code>Projects.items.&lt;id&gt;</code> nos três catálogos;
4. valide métricas, case study, filtros e drawer;
5. teste abertura por mouse e teclado, mobile, reduced motion e WebGL indisponível;
6. execute testes de mensagens, E2E e bundle.

Para alterar experiência profissional, mantenha em sincronia os itens estruturais e <code>Experience.items.&lt;id&gt;</code>.

### 6.2 Sites publicados

<code>src/data/showcase-sites.ts</code> mantém apenas o contrato estrutural de cada experiência: ID estável, URL HTTPS, domínio, thumbnail com dimensões reservadas e blur placeholder, além dos IDs de tags. Títulos, descrições, textos alternativos e rótulos ficam no namespace <code>WebsiteShowcase</code> dos três catálogos.

<code>WebsiteShowcase.tsx</code> renderiza a seção no servidor, usa <code>next/image</code> com lazy loading e cria um link externo seguro por card. O nome acessível preserva o conteúdo visível do card e acrescenta um aviso oculto de nova aba, mantendo a correspondência entre rótulo visual e falado.

Para publicar outro site:

1. obtenha autorização para publicar o destino e a captura;
2. salve um screenshot otimizado em <code>public/images/sites/</code>, sem dados pessoais ou confidenciais;
3. declare URL HTTPS, domínio, dimensões reais, blur placeholder e tags em <code>src/data/showcase-sites.ts</code>;
4. crie todas as chaves de <code>WebsiteShowcase.items.&lt;id&gt;</code> em português, inglês e espanhol;
5. valide o asset, o link externo, o nome acessível, a ausência de overflow e o comportamento sem JavaScript;
6. execute testes unitários, smokes cross-browser, E2E completo e bundle gate.

O teste de dados impede IDs ou destinos duplicados e exige que todo thumbnail local exista. As regressões de navegador verificam todos os destinos publicados, segurança da nova aba, breakpoints móvel/compacto/desktop e renderização server-first sem JavaScript.

### 6.3 Artigo reutilizável

<code>InsightArticle</code> define:

- SEO, título, resumo e dados editoriais;
- labels da experiência;
- métricas e topologia;
- capítulos;
- cena visual de cada capítulo;
- CTA.

Os tipos de cena aceitos são <code>ingress</code>, <code>boundaries</code>, <code>hot-path</code>, <code>cache-fallback</code>, <code>telemetry</code>, <code>security</code>, <code>recovery</code> e <code>release</code>.

<code>getGoProductionArticle</code> devolve cópias isoladas de arrays e objetos para impedir contaminação entre requests. O número de cenas visuais deve acompanhar exatamente o número de seções; os testes verificam alinhamento, localização e isolamento.

Para publicar outro artigo com a experiência atual:

1. crie um modelo localizado que satisfaça <code>InsightArticle</code>;
2. reutilize <code>ImmersiveArticle</code> e <code>ArticleExperience</code>;
3. crie a rota, metadata e JSON-LD do artigo;
4. adicione o item publicado em <code>src/data/portfolio.ts</code>;
5. inclua URLs e datas no sitemap;
6. crie a imagem social correspondente;
7. adicione testes de conteúdo, sem JavaScript, reduced motion, impressão e SEO;
8. decida explicitamente como o novo artigo entra no bundle gate.

Hoje a rota, o sitemap, a imagem social e o budget editorial estão especializados em <code>go-em-producao</code>. Novos artigos não entram automaticamente nesses contratos.

### 6.3 Política editorial

Métricas, cases e experiências devem ser verificáveis e autorizados. Não publique:

- segredos, endpoints internos ou credenciais;
- screenshots ou logos sem autorização;
- nomes, dados ou depoimentos de terceiros sem consentimento;
- detalhes que violem contratos, confidencialidade ou políticas de clientes.

## 7. Configuração e variáveis de ambiente

### 7.1 Ambientes

| Ambiente | Arquivo ou mecanismo | Uso |
| --- | --- | --- |
| Desenvolvimento local | <code>.env.development.local</code> | Criado a partir de <code>.env.example</code> |
| Build de produção | variáveis exportadas ou <code>.env.production</code> | Define origem e telemetria compiladas |
| Runtime standalone | ambiente do processo | Deve passar o bootstrap de produção |
| Compose | <code>--env-file .env.production</code> | Resolve build args, runtime e limites do container |
| CI | <code>env</code> do workflow e fixtures derivadas por SHA-256 | Não usa segredos reais para validação |

Todos os arquivos <code>.env*</code>, exceto <code>.env.example</code>, são ignorados pelo Git.

### 7.2 Aplicação

| Variável | Default | Regra e fase |
| --- | --- | --- |
| <code>NEXT_PUBLIC_SITE_URL</code> | <code>https://robertomoraes.dev</code> no código | Build público. Em produção aceita apenas origem HTTPS pública, sem path, query, fragmento ou credenciais. O Compose exige valor explícito. |
| <code>NEXT_PUBLIC_WEB_VITALS_ENDPOINT</code> | vazio | Build público e opcional. Deve ser path normalizado da mesma origem, começar com uma barra e não conter query, fragmento ou barra invertida. |
| <code>RESEND_API_KEY</code> | nenhum | Runtime de produção. Deve seguir o formato <code>re_</code>, ter pelo menos 20 caracteres de token, variabilidade suficiente e não conter placeholder. |
| <code>CONTACT_FROM_EMAIL</code> | nenhum | Runtime de produção. Um email, opcionalmente com display name, em domínio DNS público. |
| <code>CONTACT_TO_EMAIL</code> | nenhum | Runtime de produção. Um email em domínio DNS público. |
| <code>CONTACT_IDEMPOTENCY_SECRET</code> | fallback para a chave Resend somente fora do gate de produção | Em produção é obrigatório, sem placeholder, com ao menos 32 caracteres e alta entropia. |
| <code>CONTACT_ALLOWED_ORIGINS</code> | origem da request apenas quando ausente fora de produção | Lista separada por vírgula. Em produção, cada item é uma origem HTTPS pública e a lista deve conter <code>NEXT_PUBLIC_SITE_URL</code>. |
| <code>CONTACT_MAX_BODY_BYTES</code> | <code>16384</code> | Inteiro entre 1.024 e 1.048.576 bytes. |
| <code>CONTACT_EMAIL_TIMEOUT_MS</code> | <code>8000</code> | Inteiro entre 1.000 e 30.000 ms. |
| <code>CONTACT_RATE_LIMIT_MAX</code> | <code>5</code> | Limite por identificador, entre 1 e 1.000. |
| <code>CONTACT_RATE_LIMIT_GLOBAL_MAX</code> | <code>100</code> | Limite global, entre 1 e 100.000 e nunca menor que o limite por identificador. |
| <code>CONTACT_RATE_LIMIT_WINDOW_SECONDS</code> | <code>60</code> | Janela entre 1 e 3.600 segundos. |
| <code>CONTACT_RATE_LIMIT_MAX_ENTRIES</code> | <code>5000</code> | Máximo de entradas em memória, entre 10 e 100.000. |
| <code>CONTACT_TRUST_PROXY</code> | não há default aceito pelo gate | Em produção deve ser exatamente <code>true</code> ou <code>false</code>. |
| <code>CONTACT_CLIENT_IP_HEADER</code> | <code>x-forwarded-for</code> | Nome de header HTTP normalizado para minúsculas, limitado a letras, números e hífen. |
| <code>CONTACT_TRUST_PROXY_HOPS</code> | <code>1</code> | Posição confiável a partir do fim da lista, entre 1 e 20. |

Variáveis públicas podem aparecer no bundle. Nenhuma credencial pode receber prefixo <code>NEXT_PUBLIC_</code>.

### 7.3 Processo e container

| Variável | Default | Uso |
| --- | --- | --- |
| <code>PORT</code> | <code>3000</code> no runner e Compose | Porta do desenvolvimento nativo e porta publicada pelo Compose; o template deriva dela <code>NEXT_PUBLIC_SITE_URL</code> e <code>CONTACT_ALLOWED_ORIGINS</code>, enquanto o processo interno do container permanece em 3000 |
| <code>HOSTNAME</code> | <code>0.0.0.0</code> no runner | Interface de bind do standalone |
| <code>NEXT_TELEMETRY_DISABLED</code> | <code>1</code> nas imagens | Desabilita telemetria do Next.js |
| <code>NEXT_DEV_OLD_SPACE_MB</code> | <code>1536</code> | Teto de old space do V8 para o servidor de desenvolvimento; inteiro de 512 a 4.096 MiB |
| <code>NEXT_DEV_MEMORY_LIMIT_MB</code> | <code>2048</code> | Teto de RSS somado da árvore do Next dev; inteiro de 512 a 4.096 MiB e ao menos 256 MiB acima do old space |
| <code>DEV_CONTAINER_MEMORY_LIMIT</code> | <code>2560m</code> | Limite rígido do container de desenvolvimento |
| <code>DEV_CONTAINER_MEMORY_RESERVATION</code> | <code>1024m</code> | Reserva de memória do container de desenvolvimento |
| <code>CONTAINER_MEMORY_LIMIT</code> | <code>768m</code> | Limite de memória do Compose de produção |
| <code>CONTAINER_CPU_LIMIT</code> | <code>1.0</code> | Limite de CPU do Compose de produção |

<code>NODE_ENV</code> é definido pelo fluxo: <code>development</code> no target dev e <code>production</code> no runner.

### 7.4 Quando os gates executam

<code>assertProductionBuildEnv</code> roda somente na fase <code>PHASE_PRODUCTION_BUILD</code> e valida:

- origem pública;
- endpoint opcional de Web Vitals.

<code>assertProductionRuntimeEnv</code> roda no registro da instrumentation quando:

- <code>NODE_ENV=production</code>;
- runtime do Next.js é Node.js.

O bootstrap agrega todos os problemas encontrados e encerra com código 1 sem imprimir os valores. A validação faz parte do build e do startup, sem depender de um comando manual adicional.

## 8. API de contato

### 8.1 Contrato do payload

O schema é <code>strict</code>: campos desconhecidos invalidam o request.

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| <code>name</code> | sim | string trimada, 2 a 100 caracteres, uma linha, sem controles |
| <code>email</code> | sim | email trimado, convertido para minúsculas, até 254 caracteres |
| <code>company</code> | não | até 120 caracteres, uma linha, sem controles |
| <code>projectType</code> | sim | <code>web</code>, <code>mobile</code>, <code>backend</code>, <code>architecture</code>, <code>leadership</code> ou <code>other</code> |
| <code>message</code> | sim | 20 a 4.000 caracteres; quebras de linha permitidas, controles inseguros rejeitados |
| <code>budget</code> | não | até 100 caracteres, uma linha, sem controles |
| <code>botCheck</code> | não | honeypot com no máximo 200 caracteres |

### 8.2 Ordem de processamento

~~~mermaid
sequenceDiagram
    participant B as Browser
    participant A as API
    participant M as Rate limiter
    participant Z as Zod
    participant R as Resend
    B->>A: POST application/json
    A->>A: Sec-Fetch-Site e Origin
    A->>A: Content-Type, Encoding e Content-Length
    A->>M: Consome bucket global
    A->>M: Consome bucket do identificador
    A->>A: Lê stream UTF-8 com limite
    A->>A: Honeypot
    A->>Z: safeParse strict
    A->>A: Config e conteúdo escapado
    A->>R: Envio com timeout e idempotency key
    R-->>A: Resultado
    A-->>B: JSON no-store
~~~

Detalhes:

1. <code>Sec-Fetch-Site: cross-site</code> é rejeitado.
2. Quando <code>Origin</code> existe, precisa estar na allowlist.
3. Apenas <code>application/json</code> é aceito.
4. <code>Content-Encoding</code> deve estar ausente ou ser <code>identity</code>.
5. <code>Content-Length</code> excessivo é rejeitado antes da leitura.
6. Os buckets global e por identificador são consumidos antes do parse.
7. O corpo é lido como stream UTF-8 fatal e interrompido ao exceder o limite.
8. Honeypot preenchido recebe sucesso silencioso sem importar Resend.
9. Zod normaliza e valida.
10. Resend é importado apenas após os controles anteriores.
11. HTML de email é escapado e o texto puro é enviado em paralelo.
12. Todas as respostas JSON usam <code>Cache-Control: no-store</code>.

### 8.3 Respostas

| Status | Situação |
| ---: | --- |
| 200 | envio aceito pelo provedor ou honeypot descartado silenciosamente |
| 400 | JSON inválido ou payload reprovado pelo schema |
| 403 | origem não permitida |
| 413 | corpo maior que o limite |
| 415 | tipo de mídia ou encoding não suportado |
| 429 | limite global, por identificador ou capacidade de entradas excedido |
| 502 | rejeição ou exceção do provedor |
| 503 | configuração de email incompleta fora do bootstrap estrito |
| 504 | timeout do envio |

Respostas após consumo do bucket por identificador incluem <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code> e <code>RateLimit-Reset</code>. Respostas 429 também incluem <code>Retry-After</code>.

### 8.4 Rate limiting e proxy

O estado fica em um <code>Map</code> do processo:

- entradas expiradas são limpas periodicamente;
- um teto impede crescimento ilimitado;
- restart limpa todo o histórico;
- réplicas não compartilham contadores.

Com <code>CONTACT_TRUST_PROXY=false</code>, a aplicação não confia em nenhum header de IP. Todos os clientes usam o identificador compartilhado <code>shared-untrusted-proxy</code>, além do bucket global. Essa escolha evita spoofing, mas pode limitar visitantes legítimos em conjunto.

Com <code>CONTACT_TRUST_PROXY=true</code>, o proxy precisa remover o header recebido do cliente e escrever uma cadeia confiável. A aplicação:

1. lê o header configurado;
2. separa por vírgula;
3. seleciona o endereço a partir do fim conforme <code>CONTACT_TRUST_PROXY_HOPS</code>;
4. valida IPv4 ou IPv6;
5. gera um HMAC com chave aleatória do processo antes de usar o endereço no mapa.

Nunca habilite confiança de proxy diretamente na internet.

### 8.5 Idempotência e privacidade

A chave de idempotência é um HMAC do payload validado, sem honeypot, combinado com uma janela de dez minutos. O segredo não sai do servidor.

Logs de falha registram apenas categoria, nome/código e status do provedor quando disponíveis. Conteúdo da mensagem, email, segredo e chave do Resend não são logados. Ainda assim, logs de infraestrutura devem ter retenção e acesso controlados.

### 8.6 Assunções e limites

- Não existe autenticação, cookie de sessão ou operação em nome de usuário.
- Requests sem header <code>Origin</code> são aceitos se não declararem <code>Sec-Fetch-Site: cross-site</code>.
- Não existe CAPTCHA, proof-of-work ou classificação de abuso.
- Não existe fila durável para reprocessar falhas de email.
- Rate limiting distribuído e WAF não fazem parte deste repositório.

## 9. Modelo de segurança

### 9.1 Headers globais

| Header | Valor ou política |
| --- | --- |
| <code>Content-Security-Policy</code> | Política descrita abaixo |
| <code>X-Content-Type-Options</code> | <code>nosniff</code> |
| <code>X-Frame-Options</code> | <code>DENY</code> |
| <code>Referrer-Policy</code> | <code>strict-origin-when-cross-origin</code> |
| <code>Permissions-Policy</code> | câmera, microfone, geolocalização, pagamento, USB e browsing topics desabilitados |
| <code>Cross-Origin-Opener-Policy</code> | <code>same-origin</code> |
| <code>Cross-Origin-Resource-Policy</code> | <code>same-origin</code> |
| <code>Origin-Agent-Cluster</code> | <code>?1</code> |
| <code>Strict-Transport-Security</code> | dois anos, subdomínios e preload; somente produção |

<code>X-Powered-By</code> é desabilitado.

### 9.2 CSP

Política de produção:

- <code>default-src 'self'</code>;
- <code>script-src 'self' 'unsafe-inline'</code>;
- <code>script-src-attr 'none'</code>;
- <code>style-src 'self' 'unsafe-inline'</code>;
- <code>img-src 'self' blob: data:</code>;
- <code>font-src 'self' data:</code>;
- <code>connect-src 'self'</code>;
- <code>media-src 'self'</code>;
- <code>worker-src 'self' blob:</code>;
- <code>object-src 'none'</code>;
- <code>base-uri 'self'</code>;
- <code>form-action 'self'</code>;
- <code>frame-ancestors 'none'</code>;
- <code>upgrade-insecure-requests</code>.

Desenvolvimento adiciona <code>unsafe-eval</code> e WebSocket em <code>connect-src</code>. HSTS e upgrade de requests não são adicionados em desenvolvimento.

O bootstrap atual do App Router e os estilos gerados exigem inline. Uma CSP por nonce/strict-dynamic seria mais rígida, mas introduziria dependência por request e reduziria o benefício de pré-renderização. Reavalie essa decisão se a aplicação passar a tratar sessão, conteúdo privado ou compliance regulatório.

Não há endpoint de report de CSP configurado.

### 9.3 XSS e conteúdo

- O JSON-LD substitui o caractere <code>&lt;</code> antes de entrar em <code>dangerouslySetInnerHTML</code>.
- O HTML de email escapa todos os campos de usuário.
- Catálogos e conteúdo editorial são dados versionados, não HTML arbitrário.
- A CSP bloqueia handlers em atributos e plugins.
- Links externos de contato usam <code>noopener noreferrer</code>.

### 9.4 Supply chain

- <code>ignore-scripts=true</code> bloqueia lifecycle scripts de dependências.
- <code>npm ci</code> usa o lockfile.
- <code>npm audit signatures</code> verifica assinaturas do registry.
- A CI executa <code>npm audit --audit-level=moderate</code>.
- Dependabot verifica npm, Docker e GitHub Actions semanalmente.
- Actions são pinadas por commit.
- Imagens-base são pinadas por versão e digest.
- Trivy 0.72 falha a CI em vulnerabilidades High ou Critical da imagem final.

Uma nova dependência que exija postinstall precisa ser avaliada conscientemente. Não remova a proteção global apenas para contornar uma instalação.

### 9.5 Container

O runtime:

- contém somente Node e o artefato standalone;
- não possui shell nem package manager;
- executa como UID/GID 65532;
- recebe <code>SIGTERM</code>;
- publica a porta somente em loopback pelo Compose;
- usa root filesystem somente leitura;
- remove todas as Linux capabilities;
- ativa <code>no-new-privileges</code>;
- limita PIDs, memória e CPU;
- grava somente em <code>/tmp</code> e <code>/app/.next/cache</code> via <code>tmpfs</code>;
- rotaciona logs JSON.

### 9.6 Gaps de segurança conhecidos

- não há secret scanning ou SAST específico configurado no repositório;
- não há WAF, mitigação DDoS ou rate limit distribuído versionado;
- não há coleta de CSP violations;
- não há autenticação porque não existe área privada;
- não há SBOM ou assinatura da imagem configurada;
- a segurança do TLS, proxy e domínio depende da plataforma externa.

## 10. Acessibilidade

### 10.1 Fundamentos

- <code>lang</code> regional correto em cada documento;
- skip link para <code>#main-content</code>;
- um <code>main</code> identificável por superfície;
- hierarquia de headings e landmarks;
- foco visível global;
- targets interativos de pelo menos 44 px nas navegações críticas;
- labels e descrições de erro nos campos;
- estados assíncronos com <code>role=status</code>, <code>role=alert</code> ou <code>aria-busy</code>;
- conteúdo decorativo marcado como <code>aria-hidden</code>;
- contraste aumentado suportado por media query;
- edição de impressão do artigo.

### 10.2 Diálogos

Menu mobile, shell de loading/erro e drawer:

- usam <code>role=dialog</code> ou <code>alertdialog</code>;
- definem <code>aria-modal</code> e nome acessível;
- movem o foco para dentro;
- prendem Tab e Shift+Tab;
- fecham com Escape;
- tornam o fundo <code>inert</code>;
- bloqueiam o scroll no elemento <code>html</code>;
- restauram foco sem alterar a posição da página.

### 10.3 Movimento

<code>prefers-reduced-motion</code>:

- desativa scroll suave;
- revela conteúdo imediatamente;
- evita GSAP e animações de contagem quando aplicável;
- torna o hero e o artigo estáticos;
- impede WebGL contínuo;
- preserva valores e texto finais.

<code>prefers-contrast: more</code> remove transparências editoriais relevantes e reforça a timeline. <code>prefers-reduced-transparency</code> e ponteiro coarse reduzem blur em superfícies globais.

### 10.4 Validação

O Playwright executa axe-core nas superfícies principais e cenários dedicados de:

- teclado e formulário;
- foco do drawer e menu;
- ausência de overflow horizontal;
- reduced motion;
- contraste aumentado;
- sem JavaScript;
- impressão;
- WebGL indisponível;
- mobile e ponteiro coarse.

Automação não substitui validação manual. Antes de uma release visual relevante, verifique:

1. navegação completa só com teclado;
2. VoiceOver ou NVDA nas rotas principais;
3. zoom a 200% e 400%;
4. orientação e viewport móvel;
5. contraste real dos novos tokens;
6. leitura sem JavaScript;
7. reduced motion e impressão.

Limite atual: o conteúdo e os links de contato funcionam sem JavaScript, mas o formulário não.

## 11. SEO e compartilhamento

### 11.1 Metadata

A home publica:

- título e descrição localizados;
- keywords;
- autor e creator;
- canonical absoluto;
- alternates regionais e <code>x-default</code>;
- Open Graph de website;
- Twitter Card;
- index/follow.

O artigo publica:

- título e descrição editoriais;
- canonical e alternates;
- Open Graph de artigo;
- data publicada e modificada;
- autor;
- Twitter Card.

### 11.2 Dados estruturados

O layout publica um grafo Schema.org com:

- <code>Person</code>;
- <code>ProfessionalService</code>;
- <code>WebSite</code>.

O artigo adiciona <code>TechArticle</code> com idioma, datas, imagem, autor e página principal.

### 11.3 Sitemap, robots e imagens sociais

O sitemap contém seis entradas: home e artigo para os três locales. Alternates são absolutos e incluem <code>x-default</code>. As datas <code>lastModified</code> são literais e devem ser atualizadas junto com mudanças editoriais reais.

<code>robots.txt</code> permite todos os crawlers e referencia o sitemap na origem configurada.

Imagens sociais são geradas com <code>ImageResponse</code>, 1200 × 630, por locale. As rotas são estáticas e retornam cache compartilhado de um dia, com stale-while-revalidate de sete dias.

### 11.4 Regras de manutenção

- <code>NEXT_PUBLIC_SITE_URL</code> incorreta contamina canonical, sitemap e imagens no build.
- Não derive canonical do host da request; a origem configurada é deliberadamente a fonte de verdade.
- O middleware não emite alternates automáticos para evitar headers baseados no host do proxy.
- Ao alterar título, descrição, slug ou data, revise metadata, JSON-LD, sitemap, cards e testes.
- Ao adicionar artigo, inclua explicitamente sitemap, imagem social e budget.

Validação mínima após build:

~~~bash
curl --fail --silent http://localhost:3000/robots.txt
curl --fail --silent http://localhost:3000/sitemap.xml
curl --fail --silent --output /dev/null http://localhost:3000/opengraph-image/pt
curl --fail --silent --output /dev/null http://localhost:3000/opengraph-image/article/pt
~~~

Use a porta real da instância.

## 12. Motion e experiência visual

### 12.1 Taxonomia

<code>ScrollReveal</code> oferece variantes semânticas:

| Variante | Uso |
| --- | --- |
| <code>title</code> | subida curta com opacity para títulos, sem recortar glifos |
| <code>body</code> | subida ainda mais contida para texto de apoio |
| <code>stat</code> | scale sutil, sem overshoot, para números e métricas |
| <code>card</code> | elevação curta de cards e itens |
| <code>ambient</code> | scale horizontal e opacity para elementos decorativos |
| variantes legadas | fade, slide e scale com deslocamentos reduzidos para componentes existentes |

Todos os keyframes ficam restritos a <code>transform</code> e <code>opacity</code>. O componente usa Intersection Observer e Web Animations API; conteúdo é visível por padrão e <code>will-change</code> existe somente durante a animação.

### 12.2 Home

- O terminal do hero é um import dinâmico OGL, renderizado somente quando capacidade, viewport e visibilidade permitem.
- A navegação atualiza variáveis CSS com um listener de scroll passivo e um frame por ciclo; hover, foco e seção ativa usam feedback CSS contido, sem mudar o layout.
- Filtros importam GSAP apenas quando uma transição animada é solicitada.
- Os divisores exibem um sinal discreto com CSS Scroll-Driven Animations; sem suporte, preservam apenas a onda estática.
- A timeline profissional usa CSS Scroll-Driven Animations dentro de <code>@supports</code>; navegadores sem suporte mantêm o trilho estático.
- Métricas usam Intersection Observer e <code>requestAnimationFrame</code> para contagem, com valor final separado para tecnologia assistiva.
- A borda reativa fica restrita aos três cards de métricas.
- A vitrine de sites combina reveal progressivo com hover restrito a <code>transform</code> e <code>opacity</code>; reduced motion e dispositivos sem hover mantêm os cards estáticos.

### 12.3 Drawer

Entrada e saída importam GSAP sob demanda. Se o import demorar ou falhar, um timer aplica estado final funcional. <code>will-change</code> é removido ao concluir.

O Liquid Portal:

- cria WebGL2 ou WebGL somente se houver contexto;
- limita DPR a 1,5 e a 1 em dispositivo low-power;
- reduz para 30 FPS no perfil low-power;
- pausa com a aba oculta;
- trata perda de contexto;
- desconecta observers, listeners e contexto no unmount.

O efeito nem é montado em mobile, reduced motion, save-data ou dispositivo low-power.

### 12.4 Artigo

O artigo não substitui o scroll nativo. A experiência usa o deslocamento real como timeline:

- listener passivo agenda no máximo um <code>requestAnimationFrame</code>;
- <code>ResizeObserver</code> recalcula geometria;
- <code>document.fonts.ready</code> corrige medidas após fontes;
- estado React muda apenas quando a cena ativa muda;
- progresso contínuo é escrito em CSS custom properties;
- a coluna visual fica sticky em desktop;
- navegação por âncora continua nativa;
- texto editorial permanece opaco durante todo o movimento.

O hero possui fases curtas de sinal, pulso, tipografia, órbita e handoff. O runtime de motion só é habilitado com viewport mínima, altura suficiente, hover e ponteiro fino. Coarse pointer e alturas restritas recebem composição estática, evitando pinning quebrado.

CSS cobre explicitamente:

- sem scripting;
- reduced motion;
- contraste aumentado;
- impressão;
- touch/coarse pointer;
- desktops de pouca altura;
- breakpoints móvel, tablet e desktop.

### 12.5 Guardrails para novas animações

Antes de adicionar motion:

1. defina o significado da animação;
2. implemente o conteúdo final antes do efeito;
3. prefira transform e opacity;
4. não leia layout a cada frame;
5. use listener passivo e agrupe escrita em <code>requestAnimationFrame</code>;
6. pause fora da viewport ou em aba oculta;
7. remova listeners, observers, frames e contextos;
8. ofereça reduced motion e fallback sem JavaScript;
9. teste touch, low-power, WebGL indisponível e viewport baixa;
10. confira bundle e CPU/GPU.

## 13. Performance

### 13.1 Estratégias

- pré-renderização da home e artigo por locale;
- Server Components para estrutura e conteúdo;
- providers com subconjuntos de mensagens;
- imports dinâmicos para terminal, drawer, Liquid Portal, GSAP e formulário;
- import do Resend somente após validar o request;
- <code>next/font</code> com fontes self-hosted no build e <code>display: swap</code>;
- otimização de imports de GSAP e OGL pelo Turbopack;
- thumbnails locais da vitrine com dimensões reservadas, blur placeholder, lazy loading e negociação AVIF/WebP pelo <code>next/image</code>;
- <code>content-visibility: auto</code> quando suportado para seções fora da viewport;
- frames, observers e listeners com cleanup;
- motion reduzido por capacidade e preferência.
- escaneamento Tailwind limitado a <code>src/</code>, sem observar documentação, E2E, scripts ou configuração de agentes.

O build pode precisar de acesso de rede para resolver as fontes do <code>next/font/google</code>.

### 13.2 Web Vitals

Quando <code>NEXT_PUBLIC_WEB_VITALS_ENDPOINT</code> está configurado, <code>WebVitals</code> envia:

- ID;
- nome;
- valor e delta;
- rating;
- tipo de navegação;
- pathname;
- timestamp.

O envio tenta <code>sendBeacon</code> e usa <code>fetch</code> same-origin com <code>keepalive</code> como fallback. Falhas nunca interrompem a experiência.

O Next.js está configurado para atribuição de CLS, LCP e INP. Este repositório não contém o endpoint receptor, persistência, dashboard ou SLO. Deixe a variável vazia até existir um caminho first-party real.

### 13.3 Gate de bundle

O gate usa a edição inglesa como superfície representativa:

- home: <code>/en/</code>;
- artigo: <code>/en/insights/go-em-producao</code>.

HTML, JS e CSS são medidos com gzip nível 9. WOFF2 usa tamanho bruto. O gate extrai:

- JS e CSS referenciados pelo HTML inicial;
- fontes preloadadas pelo HTML;
- inventário WOFF2 alcançável pelo CSS inicial;
- entries do manifest de lazy loading;
- chunks JS/CSS fora das entradas iniciais das duas rotas.

Para cada rota medida cujo HTML estático não exista, o script:

1. reúne todas as superfícies dinâmicas;
2. usa <code>BUNDLE_BUDGET_BASE_URL</code>, se configurada; ou
3. reserva uma porta loopback;
4. inicia uma única instância do standalone recém-construído com fixtures não secretas para o bootstrap;
5. captura todas as rotas dinâmicas nessa instância;
6. encerra o processo com SIGTERM e fallback para SIGKILL.

Rotas que continuam pré-renderizadas são lidas diretamente do artefato. O mesmo mecanismo cobre home e artigo; não existe uma exceção específica por superfície.

### 13.4 Budgets e overrides

| Medida | Default | Variável principal |
| --- | ---: | --- |
| Home JS | 260 KiB | <code>BUNDLE_BUDGET_HOME_JS_KB</code> |
| Home CSS | 25 KiB | <code>BUNDLE_BUDGET_HOME_CSS_KB</code> |
| Home HTML | 60 KiB | <code>BUNDLE_BUDGET_HOME_HTML_KB</code> |
| Home font preload | 120 KiB | <code>BUNDLE_BUDGET_HOME_FONT_PRELOAD_KB</code> |
| Home font inventory | 210 KiB | <code>BUNDLE_BUDGET_HOME_FONT_INVENTORY_KB</code> |
| Artigo JS | 250 KiB | <code>BUNDLE_BUDGET_ARTICLE_JS_KB</code> |
| Artigo CSS | 25 KiB | <code>BUNDLE_BUDGET_ARTICLE_CSS_KB</code> |
| Artigo HTML | 35 KiB | <code>BUNDLE_BUDGET_ARTICLE_HTML_KB</code> |
| Artigo font preload | 120 KiB | <code>BUNDLE_BUDGET_ARTICLE_FONT_PRELOAD_KB</code> |
| Artigo font inventory | 210 KiB | <code>BUNDLE_BUDGET_ARTICLE_FONT_INVENTORY_KB</code> |
| Cada lazy entry | 100 KiB | <code>BUNDLE_BUDGET_LAZY_ENTRY_KB</code> |
| Maior chunk diferido | 90 KiB | <code>BUNDLE_BUDGET_LAZY_CHUNK_KB</code> |
| Total diferido único | 165 KiB | <code>BUNDLE_BUDGET_LAZY_TOTAL_KB</code> |

Aliases legados ainda aceitos:

- <code>BUNDLE_BUDGET_JS_KB</code>, <code>BUNDLE_BUDGET_CSS_KB</code> e <code>BUNDLE_BUDGET_HTML_KB</code> para a home;
- <code>BUNDLE_BUDGET_HOME_FONT_KB</code> e <code>BUNDLE_BUDGET_ARTICLE_FONT_KB</code> para preload.

<code>BUNDLE_BUDGET_BASE_URL</code> deve ser uma URL HTTP(S) absoluta e serve à captura de qualquer superfície medida que não tenha HTML estático.

Não aumente budgets automaticamente após uma regressão. Identifique o chunk, confirme valor ao usuário e registre a razão.

### 13.5 Analyzer e limites de observabilidade

~~~bash
npm run build
npm run check:bundle
npm run analyze
~~~

O analyzer grava <code>.next/diagnostics/analyze</code>.

Limites atuais:

- budgets cobrem somente a edição inglesa da home e do artigo existente;
- o total diferido mede todos os chunks fora das entradas iniciais, não apenas o caminho que um usuário percorre;
- não existe gate Lighthouse;
- não há coleta de dados de campo configurada por padrão;
- budgets de transferência não substituem perfil de CPU, memória ou GPU.

## 14. Testes e quality gates

### 14.1 Vitest

Vitest roda em ambiente Node e inclui <code>src/**/*.test.ts</code> e <code>scripts/**/*.test.mjs</code>.

| Área | Cobertura principal |
| --- | --- |
| API de contato | mídia, origem, JSON, tamanho, honeypot, schema, provedor, idempotência e rate limit |
| Ambiente de produção | origem, endpoint de vitals, segredos, emails, proxy, limites e mensagens sem vazamento |
| Instrumentation | bypass em dev/edge e falha antecipada em produção Node |
| Validação | normalização, unknown fields, controles e limites |
| i18n | forma idêntica dos catálogos e fluxo de contato |
| Artigo | edições completas, cenas, labels e cópias isoladas |
| Sites publicados | IDs e destinos únicos, HTTPS, assets locais e dimensões reservadas |
| Bundle gate | assets, fallback dinâmico, fontes, manifestos vazios e regressões |

<code>npm test</code> também executa o teste shell do quality hook.

### 14.2 Playwright

| Projeto | Escopo |
| --- | --- |
| <code>chromium</code> | Regressão completa de UI, SEO, a11y, artigo, drawer, API e mobile |
| <code>chromium-webgl-disabled</code> | Drawer funcional sem WebGL |
| <code>firefox-smoke</code> | Home, sites publicados, artigo e drawer nas invariantes cross-browser |
| <code>webkit-smoke</code> | Home, sites publicados, artigo e drawer nas invariantes cross-browser |

Configuração:

- base local padrão: <code>http://localhost:3100</code>;
- servidor: <code>npm run start</code>;
- build prévio obrigatório;
- dois workers localmente e um na CI;
- zero retry local e dois na CI;
- <code>forbidOnly</code> e falha em flaky tests na CI;
- trace retido em falha;
- screenshot somente em falha;
- vídeo retido em falha.

O alvo declarado em <code>browserslist</code> são as duas versões mais recentes de Chrome, Firefox, Safari e Edge. A regressão completa é concentrada em Chromium; Firefox e WebKit recebem smokes das invariantes portáveis.

<code>PLAYWRIGHT_TEST_BASE_URL</code> desabilita o web server interno e aponta para uma instância existente. <code>PORT</code> muda a porta do servidor local criado pelo Playwright.

### 14.3 Sequência local

~~~bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run check:bundle
npm run test:e2e:install
npm run test:e2e
~~~

<code>npm run typecheck</code> executa <code>next typegen</code> antes do TypeScript. O compilador usa modo <code>strict</code>, <code>noUncheckedIndexedAccess</code> e <code>noImplicitOverride</code>.

Em uma máquina Linux mínima, a preparação equivalente é <code>npx playwright install --with-deps chromium firefox webkit</code>, incluindo as bibliotecas de sistema. A CI executa essa variante explicitamente.

### 14.4 Quality hook para agentes

<code>.github/hooks/quality.json</code> chama <code>scripts/ai-quality-gate.sh</code> após ferramentas de edição. O hook só executa lint quando:

- <code>AI_QUALITY_HOOKS=1</code>;
- a ferramenta é <code>apply_patch</code>, <code>create_file</code> ou <code>edit_notebook_file</code>;
- Node, npm, <code>package.json</code> e o script lint estão disponíveis.

Ativação:

~~~bash
export AI_QUALITY_HOOKS=1
~~~

O hook é uma proteção rápida, não substitui o gate completo.

## 15. Docker

### 15.1 Stages

| Stage | Base | Responsabilidade |
| --- | --- | --- |
| <code>base</code> | Node 24.18.0 trixie-slim por digest | Workdir e telemetria |
| <code>deps</code> | base | <code>npm ci</code> sem lifecycle e auditoria de assinaturas |
| <code>builder</code> | base | Código, build args públicos e <code>npm run build</code> |
| <code>dev</code> | deps | Next dev em <code>0.0.0.0:3000</code> |
| <code>runner</code> | distroless Node 24 Debian 13 por digest | Artefato standalone não-root |

<code>scripts/prepare-standalone.mjs</code>:

1. quando <code>VERCEL=1</code>, encerra com sucesso sem exigir standalone, pois o adaptador da plataforma controla o output;
2. nos demais ambientes, exige <code>.next/standalone/server.js</code>;
3. copia <code>public</code> se a pasta existir;
4. substitui e copia <code>.next/static</code>;
5. exige assets estáticos não vazios.

### 15.2 Desenvolvimento

<code>npm run dev</code> executa <code>scripts/dev-server.mjs</code>. O wrapper:

1. usa Webpack por padrão após o pico de memória observado no fluxo Turbopack;
2. lê somente os dois guardrails via <code>@next/env</code>, captura seus valores e restaura o ambiente para que o processo filho mantenha hot reload de <code>.env.development.local</code>;
3. substitui qualquer limite de old space V8 herdado pelo teto configurado;
4. mantém um único cache de desenvolvimento, persiste o bundler ativo fora da área gerenciada pelo Next e limpa <code>.next/dev</code> somente ao alternar entre Webpack e Turbopack;
5. soma o RSS do processo Next e de todos os descendentes a cada dois segundos, via <code>ps</code> no macOS e <code>/proc</code> no Linux;
6. avisa em 80% e encerra a árvore inteira ao ultrapassar o teto, com escalonamento de <code>SIGTERM</code> para <code>SIGKILL</code>;
7. rejeita uma segunda inicialização enquanto o lock do Next aponta para um PID ativo;
8. encaminha sinais de encerramento, tolera sinais duplicados e preserva o código de saída.

Turbopack continua disponível de forma explícita e sob o mesmo guardrail:

~~~bash
npm run dev:turbo
~~~

No Windows, o teto de old space continua ativo, mas a leitura portátil de RSS por árvore não é executada. O Compose é a alternativa com limite rígido de memória nesse ambiente.

~~~bash
cp .env.example .env.development.local
docker compose --env-file .env.development.local -f docker-compose.dev.yml up --build
~~~

<code>--env-file</code> é obrigatório neste fluxo para que a interpolação do Compose receba as variáveis server-side do arquivo; o bind mount, sozinho, não substitui valores já definidos em <code>environment</code>.

Para encerrar:

~~~bash
docker compose --env-file .env.development.local -f docker-compose.dev.yml down --remove-orphans
~~~

O Compose:

- monta o repositório em <code>/app</code>;
- mantém <code>node_modules</code> e cache Next em volumes;
- compara um fingerprint de <code>package-lock.json</code>, <code>package.json</code>, <code>.npmrc</code>, Node, sistema e arquitetura antes do startup;
- executa <code>npm ci</code> e <code>npm audit signatures</code> somente quando o volume de dependências está incompatível;
- invalida o cache Next quando muda a runtime de dependências;
- usa eventos nativos de filesystem para o hot reload; polling não é habilitado por padrão;
- publica somente em loopback;
- usa <code>init</code>;
- limita o container a 2.560 MiB, reserva 1.024 MiB e restringe a árvore a 256 PIDs por padrão;
- remove privilege escalation;
- rotaciona logs.

### 15.3 Produção

~~~bash
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production up --build --detach
docker compose --env-file .env.production ps
~~~

O health check chama <code>/robots.txt</code> a cada 30 segundos, com timeout de 5 segundos, start period de 20 segundos e três tentativas. Ele confirma que o servidor HTTP responde, mas não testa Resend nem qualquer dependência externa.

Smoke:

~~~bash
curl --fail --head http://127.0.0.1:3000/
curl --fail http://127.0.0.1:3000/robots.txt
curl --fail http://127.0.0.1:3000/sitemap.xml
~~~

Logs e encerramento:

~~~bash
docker compose --env-file .env.production logs --follow portfolio
docker compose --env-file .env.production down --remove-orphans
~~~

O runner não tem shell. Não planeje diagnóstico com <code>docker exec ... sh</code>. Use:

- <code>docker logs</code>;
- <code>docker inspect</code>;
- requests HTTP externos;
- <code>/nodejs/bin/node</code> apenas para inspeções pontuais já suportadas pelo ambiente.

### 15.4 Build args

Somente variáveis públicas entram como build args:

- <code>NEXT_PUBLIC_SITE_URL</code>;
- <code>NEXT_PUBLIC_WEB_VITALS_ENDPOINT</code>.

Segredos jamais devem ser passados com <code>--build-arg</code>. Mudanças em build args exigem reconstrução completa da imagem.

### 15.5 Contexto de build

<code>.dockerignore</code> exclui:

- artefatos locais e dependências;
- Git e configurações de editor;
- ambientes e logs;
- testes, reports e traces;
- documentação;
- arquivos de agentes;
- Compose e Dockerfiles do contexto copiado;
- configs de teste.

O Dockerfile solicitado pelo comando continua disponível ao builder mesmo estando na lista de ignore.

## 16. CI e manutenção de dependências

### 16.1 Triggers

O workflow roda em:

- push para <code>main</code> e <code>dev</code>;
- pull request para <code>main</code> e <code>dev</code>;
- acionamento manual;
- cron semanal às segundas.

Permissões são somente leitura. Concorrência cancela a execução anterior da mesma referência.

### 16.2 Pipeline

Ordem atual:

1. checkout por commit pinado;
2. Node.js 24.18.0 com cache npm;
3. verificação exata de Node 24.18.0 e npm 11.16.0;
4. fixtures determinísticas e não secretas;
5. <code>npm ci</code> sem lifecycle;
6. auditoria de assinaturas;
7. auditoria de dependências em nível moderate;
8. Vitest e quality hook;
9. ESLint;
10. tipos;
11. build em modo Vercel, sem standalone;
12. build de produção standalone para os gates self-hosted e Docker;
13. bundle budgets;
14. instalação de Chromium, Firefox e WebKit;
15. Playwright;
16. validação do Compose;
17. build do runner;
18. Trivy;
19. smoke do container;
20. cleanup;
21. upload do report Playwright por sete dias.

O smoke confirma:

- usuário não-root;
- entrypoint e command;
- health;
- Node e ambiente;
- headers críticos;
- home;
- robots;
- existência e entrega de asset estático.

### 16.3 Dependabot

Toda segunda-feira, horário de São Paulo:

- npm às 06:00;
- Docker às 06:10;
- GitHub Actions às 06:20.

Atualizações de digest e actions devem preservar os pins e passar todo o pipeline.

## 17. Operação

### 17.1 Preflight de release

1. confirme conteúdo e autorização das métricas;
2. use uma origem HTTPS pública;
3. confirme canonical, alternates, sitemap e imagens sociais;
4. configure chave Resend e remetente verificado;
5. confirme destinatário;
6. gere segredo exclusivo de idempotência;
7. decida confiança de proxy e número de hops;
8. defina limites de request e rate limit;
9. execute o gate completo;
10. valide Compose;
11. construa e escaneie a imagem;
12. faça smoke na imagem exata a implantar;
13. valide formulário no domínio final;
14. confirme headers no proxy público;
15. confirme logs, alertas e procedimento de rollback da plataforma.

Exemplo de segredo:

~~~bash
openssl rand -hex 32
~~~

### 17.2 Health e readiness

O único health check versionado consulta <code>/robots.txt</code>. Não existe endpoint dedicado de liveness/readiness. A aplicação não mantém banco ou cache próprio, e o Resend é usado apenas sob demanda.

Se a plataforma exigir readiness profunda, implemente um contrato explícito sem transformar a disponibilidade do site público na disponibilidade do provedor de email.

### 17.3 Logs

- Next.js e erros da API escrevem em stdout/stderr.
- O Compose usa driver <code>json-file</code>, 10 MiB por arquivo e três arquivos.
- A API evita PII no log de erro.
- Não existe integração de error tracking ou agregação de logs neste repositório.

### 17.4 Shutdown e restart

- Docker envia <code>SIGTERM</code>.
- <code>init: true</code> ajuda no encaminhamento de sinais e reaping.
- <code>restart: unless-stopped</code> reinicia falhas.
- Rate limits em memória são perdidos no restart.

### 17.5 Escala horizontal

Antes de usar mais de uma réplica:

- externalize rate limiting;
- defina afinidade somente se houver motivo explícito;
- mantenha idempotência compartilhada pelo Resend;
- centralize logs e métricas;
- valide headers de proxy em cada camada;
- garanta que todos os pods usem o mesmo build público e a mesma configuração.

### 17.6 Rollback e estado

Não existe IaC, manifesto de plataforma, migração de banco ou script de rollback no repositório. Como o site não persiste estado, rollback da aplicação deve ser feito pela plataforma para uma imagem previamente validada. A retenção, assinatura e promoção de imagens precisam ser definidas externamente.

## 18. Troubleshooting

### Node fora da faixa suportada

Sintoma: <code>npm ci</code> falha por engine.

~~~bash
nvm install
nvm use
node --version
~~~

Versões anteriores a 24.18.0 e majors a partir da 25 são rejeitadas. A referência reproduzível continua 24.18.0.

### npm diferente da referência

O projeto não impõe uma faixa adicional de npm, mas CI e <code>packageManager</code> usam 11.16.0. Para reproduzir exatamente uma falha de CI, use a versão de referência.

### Build rejeita a origem

Verifique:

- HTTPS;
- hostname público;
- ausência de path, query, hash e credenciais;
- ausência de espaços;
- endpoint de Web Vitals como path same-origin.

<code>localhost</code>, ranges reservados e domínios de exemplo são rejeitados no gate de produção.

### Standalone encerra imediatamente

Leia stderr. O bootstrap agrega nomes de variáveis inválidas. Confirme todas as variáveis server-side, principalmente <code>CONTACT_TRUST_PROXY</code>, origem, emails e entropia dos segredos.

### Porta ocupada

Desenvolvimento usa 3000 e Playwright usa 3100.

~~~bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:3100 -sTCP:LISTEN
~~~

Altere a porta do Playwright:

~~~bash
PORT=3200 npm run test:e2e
~~~

### Servidor de desenvolvimento cresce em memória

O servidor protegido informa os limites ao iniciar:

~~~text
[dev-guard] webpack; V8 old space <= 1536 MiB; process tree RSS <= 2048 MiB
~~~

Se o teto for alcançado, o wrapper encerra toda a árvore e informa o RSS observado. Não aumente os limites como primeira resposta. Confirme se arquivos gerados estão sendo gravados dentro de diretórios observados, encerre execuções E2E antigas e reinicie o cache de desenvolvimento nativo somente se houver evidência de corrupção:

~~~bash
rm -rf .next/dev
npm run dev
~~~

No Docker, pare o serviço antes de descartar os volumes. A opção <code>--volumes</code> remove tanto o cache Next quanto <code>node_modules</code>; o próximo <code>up</code> fará uma instalação limpa e verificada:

~~~bash
docker compose --env-file .env.development.local -f docker-compose.dev.yml down --volumes --remove-orphans
docker compose --env-file .env.development.local -f docker-compose.dev.yml up --build
~~~

Para diagnosticar uma possível regressão específica do Turbopack, use temporariamente o modo opt-in com tracing e mantenha o guardrail ativo:

~~~bash
NEXT_TURBOPACK_TRACING=1 npm run dev:turbo
~~~

O trace fica em <code>.next/dev/trace-turbopack</code>. Ele pode conter caminhos do ambiente local e não deve ser versionado. Em Docker, <code>DEV_CONTAINER_MEMORY_LIMIT</code> é a última barreira; mantenha-o acima de <code>NEXT_DEV_MEMORY_LIMIT_MB</code> para o encerramento controlado ocorrer antes do OOM killer.

### Playwright não inicia

Confirme:

1. <code>npm run build</code> concluído;
2. browsers instalados;
3. porta livre;
4. artefato standalone presente;
5. nenhum servidor incompatível sendo reutilizado localmente.

Para usar uma instância já iniciada:

~~~bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e
~~~

### Container unhealthy

~~~bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs portfolio
docker inspect "$(docker compose --env-file .env.production ps --quiet portfolio)"
~~~

Procure erros de bootstrap, porta, filesystem e health check.

### Formulário retorna 403

- compare <code>Origin</code> com <code>CONTACT_ALLOWED_ORIGINS</code>;
- inclua a origem pública exata;
- não inclua path;
- revise o proxy e <code>Sec-Fetch-Site</code>.

### Formulário retorna 415

Envie <code>Content-Type: application/json</code> sem compressão, ou com encoding <code>identity</code>.

### Formulário retorna 413

Reduza o payload ou ajuste <code>CONTACT_MAX_BODY_BYTES</code> dentro da faixa validada. Não aumente sem rever abuso e custo.

### Formulário retorna 429

Leia <code>Retry-After</code> e headers <code>RateLimit-*</code>. Com proxy não confiável, todos compartilham o bucket. Em múltiplas réplicas, os limites são independentes e devem ser externalizados.

### Formulário retorna 502 ou 504

Revise disponibilidade do Resend, remetente, chave, timeout e logs sem expor o payload. 502 representa rejeição/exceção; 504 representa timeout.

### Formulário retorna 503

Configuração server-side de email está incompleta. Em produção normal, o bootstrap deveria impedir que essa instância começasse a servir.

### WebGL falha

O site deve permanecer utilizável. Confirme:

- gradiente estático no hero;
- drawer opaco e legível;
- nenhum erro não tratado;
- cenário <code>chromium-webgl-disabled</code>.

Não force WebGL em hardware ou preferências que o gate de capacidade exclui.

### Timeline não desenha

Navegadores sem CSS Scroll-Driven Animations exibem somente o trilho estático. Isso é o fallback esperado. Reduced motion também impede o desenho progressivo.

### Artigo parece estático

É esperado em:

- reduced motion;
- ponteiro coarse ou sem hover;
- viewport menor que o limite;
- altura abaixo de 600 px;
- JavaScript desabilitado.

O texto deve continuar completo.

### Bundle gate falha

1. execute <code>npm run build</code> novamente;
2. leia a linha e o asset excedido;
3. abra o analyzer;
4. verifique novos imports síncronos, mensagens, CSS e fontes;
5. confirme que manifests e assets não estão vazios;
6. reduza a regressão antes de alterar o budget.

### Build não baixa fontes

As fontes são declaradas com <code>next/font/google</code> e incorporadas no build. Confirme conectividade e política de rede do ambiente de build. O runtime não precisa buscar fontes do Google.

### Filesystem read-only

O runner só pode gravar nos dois <code>tmpfs</code> definidos. Um novo recurso que precise de disco deve:

1. justificar persistência;
2. receber mount explícito e mínimo;
3. manter o root filesystem read-only;
4. ser testado na CI.

### Dependência exige postinstall

<code>ignore-scripts=true</code> é intencional. Avalie se há artefato pré-compilado, script explícito seguro ou alternativa de dependência. Não habilite scripts globalmente sem revisão de supply chain.

## 19. Convenções de desenvolvimento

### 19.1 Next.js

Esta versão pode divergir de convenções anteriores. Antes de alterar App Router, metadata, proxy, caching, Route Handlers ou APIs experimentais, leia a documentação instalada em <code>node_modules/next/dist/docs/</code>.

### 19.2 TypeScript

- preserve modo strict;
- não use casts para esconder estados inválidos;
- trate acessos possivelmente indefinidos;
- use <code>@/</code> para imports de <code>src</code>;
- mantenha contratos compartilhados em <code>src/types</code> ou junto do domínio quando forem específicos.

### 19.3 React e componentes

- prefira componentes existentes;
- mantenha Server Component por padrão;
- use Client Component apenas para APIs do browser ou interação;
- não crie provider global para estado local;
- preserve conteúdo antes de animação;
- trate erro e loading junto de fronteiras lazy;
- limpe todo efeito.

### 19.4 CSS e design

- use tokens de <code>src/styles/variables.css</code>;
- preserve foco visível e responsividade;
- teste transparência, contraste e ponteiro coarse;
- evite dimensões rígidas sem fallback;
- prefira CSS nativo e Web Animations antes de adicionar runtime;
- mantenha a estética moderna sem sacrificar leitura.

### 19.5 Backend

- valide fronteiras antes da lógica;
- mantenha responses sem segredos;
- preserve compatibilidade do payload;
- mantenha limites finitos;
- não confie em headers de proxy sem topologia documentada;
- cubra casos válidos, inválidos e falhas externas.

### 19.6 Dependências

Uma nova dependência precisa demonstrar:

- ganho não atendido pela plataforma ou código existente;
- compatibilidade com lifecycle scripts bloqueados;
- impacto de bundle;
- licença e manutenção aceitáveis;
- suporte aos browsers configurados;
- comportamento em SSR e standalone.

### 19.7 Documentação

Atualize README e este documento quando mudar:

- comandos;
- engines ou versões de referência;
- variáveis e defaults;
- rotas e conteúdo;
- security headers;
- budgets;
- Docker ou CI;
- gaps operacionais.

Instruções devem ser reproduzíveis por um revisor sem contexto.

## 20. Matriz de mudanças

| Mudança | Arquivos mínimos a revisar | Validação mínima |
| --- | --- | --- |
| Texto localizado | três catálogos ou três edições do artigo | testes i18n/conteúdo, build e E2E da rota |
| Projeto | dados, tipos e mensagens | Vitest, drawer desktop/mobile, a11y e bundle |
| Site publicado | dados, três catálogos e thumbnail local | Vitest, link HTTPS, no-JS, cross-browser, overflow e bundle |
| Experiência profissional | dados e mensagens | semântica da lista, espaçamento, timeline e reduced motion |
| Artigo | conteúdo, rota, metadata, sitemap e imagem | sem JS, print, reduced motion, SEO, a11y e bundle |
| Motion | componente, CSS e instruções | reduced motion, touch, low-power, CPU/GPU e E2E |
| API | route, schema, env e testes | unitários de todos os status, segurança e compatibilidade |
| Variável pública | env example, validator, Docker e CI | build e inspeção do bundle/metadata |
| Variável server-side | env example, validator, Compose e CI | bootstrap, testes e container |
| Dependência | package e lockfile | install sem lifecycle, audit, testes e bundle |
| Docker | Dockerfile, Compose e CI | build, Trivy, usuário, health, headers e assets |

## 21. Gaps e evolução consciente

Estes itens não devem ser descritos como existentes:

1. rate limiter distribuído;
2. endpoint receptor de Web Vitals;
3. error tracking e agregação de logs;
4. endpoint dedicado de health/readiness;
5. WAF, CDN, TLS e proxy versionados;
6. IaC, registry, assinatura de imagem e rollback;
7. CMS ou pipeline editorial;
8. rota genérica e budget automático para múltiplos artigos;
9. Lighthouse CI e SLOs de campo;
10. formulário funcional sem JavaScript;
11. CSP por nonce e report de violations;
12. smoke profundo em Firefox/WebKit equivalente ao Chromium;
13. teste de carga da API de contato;
14. SBOM.

Prioridade operacional antes de escala horizontal:

1. rate limiting distribuído e política no edge;
2. observabilidade centralizada;
3. health/readiness adequado à plataforma;
4. runbook de deploy e rollback;
5. SLOs e dados reais de Web Vitals.

## 22. Referência rápida de arquivos

| Tema | Arquivos |
| --- | --- |
| Scripts e versões | <code>package.json</code>, <code>.nvmrc</code>, <code>.npmrc</code> |
| Next e headers | <code>next.config.ts</code> |
| Locale e roteamento | <code>src/i18n.config.ts</code>, <code>src/navigation.ts</code>, <code>src/proxy.ts</code> |
| Layout e metadata | <code>src/app/[locale]/layout.tsx</code> |
| Home | <code>src/app/[locale]/(home)/page.tsx</code> |
| Artigo | <code>src/app/[locale]/insights/go-em-producao</code>, <code>src/components/insights</code> |
| Conteúdo | <code>src/data/portfolio.ts</code>, <code>src/data/showcase-sites.ts</code>, <code>src/content</code>, <code>src/messages</code> |
| Vitrine de sites | <code>src/components/sections/WebsiteShowcase.tsx</code>, <code>src/components/sections/WebsiteShowcase.module.css</code>, <code>public/images/sites</code> |
| Contato | <code>src/app/api/contact/route.ts</code>, <code>src/lib/validations.ts</code> |
| Ambiente | <code>.env.example</code>, <code>src/lib/production-env.ts</code>, <code>src/instrumentation.ts</code> |
| Performance | <code>scripts/check-bundle-budget.mjs</code>, <code>src/components/layout/WebVitals.tsx</code> |
| Standalone | <code>scripts/prepare-standalone.mjs</code> |
| Docker | <code>Dockerfile</code>, <code>docker-compose.yml</code>, <code>docker-compose.dev.yml</code> |
| CI | <code>.github/workflows/ci.yml</code>, <code>.github/dependabot.yml</code> |
| Testes | <code>vitest.config.mts</code>, <code>playwright.config.ts</code>, <code>e2e</code> |
| Guardrails | <code>AGENTS.md</code>, <code>.github/instructions</code>, <code>.github/hooks/quality.json</code> |

## 23. Checklist de onboarding

1. leia este documento e o README;
2. rode <code>nvm use</code> ou confirme Node <code>&gt;=24.18.0 &lt;25</code>;
3. instale com <code>npm ci</code>;
4. crie <code>.env.development.local</code> a partir do exemplo;
5. execute <code>npm run dev</code>;
6. navegue pelos três locales;
7. teste home, artigo, drawer, menu e contato;
8. leia as instruções da área que será alterada;
9. consulte a documentação local do Next.js;
10. execute testes da área;
11. rode o gate completo antes de entregar;
12. atualize documentação se o contrato mudar.

Critério de conclusão: outra pessoa deve conseguir instalar, executar, testar, construir, empacotar, diagnosticar e evoluir o projeto usando somente os arquivos versionados e as credenciais externas explicitamente indicadas.
