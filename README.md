# Roberto Moraes — Portfólio

[![CI](https://github.com/Rdemora2/Portifolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Rdemora2/Portifolio/actions/workflows/ci.yml)

Portfólio profissional multilíngue em Next.js 16 e React 19. A aplicação combina conteúdo pré-renderizado, uma experiência editorial imersiva e efeitos progressivos com limites explícitos de acessibilidade, segurança e performance.

Este README é a porta de entrada operacional. O desenho completo, os fluxos, contratos, decisões e procedimentos de manutenção estão em [docs/TECHNICAL_CONTEXT.md](./docs/TECHNICAL_CONTEXT.md).

## Características principais

- Home e artigo localizados e pré-renderizados para português, inglês e espanhol.
- Prefixo de idioma somente quando necessário: <code>/</code>, <code>/en</code> e <code>/es</code>.
- Metadata localizada com canonical, <code>hreflang</code>, Open Graph, Twitter Cards, sitemap e JSON-LD.
- Server Components por padrão e ilhas client-side somente para interação.
- Vitrine de sites publicados com screenshots locais, links externos seguros e conteúdo integralmente localizado.
- Artigo legível sem JavaScript, com experiência de scroll aprimorada quando o navegador e as preferências do usuário permitem.
- WebGL, GSAP e formulário carregados sob demanda, com fallbacks estáticos ou nativos.
- API de contato com validação estrita, proteção de origem, limites de corpo, rate limiting, honeypot, timeout e idempotência.
- Entrega nativa na Vercel e build standalone para imagem distroless, não-root e com filesystem somente leitura via Compose.
- Gates automatizados para testes, lint, tipos, build, bundle, navegadores, dependências e imagem Docker.

## Stack

| Área | Implementação atual |
| --- | --- |
| Aplicação | Next.js 16.3.0, React 19.2.4, TypeScript 5 |
| Interface | Tailwind CSS 4, CSS Modules, CSS nativo e Web Animations API |
| Motion opcional | GSAP 3.15.0 e OGL 1.0.11 |
| Formulário | React Hook Form 7.74.0, Zod 4.4.1 e Resend 6.17.2 |
| Internacionalização | next-intl 4.12 |
| Qualidade | ESLint 9, Vitest 4.1, Playwright 1.61 e axe-core |
| Entrega | GitHub Actions, Docker e Docker Compose |

## Requisitos

- Node.js <code>&gt;=24.18.0 &lt;25</code>.
- npm 11.16.0 como versão de referência reproduzível.
- Docker 24+ somente para os fluxos em container.

O projeto usa Node.js 24.18.0 em <code>.nvmrc</code>, CI e Docker. <code>engines</code>, <code>devEngines</code> e <code>engine-strict=true</code> mantêm instalações na linha 24, a partir de 24.18.0, para evitar upgrades automáticos de major e divergência entre desenvolvimento, CI e deploy. O campo <code>packageManager</code> declara npm 11.16.0 como referência reproduzível, sem impor uma faixa adicional de compatibilidade.

Scripts de lifecycle de dependências ficam desabilitados por <code>.npmrc</code>. Os scripts do próprio projeto, executados explicitamente com <code>npm run</code>, continuam habilitados.

## Execução local

### Node.js

Use <code>nvm use</code> para a toolchain de referência ou uma versão compatível da linha Node.js 24:

~~~bash
nvm use
node --version
npm --version
npm ci
cp .env.example .env.development.local
npm run dev
~~~

A aplicação fica em [http://localhost:3000](http://localhost:3000).

Use especificamente <code>.env.development.local</code> para o desenvolvimento. O template contém apenas placeholders locais e nunca deve ser promovido para produção. As credenciais do Resend só são necessárias para validar um envio real; os demais conteúdos e links funcionam sem elas.

O fluxo padrão usa explicitamente Webpack, limita o old space do V8 a 1.536 MiB e, no macOS e Linux, monitora o RSS de toda a árvore do servidor. Se ela ultrapassar 2.048 MiB, o processo é encerrado com uma mensagem explícita em vez de pressionar a memória da máquina. Os limites podem ser ajustados por <code>NEXT_DEV_OLD_SPACE_MB</code> e <code>NEXT_DEV_MEMORY_LIMIT_MB</code>; ambos aceitam de 512 a 4.096 MiB e o old space deve deixar ao menos 256 MiB para o restante do heap, memória nativa e processos filhos. No Windows, o old space continua limitado, mas o teto rígido de memória exige o fluxo Docker. O wrapper lê os dois valores com a mesma precedência de arquivos <code>.env</code> do Next.js sem repassar o estado do loader ao processo filho.

Se o Node 24 do Homebrew estiver <em>keg-only</em>:

~~~bash
export PATH="$(brew --prefix node@24)/bin:$PATH"
~~~

### Docker de desenvolvimento

O Compose de desenvolvimento monta o repositório, preserva <code>node_modules</code> e <code>.next</code> em volumes nomeados e usa eventos nativos para o hot reload. Além do watchdog da aplicação, o container tem limite rígido padrão de 2.560 MiB e reserva de 1.024 MiB:

~~~bash
cp .env.example .env.development.local
docker compose --env-file .env.development.local -f docker-compose.dev.yml up --build
~~~

O parâmetro <code>--env-file</code> também alimenta a interpolação do Compose; assim, valores server-side definidos no arquivo chegam ao container em vez de serem substituídos pelos defaults do YAML.

O template deriva <code>NEXT_PUBLIC_SITE_URL</code> e <code>CONTACT_ALLOWED_ORIGINS</code> de <code>PORT</code>. Portanto, alterar <code>PORT</code> no arquivo muda em conjunto a porta publicada e as duas origens browser-facing.

Os volumes de dependências e cache são reconciliados por um fingerprint de <code>package-lock.json</code>, <code>package.json</code>, <code>.npmrc</code>, Node.js, plataforma e arquitetura. Ao detectar uma runtime incompatível, o container executa uma instalação limpa com verificação de assinaturas e descarta apenas o cache Next obsoleto; um volume antigo nunca é reutilizado silenciosamente.

Para encerrar e remover os containers:

~~~bash
docker compose --env-file .env.development.local -f docker-compose.dev.yml down --remove-orphans
~~~

## Configuração

As configurações públicas são incorporadas ao bundle. Segredos permanecem exclusivamente no runtime do servidor.

| Variável | Fase | Obrigatoriedade |
| --- | --- | --- |
| <code>NEXT_PUBLIC_SITE_URL</code> | build e runtime | Origem pública; em produção deve ser HTTPS e pública |
| <code>NEXT_PUBLIC_WEB_VITALS_ENDPOINT</code> | build | Caminho first-party opcional para telemetria |
| <code>RESEND_API_KEY</code> | runtime | Obrigatória no bootstrap de produção |
| <code>CONTACT_FROM_EMAIL</code> | runtime | Remetente com domínio público; deve estar verificado para envio real |
| <code>CONTACT_TO_EMAIL</code> | runtime | Destino das mensagens |
| <code>CONTACT_IDEMPOTENCY_SECRET</code> | runtime | Segredo de alta entropia com pelo menos 32 caracteres |
| <code>CONTACT_ALLOWED_ORIGINS</code> | runtime | Lista de origens HTTPS; deve conter a origem pública |
| <code>CONTACT_TRUST_PROXY</code> | runtime | Decisão explícita: <code>true</code> ou <code>false</code> |

Limites de request, timeout, rate limiting e proxy estão documentados e exemplificados em [.env.example](./.env.example). O contrato completo, incluindo faixas aceitas e defaults, está no [contexto técnico](./docs/TECHNICAL_CONTEXT.md).

Regras importantes:

- Nunca exponha segredos com prefixo <code>NEXT_PUBLIC_</code>.
- Alterar uma variável pública exige novo build.
- Habilite <code>CONTACT_TRUST_PROXY</code> somente se o proxy confiável sobrescrever o header configurado.
- O endpoint de Web Vitals deve ser um caminho relativo à origem. Este repositório não implementa o coletor; ele precisa existir na mesma origem antes de a variável ser habilitada.

## Comandos

| Comando | Finalidade |
| --- | --- |
| <code>npm run dev</code> | Servidor de desenvolvimento com Webpack e limites de memória |
| <code>npm run dev:turbo</code> | Turbopack opt-in, protegido pelos mesmos limites |
| <code>npm test</code> | Vitest e regressão do quality hook |
| <code>npm run test:watch</code> | Vitest em modo interativo |
| <code>npm run lint</code> | ESLint com regras Next.js, Core Web Vitals e TypeScript |
| <code>npm run typecheck</code> | Gera tipos de rotas e executa TypeScript sem emitir arquivos |
| <code>npm run build</code> | Build de produção; fora da Vercel, prepara e valida o standalone |
| <code>npm run check:bundle</code> | Gate de transferência inicial e chunks diferidos |
| <code>npm run test:e2e:install</code> | Instala Chromium, Firefox e WebKit |
| <code>npm run test:e2e</code> | Playwright em todos os projetos configurados |
| <code>npm run analyze</code> | Analyzer oficial do Turbopack |
| <code>npm run start</code> | Executa <code>.next/standalone/server.js</code> |

As validações de ambiente não dependem de um comando manual separado: os gates reais são executados pelo <code>next build</code> para variáveis públicas e pelo bootstrap Node.js ao iniciar em produção.

## Validação completa

Instale os browsers uma vez:

~~~bash
npm run test:e2e:install
~~~

Em uma instalação Linux mínima, instale também as bibliotecas do sistema com <code>npx playwright install --with-deps chromium firefox webkit</code>. A CI já usa essa variante.

Depois execute, nesta ordem:

~~~bash
npm test
npm run lint
npm run typecheck
npm run build
npm run check:bundle
npm run test:e2e
~~~

O Playwright inicia o standalone em <code>http://localhost:3100</code> por padrão, portanto o build é pré-requisito. O projeto principal faz a regressão detalhada em Chromium; há um cenário dedicado sem WebGL e smokes adicionais em Firefox e WebKit. Falhas preservam trace, screenshot e vídeo conforme a configuração.

Para testar uma instância já iniciada:

~~~bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e
~~~

Use essa opção apenas contra um ambiente descartável ou autorizado: os testes exercitam rotas, navegação e a API de contato.

### Budgets de bundle

<code>npm run check:bundle</code> mede HTML, JS e CSS com gzip nível 9; WOFF2 é medido pelo tamanho bruto, pois já é comprimido. Preloads de fonte e inventário alcançável pelo CSS são gates separados.

| Superfície | Limite padrão |
| --- | ---: |
| Home JS | 260 KiB |
| Artigo JS | 250 KiB |
| Home CSS / artigo CSS | 25 KiB cada |
| Home HTML | 60 KiB |
| Artigo HTML | 35 KiB |
| Fontes preloadadas da home / artigo | 120 KiB cada |
| Inventário WOFF2 da home / artigo | 210 KiB cada |
| Cada entry lazy | 100 KiB |
| Maior chunk diferido | 90 KiB |
| Total diferido único | 165 KiB |

Os nomes das variáveis de override e o fallback que captura pelo standalone qualquer rota medida sem HTML pré-renderizado estão detalhados no [contexto técnico](./docs/TECHNICAL_CONTEXT.md). Manifestos vazios, rotas sem assets iniciais e ausência de chunks diferidos são tratados como erro.

O analyzer grava uma interface estática em <code>.next/diagnostics/analyze</code>:

~~~bash
npm run analyze
~~~

## Produção

### Standalone local

O build copia <code>public</code> quando existente e <code>.next/static</code> para o artefato standalone. Injete um ambiente de produção válido antes de iniciar:

~~~bash
set -a
. ./.env.production
set +a
npm run build
npm run start
~~~

Na Vercel, <code>VERCEL=1</code> é definido pela plataforma: o adaptador nativo do Next.js assume o output do deploy e a preparação standalone é ignorada de forma intencional. O standalone permanece exclusivo dos fluxos local, Docker e self-hosted.

<code>.env.production</code> é ignorado pelo Git. Use valores reais para validar o formulário; fixtures apenas sintaticamente válidas servem para smoke de páginas, mas não para entrega de email.

Ao carregar o arquivo com o shell, mantenha-o compatível com POSIX e coloque entre aspas valores que contenham espaços. O Compose também aceita esses valores entre aspas.

### Docker Compose

Crie um <code>.env.production</code> exclusivo para o ambiente. Não copie <code>.env.example</code>: seus valores sensíveis são deliberadamente inválidos em produção.

~~~bash
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production up --build --detach
docker compose --env-file .env.production ps
curl --fail http://127.0.0.1:3000/robots.txt
~~~

A porta é publicada somente em loopback por padrão. Um proxy reverso deve terminar HTTPS e encaminhar o tráfego público. Se <code>PORT</code> for alterada no arquivo de ambiente, ajuste o URL do smoke.

Para acompanhar logs e encerrar:

~~~bash
docker compose --env-file .env.production logs --follow portfolio
docker compose --env-file .env.production down --remove-orphans
~~~

O runner recompõe o Node.js 24.18.0 sobre a base distroless <code>base-nossl</code> Debian 13, sem shell, package manager, toolchain ou OpenSSL de sistema não utilizado. Apenas o binário oficial do Node e suas bibliotecas C++ dinâmicas entram na imagem; licenças e metadados correspondentes permanecem presentes. A CI também gera um SBOM CycloneDX da imagem final e confirma nele o runtime Node esperado. O processo executa como UID/GID <code>65532:65532</code>; o Compose remove capabilities, proíbe privilege escalation, aplica limites de processo/CPU/memória e disponibiliza somente dois <code>tmpfs</code> graváveis.

## Segurança e limites deliberados

- A CSP e os headers defensivos são centralizados em <code>next.config.ts</code>.
- A API não retorna segredos nem inclui dados pessoais nos logs de erro.
- Instalações bloqueiam lifecycle scripts e a CI verifica assinaturas e vulnerabilidades.
- Actions e imagens-base são fixadas por commit ou digest; o Trivy rejeita vulnerabilidades High e Critical da imagem final.
- A política estática ainda usa <code>unsafe-inline</code> para scripts e estilos exigidos pelo bootstrap atual do App Router. Migrar para nonce por request tornaria as superfícies hoje estáticas dinâmicas; a decisão deve ser reavaliada se surgir autenticação ou requisito formal de compliance.
- O rate limiter é local ao processo e reinicia com a instância. Múltiplas réplicas exigem Redis/Upstash, WAF ou mecanismo distribuído equivalente.
- Com <code>CONTACT_TRUST_PROXY=false</code>, nenhum header de IP é confiado e os clientes compartilham o bucket por cliente. Isso é seguro contra spoofing, mas pode gerar contenção sob tráfego real.

Veja o [modelo de segurança completo](./docs/TECHNICAL_CONTEXT.md), inclusive a ordem dos controles da API e os gaps operacionais conhecidos.

## Estrutura

~~~text
src/
├── app/                 rotas, layouts, metadata, imagens sociais e API
├── components/          layout, seções, componentes compartilhados e artigo
├── content/             modelos editoriais localizados
├── data/                projetos, sites publicados, experiência, métricas e links
├── hooks/               observação de viewport e navegação
├── lib/                 constantes, validações, WebGL e gates de produção
├── messages/            catálogos pt, en e es
└── types/               contratos compartilhados
e2e/                     regressão Playwright
scripts/                 bundle gate, standalone e quality hook
docs/                    contexto técnico versionado
public/images/sites/     thumbnails locais dos sites publicados
~~~

<code>docs/portifolio/</code> permanece intencionalmente ignorado e não faz parte da documentação versionada.

## Política de conteúdo

Casos, métricas e experiências publicados devem ser verificáveis e autorizados. Logos, screenshots, depoimentos e informações confidenciais de terceiros não devem entrar no portfólio sem aprovação explícita.

Ao alterar conteúdo localizado, arquitetura, ambiente, budgets ou comandos, atualize o README e [docs/TECHNICAL_CONTEXT.md](./docs/TECHNICAL_CONTEXT.md) no mesmo conjunto de mudanças.
