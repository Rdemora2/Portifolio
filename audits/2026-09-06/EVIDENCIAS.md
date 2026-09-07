# Índice e reprodução da auditoria

O documento principal é [RELATORIO.md](RELATORIO.md). Os arquivos desta pasta são artefatos da auditoria, não mudanças na aplicação.

## Ambiente

- Commit: dddab26d28c9eb5fc6605bda9a2435d66da7e896.
- Node 24.18.0 / npm 11.16.0 disponíveis em /opt/homebrew/opt/node@24/bin.
- Next.js 16.3.0, build de produção standalone.
- Porta da inspeção local: 3200. E2E executado na 3300 porque a 3100 estava ocupada.
- Chromium, Firefox e WebKit já estavam instalados. Não foram instaladas dependências.
- Leitura de rede foi autorizada durante a auditoria. Não houve contato real nem deploy.

## Evidências essenciais

| Arquivo | Conteúdo |
|---|---|
| evidence/build.txt, lint.txt, typecheck.txt, unit-tests.txt | Baseline de engenharia |
| evidence/e2e.txt | 34 testes de navegador existentes |
| evidence/npm-audit.json | Consulta de vulnerabilidades na data da auditoria |
| evidence/bundle.txt | JS, CSS, HTML, fontes e chunks diferidos |
| evidence/responsive-matrix.json | 132 amostras, geometria, imagens e mensagens de console |
| evidence/assets.json | Dimensões e tamanho dos 24 assets |
| evidence/production-domains.json | DNS independente e resposta do alias público |
| evidence/public-checks.json | Rotas, imagens, ícones, sitemap/robots e links externos |
| evidence/vercel-deployment.json | Estado sanitizado do deployment consultado pelo conector |
| evidence/production-network.json | Amostra de rede/console, sem payloads de formulário |
| evidence/interaction-audit.md | Reproduções de foco, autoplay, sobreposição e chunks abortados |
| evidence/final-browser-checks.json | Canvas real, imagem indisponível, 504 simulado e identificação de analytics |
| evidence/nojs-confirmation.json | Home sem JS, confirmada no build local e no alias público |
| evidence/contact-rate-limit-reproduction.txt | Bug de rate limit com provider simulado |
| evidence/lighthouse-confirmation.json | Medições confirmadas, incluindo três rodadas mobile e desktop efetivo |
| evidence/field-metrics-availability.json | Indisponibilidade de dados PageSpeed/CrUX por quota |
| evidence/screenshots, evidence/sections, evidence/social | Capturas da UI e sete artes Open Graph |

Capturas full-page com reduced motion são apoio de layout. Como a home usa content-visibility, seções distantes podem ser omitidas do raster full-page; as capturas individuais em evidence/sections complementam a inspeção. A assinatura WebGL possui capturas próprias com canvas confirmado.

## Comandos utilizados

Executar na raiz do repositório com o Node indicado:

- npm run lint
- npm run typecheck
- NEXT_TELEMETRY_DISABLED=1 npm run build
- npm test
- npm audit --json
- npm run check:bundle
- PORT=3300 npm run test:e2e
- node node_modules/vitest/vitest.mjs run --config audits/2026-09-06/vitest.config.mts

Os três scripts browser-audit.mjs, final-browser-checks.mjs e lighthouse-confirmation.mjs ficam nesta pasta. Os dois primeiros exigem o build já servido na porta 3200; usar apenas fixtures de validação como as de playwright.config.ts, sem credenciais reais. final-browser-checks intercepta a API antes de simular o envio. O teste isolado de rate limit usa mock do Resend.

Lighthouse foi importado do cache local já existente em /Users/roberto/.npm/_npx/0f94ee7615faf582/node_modules/lighthouse (13.4.1). Esse caminho é específico desta máquina. Os relatórios HTML são autossuficientes para leitura.

## Limites das medições

As rodadas exploratórias permanecem no arquivo lighthouse-summary.json. A amostra chamada production-home-desktop nessa exploração tinha perfil mobile e foi descartada da comparação desktop; usar home-desktop-confirm. A tentativa com user-agent alternativo não comprova diferença de custo WebGL. Os dados válidos e suas configurações constam da confirmação.

Não comparar a home local com o alias como se fossem antes/depois de uma alteração. Nenhum código foi corrigido. Os valores de laboratório não são p75 de visitantes reais; TBT não é INP.

Os arquivos de teste que reproduzem defeitos confirmam o estado atual. Após uma correção, devem ser substituídos por expectativas de comportamento correto na suíte de regressão.
