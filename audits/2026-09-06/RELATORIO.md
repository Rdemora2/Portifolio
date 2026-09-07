# Auditoria do portfólio — 6 e 7 de setembro de 2026

**Escopo:** discovery, baseline, auditoria e plano. **Código de referência:** main, commit dddab26d28c9eb5fc6605bda9a2435d66da7e896. A auditoria começou em 06/09 e terminou após a virada do dia no fuso America/Sao_Paulo; a pasta mantém a data inicial.

**Estado das alterações:** nenhum arquivo da aplicação, dependência, configuração de produção ou design foi alterado. Foram criados apenas este relatório, scripts de auditoria, uma reprodução isolada com provider simulado e evidências. Não houve commit, PR, deploy, alteração de DNS, envio real de formulário ou instalação de dependências.

## Executive Summary

O portfólio tem uma base técnica organizada, identidade visual coerente e bons controles automatizados. Entretanto, **não atende ainda ao critério de conclusão solicitado**. Há problemas reproduzidos de descoberta pública, acessibilidade, robustez, conteúdo e apresentação mobile que passam pelos testes atuais.

O bloqueador mais abrangente é a origem pública: o site responde no [alias público da Vercel](https://portifolio-liard-zeta.vercel.app/), mas as 30 páginas, o sitemap e todas as imagens sociais apontam para robertomoraes.dev, que não resolveu em três resolvedores DNS. Não basta a imagem existir no projeto: as sete URLs absolutas anunciadas aos crawlers falharam.

Outros achados de alta prioridade:

- O arquivo público preparado para agentes de IA atribui funcionalidades e resultados aos projetos HSL e Fiesta que contradizem os estudos de caso.
- O autoplay da galeria deixa o foco de teclado dentro de um slide que se torna oculto para tecnologias assistivas.
- Na reprodução com identificação de IP via proxy habilitada, requisições já bloqueadas por cliente continuam consumindo o limite global e bloqueiam outros clientes na mesma instância.
- Falta transparência de privacidade para o formulário, os serviços envolvidos e o cookie de idioma.
- Quando os chunks JavaScript falham, o perfil abaixo do hero permanece invisível devido à opacidade inicial das animações.

Não foi confirmada vulnerabilidade crítica P0. A indisponibilidade do domínio canônico foi classificada como **P1**, pois o alias público continua funcionando; ela bloqueia a aprovação de SEO e compartilhamento. P0 seria apropriado se houvesse indisponibilidade completa do único endereço efetivamente utilizado pelos visitantes.

As correções propostas preservam paleta, tipografia, composição, cartões, linguagem técnica e assinatura WebGL. Não há evidência que justifique um redesign.

## Discovery e identidade a preservar

### Stack, arquitetura e deploy

| Área | Implementação encontrada |
|---|---|
| Toolchain | Node 24.18.0 e npm 11.16.0. O shell iniciou em Node 26; todas as validações principais usaram a instalação 24.18.0 existente. |
| Aplicação | Next.js 16.3.0, React/React DOM 19.2.4, TypeScript 5, App Router e rotas tipadas. |
| Idiomas | next-intl 4.13.7; PT como padrão sem prefixo, EN/ES com prefixo; caminhos traduzidos e redirecionamentos legados. |
| Estilo | Tailwind 4, CSS Modules, tokens CSS, Syne, DM Sans e JetBrains Mono via next/font. |
| Interação | Web Animations API, OGL para LiquidChrome, Swiper para galerias, carregamento progressivo do formulário e das galerias. |
| Formulário | React Hook Form + Zod; POST /api/contact; Resend no servidor. |
| Conteúdo | Dados tipados em src/data, textos PT/EN/ES em src/messages e artigo estruturado em src/content/insights. |
| Operação | Adaptador nativo da Vercel; saída standalone para hospedagem própria/Docker. Não há necessidade de migrar a hospedagem. |
| Qualidade | Vitest, testes dos scripts shell, Playwright/axe, limites de bundle e CI com verificações de supply chain/container. |

São dez superfícies por idioma: home, projetos, experiência, sobre, insights, contato, artigo e três cases. Além delas há API de contato, metadados/imagens sociais e estados de erro/404.

O layout central reúne navegação, rodapé, fontes, provedor de idioma com mensagens reduzidas e metadados. As páginas e a maior parte do conteúdo usam renderização de servidor; ilhas de cliente cuidam de menu, motion, formulário, galeria e experiência do artigo. A separação entre dados, traduções e UI é útil, embora a cópia em llms-full.txt tenha divergido.

Foram consultadas as instruções locais e as referências instaladas do Next.js para fontes e imagens. A arquitetura não precisa de refatoração ampla por preferência pessoal.

### Baseline visual

Preservar:

- Fundo azul quase preto, superfícies profundas, texto claro e secundários azulados; acentos índigo, ciano e verde.
- Syne nos títulos, DM Sans no corpo e JetBrains Mono em rótulos/metadata.
- Cartões com transparência, bordas discretas, grid técnico, pills, linhas e numeração.
- Hero com nome, cargo, stack e dois CTAs; fundo LiquidChrome como assinatura.
- Cases com contexto, desafio, solução, impacto, métricas e stack; cronologia e artigo com tratamento editorial próprio.
- Movimento contido e alternativas para reduced motion.

Referências: [tokens](../../src/styles/variables.css#L1), [hero](../../src/components/sections/Hero.tsx#L10), [captura mobile com WebGL ativo](evidence/screenshots/hero-webgl-mobile.png), [captura desktop com WebGL ativo](evidence/screenshots/hero-webgl-desktop.png).

## Baseline

| Verificação executada | Resultado | Evidência |
|---|---|---|
| Build de produção standalone | Passou; compilação em 14,7 s e geração de 45 páginas/artefatos estáticos | [build](evidence/build.txt) |
| ESLint | Passou, sem diagnóstico | [lint](evidence/lint.txt) |
| Typecheck | Passou | [typecheck](evidence/typecheck.txt) |
| Vitest + quality hook | 130 testes, 16 arquivos; hook passou | [testes](evidence/unit-tests.txt) |
| Playwright existente | 34/34 passaram, em aproximadamente 2,6 min | [E2E](evidence/e2e.txt) |
| Auditoria npm | Zero vulnerabilidades reportadas; 565 dependências no inventário | [audit](evidence/npm-audit.json) |
| Limites de bundle | Todos passaram | [bundle](evidence/bundle.txt) |
| Matriz adicional | 11 superfícies PT × 12 larguras = 132; sem overflow horizontal detectado | [matriz](evidence/responsive-matrix.json) |
| Produção pública | 30/30 rotas, 98/98 URLs de imagens e 3/3 ícones acessíveis no alias | [verificação pública](evidence/public-checks.json) |
| Open Graph | 7/7 PNGs 1200×630 no alias; 0/7 URLs absolutas anunciadas acessíveis | [imagens sociais](evidence/social/opengraph-image.png) |
| Links externos de projetos | 18 acessíveis; 1 com HTTP 404, confirmado com UA de navegador | [verificação pública](evidence/public-checks.json) |
| Vercel | Deployment READY no mesmo commit; Node 24.x; consulta agregada de 7 dias sem erros de runtime registrados | [deployment](evidence/vercel-deployment.json) |

A porta 3100 já estava ocupada. A suíte foi executada na 3300, e a inspeção manual na 3200, sem interromper o processo preexistente. As credenciais locais eram fixtures e os cenários de envio foram simulados.

Os testes existentes cobrem Chromium, Firefox, WebKit, Pixel 7, iPhone 15, orientação horizontal, redução de movimento e WebGL indisponível. Emulação não equivale a teste em dispositivo físico.

## Problemas encontrados

Legenda: **bug** = comportamento reproduzido; **fato** = observação verificável; **recomendação** = melhoria proposta; **condicional** = depende de configuração externa não inspecionada. Uma preferência estética não é tratada como defeito técnico.

### Alta prioridade

| ID / prioridade | Problema e evidência | Impacto | Solução proposta |
|---|---|---|---|
| A01 · P1 · bug | Todas as 30 canonicals, hreflangs, OG/Twitter e URLs do sitemap usam domínio sem DNS. Sistema, Google DNS e Cloudflare retornaram ENOTFOUND. [constants.ts:6](../../src/lib/constants.ts#L6); [prova DNS/HTTP](evidence/production-domains.json). | Crawlers e plataformas sociais recebem endereços indisponíveis; previews não conseguem obter a imagem anunciada. | Definir a origem pública definitiva. Ou regularizar domínio/DNS/TLS e vínculo na Vercel, ou usar o alias publicado como origem canônica. Depois alinhar NEXT_PUBLIC_SITE_URL, metadados, sitemap e arquivos llms. DNS/deploy exigem solicitação específica. |
| A02 · P1 · fato | llms-full.txt descreve HSL como portal Next.js/patient self-service/zero incidentes e Fiesta como reservas/pagamentos/LCP sub-second. Isso contradiz os cases Go/GCP/Android TV/Tasy e broadcast/unicast. [llms-full.txt:68](https://github.com/Rdemora2/Portifolio/blob/dddab26d28c9eb5fc6605bda9a2435d66da7e896/public/llms-full.txt#L68); [portfolio.ts:166](../../src/data/portfolio.ts#L166); [portfolio.ts:255](../../src/data/portfolio.ts#L255). | Informação profissional inconsistente, disseminada em um arquivo destinado explicitamente a agentes de IA. | Remover afirmações sem respaldo no conteúdo aprovado e derivar esse documento da mesma fonte dos cases. Corrigir também /contact para o caminho PT efetivo /contato. |
| A03 · P1 · bug | Autoplay a cada 4 s, sem pausa persistente. Ao focar a imagem e aguardar 4,6 s, o mesmo elemento permanece focado e passa a aria-hidden=true/tabIndex=-1. [ProjectGalleryCarousel.tsx:169](../../src/components/portfolio/ProjectGalleryCarousel.tsx#L169); [reprodução](evidence/interaction-audit.md). | Contexto de leitura e foco se perdem; o conteúdo avança enquanto o usuário de teclado tenta operá-lo. | Toggle localizado Pausar/Retomar, pausa enquanto houver foco dentro da galeria e estado persistente após interação. Manter coverflow, setas, dimensões e reduced motion. Referência: [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). |
| A04 · P1 · bug reproduzido sob configuração explícita | O limite global é consumido antes do limite por cliente. Na fixture com CONTACT_TRUST_PROXY=true e limites reduzidos, duas tentativas aceitas + duas já rejeitadas do cliente A impedem a primeira tentativa de B. [route.ts:291](../../src/app/api/contact/route.ts#L291); [teste isolado:52](contact-rate-limit-reproduction.test.ts#L52). | Com IPs diferenciados nessa configuração, um cliente consegue negar o contato a outros na mesma instância. O valor efetivo de produção não foi inspecionado. | Admitir a tentativa no controle individual antes de consumir capacidade global; testar isolamento entre clientes. O teste usou Resend simulado e não enviou e-mail. |
| A05 · P1 · fato | O formulário trata dados pessoais e os encaminha ao Resend; Analytics/Speed Insights foram observados no DOM público. Não há política/aviso que explique finalidade, compartilhamento, retenção e direitos. [ContactForm.tsx:45](../../src/components/sections/ContactForm.tsx#L45); [layout.tsx:308](../../src/app/[locale]/layout.tsx#L308). | Falta informação para uma decisão consciente de contato e para compreensão do tratamento dos dados. Não se afirma uma conclusão jurídica definitiva. | Aviso curto junto ao formulário e política PT/EN/ES no rodapé. Definir com o responsável finalidade/base, retenção e canal de direitos; documentar Resend, Vercel e NEXT_LOCALE. Não criar banner fictício. |
| A26 · P1 · bug de robustez | Com JS habilitado, motion normal e 13 chunks abortados, os quatro wrappers do perfil permaneceram com opacidade computada 0. ScrollReveal emite o estado invisível no HTML e só o effect o restaura; o CSS de fallback cobre scripting:none, não falha de download. [ScrollReveal.tsx:187](../../src/components/shared/ScrollReveal.tsx#L187); [captura da falha](evidence/screenshots/home-profile-js-aborted.png). | Em conexão instável ou falha de assets, conteúdo presente no documento não fica visualmente acessível. | HTML visível por padrão; aplicar estado inicial de motion apenas após inicialização bem-sucedida do observer. Testar atraso, falha de chunks e reduced motion, preservando a animação nas visitas normais. |

### Correções, otimizações e refinamentos

| ID / prioridade | Problema → evidência | Impacto → solução |
|---|---|---|
| A06 · P2 · requisito editorial | Hero, título da aba e imagem social dão peso equivalente a engenharia e gestão. [pt.json:29](../../src/messages/pt.json#L29); [social-image.tsx:9](../../src/lib/social-image.tsx#L9). | Contraria o posicionamento solicitado. Abrir com Software Engineer/Engenheiro de Software; apresentar gestão como experiência complementar. Preservar cargos históricos verdadeiros na cronologia. |
| A07 · P2 · bug visual | RESPONSABILIDADE invade o valor adjacente em 19,11 px nas larguras 320, 390 e 430. A coluna de 5rem não acomoda o rótulo. [Portfolio.module.css:868](../../src/components/portfolio/Portfolio.module.css#L868); [recorte](case-fact-responsabilidade-overlap-390.png). | Leitura prejudicada apesar de não existir overflow de viewport. Dimensionar a coluna pelo conteúdo ou empilhar rótulo/valor em larguras pequenas; validar PT/ES e 320 px. |
| A08 · P2 · bug | A demonstração de arquitetura Carla Moraes aponta para endereço com HTTP 404. [showcase-sites.ts:40](../../src/data/showcase-sites.ts#L40). | Quebra a passagem do case para a prova publicada. Atualizar para endereço confirmado ou indicar indisponibilidade; não escolher outro projeto apenas por nome semelhante. |
| A09 · P2 · bug de navegação | O bloco Próximo case usa o CTA Todos os projetos, mas leva a um projeto individual. [ProjectCaseStudy.tsx:300](../../src/components/portfolio/ProjectCaseStudy.tsx#L300). | O destino contradiz a promessa. Usar Abrir próximo case ou Ver [nome do case]; manter o link de retorno ao índice separado. |
| A10 · P2 · fato | As três homes duplicam a marca no title e no título social: nome já está na tradução e é acrescentado pelo template/helper. [layout.tsx:75](../../src/app/[locale]/layout.tsx#L75); [page-metadata.ts:53](../../src/lib/page-metadata.ts#L53). | Ruído em abas, resultados e previews. Tratar a home com título absoluto ou fornecer ao template um título sem marca repetida. |
| A11 · P2 · bug de feedback | O erro de envio desaparece após 4 s. Em resposta 504 simulada, o alerta passou de 1 para 0 após 4,3 s; os campos foram preservados. [ContactForm.tsx:72](../../src/components/sections/ContactForm.tsx#L72); [prova](evidence/final-browser-checks.json). | A explicação some antes de ser lida ou usada. Mantê-la até nova tentativa/edição ou dispensa explícita. Preservar o comportamento correto de foco e aria-invalid do formulário. |
| A12 · P2 · recomendação de UX | Artigo com cerca de 13,4 telas mobile sem índice navegável: nav de capítulos existe somente no stage desktop ≥1120 px; o tracker mobile é aria-hidden. [ArticleExperience.tsx:380](../../src/components/insights/ArticleExperience.tsx#L380); [ImmersiveArticle.module.css:926](../../src/components/insights/ImmersiveArticle.module.css#L926). | Explorar e revisitar oito capítulos exige muito scroll. Reutilizar os anchors em um índice compacto expansível; manter a apresentação desktop. |
| A13 · P2 · fato de performance | Dez thumbnails WebP de 1410×831 usam unoptimized, somando 728,85 KiB de originais. sizes não gera srcset nesse modo. [WebsiteShowcase.tsx:80](../../src/components/sections/WebsiteShowcase.tsx#L80); [inventário](evidence/assets.json). | Ao percorrer a vitrine, telas pequenas recebem arquivos sem ajuste de resolução. Remover a exceção unoptimized, medir variantes e cache do Next Image e comparar nitidez. Não remover lazy loading, blur ou proporção. |
| A14 · P2 · medição/recomendação | Home mobile: LCP 2,57–3,03 s em três confirmações; mediana 2,69 s. O elemento é o H1. Há 109,4 KiB de fontes preloaded e animação de entrada do título. [globals.css:314](../../src/app/globals.css#L314); [Lighthouse](evidence/lighthouse-confirmation.json). | Há margem para melhorar a chegada do conteúdo principal. Perfilar hidratação/long tasks; testar título legível no primeiro paint e animação no contorno/fundo; avaliar preload das fontes por uso acima da dobra. Nenhuma economia ou causalidade exata foi presumida. |
| A15 · P2 · lacuna de testes | isBot retorna true para navigator.webdriver; Playwright padrão não monta LiquidChrome. [is-bot.ts:18](../../src/lib/is-bot.ts#L18); [HeroClient.tsx:30](../../src/components/sections/HeroClient.tsx#L30). | Testes verdes não provam a assinatura WebGL dos visitantes. Acrescentar teste explícito desse caminho, com asserção de canvas, resize, perda de contexto e pausa. A auditoria exercitou canvas ativo em 390/1440 separadamente. O efeito em Lighthouse depende da configuração/versão; não generalizar a detecção. |
| A16 · P2 · fato/robustez | A passagem responsiva registrou avisos recorrentes de slides insuficientes para loop em ambas as galerias. [ProjectGalleryCarousel.tsx:164](../../src/components/portfolio/ProjectGalleryCarousel.tsx#L164); [console da matriz](evidence/responsive-matrix.json). | A configuração pede um loop que a biblioteca avisa não poder garantir. Adaptar loop/slides visíveis ao inventário e testar ciclos completos em cada breakpoint. Não foi demonstrado que todas as galerias deixam de funcionar. |
| A17 · P2 · fato documental | Documentação da API usa projectType/budget, mas o contrato atual exige subject e aceita company. Também há descrições antigas sobre CSP e ausência de SBOM. [TECHNICAL_CONTEXT.md:428](../../docs/TECHNICAL_CONTEXT.md#L428); [validations.ts:20](../../src/lib/validations.ts#L20). | Outro engenheiro pode construir payload inválido ou interpretar controles inexistentes. Atualizar contrato, exemplos, deploy Vercel/standalone e separar estado atual de histórico. |
| A18 · P2 · recomendação | critters 0.0.23 está descontinuado, mas é usado de fato por experimental.optimizeCss do Next. [next.config.ts:73](../../next.config.ts#L73). | Risco de manutenção, sem vulnerabilidade apontada no audit atual. Avaliar desativar optimizeCss e medir o resultado antes de trocar pacote. Não remover a dependência sem verificar o consumidor do Next. |
| A19 · P2 · condicional | Rate limit em Map por processo; configuração WAF externa não foi inspecionada. CONTACT_TRUST_PROXY=false, o default do código, usa um bucket comum a todos os clientes. [route.ts:48](../../src/app/api/contact/route.ts#L48); [route.ts:109](../../src/app/api/contact/route.ts#L109). | Réplicas e reinícios não compartilham contagem; com proxy não confiável, o limite chamado por cliente também é compartilhado. Confirmar topologia/configuração e proteção externa antes de propor infraestrutura. Se necessário, usar proteção da plataforma ou estado compartilhado proporcional. |
| A20 · P2 · risco operacional | O timeout do servidor usa Promise.race; retornar 504 não cancela nem prova que o provider não entregou. A idempotência usa janela temporal. [route.ts:247](../../src/app/api/contact/route.ts#L247). | Entrega pode ficar indeterminada. Documentar isso, testar resolução tardia e retries na borda da janela e definir política de repetição. Abort de rede também não garante que uma entrega já aceita seja desfeita. |
| A21 · P3 · recomendação social | Cases compartilham imagem genérica por idioma, embora o alt receba o título específico do case. [page-metadata.ts:29](../../src/lib/page-metadata.ts#L29); [case metadata:40](../../src/app/[locale]/work/[slug]/page.tsx#L40). | Preview pouco específico e descrição visual imprecisa. Corrigir alt já; arte por case é melhoria opcional, reutilizando a composição social atual e informações aprovadas. |
| A22 · P3 · recomendação | Não há caminho explícito de voltar ao topo em páginas de 7–13 telas mobile. [Footer.tsx](../../src/components/layout/Footer.tsx). | Retorno exige scroll prolongado. Adicionar link discreto no rodapé; avaliar botão flutuante apenas nas páginas longas, com ≥44 px, foco no alvo, safe areas, threshold e reduced motion. |
| A23 · P3 · fato | O 404 localizado usa token inexistente color-edge-bright; o 404 global tem estilo aria-current, mas não aplica o atributo aos idiomas. [not-found.tsx:66](../../src/app/[locale]/not-found.tsx#L66); [global-not-found.tsx:95](../../src/app/global-not-found.tsx#L95). | Pequena inconsistência de borda/estado atual. Reutilizar token existente e marcar o idioma atual. O status 404/noindex e o retorno já funcionam. |
| A24 · P3 · consistência | Links de contato/rodapé em nova aba não seguem o aviso acessível já existente na vitrine. [Contact.tsx:53](../../src/components/sections/Contact.tsx#L53); [WebsiteShowcase.tsx:127](../../src/components/sections/WebsiteShowcase.tsx#L127). | Menor previsibilidade. Aplicar o padrão localizado existente, sem alterar destinos nem remover canais profissionais deliberadamente públicos. |
| A25 · P3 · semântica | Paginação da galeria é nomeada como Ampliar/Abrir imagem, mas apenas muda o slide. [ProjectGalleryCarousel.tsx:238](../../src/components/portfolio/ProjectGalleryCarousel.tsx#L238). | Nome acessível descreve outra ação. Usar Ir para imagem N; reservar Ampliar para o controle que abre o diálogo. |
| A27 · P2 · bug de fallback | Com JavaScript desabilitado, a home local e pública permanece no loading; o H1 fica em um div hidden de streaming mesmo após networkidle e mais 1,2 s. [loading.tsx](https://github.com/Rdemora2/Portifolio/blob/dddab26d28c9eb5fc6605bda9a2435d66da7e896/src/app/%5Blocale%5D/%28home%29/loading.tsx); [prova](evidence/nojs-confirmation.json); [captura pública](evidence/screenshots/nojs-home-public.png). | O conteúdo principal não aparece nessa condição. Rever a boundary de loading/streaming da home para entregar conteúdo estático essencial visível, sem depender de script de revelação. Não contornar removendo o atributo hidden de boundaries indiscriminadamente. |

### Itens que não devem virar correções sem mais evidência

- As métricas e afirmações profissionais existentes, como tráfego, latência e pioneirismo, precisam de validação do titular para refinamento editorial. Não foram verificadas contra telemetria dos projetos e não devem ser inventadas, ampliadas ou descartadas por suposição.
- Datas lastModified fixas no sitemap não são automaticamente erradas por serem anteriores ao último commit: uma alteração de código pode não mudar o conteúdo. Preferir datas de conteúdo reais; não usar a data do build como atualização fictícia.
- Não foi demonstrada fuga do leitor de tela no lightbox, colisão com notch físico ou falha de anúncio do global-error. Permanecem cenários para QA em dispositivo/tecnologia assistiva.
- A suspeita de reinício persistente do WebGL fora da viewport foi retirada: o wrapper atual desmonta o componente quando a aba fica oculta.
- A suspeita de foco ausente na validação foi retirada: React Hook Form foca corretamente o primeiro campo inválido.
- Os hashes FAQ, stack e metrics mantiveram headings visíveis abaixo da navegação nas reproduções isoladas. Não há justificativa para mudar offsets por preferência.

## Alterações realizadas e alterações visuais

Não houve implementação de correções. A entrega atual contém diagnóstico e resultados concretos para revisão, conforme a missão condiciona a fase de implementação à autorização posterior.

O plano visual é de refinamento:

| Problema atual | Por que mudar | Refinamento | Impacto esperado |
|---|---|---|---|
| Rótulo de case colide no mobile | Legibilidade objetivamente prejudicada | Corrigir somente a grade de dados | Eliminar sobreposição preservando tipografia e espaçamento geral |
| Autoplay sem controle | Leitura/foco não ficam sob controle do visitante | Pausar/Retomar junto às setas atuais | Galeria acessível com a mesma linguagem |
| Gestão compete no hero | Contraria o posicionamento solicitado | Revisar cargo/copy e arte social | Engenharia clara na primeira impressão |
| Artigo longo sem índice mobile | Navegação interna custosa | Disclosure compacto com anchors existentes | Exploração confortável sem substituir a seção |
| Ausência de transparência | Formulário não explica tratamento | Aviso curto + link de política no rodapé | Clareza sem popup dominante |

Não se propõe trocar fontes, paleta, hero, cards, cronologia, framework, biblioteca de ícones ou arquitetura de páginas.

## Mobile

Foram exercitadas as larguras **320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920 e 2560 px** nas 11 superfícies PT. A suíte também cobre idiomas, orientação curta horizontal e semântica touch nas emulações de Pixel/iPhone.

Não houve overflow horizontal na matriz, mas houve colisão entre elementos irmãos; são verificações diferentes. A correção de A07 deve adicionar uma asserção de interseção/rótulo, pois um teste apenas de scrollWidth não a detecta.

| Página a 390×844 | Altura aproximada | Consequência |
|---|---:|---|
| Home | 7.726 px / 9,2 telas | Voltar ao topo pode ajudar |
| Projetos | 10.792 px / 12,8 telas | Atalho de retorno é útil após a vitrine |
| Case HSL | 6.494 px / 7,7 telas | Galeria precisa de controle e foco estáveis |
| Experiência | 4.121 px / 4,9 telas | Cronologia permanece legível |
| Sobre | 5.624–5.676 px / 6,7 telas | Stack/FAQ acessíveis por hash |
| Índice de insights | 1.632 px / 1,9 tela | Botão flutuante acrescentaria pouco |
| Artigo | aproximadamente 11.300 px / 13,4 telas | Priorizar índice de capítulos |
| Contato | 2.201 px / 2,6 telas | Priorizar feedback e privacidade |

O hero usa 100dvh com fallback 100vh e tratamento para telas baixas; o menu usa dvh. Não há viewport-fit=cover nem uso de safe-area-inset no código. Isso, isoladamente, não prova uma colisão: o navegador pode proteger a área útil. Notch, barras dinâmicas, teclado virtual e rotação em iPhone físico continuam fora da evidência obtida.

O botão flutuante de topo é **opcional**. Se adotado, aparecer após scroll significativo, sumir perto do início, respeitar safe areas, não cobrir CTA/formulário, ter nome acessível e teclado, levar foco ao início e desativar scroll suave com reduced motion. Um link textual no rodapé é a alternativa de menor complexidade.

## Performance

### Medidas de laboratório

Lighthouse 13.4.1 já instalado em cache; Chromium 149; build otimizado. As três confirmações da home usaram o perfil mobile padrão, 412×823, simulação de rede e CPU 4×. Desktop foi confirmado com configuração desktop efetiva de 1350×940 e CPU 1×.

| Cenário | Performance | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|
| Home pública mobile — mediana de 3 | 93 | 1,06 s | 2,69 s | 240 ms | 0 |
| Home pública mobile — intervalo | 75–94 | 0,98–1,17 s | 2,57–3,03 s | 93–928 ms | 0 |
| Home pública desktop — 1 confirmação | 99 | 0,31 s | 0,66 s | 16 ms | 0 |
| Projetos público mobile — 1 exploração | 75 | 1,51 s | 3,03 s | 669 ms | 0 |
| Artigo público mobile — 1 exploração | 95 | 1,11 s | 2,62 s | 162 ms | 0 |
| Home local mobile — confirmação | 82 | 1,08 s | 4,16 s | 238 ms | 0 |

Fontes: [confirmações](evidence/lighthouse-confirmation.json), [relatório HTML da home](evidence/home-mobile-confirm-1.html), [explorações de projetos/artigo](evidence/lighthouse-summary.json).

As rodadas exploratórias mostraram variação importante e foram seguidas pelas confirmações acima. A rodada inicialmente chamada production-home-desktop no arquivo exploratório estava configurada como mobile e **não é usada como desktop** neste relatório. A tentativa exploratória com UA alternativo também não é tratada como prova de diferença de custo do WebGL. As configurações efetivas estão nos JSONs.

O LCP da home é o H1 com o nome, não uma imagem. O HTML contém esse texto; não faz sentido tentar resolver esse LCP aplicando preload a uma thumbnail. O próximo experimento deve investigar atraso de renderização, animação de entrada, fontes e trabalho de hidratação. A redução exata de cada mudança ainda não foi medida.

LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1 são referências de experiência, avaliadas em campo no percentil 75; TBT de laboratório não substitui INP. [Referência de Web Vitals](https://web.dev/articles/vitals).

**Dados reais de visitantes indisponíveis:** a API pública de PageSpeed retornou 429 por quota; não foram obtidos CrUX/INP/p75. Não se afirma aprovação de Core Web Vitals. [Evidência da indisponibilidade](evidence/field-metrics-availability.json).

### Bundle, fontes e imagens

| Superfície | JS inicial gzip | CSS gzip |
|---|---:|---:|
| Home | 220,9 KiB | 16,4 KiB |
| Projetos | 222,9 KiB | 18,6 KiB |
| Case amostrado | 224,1 KiB | 16,4 KiB |
| Experiência / Sobre | 217,0 KiB | 16,8 / 18,2 KiB |
| Insights | 217,4 KiB | 16,4 KiB |
| Contato | 219,2 KiB | 16,4 KiB |
| Artigo | 219,6 KiB | 19,4 KiB |

Cada rota mede 109,4 KiB de fontes preloaded; inventário de fontes referenciado pelo CSS: 197,2 KiB. Chunks fora das entradas principais somam 133,8 KiB; maior chunk diferido: 83,6 KiB. São métricas de inventário/regressão, não promessa de que cada visita baixe tudo.

Foram inventariados 24 assets de imagem/ícone: 21 WebPs, Apple icon 180×180, favicon e SVG. Os maiores originais são hsl_app_01.webp (aproximadamente 215,5 KiB) e terraviva.webp (194,0 KiB). Nas galerias, Next Image produz variantes; a exceção problemática está nas dez thumbnails da vitrine (A13). Não foi vista necessidade de substituir as imagens ou alterar suas proporções.

Os imports dinâmicos de formulário, galeria e WebGL são decisões úteis. Não se recomenda remover bibliotecas apenas porque contribuem para o bundle; primeiro localizar custo no comportamento realmente exercitado.

**Antes/depois:** existe apenas baseline. Nenhuma melhora de performance é atribuída a uma correção ainda não implementada.

## SEO e Social Sharing

A estrutura de metadata, hreflangs recíprocos, x-default, JSON-LD, sitemap e redirecionamentos legados está presente. As 30 rotas públicas responderam 200 no alias; 404/noindex foi coberto pela suíte. Isso não compensa A01.

As sete artes foram baixadas do alias, verificadas como PNG 1200×630 e inspecionadas visualmente. São legíveis, sem cortes evidentes. A arte principal repete o posicionamento duplo de engenharia/gestão; os cases usam a arte genérica do idioma. A arte do artigo tem contexto próprio.

**Situação do compartilhamento:** não aprovado. As imagens absolutas anunciadas falham por DNS. Não foram realizadas publicações ou inspeções autenticadas em LinkedIn, WhatsApp, X, Facebook, Slack ou Discord; portanto não se afirma que seus caches/previews estejam corretos. Depois de regularizar a origem, repetir GET anônimo às URLs exatas, confirmar TLS/tipo/dimensão, conferir redirects/canonical e então validar previews nas plataformas relevantes.

Revisar títulos longos e descrições prolixas como trabalho editorial, sem impor limites fictícios de caracteres: snippets variam conforme plataforma e consulta. Prioridade imediata é remover marca duplicada e esclarecer a especialidade.

## Accessibility

Os testes axe da suíte e as rodadas Lighthouse reportaram ausência de violações automatizadas nas superfícies auditadas. Isso não equivale a conformidade WCAG completa: autoplay/foco e nomes que prometem a ação errada exigiram interação e revisão humana.

Foram validados menu com teclado/Escape, retorno de foco, navegação entre páginas/idiomas, campos inválidos com foco no primeiro erro, reduced motion e fallback de WebGL. A03 e A07 são regressões que a estratégia de testes deve passar a proteger.

Para novos controles, 44×44 px é uma meta ergonômica adequada ao mobile; o mínimo WCAG 2.2 AA de 24×24 tem exceções de espaçamento e contexto. Não se deve classificar todo controle menor que 44 px como violação automática. [WCAG 2.2, tamanho de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

VoiceOver/TalkBack em aparelho físico, zoom com teclado virtual e exploração do lightbox por rotor continuam pendentes. Sugestões de ARIA devem ser confirmadas nesses fluxos e não substituir semântica nativa.

## Privacy

| Tecnologia | Evidência | Tratamento proposto |
|---|---|---|
| NEXT_LOCALE | Cookie de preferência do next-intl; resposta pública observou SameSite=Lax/Path=/ | Descrever finalidade e duração efetiva; não classificar como publicidade |
| Vercel Analytics 2.0.1 | Script observado em caminho reescrito da própria origem, identificado por data-sdkn | Explicar medição, dados e fornecedor |
| Speed Insights 2.0.0 | Script/endpoint de vitals observado na mesma origem | Explicar RUM e revisar necessidade/configuração |
| WebVitals próprio | Componente opcional condicionado a endpoint same-origin | Documentar apenas se efetivamente configurado |
| Formulário/Resend | Campos e envio no servidor inspecionados; nenhum envio real efetuado | Aviso junto ao formulário e política de retenção/direitos |
| Storage da aplicação | localStorage e sessionStorage vazios na amostra; nenhum uso próprio adicional encontrado no código | Não inventar categoria/consentimento para tecnologia ausente |

Os scripts da Vercel aparecem em caminhos com hash, não necessariamente contendo /_vercel. A primeira filtragem por esse nome não seria suficiente; a identificação final foi feita pelos atributos do DOM. [Prova de runtime](evidence/final-browser-checks.json).

A documentação oficial descreve o Web Analytics como solução sem cookies de terceiros; isso não elimina a necessidade de transparência nem determina por si só a base aplicável ao formulário. A ausência de banner não foi classificada como bug. A política deve refletir o inventário real e as decisões do responsável, sem textos legais ou prazos inventados. [Vercel Analytics](https://vercel.com/docs/analytics/privacy-policy), [Speed Insights](https://vercel.com/docs/speed-insights/metrics), [orientação da ANPD](https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d).

## Engineering, dependências e segurança

### Dependências diretas

| Pacotes | Uso constatado | Decisão |
|---|---|---|
| next, react, react-dom | Framework/renderização | Preservar; sem upgrade indiscriminado |
| next-intl | Rotas, mensagens e locale | Preservar; contrato centralizado é útil |
| react-hook-form, @hookform/resolvers, zod | Formulário e validação | Responsabilidades complementares; preservar |
| resend | Entrega no servidor | Preservar; melhorar testes de timeout/idempotência |
| @vercel/analytics, @vercel/speed-insights | Métricas do deployment | Uso real; documentar privacidade |
| ogl | Efeito LiquidChrome | Uso real; testar caminho visual |
| swiper | Galerias | Uso real; corrigir configuração e acessibilidade |
| react-icons | Ícones de stack | Uso real e imports otimizados |
| @playwright/test, @axe-core/playwright | E2E e acessibilidade | Preservar e ampliar cenários importantes |
| vitest | Unidade/integração/scripts | Preservar |
| @next/env | Ferramenta local de desenvolvimento | Uso real |
| tailwindcss, @tailwindcss/postcss | CSS | Uso real |
| typescript, @types/node, @types/react, @types/react-dom | Tipos | Uso real |
| eslint, eslint-config-next | Lint | Uso real |
| critters | Consumidor indireto do optimizeCss | Avaliar manutenção com benchmark, conforme A18 |

Nenhuma dependência direta sem uso foi confirmada. O resultado npm audit de zero vulnerabilidades é uma fotografia da base consultada nesta data, não garantia futura nem auditoria da imagem Docker. O [aviso de descontinuação do Critters](https://www.npmjs.com/package/critters?activeTab=versions) é um risco de manutenção separado de CVE.

### Controles bem implementados

- Zod estrito, normalização, validação de origem/media type/encoding e limite de corpo recebido por streaming.
- Honeypot, HMAC de IP/idempotência, escape HTML e mensagens de erro controladas. Existe rate limit, com as falhas e condições específicas descritas em A04/A19.
- Validação de configuração de produção sem imprimir valores; dados de envio não aparecem como payload em logs.
- CSP, nosniff, frame-ancestors, HSTS, Referrer-Policy e Permissions-Policy observados na resposta pública.
- Separação do build Vercel/standalone; container com usuário não root, filesystem restrito e controles proporcionais.
- CI com permissões limitadas, versões/digests fixados, instalação sem lifecycle scripts, auditoria/assinaturas, Trivy e geração de SBOM.

O CSP ainda permite inline script, como é comum nesta estratégia estática do Next. Não foi demonstrada uma exploração XSS; migrar para nonce/hash sem analisar cache e renderização seria uma mudança de arquitetura desproporcional.

A configuração real de variáveis, WAF, retenção e entrega Resend não foi lida. O teste de rate limit confirma o defeito de ordenação no código; não prova que a produção esteja sob abuso. Regras da plataforma devem considerar a topologia real. [Headers da Vercel](https://vercel.com/docs/headers/request-headers), [rate limiting WAF](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

Os ciclos de vida de ArticleExperience, useInView e LogoLoop têm limpeza adequada de listeners, observers e tarefas agendadas. Não foi demonstrado memory leak; não há justificativa para reescrevê-los.

## Conteúdo, posicionamento e jornada

| Área | Avaliação e proposta concreta |
|---|---|
| Hero | Nome, stack e CTAs são claros. Trocar apenas o posicionamento principal para Engenheiro de Software / Software Engineer; gestão sai da mesma linha de peso. |
| Profile da home | A ideia de engenharia como eixo e gestão como diferencial já aponta na direção correta. Manter foco em código, arquitetura, operação e produto; evitar repetir a mesma afirmação em cada seção. |
| Atuação/skills | Backend, interfaces, cloud e operação têm conteúdo pertinente. Preservar categorias e exemplos; reduzir frases como performance máxima quando não contextualizadas. |
| Trajetória | Não reescrever cargos verdadeiros. Ajustar a introdução para enfatizar evolução em engenharia e resultados de software; liderança pode permanecer como capacidade complementar. |
| Projetos | HSL é a prova técnica mais clara e já aparece primeiro. Band e Fiesta devem distinguir contribuição direta, gestão e implementação de equipes; a presença de gestão nesses cases não é defeito por si só. |
| Insights | Artigo sustenta profundidade técnica. Evitar importar métricas do artigo para cases diferentes; oferecer índice mobile. |
| CTAs | Explorar projetos e ver experiência são adequados. Corrigir A09 e o link quebrado A08 antes de adicionar novos CTAs. |
| Contato | Caminho direto, campos compreensíveis e foco correto. Manter dados após falha; persistir alerta e explicar privacidade. |
| Footer | Navegação e redes encerram a jornada. Adicionar política e retorno ao topo proporcional ao comprimento; não adicionar newsletter/chat sem necessidade. |
| Metadata/social | Uma única marca, engenharia como título principal, descrição específica e sem superlativos não comprovados. |

Exemplos para revisão editorial, sem novos fatos:

- Cargo da home: **Engenheiro de Software**.
- Título absoluto PT: **Roberto Moraes | Engenheiro de Software**.
- Descrição PT: **Desenvolvimento de software com Go, Next.js e Kotlin. Projetos de backend, cloud e sistemas em produção, com foco em arquitetura e confiabilidade.**
- CTA do próximo case: **Explorar este case**.

A experiência em gestão continua na cronologia e no contexto de contribuição, com importância complementar. Não se propõe apagar o histórico para aparentar outra experiência.

## Estados de erro e pequenos detalhes

Foram exercitados 404, formulário inválido, resposta 504 simulada, imagens 404 simuladas, JavaScript desabilitado em páginas amostradas e WebGL ativo/indisponível. Imagens indisponíveis preservaram o layout e não criaram overflow, mas exibem imagem quebrada/alt; um fallback discreto é refinamento opcional.

O formulário depende de JavaScript, mas contato direto continua disponível. Uma mensagem explícita de requisito/fallback é preferível a deixar skeleton indefinido se o carregamento falhar. A home sem JavaScript não passou: A27 registra o loading permanente observado também no alias público. Case e artigo amostrados mantiveram H1/conteúdo; o case ofereceu cinco links de imagens sem depender do carrossel. API de contato não foi enviada contra produção.

Há favicon, Apple icon, SVG, theme-color, idioma por documento, metadados de viewport, estilos de seleção/foco e regras de impressão. Manifest e instalação PWA não são requisitos automáticos de um portfólio. Não se recomenda acrescentá-los sem uma necessidade de produto.

Console: a amostra pública de home/projetos/contato não apresentou exceptions, warnings ou respostas ≥400. A matriz local detectou avisos Swiper (A16), um aviso de preload de CSS e erros 404 esperados nas navegações deliberadas à rota inexistente. Portanto, não se declara console universalmente limpo.

## Documentation

Foram criados este relatório e as evidências, sem reescrever README/TECHNICAL_CONTEXT durante a auditoria. A documentação existente é extensa e contém decisões úteis; o problema é a mistura de estado atual com contratos históricos.

Priorizar:

1. Contrato de contato com subject/company e exemplos coerentes.
2. Diferença entre validação de build, runtime e envio efetivo.
3. Origem pública real, configuração Vercel e saída standalone.
4. Política de privacidade e inventário de telemetria.
5. Estado atual de CSP, timeout, SBOM e escopo do badge de segurança.
6. Reproduções que previnem regressões em foco, layout mobile e rate limit.

## Plano de implementação

Estimativas são relativas; não incluem espera por DNS, validação factual do titular ou configuração de serviços.

| Grupo | Escopo | Natureza / esforço | Dependências e risco | Critério de aceite |
|---|---|---|---|---|
| 1 | A01, A02, A06, A08, A10 | Origem, links e conteúdo; pequeno/médio | Definir domínio definitivo; confirmar fatos profissionais. DNS/deploy ficam fora de autorização genérica. | URLs anunciadas resolvem; 30 rotas recíprocas; 7 imagens públicas; link externo corrigido; marca única; conteúdo llms consistente; engenharia primária. |
| 2 | A03, A07, A09, A16, A25–A27 | Bugs de UI/a11y/robustez; médio | Alterar grade de fatos, estado inicial de reveal, boundary da home e comportamento de galeria/CTAs em subgrupos | Home visível sem JS; conteúdo visível quando chunks falham; foco nunca permanece em slide oculto; pausa touch/teclado; sem overlap 320–430; sem aviso de loop; nomes/destinos coerentes. |
| 3 | A04, A11, A20 | Robustez do contato; médio | Provider sempre simulado em testes; não alterar infraestrutura por suposição | Cliente agressor não bloqueia outro por tentativas já rejeitadas; timeout/retry documentados e testados; erro legível até ação. |
| 4 | A05, A17, A19 | Privacidade/documentação/operação; médio | Responsável define retenção/base/canal; verificar WAF antes de mudar | Avisos verdadeiros nos 3 idiomas; documentação reproduzível; proteção externa identificada ou lacuna explicitada. |
| 5 | A13, A14, A15, A18 | Otimização; médio | Medir experimentos separados e evitar troca de dependência sem benefício | Mesmo visual; variantes de imagem adequadas; comparação de LCP/JS/fontes; teste explícito de canvas; sem regressão no build. |
| 6 | A12, A21–A24 | Refinamento; pequeno/médio | Índice mobile é o item mais útil; arte por case e botão flutuante opcionais | Navegação interna acessível; footer completo; estados/nomes consistentes; screenshots comparáveis. |

Após cada grupo: executar checks afetados, verificar desktop/mobile e comparar capturas. Nos grupos de UI/rotas/galeria/contato, executar build, lint, tipos, testes aplicáveis e a passagem de navegador. No fim, repetir a suíte completa e medir performance com o mesmo perfil/ambiente. Não atribuir melhora a rodadas incomparáveis.

## Remaining Issues

Todos os achados acima continuam pendentes de implementação. Além deles:

- Não há aprovação de production readiness enquanto A01–A05 e os bugs que bloqueiam conteúdo/foco não forem resolvidos.
- DNS/deploy, WAF e variáveis reais não foram alterados; segredos não foram inspecionados.
- Entrega real de e-mail, retenção Resend e regras externas não foram verificadas.
- Sem testes em aparelho físico, VoiceOver/TalkBack, teclado virtual real ou barras móveis reais.
- Sem dados CrUX/INP/p75; performance é baseline de laboratório.
- Sem preview autenticado em cada plataforma social; a falha das URLs absolutas já impede aprovação.
- Container/Trivy/SBOM foram revisados no código da CI, mas não executados novamente nesta máquina.
- Não se verificou o histórico completo do Git em busca de segredos nem bases privadas de vulnerabilidades. Zero npm audit não significa ausência de todo risco.

## Final Verification

O build, lint, tipos, 130 testes, quality hook, 34 E2E e budgets passaram no código original. A reprodução adicional confirmou o defeito de rate limit usando provider simulado. Foram coletados screenshots, medidas responsivas, evidências públicas, inventário de assets, testes de falha e Lighthouse.

Ao final, lint e typecheck também passaram com os artefatos de auditoria presentes. Todos os links locais dos dois documentos foram verificados. O diff dos arquivos versionados e o staging permaneceram vazios; somente a pasta audits é nova. O servidor criado na porta 3200 foi encerrado. Evidências: [lint final](evidence/final-lint.txt), [typecheck final](evidence/final-typecheck.txt) e [índice de reprodução](EVIDENCIAS.md).

O resultado é uma **auditoria concluída com plano revisável**, não uma implementação concluída. A identidade original foi preservada porque nenhum arquivo da aplicação foi alterado. As fases de implementação, comparação depois das correções e regressão final permanecem para o trabalho autorizado a seguir.
