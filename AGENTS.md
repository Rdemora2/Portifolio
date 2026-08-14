<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Agent Ecosystem

## Pre-requisitos

- Acesso ao workspace e permissoes para executar comandos quando necessario.
- Node.js 24+ (`>=24.0.0`) obrigatorio; use o Node.js 24.18.0 e o npm 11.16.0 declarados em `.nvmrc` e `package.json` apenas como toolchain de referencia.

## Passos

- Escolha um agente pelo contexto do trabalho.
- Forneca objetivo, escopo, restricoes e criterio de aceite.
- Use Tech Lead para triagem e delegacao quando o problema for amplo.

## Como validar

- Verifique se os agentes aparecem no seletor de agentes.
- Rode um prompt e confirme o formato esperado da saida.

## Catalog

- Orquestrador: triagem, delegacao e consolidacao multiagente.
- Gestao de Projetos: roadmap, backlog, riscos, status e governanca.
- Tech Lead: arquitetura, tradeoffs, plano de entrega e coordenacao.
- UI and UX: direcao visual, hierarquia, acessibilidade e especificacao.
- Frontend: implementacao em React e Next.js no app router.
- Backend: rotas, validacao, erros e compatibilidade.
- DevOps: infra, deploy, docker, pipelines e ambientes.
- Sustentacao: triagem, mitigacao, hotfix e follow-up.
- QA: plano de testes, automacao e regressao.
- Performance: web vitals, bundle e render.
- Security: hardening, validacao, headers e riscos.
- Accessibility: auditoria e correcoes de a11y.
- SEO: metadata, open graph, sitemap e robots.
- Documentation: README, ADR, onboarding e docs tecnicas.

## Guardrails

- Frontend e Backend devem consultar node_modules/next/dist/docs/ antes de codar.
- Evite mudancas amplas sem plano; prefira iteracoes pequenas e validaveis.

## Instructions

- [Frontend guidelines](.github/instructions/frontend.instructions.md)
- [Backend guidelines](.github/instructions/backend.instructions.md)
- [Documentation guidelines](.github/instructions/docs.instructions.md)
- [Motion guidelines](.github/instructions/motion.instructions.md)

## Prompts

- [Orquestrar demanda](.github/prompts/orquestrar.prompt.md)
- [Auditoria UI](.github/prompts/ui-audit.prompt.md)
- [Plano de testes](.github/prompts/qa-plan.prompt.md)
- [Auditoria de performance](.github/prompts/perf-audit.prompt.md)
- [Checklist de seguranca](.github/prompts/security-check.prompt.md)
- [Release readiness](.github/prompts/release-readiness.prompt.md)
- [Code review](.github/prompts/code-review.prompt.md)

## Hooks

- [Quality hook](.github/hooks/quality.json)
- [Quality gate script](scripts/ai-quality-gate.sh)

Passos:

- Exporte AI_QUALITY_HOOKS=1 para ativar o lint automatico.

Como validar:

- Edite um arquivo e confirme a execucao do lint.
