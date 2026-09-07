# Auditoria de interação, mobile e acessibilidade

Data da coleta: 6–7 de setembro de 2026. A reprodução usou a aplicação local já disponível em `http://127.0.0.1:3200`, Chromium headless e viewports móveis. Nenhum arquivo-fonte foi alterado durante a coleta.

## Galeria: autoplay e foco ocultado

**Confirmado — P1.** O carrossel inicia autoplay com intervalo de 4 segundos, mantém o autoplay depois de interação e só oferece pausa implícita ao mouse (`pauseOnMouseEnter`). A configuração está em `src/components/portfolio/ProjectGalleryCarousel.tsx:169-177`. Não existe controle Pausar/Retomar junto dos controles anterior/próximo em `src/components/portfolio/ProjectGalleryCarousel.tsx:138-155`.

O efeito sobre foco foi reproduzido em `/projetos/hospital-sirio-libanes`, viewport `390 × 844`:

1. Rolar até `[data-project-gallery]` e aguardar o enhancement do Swiper.
2. Focar o botão ativo `[data-project-gallery] button[tabindex="0"]`.
3. Aguardar 4,6 segundos sem mover o foco.
4. Inspecionar `document.activeElement`, `aria-hidden` e `tabindex`.

Resultado observado:

```text
antes: label="Ampliar imagem: Interface principal do aplicativo Hospital Sírio-Libanês"
       aria-hidden=null, tabindex="0"
depois: mesmo document.activeElement
        aria-hidden="true", tabindex="-1"
novo ativo: "Ampliar imagem: Canal Sírio-Libanês apresentando conteúdo institucional"
```

O código reaplica `aria-hidden` e `tabIndex` conforme `isActive` em `src/components/portfolio/ProjectGalleryCarousel.tsx:193-203`. Assim, o avanço automático deixa o foco real dentro de um elemento removido da árvore de acessibilidade. A correção deve oferecer pausa persistente e impedir avanço enquanto o carrossel contém foco; também deve evitar marcar o próprio elemento focado como oculto.

## Case mobile: colisão entre fato e valor

**Confirmado — P2.** Em largura móvel, cada fato usa uma coluna fixa de `5rem` para o rótulo e `0.75rem` de gap (`src/components/portfolio/Portfolio.module.css:864-874`). O rótulo usa fonte mono, caixa alta e espaçamento entre letras (`src/components/portfolio/Portfolio.module.css:595-600`).

Medição do `Range` do texto de `dt` contra o retângulo de `dd`, feita em `/projetos/hospital-sirio-libanes`:

| Viewport | fim do texto `RESPONSABILIDADE` | início do `dd` | interseção horizontal | interseção vertical |
| --- | ---: | ---: | ---: | --- |
| 320 px | 127,11 px | 108,00 px | 19,11 px | sim |
| 390 px | 127,11 px | 108,00 px | 19,11 px | sim |
| 430 px | 127,11 px | 108,00 px | 19,11 px | sim |

O valor é constante porque a coluna do rótulo permanece em 80 px nas três larguras. O recorte visual está em [`../case-fact-responsabilidade-overlap-390.png`](../case-fact-responsabilidade-overlap-390.png). A correção deve aumentar a coluna de rótulo com limite previsível ou empilhar rótulo e valor no breakpoint móvel, com validação adicional em português e espanhol.

## Formulário: foco de validação e duração do erro

**Falso positivo retirado.** O código não declara manualmente um callback de erro em `handleSubmit` (`src/components/sections/ContactForm.tsx:36-43,91-98`), mas o comportamento padrão do React Hook Form foca o primeiro campo inválido. A reprodução em `/contato`, `390 × 844`, após clicar em “Enviar mensagem” com o formulário vazio, resultou em:

```json
{
  "active": "contact-name",
  "invalid": ["contact-name", "contact-email", "contact-subject", "contact-message"]
}
```

O E2E existente também cobre esse contrato. Portanto, a ausência de foco no primeiro erro não deve constar como defeito.

**Confirmado pela implementação — P2.** Uma falha de envio é removida automaticamente após 4 segundos em `src/components/sections/ContactForm.tsx:72-80`, embora a mensagem possa pedir que a pessoa aguarde ou use outro canal. O alerta é corretamente exposto com `role="alert"` em `src/components/sections/ContactForm.tsx:235-248`. Para não impor leitura e ação em quatro segundos, o erro deve permanecer até nova edição, novo envio ou dispensa explícita. A mensagem de sucesso é removida após 5 segundos em `src/components/sections/ContactForm.tsx:64-70`.

## Hashes: títulos não ficaram oclusos

**Hipótese de oclusão retirada.** Os wrappers `#faq`, `#stack` e a seção `#metrics` não declaram `scroll-margin-top`, enquanto a navegação é fixa. Apesar disso, o padding interno deixou os títulos visíveis após a conclusão do scroll suave.

Resultados em `390 × 844`, com borda inferior da navegação em `69 px`:

| URL | topo do alvo | topo do título | resultado |
| --- | ---: | ---: | --- |
| `/sobre#faq` | 6,5 px | 120,17 px | título visível |
| `/sobre#stack` | -0,09 px | 87,91 px | título visível |
| `/projetos/hospital-sirio-libanes#metrics` | 59,67 px | 131,67 px | título visível |

Para reproduzir, carregar cada URL isoladamente, aguardar cerca de 1,5 segundo para o scroll suave e comparar `getBoundingClientRect().top` do título com o `bottom` da navegação. Uma troca rápida entre hashes durante um scroll ainda em andamento produziu posição instável uma vez, mas não foi consolidada como cenário de produto e não deve ser relatada como bug confirmado.

