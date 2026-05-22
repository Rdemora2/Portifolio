# Portifolio

Portfolio profissional construido com Next.js 16 (App Router), React 19 e TypeScript. O foco e performance, animacoes e conteudo dinamico dirigido por dados, com SEO forte e uma API de contato integrada ao Resend.

## Visao geral

- Single-page com secoes ricas (Hero 3D, About, Projects, Tech Stack, Metrics, Experience, Insights e Contact).
- Conteudo editavel centralizado em [src/data/portfolio.ts](src/data/portfolio.ts).
- Animacoes e 3D com GSAP, Three.js e React Three Fiber.
- SEO completo (metadata, Open Graph, JSON-LD) no App Router.
- Formulario de contato com validacao Zod e envio via Resend.

## Stack principal

- Next.js 16.2 (App Router, output standalone)
- React 19 + TypeScript 5
- Tailwind CSS 4
- Three.js + @react-three/fiber + @react-three/drei
- GSAP + Lenis
- Zod + React Hook Form
- Resend (email)

## Estrutura do projeto

- [src/app](src/app) - rotas, layout raiz, metadata, API routes
- [src/components](src/components) - layout, secoes e componentes compartilhados
- [src/data](src/data) - conteudo do portfolio (projetos, tech stack, experiencia)
- [src/lib](src/lib) - helpers, validacoes e utilitarios
- [src/styles](src/styles) - estilos globais e variaveis
- [public](public) - assets estaticos

## Requisitos

- Node.js 20+
- Docker 24+ (para ambiente containerizado)

## Rodando localmente (dev)

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Build e execucao (producao local)

```bash
npm run build
npm run start
```

## Variaveis de ambiente

Crie um arquivo .env baseado em [.env.example](.env.example).

```
RESEND_API_KEY=your_key_here
```

Sem `RESEND_API_KEY`, a rota [src/app/api/contact/route.ts](src/app/api/contact/route.ts) retorna erro 500.

## Docker (producao)

Build e run:

```bash
docker compose up --build
```

O container sobe em http://localhost:3000.

Para desligar:

```bash
docker compose down
```

## Docker (dev)

Ambiente com hot reload e volumes configurados:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Para limpar volumes (node_modules e cache do Next):

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Notas para Mac e Windows

- O compose dev habilita polling do watcher para evitar perda de hot reload.
- Em casos raros de dependencias nativas, use `DOCKER_DEFAULT_PLATFORM=linux/amd64` no build.

## Scripts NPM

- `npm run dev` - ambiente de desenvolvimento
- `npm run build` - build de producao
- `npm run start` - servidor de producao
- `npm run lint` - lint

## Deploy

- Imagem Docker: use o `Dockerfile` (target `runner`).
- PaaS (ex: Vercel, Render, Fly.io): `npm run build` + `npm run start`.

## Licenca

Este projeto e de uso pessoal/portfolio.
