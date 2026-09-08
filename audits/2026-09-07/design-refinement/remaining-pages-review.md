# Revisão das páginas restantes

Revisão local na branch `codex/portfolio-design-refinement`, em 7 de setembro de 2026.

## Escopo e resultado

- **Sobre:** introdução mais curta, navegação por perfil, princípios, stack e FAQ; biografia e perguntas em primeira pessoa, com responsabilidades e critérios concretos. FAQ em duas colunas no desktop e acordeão nativo no celular.
- **Experiência:** atalhos por empresa, cinco posições preservadas, descrições e entregas sem duplicar a lista de tecnologias; melhor legibilidade dos destaques.
- **Contato:** canais diretos e formulário com títulos distintos, instrução breve e painel com contraste estável. Os campos, a validação e o envio mantêm o contrato existente.
- **Insights:** destaque editorial para o artigo publicado, capa em CSS, resumo completo, data, tempo de leitura e assuntos.
- **Artigo:** título informativo, métricas contextualizadas, menos afirmações absolutas e leitura com títulos menores e texto maior. O título se adapta a telas baixas. Os oito capítulos e a experiência progressiva permanecem disponíveis.
- **Privacidade:** índice numerado, fixo no desktop, e seções com largura de leitura controlada. O conteúdo da política foi preservado.

Textos revisados em português, inglês e espanhol; descrições de experiência e artigo sincronizadas com os dados de portfólio. Sem dependências novas. Estilos antigos de PageIntro removidos do módulo compartilhado e substituídos por um módulo próprio.

A terminologia de bcrypt foi corrigida para hashing, conforme a [documentação oficial do pacote](https://pkg.go.dev/golang.org/x/crypto/bcrypt). Os 6 ms apresentados no artigo e no FAQ são a média da API, sem atribuí-los à experiência completa na TV.

## Validação

- Build de produção e ESLint dos arquivos alterados aprovados.
- 21 testes unitários de dados, traduções, contrato editorial e artigo aprovados.
- 10 testes E2E Chromium aprovados: escala dos títulos, cronologia, perfil/stack, artigo progressivo, formulário, auditoria WCAG, matriz responsiva e navegação nativa em PT/EN/ES.
- Navegação por âncoras, FAQ por teclado e equivalência entre resposta visível e JSON-LD verificadas também com JavaScript desabilitado.
- Seis páginas em 390 e 1440 px: nenhum overflow, erro de JavaScript ou violação automática WCAG 2 A/AA, 2.1 AA e 2.2 AA. Formulário carregado e FAQ aberto incluídos na inspeção final.
- Todos os limites de bundle aprovados. CSS gzip: Experiência 14,7 KiB; Sobre 21,5 KiB; Insights 13,9 KiB; Contato 12,9 KiB; Artigo 20,4 KiB; Privacidade 13,4 KiB. Limite por rota: 25 KiB.

Evidências: `remaining-accessibility.json`, `remaining-bundle.txt`, `remaining-build.txt` e capturas `remaining-*.png` nesta pasta. A auditoria automática complementa a inspeção visual; não representa certificação de acessibilidade. Nenhuma mensagem real foi enviada pelo formulário e não houve deploy.

## Reprodução

Com Node.js 24.18.0, dependências instaladas e o build servido em `http://127.0.0.1:3400`:

```sh
npx vitest run src/data/portfolio.test.ts src/i18n/messages.test.ts src/i18n/editorial-contract.test.ts src/content/insights/go-em-producao.test.ts
PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:3400 npm run test:e2e -- --project=chromium --workers=1 e2e/remaining-pages-review.spec.ts e2e/portfolio.spec.ts --grep 'remaining pages|professional chronology|separates profile|localized editorial|professional contact|automated WCAG|overflow-free|deliberate responsive scale'
npm run check:bundle
node audits/2026-09-07/design-refinement/remaining-visual.mjs
```