## Artigo móvel: navegação de capítulos indisponível

**Confirmado — P2.** Em `390 × 844`, `/insights/go-em-producao` mediu `11.345 px`, ou `13,4` alturas de viewport, e possui oito capítulos. O único `<nav>` com links para capítulos fica dentro de `.stage` (`src/components/insights/ArticleExperience.tsx:394-510`). `.stage` usa `display: none` por padrão (`src/components/insights/ImmersiveArticle.module.css:926-928`) e só é exibido a partir de 1120 px (`src/components/insights/ImmersiveArticle.module.css:1506-1542`).

O tracker móvel em `src/components/insights/ArticleExperience.tsx:380-392` é informativo, tem `aria-hidden="true"` e não oferece links. Logo, touch, teclado em viewport estreita e leitor de tela não recebem navegação interna para uma página de 13,4 telas. A correção pode reutilizar os anchors existentes em um sumário compacto/disclosure próximo ao início, preservando o tracker e a linguagem visual atuais.

Comprimentos de referência medidos em `390 × 844`:

| Rota | altura | telas |
| --- | ---: | ---: |
| `/` | 7.726 px | 9,2 |
| `/projetos` | 10.792 px | 12,8 |
| case HSL | 6.494 px | 7,7 |
| `/experiencia` | 4.121 px | 4,9 |
| `/sobre` | 5.676 px | 6,7 |
| `/insights` | 1.632 px | 1,9 |
| artigo | 11.345 px | 13,4 |
| `/contato` | 2.201 px | 2,6 |

Um link textual “voltar ao topo” no rodapé se justifica primeiro em Work e no artigo, que passam de doze telas. Um botão flutuante não é necessário para corrigir a navegação interna do artigo.

## Safe areas

**Limitação da auditoria; não confirmado como bug.** Não há uso de `env(safe-area-inset-*)` no código. O menu móvel ocupa `fixed inset-0`, `h-dvh` e usa padding comum no cabeçalho (`src/components/layout/Navigation.tsx:277-319`). O modal posiciona fechar e navegação com offsets fixos (`src/components/portfolio/Portfolio.module.css:1397-1479`). O viewport não solicita `viewportFit: "cover"` (`src/app/[locale]/layout.tsx:51-54`), de modo que navegadores comuns devem reservar a área segura.

A validação conclusiva requer iPhone/iPad com notch ou Dynamic Island em retrato, paisagem e modo instalado. Verificar se o botão de fechar do menu, o botão de fechar do modal e os controles inferiores permanecem inteiramente visíveis e acionáveis. Só adicionar `env(safe-area-inset-*)` se houver colisão nesse hardware/modo; a ausência do token, isoladamente, não prova defeito.

## ScrollReveal: conteúdo invisível quando os chunks falham ou demoram

**Confirmado — P1 de progressive enhancement.** `ScrollReveal` envia no SSR o keyframe inicial como estilo inline, incluindo `opacity: 0` e transformação (`src/components/shared/ScrollReveal.tsx:187-208`). A restauração sem JavaScript existe apenas em `@media (scripting: none)` (`src/app/globals.css:513-530`). Quando o navegador tem scripting habilitado, mas os chunks falham, são bloqueados ou ainda não carregaram, essa media query não casa e nenhum `useEffect` executa `revealImmediately()` (`src/components/shared/ScrollReveal.tsx:109-169`).

Reprodução em `/`, Chromium `390 × 844`, `prefers-reduced-motion: no-preference`:

1. Manter JavaScript habilitado no contexto.
2. Interceptar `**/_next/static/**/*.js` e abortar as requisições.
3. Carregar a home, rolar o perfil `[data-home-section="profile"]` para a viewport e aguardar 500 ms.
4. Medir a opacidade computada de todos os `[data-scroll-reveal]` dentro da seção.

Foram abortados 13 chunks. Os quatro wrappers do perfil mantiveram o estilo inline `transform: translate3d(0, 28px, 0); opacity: 0` e opacidade computada `0`. O `h2` isolado tinha opacidade computada `1`, mas permaneceu invisível por estar dentro do primeiro wrapper opaco. O recorte [`screenshots/home-profile-js-aborted.png`](screenshots/home-profile-js-aborted.png) mostra apenas fundo, navegação fixa e divisor, sem título, texto ou pilares do perfil.

O teste com `javaScriptEnabled: false` confirmou que `matchMedia("(scripting: none)").matches` passa a `true` e a regra CSS sobrescreve a opacidade computada dos wrappers para `1`. Contudo, o servidor Next de desenvolvimento manteve o segmento da aplicação dentro de um ancestral `div[hidden]`, deixando os retângulos com altura zero; por isso esse segundo screenshot não representa uma validação confiável do modo no-JS em produção e não é usado como evidência visual. A prova do defeito é o cenário com scripting habilitado e chunks abortados, somada ao caminho causal no código.

O mesmo estado ocorre transitoriamente com chunks lentos: o HTML chega já opaco e só fica visível depois que o componente hidrata e seu efeito executa. A correção deve manter o HTML visível por padrão e aplicar o keyframe inicial apenas quando o cliente inicializar o mecanismo de reveal, por exemplo adicionando o estado de animação no efeito antes de observar o elemento. Isso preserva a identidade e as animações atuais sem depender do sucesso do bundle para apresentar conteúdo essencial.
