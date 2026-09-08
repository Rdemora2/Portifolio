# Revisão final do portfólio

Branch: `codex/portfolio-design-refinement`. Prévia local: http://127.0.0.1:3400/. Revisão de 7 de setembro de 2026, com Node.js 24.18.0 e npm 11.16.0.

## Melhorias aplicadas

- **Cartões de projetos:** o link passou a conter apenas a ação, com o nome do projeto como contexto acessível. Título, descrição e métricas permanecem disponíveis separadamente para leitores de tela. Um pseudo-elemento mantém toda a superfície clicável e o foco continua destacado. O Lighthouse deixou de apontar `label-content-name-mismatch`.
- **Imagens responsivas:** `sizes` passou a refletir as margens e colunas reais; foi incluída uma variante de 384 px na otimização do Next.js. Na amostra mobile do Lighthouse, a primeira imagem do Sírio-Libanês passou de 750 px / 49.384 bytes para 640 px / 37.694 bytes, redução de 23,7%. A variante de 384 px tem 16.738 bytes para telas com menor densidade.
- **Rolagem:** o menu não reescreve estilos quando a transição da home já terminou. Páginas internas não registram esse listener de rolagem. O progresso também é limitado a zero durante overscroll negativo.
- **Ferramentas de qualidade:** o script de auditoria foi convertido para ESM, corrigindo o lint global. Testes foram alinhados ao título atual de Projetos; a animação dos artigos é pausada no momento da criação, evitando dependência da velocidade do executor. A verificação do anel de progresso aguarda sua atualização visual.

Sem dependências novas, deploy ou envio real de mensagens. Layout e idiomas preservados.

## Verificações

- `npm test`: **152 testes unitários aprovados**, além do quality hook.
- `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`: aprovados.
- **67 cenários E2E verificados** em Chromium, Firefox, WebKit e dispositivos móveis: 66 passaram na execução completa final; o cenário do anel de progresso foi corrigido para aguardar a atualização visual e passou na execução posterior de 9 testes de interação. Evidências: `final-e2e.txt` e `final-interactions.txt`.
- Cobertura de rotas PT/EN/ES, menu modal, teclado, galerias, formulário com transporte simulado, idempotência, conteúdo sem JavaScript, erros/404, WebGL ativo/desativado/perda de contexto, movimento reduzido, SEO e auditoria WCAG.
- Testes específicos confirmam clique na imagem do cartão, nome acessível conciso e **zero chamadas a `style.setProperty`** no menu durante rolagem além da transição.
- Limites de bundle aprovados para todas as rotas. Home: **228,4 KiB JS / 19,2 KiB CSS** gzip, abaixo dos limites de 260 / 25 KiB.

## Lighthouse local

Uma amostra por página/perfil, Lighthouse 13.3.0, configuração padrão. Os testes funcionais de WebGL são separados. Resultados de laboratório, sem equivalência a dados de usuários reais.

| Página / perfil | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home / mobile | 89 | 100 | 100 | 100 | 3,67 s | 0 |
| Home / desktop | 99 | 100 | 100 | 100 | 0,80 s | 0 |
| Projetos / mobile | 90 | 100 | 100 | 100 | 3,59 s | 0 |
| Contato / mobile | 92 | 100 | 100 | 100 | 3,42 s | 0 |

A principal margem de melhoria permanece no carregamento inicial sob a simulação de rede móvel. As alterações desta revisão reduzem o tamanho da imagem e o trabalho durante a rolagem; a diferença de pontuação da home (88 para 89) entre duas amostras não deve ser interpretada como ganho estatístico. Não foram removidas funcionalidades ou alterada a identidade visual para elevar a nota.

Resultados completos: `final-performance-*.json`, `final-image-sizes.json`, `final-bundle.txt`, `final-unit.txt`, `final-lint.txt`, `final-types.txt`, `final-build.txt` e `final-projects.png`.

## Reprodução

Com o standalone em `127.0.0.1:3400`:

```sh
npm test
npm run lint
npm run typecheck
PLAYWRIGHT_TEST_BASE_URL=http://127.0.0.1:3400 npm run test:e2e -- --workers=1
npm run check:bundle
```

Para o Lighthouse, configure `LIGHTHOUSE_RUNTIME` com o caminho do `node_modules` de uma instalação existente e execute `node audits/2026-09-07/design-refinement/final-performance.mjs`. O script não instala dependências.
