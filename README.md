<div align="center">
  <h1>Roberto Zarzur | Portfólio</h1>
  <p><strong>Next.js 16 • React 19 • Three.js • GSAP • Next-Intl</strong></p>
  
  [![CI](https://github.com/robertozarzur/portifolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/robertozarzur/portifolio/actions/workflows/ci.yml)
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-WebGL-white?logo=threedotjs&logoColor=black)](https://threejs.org/)
</div>

<br />

> Código-fonte do meu portfólio pessoal. A ideia aqui foi construir algo além de uma página estática simples, unindo performance (60fps), componentes 3D integrados e uma arquitetura limpa que eu utilizaria em projetos reais no dia a dia.

## 🚀 Visão Geral

O projeto foi estruturado com foco em ser rápido, acessível e fácil de dar manutenção. Principais pontos técnicos da arquitetura:

* **App Router (Next.js 16.2)**: Base da aplicação rodando com Turbopack. O foco foi priorizar páginas e componentes estáticos (SSG/SSR) para garantir um load rápido e não prejudicar o SEO.
* **Internacionalização (i18n)**: Suporte nativo a Português, Inglês e Espanhol utilizando `next-intl`. Os dicionários e as rotas são tratados no lado do servidor para evitar overhead no client.
* **Experiência 3D (WebGL)**: Utilização do `Three.js` de forma declarativa (via `@react-three/fiber`). Tive o cuidado de implementar hooks customizados como o `useAdaptiveDpr` para detectar hardwares ou conexões mais limitadas, reduzindo a qualidade ou desativando efeitos pesados automaticamente para não travar o celular do usuário.
* **Animações e Scroll**: Para não ter dor de cabeça com performance, as animações e o smooth scroll usam `Lenis`, `GSAP` e CSS Transforms nativos. O objetivo foi isolar ao máximo essas mudanças visuais dos re-renders do React 19.
* **Pipelines e CI/CD**: O repositório tem um workflow no GitHub Actions (`.github/workflows/ci.yml`) que roda o build rigoroso e o linter do projeto. A pipeline barra qualquer PR que quebre regras do ESLint, tipagens do TypeScript ou hooks do React.

---

## 🛠 Tech Stack

| Camada | Tecnologia | O que faz no projeto |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2, React 19 | Estrutura base, App Router e SSR. |
| **Linguagem** | TypeScript 5 | Tipagem estrita ativada (`strict: true`) em toda a base de código. |
| **Estilização** | Tailwind CSS 4 | Classes utilitárias padronizadas e mapeamento de variáveis CSS para o tema. |
| **Animações & 3D** | GSAP, Three.js, R3F | Renderização de Canvas, shaders customizados e animações fluidas no DOM. |
| **Forms & i18n** | Zod, React Hook Form, Next-Intl | Validação estrita de schemas do contato e tradução server-side. |

---

## 📂 Estrutura do Repositório

```text
├── .github/             # Workflows do GitHub Actions
├── messages/            # Dicionários de tradução (pt, en, es)
├── src/
│   ├── app/             # Rotas do Next.js e layouts principais
│   ├── components/      # Componentes UI (genéricos, seções da home e elementos 3D)
│   ├── data/            # Dados estáticos do portfólio (experiências, projetos)
│   ├── hooks/           # Hooks customizados (useInView, useAdaptiveDpr, etc)
│   ├── lib/             # Utilitários, validações globais e setup do GSAP
│   └── styles/          # Diretivas do Tailwind e variáveis CSS puras
├── public/              # Imagens e fontes estáticas
└── Dockerfile           # Imagem multi-stage (standalone) para deploy em containers
```

---

## ⚙️ Como rodar localmente

A stack permite rodar nativamente via Node ou encapsulada no Docker se você preferir não instalar dependências locais.

### Requisitos
- Node.js 20+ ou Docker 24+

### 1. Rodando nativamente (Recomendado)
```bash
# Instala as dependências de acordo com o lockfile
npm ci

# Inicia o servidor de desenvolvimento com o Turbopack
npm run dev
```
> O app vai subir em `http://localhost:3000`.

### 2. Rodando via Docker Compose
Se preferir isolar tudo no container, inclusive o ambiente de dev (suporta hot-reload):
```bash
docker compose -f docker-compose.dev.yml up --build
```
> Nota: Se precisar resetar o cache do `node_modules` gerenciado pelo volume do Docker, rode `docker compose -f docker-compose.dev.yml down -v`.

---

## 🚢 Build & Deploy de Produção

O projeto foi configurado com `output: "standalone"`, gerando um build super enxuto e autossuficiente (não depende de pastas de cache soltas do framework).

Para testar o build de produção na sua máquina:
```bash
npm run build
npm run start
```

### Produção com Docker
Se for fazer o deploy em nuvem (GCP, AWS, VPS), basta utilizar o `docker-compose.yml` raiz que usa o `Dockerfile` multi-stage focado em produção:
```bash
docker compose up --build
```
