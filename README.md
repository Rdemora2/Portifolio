# Roberto Moraes — Portfólio

[![CI](https://github.com/Rdemora2/Portifolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Rdemora2/Portifolio/actions/workflows/ci.yml)

Portfólio profissional multilíngue construído com Next.js 16 e React 19. A aplicação prioriza conteúdo server-rendered, acessibilidade, SEO técnico, segurança e efeitos visuais progressivos que não bloqueiam a experiência principal.

## Arquitetura

- App Router com páginas estáticas para português, inglês e espanhol.
- Prefixo de idioma apenas para idiomas não padrão: `/`, `/en` e `/es`.
- Conteúdo e metadata localizados, incluindo canonical, `hreflang`, Open Graph, sitemap e dados estruturados.
- Client Components restritos a interações que realmente precisam do navegador.
- Efeitos WebGL em OGL carregados sob demanda, com fallback estático, pausa em abas ocultas e redução ou desativação conforme movimento reduzido, ponteiro, economia de dados e capacidade do dispositivo.
- API de contato com validação estrita, limite de corpo, proteção de origem, honeypot, rate limiting, timeout e idempotência.
- Build standalone preparado para execução direta ou em container Node.js 24 distroless não-root, sem shell ou package manager no runtime; as imagens-base são fixadas por versão e digest.

## Stack

| Área | Tecnologias |
| --- | --- |
| Aplicação | Next.js 16.2, React 19, TypeScript 5 |
| Interface | Tailwind CSS 4, CSS nativo, GSAP sob demanda |
| Efeitos opcionais | OGL com shaders progressivos e fallback estático |
| Formulário | React Hook Form, Zod, Resend |
| Internacionalização | next-intl |
| Qualidade | ESLint, TypeScript, Vitest, Playwright, axe-core |
| Entrega | GitHub Actions, Docker, Docker Compose |

## Requisitos

- Node.js 24+ obrigatório (`>=24.0.0`, sem teto de major); `.nvmrc` fixa a versão de referência em 24.18.0
- npm 11.16.0 é a versão de referência reproduzível declarada em `packageManager`, não um bloqueio de compatibilidade
- Docker 24+ apenas para execução em container

O mínimo do runtime é estrito: `engines`, `devEngines` e `engine-strict=true` rejeitam versões anteriores a Node.js 24, mas não bloqueiam majors futuros nem impõem uma faixa adicional de npm. `.nvmrc`, `packageManager`, CI e Docker mantêm Node.js 24.18.0/npm 11.16.0 como toolchain de referência para builds reproduzíveis, sem funcionar como teto de compatibilidade. O runner usa distroless Debian 13. Scripts de lifecycle das dependências são bloqueados por `.npmrc`. Os comandos explicitamente invocados com `npm run` continuam disponíveis, e o build limpo comprova que os artefatos nativos pré-compilados bastam para esta árvore de dependências. A instalação também verifica assinaturas do registry, e o Trivy rejeita vulnerabilidades Critical ou High na imagem final.

O workflow roda em pushes, pull requests, acionamento manual e semanalmente, para detectar novas vulnerabilidades mesmo sem alterações no repositório. O Dependabot verifica semanalmente dependências npm, digests Docker e actions pinadas.

## Ambiente local

Ative a versão de referência com `nvm use` ou use qualquer Node.js 24+. Se o Node 24 foi instalado pelo Homebrew e está keg-only, use `export PATH="$(brew --prefix node@24)/bin:$PATH"` antes dos comandos abaixo.

```bash
node --version # v24.18.0
npm --version  # 11.16.0
npm ci
cp .env.example .env.development.local
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`. Use especificamente `.env.development.local`: ao contrário de `.env.local`, ele não é carregado por `next typegen` ou `next build`, evitando que a URL HTTP local contamine uma validação de produção.

As credenciais do Resend só são necessárias para enviar mensagens reais. Nunca adicione segredos a variáveis com prefixo `NEXT_PUBLIC_`.

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origem pública compilada no build para metadata, sitemap e links canônicos |
| `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` | Rota first-party opcional compilada no build para ingestão de Web Vitals |
| `RESEND_API_KEY` | Credencial server-side do Resend |
| `CONTACT_FROM_EMAIL` | Remetente verificado |
| `CONTACT_TO_EMAIL` | Destino das mensagens |
| `CONTACT_IDEMPOTENCY_SECRET` | Segredo longo usado na chave de idempotência |
| `CONTACT_ALLOWED_ORIGINS` | Origens aceitas pela API, separadas por vírgula |

Os demais limites e parâmetros de proxy estão documentados em [.env.example](./.env.example). Ative `CONTACT_TRUST_PROXY` somente atrás de um proxy confiável que sobrescreva o header de IP configurado. O Compose exige essa decisão explicitamente para evitar que todos os visitantes compartilhem o mesmo limite de requisições por engano.

## Validação

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run check:bundle
```

`npm run typecheck` executa `next typegen` antes do TypeScript, portanto também valida os tipos gerados para rotas, layouts e handlers. `npm test` inclui os testes Vitest e a regressão shell do quality hook.

Para a primeira execução dos testes de navegador:

```bash
npm run test:e2e:install
npm run build
npm run test:e2e
```

O E2E verifica rotas e idiomas, metadata, headers de segurança, artigo, sitemap, Open Graph, formulário, navegação por teclado, layout mobile e conformidade automatizada WCAG nas superfícies principais.

Para inspecionar o bundle:

```bash
npm run analyze
```

O analyzer oficial do Turbopack grava a interface estática em `.next/diagnostics/analyze` e não inicia um servidor. O quality gate de bundle mede os assets efetivamente referenciados pelo HTML prerenderizado, além dos imports dinâmicos:

| Superfície | Limite gzip padrão | Motivo |
| --- | ---: | --- |
| Home JS | 260 KiB | Limita o runtime e a página principal do build Turbopack com cerca de 10% de margem sobre o baseline |
| Artigo JS | 250 KiB | Mantém a rota editorial abaixo da página principal |
| Home CSS / artigo CSS | 25 KiB cada | Evita crescimento global de estilos sem penalizar variações de fontes |
| Home HTML | 60 KiB | Comporta o payload localizado da página completa |
| Artigo HTML | 35 KiB | Limite separado para crescimento editorial |
| Cada entry lazy | 100 KiB | Limita dependências de cada fronteira `next/dynamic`, incluindo o formulário validado |
| Maior chunk secundário | 90 KiB | Impede que um único arquivo diferido domine a interação |
| Total secundário único | 165 KiB | Limita todo JS/CSS fora dos HTMLs iniciais da home e do artigo, com cerca de 10% de margem sobre o baseline, inclusive imports dinâmicos transitivos |

Os limites podem ser ajustados em CI pelas variáveis `BUNDLE_BUDGET_HOME_*_KB`, `BUNDLE_BUDGET_ARTICLE_*_KB`, `BUNDLE_BUDGET_LAZY_ENTRY_KB`, `BUNDLE_BUDGET_LAZY_CHUNK_KB` e `BUNDLE_BUDGET_LAZY_TOTAL_KB`. Um manifest ou conjunto de entries vazio é tratado como erro, não como bundle de tamanho zero.

## Segurança de conteúdo

A CSP é estática e centralizada em `next.config.ts`. Em produção, `script-src-attr 'none'` bloqueia handlers JavaScript em atributos HTML; `object-src`, `frame-ancestors`, `base-uri` e `form-action` também permanecem restritos. `Cross-Origin-Resource-Policy: same-origin` limita o uso dos assets à própria origem e `Origin-Agent-Cluster: ?1` solicita isolamento por origem. O modo de desenvolvimento adiciona `unsafe-eval` somente para o diagnóstico do React.

O bootstrap estático do Next.js ainda exige `unsafe-inline` em scripts e estilos. Uma política com nonce por requisição e `strict-dynamic` seria mais rígida, mas no Next.js 16 tornaria as páginas dinâmicas e desativaria as vantagens de SSG, ISR, cache direto em CDN e PPR. Para este portfólio público foi priorizada a geração estática; se o produto passar a exibir dados autenticados ou entrar em um regime de compliance mais estrito, essa decisão deve ser reavaliada conscientemente.

## Produção

O próprio script de build copia `public` e os assets estáticos para `.next/standalone`, deixando o comando abaixo pronto para servir o artefato:

```bash
npm run build
npm run start
```

Com Docker Compose, provisione as variáveis obrigatórias em um `.env.production` exclusivo do ambiente. Não copie `.env.example` para produção: ele é somente um template de desenvolvimento e todos os seus valores sensíveis são deliberadamente inválidos. As variáveis `NEXT_PUBLIC_*` são build-time: qualquer alteração exige reconstruir a imagem. A porta é publicada apenas em loopback por padrão, e o target final da imagem é sempre o runner não-root.

Há dois gates nativos e não contornáveis por configuração de CI: `next build` rejeita origem pública insegura ou endpoint de Web Vitals externo; no bootstrap Node.js de produção, `instrumentation.ts` rejeita credenciais ausentes, placeholders, domínios reservados, segredo fraco, origens divergentes, decisão de proxy ambígua e limites inválidos. As mensagens identificam apenas as variáveis, sem imprimir seus valores.

Para subir o ambiente validado:

```bash
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production up --build --detach
docker compose --env-file .env.production ps
```

Além dos gates automatizados, antes de um deploy real:

- use a origem HTTPS pública em `NEXT_PUBLIC_SITE_URL` e `CONTACT_ALLOWED_ORIGINS`;
- informe uma chave Resend válida e um remetente verificado;
- confirme o destinatário das mensagens;
- gere um segredo exclusivo e aleatório para `CONTACT_IDEMPOTENCY_SECRET` (por exemplo, `openssl rand -hex 32`);
- decida explicitamente se há um proxy confiável antes de habilitar `CONTACT_TRUST_PROXY`;
- reconstrua a imagem e confira canonical, sitemap, envio do formulário e headers no domínio final.

Após validar ou se uma execução interrompida mantiver container, rede ou porta ocupados, libere os recursos do projeto com:

```bash
docker compose --env-file .env.production down --remove-orphans
```

O rate limiter embutido é intencionalmente local ao processo. Em produção com múltiplas réplicas, use Redis/Upstash, WAF ou outro armazenamento distribuído.

## Estrutura principal

```text
src/
├── app/                 rotas, metadata, sitemap e APIs
├── components/          layout, seções, UI compartilhada e efeitos opcionais
├── content/             artigos editoriais localizados
├── data/                projetos e experiência profissional
├── hooks/               hooks de interação e observação
├── lib/                 validação, constantes e integrações
└── messages/            catálogos pt, en e es
e2e/                     testes Playwright
scripts/                 quality gate e preparação standalone
```

## Política de conteúdo

Casos, métricas e experiências publicados devem ser verificáveis e autorizados. Materiais confidenciais, logos, screenshots e depoimentos de terceiros não devem entrar no portfólio sem aprovação explícita.
