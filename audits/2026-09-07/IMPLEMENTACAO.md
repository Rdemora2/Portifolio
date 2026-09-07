# Implementação da auditoria do portfólio

**Data:** 7 de setembro de 2026  
**Branch:** `codex/portfolio-audit-remediation`  
**Referência dos achados:** [auditoria de 6 e 7 de setembro de 2026](../2026-09-06/RELATORIO.md)

## Executive Summary

A implementação trata os 27 achados documentados na auditoria, sem redesign e sem migração de stack ou hospedagem. A origem padrão passa a usar o alias público funcional; conteúdo e arquivos para crawlers compartilham a mesma fonte; os fluxos de galeria, contato e carregamento progressivo recebem correções de robustez; e a experiência ganha política de privacidade localizada, índice mobile e imagens sociais específicas por case.

A implementação está **validada localmente e pronta para revisão/integração**, com build, lint, TypeScript, 152 testes unitários/de contrato, 51 testes de navegadores, 49 budgets e 144 combinações responsivas aprovados. A versão final marcou 91 nas três medições mobile e 99 no desktop, com CLS zero; o LCP mobile mediano de 3,45 s ainda merece melhoria. A variação de carga da máquina impede atribuir todo ganho de pontuação ao código. O merge autorizado depende das GitHub Actions verdes; a prontidão operacional também depende da configuração real da plataforma. Não foram executados deploy manual, alteração de DNS, WAF, infraestrutura ou configuração de produção.

A identidade foi preservada: paleta, três famílias tipográficas, composição das páginas, linguagem dos cases, cartões e assinatura WebGL continuam presentes. Engenharia de software assume o posicionamento principal solicitado, enquanto cargos históricos e experiência de liderança permanecem na trajetória.

## Baseline antes das alterações

