# Refinamento visual do portfólio

Implementação na branch `codex/portfolio-design-refinement`, com Node.js 24.18.0 e npm 11.16.0. Prévia local: http://127.0.0.1:3400/pt.

## Resultado

- Hero com hierarquia tipográfica mais clara, evidências do case Sírio-Libanês, superfície escura estável e controle de pausa do WebGL.
- Marquee de marcas em uma única linha: Newco, BandSports, BandNews TV, Arte 1, Terra Viva, Agro+, Globo, Hospital Sírio-Libanês, OMO Lavanderia, Housi e Prêmio SDE — Sou do Esporte. Movimento contínuo com pausa manual, no hover e fora da viewport. Teclado e movimento reduzido usam uma faixa estável com rolagem horizontal. Cópias visuais ficam ocultas da árvore de acessibilidade. Logos obtidos nos sites e perfis oficiais; fontes registradas em `public/images/brands/SOURCES.md`. Links associados somente aos dois cases documentados. A Band foi removida conforme solicitado.
- Cases com imagens reais e resumo de resultados; projetos antes do perfil na home. Laboratório com quatro interfaces iniciais e expansão nativa para as demais.
- Experiência em linha contínua, competências priorizando backend/cloud/operação e links para evidências, biografia com métricas integradas.
- Contato na navegação, encerramento da home com CTA e botão de retorno ao topo com progresso, foco correto e proteção durante diálogos.
- Alvos de toque ampliados, pausa por foco/visibilidade, reduced motion, estados de erro e fallback de imagens/formulário sem JavaScript.
- Textos em português, inglês e espanhol. Sem novas dependências no projeto.

## Validação

- `npm test`: 152 testes unitários e testes do quality hook aprovados.
- `npm run lint`, TypeScript do build e `git diff --check`: aprovados.
- `npm run build`: 59 páginas geradas; saída standalone preparada.
- 57 cenários E2E cobertos: 56 aprovados na execução completa e o cenário de escala dos heros aprovado após compactar o espaçamento dos cases em telas baixas. Evidências: [execução completa](e2e.txt) e [verificação final do hero](responsive-hero-e2e.txt).
- Chrome, Firefox, WebKit, mobile, teclado, formulários simulados, galerias, navegação entre idiomas, WebGL ativo/desativado/perda de contexto e conteúdo sem JavaScript verificados.
- Pausa do hero validada pela interrupção das chamadas WebGL `drawArrays`; retorno ao topo sem mutações em repouso.
- Auditorias automatizadas WCAG nas superfícies principais aprovadas. [Matriz responsiva](responsive.json): 320, 768 e 1440 px, sem rolagem horizontal ou erros de página.
- [Budgets](bundle.txt): home com 227,9 KiB de JavaScript e 22,3 KiB de CSS, dentro dos limites de 260 e 25 KiB.

## Desempenho local

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 90 | 100 | 100 | 100 | 3,54 s | 0 |
| Desktop | 99 | 100 | 100 | 100 | 0,86 s | 0 |

Uma amostra local por perfil no Lighthouse 13.3.0, com configuração padrão e user agent do Lighthouse. Não representa medição de campo; o efeito WebGL usa fallback nessa auditoria e tem testes funcionais próprios. Resultados: [mobile](lighthouse-mobile.json), [desktop](lighthouse-desktop.json).

## Inspeção visual e reprodução

[Desktop com WebGL](desktop-final.png), [mobile com WebGL](mobile-final.png), [320 × 568](hero-320x568.png), [844 × 390](hero-844x390.png).

Com o standalone de validação ativo na porta 3400:

```sh
PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:3400 npm run test:e2e
node audits/2026-09-07/design-refinement/capture.mjs
```

O build e o servidor foram executados com as credenciais sintéticas definidas em `playwright.config.ts`. Nenhum envio real de contato foi realizado. A medição de Lighthouse reutiliza um runtime já instalado, informado pela variável `LIGHTHOUSE_RUNTIME`, sem instalar pacotes.

## Páginas internas restantes

A revisão de Sobre, Experiência, Contato, Insights, artigo e Privacidade está documentada em [remaining-pages-review.md](remaining-pages-review.md), com testes e capturas próprios.

## Revisão final

[Relatório final](final-review.md): refinamentos de acessibilidade nos cartões, imagens responsivas, redução de trabalho na rolagem, validação global e novas medições de desempenho.
