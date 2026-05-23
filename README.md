<div align="center">
  <h1>Roberto Zarzur | Portfolio</h1>
  <p><strong>Next.js 16 • React 19 • Three.js • GSAP</strong></p>
  
  [![Build Status](https://github.com/robertozarzur/portifolio/actions/workflows/ci.yml/badge.svg)](https://github.com/robertozarzur/portifolio/actions)
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?logo=threedotjs&logoColor=black)](https://threejs.org/)
</div>

<br />

> Portfólio de Engenharia de Software desenvolvido com o estado da arte do ecossistema React. Foco extremo em **performance visual (60fps)**, renderização 3D orientada a shaders, arquitetura componentizada rigorosa e CI/CD contínuo.

## 🚀 Visão Geral da Arquitetura

O projeto foi meticulosamente desenhado para servir não apenas como uma vitrine profissional, mas como uma prova técnica viva de conceitos avançados de engenharia de Front-end:

* **App Router State-of-the-art**: Estruturado sob o Next.js 16.2 usando Turbopack, com rotas estáticas pré-renderizadas, metadados semânticos e JSON-LD para pontuação perfeita em SEO.
* **Motor Gráfico WebGL Customizado**: Integração nativa de `Three.js` via `@react-three/fiber`. Os shaders (GLSL) utilizam hooks de `useAdaptiveDpr` para escalonamento dinâmico de resolução em hardwares de baixo poder de fogo (mobile-friendly sem frames drops) e matemáticas preditivas puras para evitar overhead de memória (Garbage Collection thrashing).
* **Coreografia de Motion**: Layouts complexos acionados por scroll (com `Lenis` via hooks), micro-interações vetoriais otimizadas via `GSAP` e isolamento estrito de renders utilizando `useSyncExternalStore` (para states dinâmicos globais sem renderização em cascata) dentro do React 19.
* **Controle Estrito & CI/CD**: Código 100% tipado. O repositório conta com uma Integração Contínua (CI) customizada via GitHub Actions (`.github/workflows/ci.yml`) que bloqueia o merge caso haja *type errors*, regras quebradas do ESLint (incluindo dependências do React Compiler) ou falha na compilação estrutural.

---

## 🛠 Tech Stack

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Framework & Engine** | Next.js 16.2, React 19 | Renderização SSR/SSG (App Router) e concorrência nativa. |
| **Linguagem** | TypeScript 5 | Tipagem estática rigorosa (`strict: true`). |
| **Estilização** | Tailwind CSS 4 | Layout reativo e Design System customizado via CSS Variables puras. |
| **Motion & 3D** | GSAP, Three.js, R3F, Drei | Ambientes gráficos, shaders e animações DOM em altíssima fluidez. |
| **Validação & API** | Zod, React Hook Form, Resend | Validações schema-driven e entrega backendless de email via edge. |

---

## 📂 Organização do Repositório

```text
├── .github/             # CI/CD Actions, guidelines p/ Agentes AI (hooks)
├── src/
│   ├── app/             # Rotas estáticas, API handlers e Layouts Root
│   ├── components/      # (1) UI System, (2) Sections unificadas, (3) Three.js Core
│   ├── data/            # Single Source of Truth (SSOT) p/ conteúdo dinâmico do portfolio
│   ├── hooks/           # Hooks focados em performance (useAdaptiveDpr, useLenis, etc)
│   ├── lib/             # Helpers GLSL unificados, motores randômicos estocásticos e validadões
│   └── styles/          # Tokens CSS nativos (Bridged com o framework)
├── public/              # Assets estáticos 
└── Dockerfile           # Imagem multi-stage ultra enxuta (runner pattern)
```

---

## ⚙️ Inicialização Local (Ambiente de Desenvolvimento)

A stack foi desenhada para ser "Plug-and-play" usando os binários nativos do seu SO, ou encapsulada puramente em contêineres otimizados.

### Requisitos Mínimos
- Node.js 20+
- Docker 24+ (Opcional, para orquestração isolada)

### 1. Inicializando Nativamente (Recomendado)
```bash
# Sincroniza e garante locks do projeto
npm ci

# Sobe o core em ambiente local com Turbopack habilitado
npm run dev
```
> O app estará imediatamente rodando e escutando modificações em `http://localhost:3000`

### 2. Inicializando via Docker Compose (Com Hot-Reload)
Volumes pré-configurados com suporte à injeção direta:
```bash
docker compose -f docker-compose.dev.yml up --build
```
> **Nota de Manutenção:** Caso precise destruir a layer de cache isolado do `node_modules` gerada pelo docker: `docker compose -f docker-compose.dev.yml down -v`

---

## 🚢 Teste Local de Produção & Deploy

O Next.js foi configurado para gerar `output: "standalone"`. Ou seja, o deploy consiste de um pacote Node microscópico com 100% de autonomia e autossuficiência (sem dependência extra do framework).

Para realizar um teste do build estático localmente:

```bash
npm run build
npm run start
```

### Docker (Produção Pura)
A mesma arquitetura standalone é embalada em uma imagem Multi-stage final:
```bash
# Build e execução do runner final na sua máquina local ou servidor em Cloud
docker compose up --build
```

---

<div align="center">
  <p>Feito com paixão, código denso, shaders e perfeccionismo. <br/> <strong>Arquitetado para as fronteiras do Front-end web moderno.</strong></p>
</div>