O baseline corresponde ao commit `dddab26d28c9eb5fc6605bda9a2435d66da7e896`, documentado integralmente na [auditoria anterior](../2026-09-06/RELATORIO.md#baseline).

| Verificação | Resultado anterior |
|---|---|
| Build, lint e TypeScript | Passaram; build standalone gerou 45 páginas/artefatos estáticos. |
| Testes unitários e quality hook | 130 testes em 16 arquivos; passaram. |
| Playwright existente | 34/34 passaram, mas o caminho WebGL real não era exercitado pelo navegador automatizado padrão. |
| Bundles e dependências | Budgets passaram; npm audit reportou zero vulnerabilidades em inventário de 565 dependências. |
| Responsividade adicional | 132 combinações, 11 superfícies PT × 12 larguras; sem overflow horizontal global. A inspeção específica encontrou colisão no bloco de fatos dos cases em 320, 390 e 430 px. |
| Produção | 30 rotas e assets respondiam no alias Vercel, mas canonicals, hreflangs, sitemap e OG apontavam para um domínio sem resolução DNS. |
| Social | Sete PNGs 1200×630 existiam no alias; nenhuma das sete URLs absolutas então anunciadas estava acessível. |
| Performance de laboratório | Home mobile: LCP de 2,57–3,03 s, mediana 2,69 s; 109,4 KiB de fontes pré-carregadas. Não havia CrUX/INP/p75 de visitantes. |

O baseline visual a preservar era composto pelo fundo azul quase preto, acentos índigo/ciano/verde, Syne nos títulos, DM Sans no corpo, JetBrains Mono nos rótulos, cartões translúcidos, grids técnicos, hero com dois CTAs e LiquidChrome, cases editoriais e movimento contido com alternativa para `prefers-reduced-motion`.

## Problemas encontrados

A auditoria não confirmou P0. Ela registrou 6 achados P1, 16 P2 e 5 P3. As classificações distinguem bugs reproduzidos, fatos verificáveis, riscos condicionais e recomendações; a descrição problema → evidência → impacto → solução permanece no [relatório de origem](../2026-09-06/RELATORIO.md#problemas-encontrados).

| Prioridade | Achados | Natureza e estado nesta implementação |
|---|---|---|
| P0 | Nenhum | Nenhuma vulnerabilidade crítica ou indisponibilidade completa foi confirmada. |
| P1 | A01–A05, A26 | Origem pública, consistência do conteúdo para agentes, foco/autoplay, admissão atômica do contato, transparência de privacidade e conteúdo invisível quando chunks falham. Correções implementadas e validadas localmente; integração depende da CI. |
| P2 | A06–A20, A27 | Posicionamento, mobile, navegação, feedback, imagens, performance, lacunas de teste, documentação, dependência descontinuada, limites operacionais e fallback sem JavaScript. Implementados ou documentados conforme a natureza do achado; A15 teve 12/12 repetições WebGL aprovadas após isolar os testes; a suíte integrada final passou em 51/51. |
| P3 | A21–A25 | Imagens sociais específicas, retorno ao topo, consistência da 404, aviso de nova aba e semântica da paginação. Implementados. |

Não viraram correção hipóteses sem evidência: não se inventaram métricas profissionais, datas de conteúdo, problemas de notch/leitor de tela ou mudança estética. O rate limit distribuído e a retenção nos fornecedores continuam tratados como limites externos, sem afirmação sobre configuração não inspecionada.

## Alterações realizadas

| Achados | Implementação |
|---|---|
| A01 | Metadata, sitemap, robots, OG e documentos `llms` usam a resolução comum de `NEXT_PUBLIC_SITE_URL`, com `https://portifolio-liard-zeta.vercel.app` como origem padrão funcional; fixtures da CI e do budget foram alinhadas. |
| A02 | `llms.txt` e `llms-full.txt` são rotas estáticas; o documento completo deriva cases e trajetória dos dados estruturados, removendo divergências editoriais. |
| A03, A16, A25 | Galeria ganhou pausa persistente, pausa por foco/modal, respeito a reduced motion, comportamento sem loop insuficiente, proteção do foco e paginação com nome correspondente à ação. |
| A04 | A admissão nos limites global e por cliente tornou-se atômica; tentativas já rejeitadas não consomem o outro bucket. |
| A05 | Aviso no formulário, links no rodapé e página de privacidade localizada em PT/EN/ES. |
| A06, A10 | Engenharia ocupa o posicionamento principal; títulos de aba e social deixam de duplicar a marca. |
| A07–A09 | Fatos mobile acomodam os rótulos; a demonstração indisponível não leva a 404; o CTA de próximo case descreve seu destino. |
| A11, A20 | O erro de contato permanece até nova ação. Uma chave opaca de retentativa, sem conteúdo pessoal, sobrevive a reload no `sessionStorage`; sucesso a remove. O servidor vincula idempotência ao payload. |
| A12 | O artigo ganhou índice mobile nativo e expansível para oito capítulos, com fechamento e transferência de foco após a seleção. |
| A13, A14, A18 | Miniaturas usam variantes responsivas do Next Image; revelações são iniciadas perto da viewport; Critters e `experimental.optimizeCss` foram removidos sem adicionar dependência. |
| A15 | Foram adicionados cenários para canvas/contexto real, resize, visibilidade, reduced motion e perda de contexto. As 12 repetições isoladas e a suíte integrada final de 51 testes passaram. |
| A17, A19 | Documentação alinha o contrato de contato, CSP efetiva, SBOM, timeout indeterminado, trust proxy e rate limit por processo. |
| A21–A24 | Cases recebem arte social própria; rodapé oferece retorno ao topo; 404 usa token existente; links externos anunciam nova aba. |
| A26, A27 | HTML inicial é visível, as animações começam perto da viewport e a boundary que prendia a home no loading sem JavaScript foi removida. |

## Alterações visuais

As mudanças visuais são localizadas: correção da grade de fatos dos cases, controles necessários na galeria, índice compacto no artigo mobile, aviso e página de privacidade, indicação de demonstração indisponível e link de retorno ao topo. As imagens sociais dos cases seguem a composição gráfica existente. O problema, a justificativa e a solução de cada mudança correspondem aos achados A03, A05, A07, A08, A12 e A21–A25 do baseline.

A identidade original foi preservada explicitamente. Não foram trocadas paleta, tipografia, estrutura editorial, dimensões centrais, efeitos de cartões ou assinatura LiquidChrome. As três fontes e seus preloads foram preservados: Syne, DM Sans e JetBrains Mono aparecem no hero. As capturas de home, galeria, vitrine, artigo, fatos mobile, privacidade e WebGL estão na pasta de [evidências](evidence/).

## Mobile

- A coluna de fatos passou a acomodar os rótulos em PT e ES e o espaçamento do hero foi ajustado para 320 px.
- O artigo oferece acesso aos oito capítulos sem exigir percorrer aproximadamente treze telas; a seleção fecha o índice e move o foco ao título.
- Miniaturas podem receber variantes adequadas à largura, preservando lazy loading, blur e proporção.
- Galerias mantêm dimensões, coverflow e controles, com autoplay controlável e reduced motion.
- A matriz confirmada cobre **144 combinações**: 12 superfícies × 12 larguras entre 320 e 2560 px, sem overflow, colisão de texto nos fatos ou warnings do Swiper.

Emulação não substitui aparelhos físicos. Safe areas, VoiceOver e TalkBack continuam no checklist de release.

## Performance

O preload permanece em **109,4 KiB**, com inventário total de 197,2 KiB. O experimento de removê-lo de JetBrains Mono foi revertido: ela aparece no subtítulo do hero e merece prioridade junto de Syne e DM Sans. A redução provisória para 69,9 KiB não fica na entrega e não é contabilizada como ganho. O JavaScript inicial da home permanece aproximadamente 220,4 KiB gzip, dentro do budget.

O `ScrollReveal` não prepara animações de todas as seções na hidratação: o conteúdo nasce visível e a animação é iniciada pelo `IntersectionObserver` perto da viewport. As miniaturas responsivas reduzem a necessidade de entregar os originais de 1410×831 a telas pequenas.

A remoção de Critters reduz superfície de manutenção. Não se atribui a ela ganho de LCP: o caminho não demonstrou uso no App Router e os experimentos anteriores tiveram concorrência com outras verificações. Lighthouse é evidência de laboratório e não há dados CrUX/INP/p75.

O experimento de preload posteriormente revertido usou Lighthouse 13.4.1 e o mesmo Chromium: mobile 412×823 com simulação de rede/CPU 4×; desktop 1350×940/CPU 1×. A ordem foi candidato → original → candidato, sem outra suíte de navegador ou build da tarefa em paralelo. O original veio do commit do baseline, sem `.env`, usando o mesmo Node/dependências instaladas e origem explícita; apenas a raiz de resolução do Turbopack foi ajustada para o checkout descartável. Esse checkout e seu servidor foram removidos após a medição.

| Rodada | N | Performance, mediana (intervalo) | FCP mediano | LCP mediano | TBT mediano | CLS mediano (máximo) |
|---|---:|---:|---:|---:|---:|---:|
| Experimento mobile — primeira série | 3 | 69 (60–77) | 1,67 s | 4,11 s | 646 ms | 0 (0,0203) |
| Original mobile — controle contemporâneo | 3 | 83 (74–83) | 1,12 s | 3,65 s | 326 ms | 0 (0) |
| Experimento mobile — repetição após controle | 3 | 78 (70–84) | 1,60 s | 3,69 s | 420 ms | 0 (0,0203) |
| Experimento desktop | 1 | 98 | 0,45 s | 0,92 s | 55 ms | 0 (0) |

**O experimento foi rejeitado.** Apesar de diminuir o preload, ele teve FCP/TBT piores nas amostras e LCP próximo do controle na segunda série. O `benchmarkIndex` da máquina variou de 956 a 1408 nas séries do candidato; o controle também variou. Sem controle exclusivo da carga da máquina, esses dados não isolam a causa nem autorizam atribuir toda diferença ao código. As seis medições mobile do candidato foram preservadas, inclusive as desfavoráveis. A14 preserva a prioridade das fontes críticas e muda o comportamento das revelações; não recebe crédito pela redução provisória de preload.

Acessibilidade, boas práticas e SEO do Lighthouse marcaram **100 em todas as medições finais com as fontes restauradas**. Os filmstrips representativos mostram a assinatura WebGL, mas a sonda de runtime após o Lighthouse não ficou disponível; não se afirma uma configuração de capacidades idêntica em todas as execuções. Os testes funcionais específicos cobrem WebGL ativo separadamente.

O controle confirmou dois stylesheets externos e nenhum CSS inline também no original. `experimental.inlineCss` foi avaliado na [documentação do Next](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss): é global, experimental, duplica CSS no HTML/RSC e altera o benefício de cache entre páginas. Foi mantido o CSS externo; não se introduziu esse risco sem um experimento específico de primeira visita e navegação recorrente.

[Evidência comparativa completa](evidence/performance-comparison.json), [manifesto do controle](evidence/control-manifest.json), [CSS do controle](evidence/control-css.json). Os arquivos `before-optimize-*`, executados com concorrência, continuam excluídos da conclusão.

### Versão entregue, com as três fontes priorizadas

| Rodada final | N | Performance | FCP mediano | LCP mediano | TBT mediano | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Mobile | 3 | **91 / 91 / 91** | 1,07 s | **3,45 s** | 60,5 ms | **0 nas três** |
| Desktop | 1 | **99** | 0,31 s | **0,77 s** | 0 ms | **0** |

As medições usam os mesmos perfis mobile/desktop descritos acima e o build final com os preloads restaurados. O `benchmarkIndex` mobile subiu para 2169,5–2657,5, sinal de uma máquina mais rápida do que durante o controle. Portanto, a diferença de pontuação não demonstra isoladamente o efeito do preload nem comprova ganho geral de CWV em visitantes. A prioridade das fontes foi mantida porque as três aparecem acima da dobra. O LCP mobile permanece acima de 2,5 s e é o principal ponto de performance a acompanhar.

Os 49 budgets passaram novamente; preload de 109,4 KiB e inventário de 197,2 KiB ficam dentro dos limites de 120/210 KiB. [Medições mobile finais](evidence/accepted-mobile-summary.json), [medição desktop final](evidence/accepted-desktop-summary.json), [build final](evidence/build-fonts-restored.txt) e [budgets](evidence/bundle-accepted.txt).

## SEO

A origem default atual é o alias público funcional, e `NEXT_PUBLIC_SITE_URL` continua sendo o ponto de configuração para domínio próprio. Metadata, canonical, hreflang, sitemap, robots, imagens sociais e documentos `llms` compartilham essa resolução. A home usa título absoluto, eliminando a marca duplicada, e o posicionamento começa por engenharia.

`/llms.txt` e `/llms-full.txt` retornaram 200 como `text/plain` no build local, com origem configurada e sem a origem antiga. Os links localizados para a política usam âncoras documentais; esse workaround evita a duplicação de metadata do Next confirmada durante navegação SPA, conforme o [diagnóstico isolado](evidence/seo-debug/metadata-duplication-diagnosis.json).

O workaround passou em **18/18 navegações**: três idiomas, dois links e três repetições, verificando documento, URL, idioma, canonical único, x-default único e cookie. Ele cobre os links para privacidade, sem afirmar corrigir toda a reconciliação de metadata do App Router. O custo é uma recarga documental nesses links. [Evidência de navegação](evidence/seo-debug/privacy-anchor-final-stress.json).

Antes da publicação, é necessário confirmar `NEXT_PUBLIC_SITE_URL` e `CONTACT_ALLOWED_ORIGINS` na plataforma. Um domínio próprio pode substituir o alias sem alterar os geradores.

## Social Sharing

Foram criadas nove artes específicas para os cases, uma por projeto e idioma, com título, papel e stack, preservando a linguagem visual existente. A validação local registrou **16 URLs de OG**, todas com resposta 200 e PNG 1200×630; as nove novas imagens estão incluídas. Títulos sociais não duplicam mais a marca e o texto alternativo corresponde ao case.

O cache autenticado e a atualização de previews nas plataformas sociais não foram exercitados. Essa validação deve ocorrer após publicação em URL definitiva.

## Accessibility

- A galeria pode ser pausada, pausa com foco/modal, preserva o foco e respeita reduced motion; a paginação anuncia a seleção real.
- O índice mobile usa elementos nativos e transfere foco para o capítulo escolhido.
- O destino do retorno ao topo é focável e usa navegação nativa.
- Links que abrem nova aba recebem aviso acessível localizado.
- `ScrollReveal` mantém conteúdo visível no HTML inicial e em falha de chunks; a home também entrega conteúdo essencial sem JavaScript.
- O formulário mantém mensagens de erro até nova ação e preserva o comportamento de foco/`aria-invalid` já correto.

A cobertura automatizada inclui axe e cenários de teclado, mas VoiceOver, TalkBack e dispositivos físicos permanecem sem validação. A suíte final de navegadores passou em 51/51 testes, incluindo os cenários automatizados de acessibilidade.

## Privacy

A política localizada descreve os tratamentos observáveis no formulário, Resend, Vercel Analytics/Speed Insights e cookie de idioma, além do canal para exercício de direitos. O aviso junto ao formulário permite conhecer esse fluxo antes do envio. Não foi criado banner de consentimento sem necessidade demonstrada.

Para retentativa, o cliente guarda somente chave opaca e timestamp no `sessionStorage`, com duração máxima inferior a 24 horas; não guarda nome, e-mail, empresa, assunto nem mensagem. A chave é reutilizada entre reloads/edições e removida após sucesso. Se o armazenamento estiver indisponível, a tentativa usa fallback em memória.

O titular ainda precisa definir ou confirmar a retenção efetiva na caixa de e-mail e nos fornecedores. Nenhum prazo foi inventado e o relatório não afirma conformidade jurídica definitiva.

## Engineering

A arquitetura permanece Next.js App Router, React, TypeScript, next-intl, Zod/React Hook Form, OGL, Swiper e Resend. Não houve migração arquitetural, dependência nova nem atualização ampla. Critters foi removido junto com o único experimento que justificava sua presença; o lockfile recebeu apenas remoções relacionadas.

No contato, limites global e por cliente são admitidos atomicamente e testes usam provider simulado, sem envio real. O timeout ainda representa estado de entrega indeterminado: uma resposta 504 não prova que o provedor deixou de entregar. A chave estável reduz duplicação em reload/retry, mas outra aba, armazenamento bloqueado, expiração ou payload diferente podem gerar nova entrega.

O rate limit continua local a cada processo. Réplicas e reinícios não compartilham contagem; com `CONTACT_TRUST_PROXY=false`, o bucket chamado de cliente é comum. Proteção distribuída depende da configuração real da plataforma/WAF, que não foi inspecionada nem alterada.

As verificações confirmadas nesta etapa incluem 152 testes unitários/de contrato em 21 arquivos, 49 budgets para nove superfícies e npm audit sem vulnerabilidades reportadas no inventário atual de 553 dependências.

## Documentation

- `README.md` e `docs/TECHNICAL_CONTEXT.md` foram alinhados ao contrato real `company`/`subject`, à CSP efetiva, à saída Vercel/standalone e ao SBOM já existente na CI.
- `docs/CONTACT_OPERATIONS.md` documenta timeout, idempotência, trust proxy, limite em memória, configuração esperada, testes seguros e resposta operacional.
- A política de privacidade localizada registra fornecedores e limitações conhecidas sem inventar retenção ou garantia legal.
- Os documentos `llms` agora são gerados pela aplicação a partir das fontes estruturadas.

## Diagnóstico das intermitências

A inspeção WebGL encontrou sinais de capacidade elegíveis, contexto WebGL2 disponível, ausência de falhas de rede e canvas presente logo após o timeout. O teste executava leituras síncronas de pixels enquanto outro forçava perda de contexto, e o console registrou stalls da GPU. A leitura foi removida e o grupo foi serializado, mantendo asserções de contexto real, dimensões, resize, visibilidade, reduced motion e perda de contexto. As seis repetições passaram: **12/12 testes**.

A falha isolada de clipping em Firefox não foi reproduzida em **10 sondagens geométricas e oito execuções do spec real**. Não houve alteração de CSS sem evidência. Esses resultados caracterizam o diagnóstico; não provam ausência de intermitência em qualquer ambiente. O helper passou a registrar seletor e geometria sem copiar texto de contato. [Resumo e evidências](evidence/ui-debug/ui-debug-summary.json).

A rodada integrada seguinte passou em **50/51 testes** e encontrou uma falha diferente em WebKit: uma requisição RSC de prefetch falhou 40,5 ms após o teste substituir o documento, antes da nova página terminar de carregar. Requisições vizinhas da mesma origem responderam 200; a requisição interrompida não teve resposta completa no trace. A evidência favorece cancelamento na navegação artificial, sem provar universalmente ausência de problemas de acesso. O harness agora aguarda a rede estabilizar **depois** das asserções de conteúdo inicial e **antes** de substituir o documento. Não há filtro de erros. As **10/10 repetições WebKit passaram**. [Trace resumido](evidence/ui-debug/webkit-rsc-navigation-trace.json) e [repetições](evidence/ui-debug/webkit-article-repeat.json).

A rodada integrada final passou em **51/51 testes, sem retry**, em 1,8 minuto, incluindo WebGL ativo, fallback sem WebGL, Firefox, WebKit e os dois projetos mobile. Esse é o resultado local de aceite. A rodada interrompida permanece identificada como `e2e-interrupted.txt`, sem ser contabilizada como aprovação.

## Remaining Issues

1. **Integração contínua:** as verificações locais estão concluídas. A CI da revisão fará instalação limpa, builds Vercel/standalone, navegadores e validação do container com Trivy/SBOM. O merge está condicionado às Actions verdes.
2. **Performance mobile:** a versão final marcou 91 nas três medições e CLS zero, mas o LCP mediano de 3,45 s ainda merece atenção. A carga variável da máquina limita a atribuição causal e não há dados de visitantes. O experimento de remover o preload foi rejeitado e preservado como diagnóstico.
3. **Entrega e ambiente:** commit, PR e merge foram autorizados pelo titular; o merge depende das GitHub Actions verdes. Não foram executados deploy manual, DNS, WAF ou mudança de variáveis. A integração automática da plataforma e a origem/CORS de produção precisam ser verificadas separadamente. A inspeção do deployment anterior `dpl_6TtvrcSguGZ1S9rbSTrvEkaDHrCg`, projeto `robertomoraes`, confirmou falha antes da compilação: o gate rejeitou `NEXT_PUBLIC_SITE_URL` vazia ou com whitespace. Este PR preserva essa validação; o default não mascara uma variável explicitamente inválida. É necessário corrigir ou remover essa configuração na Vercel, ação não executada nesta entrega.
4. **Limites operacionais:** rate limit por processo, estado indeterminado após timeout e retenção externa permanecem explicitamente documentados.
5. **Validação humana/externa:** faltam aparelhos físicos, VoiceOver/TalkBack, entrega real do Resend e atualização dos caches sociais depois do deploy.

## Final Verification

Toolchain de referência: Node.js 24.18.0 e npm 11.16.0. As credenciais usadas nos testes foram sintéticas, o provider de contato foi simulado e nenhum e-mail real foi enviado.

| Verificação | Resultado atual | Evidência |
|---|---|---|
| Build de produção standalone | Passou com origem pública explícita. | [build](evidence/build-fonts-restored.txt) |
| ESLint | Passou. | [lint](evidence/lint-accepted.txt) |
| TypeScript | Passou. | [typecheck](evidence/typecheck-accepted.txt) |
| Unitários e contratos | **152 passaram em 21 arquivos.** | [testes](evidence/unit-accepted.txt) |
| Budgets | **49 passaram**, cobrindo nove superfícies e privacidade. | [budgets](evidence/bundle-accepted.txt) |
| Matriz responsiva | **144 combinações passaram**. | [matriz](evidence/responsive-matrix.json) |
| Dependências | Zero vulnerabilidades reportadas; inventário de 553 dependências. | [npm audit](evidence/npm-audit.json) |
| Demonstrações disponíveis | 9/9 respostas HTTP 200. | [sites](evidence/available-websites.json) |
| OG e documentos `llms` | 16 imagens locais 200/PNG 1200×630; rotas `llms` 200/`text/plain`. | [social e llms](evidence/social-final.json) |
| Suíte de navegadores | **51/51 passaram**, sem retry, em seis projetos Playwright. | [E2E final](evidence/e2e-accepted.txt) |
| Performance mobile/desktop | **91 nas três medições mobile; desktop 99. CLS zero em todas.** LCP mediano 3,45 s/0,77 s; sem dados de visitantes. | [mobile](evidence/accepted-mobile-summary.json), [desktop](evidence/accepted-desktop-summary.json) |

Os registros intermediários foram preservados para diagnóstico. O aceite local usa os artefatos finais desta tabela; a aprovação da integração e da plataforma deve ser consultada nos checks do PR e no commit resultante da `main`.

## Evidências complementares

- [Revisão visual dos componentes](evidence/ui-browser-evidence.json)
- [Captura da home desktop](evidence/home-1440.png) e [mobile](evidence/home-390.png)
- [Captura da galeria desktop](evidence/gallery-final-1440.png) e [mobile](evidence/gallery-final-390.png)
- [Captura da política desktop](evidence/privacy-1440.png) e [mobile](evidence/privacy-390.png)
- [Runbook de contato](../../docs/CONTACT_OPERATIONS.md)
