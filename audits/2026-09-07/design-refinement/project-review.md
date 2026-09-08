# Revisão das páginas de projetos — 7 de setembro de 2026

## Entrega

- Índice de projetos com introdução concisa, atalhos para cases e laboratório, cartões amplos e alternância visual no desktop.
- Três cases reorganizados em contexto, arquitetura, decisões, atuação, resultados e aprendizados. Índice por âncoras, métricas contextualizadas, produtos externos e navegação para o próximo case.
- Revisão editorial de Bandeirantes, Sírio-Libanês e Fiesta Americana em português, inglês e espanhol; revisão das descrições das 11 interfaces do laboratório.
- Texto de `src/data/portfolio.ts` sincronizado com o português para manter coerência nas demais superfícies e exportações textuais.
- Redução de repetições e superlativos. Implementação individual, liderança técnica e gestão internacional descritas conforme o escopo já registrado. Os números existentes foram preservados; a média de 6 ms foi identificada como resposta do backend.
- Galeria com espaço reservado para controles e paginação na prévia sem JavaScript, evitando deslocamentos ao carregar o carrossel.

## Carregamento

Removidas 59 regras de CSS dos antigos layouts de case, após conferir que não havia consumidores. O empacotamento `graph` do Turbopack, com custo de requisição de 6.000 bytes, reduz o CSS carregado por rotas que não usam os estilos dos cases. Configuração baseada na documentação instalada do Next.js 16.3.

O CSS comprimido dos cases passou de 23,7 para 18,8 KiB; o índice usa 21,1 KiB e Sobre, 20,2 KiB. Todos ficam abaixo do limite de 25 KiB. Os demais limites de JS, HTML, fontes e módulos carregados sob demanda também passaram; resultado em `project-bundle.txt`.

WebP passou a ser o formato de saída do otimizador. Na verificação local, a conversão AVIF da miniatura do Aruá excedeu 15 segundos, enquanto a resposta WebP retornou em 58 ms e 15.482 bytes. Esta é uma observação do ambiente local, não um benchmark de produção.

## Verificação

- Build de produção e lint dos arquivos alterados aprovados.
- 20 testes unitários aprovados: catálogo de projetos, traduções, contrato editorial e imagens Open Graph dos cases.
- Navegação dos três cases nos três idiomas, links externos, galeria e lightbox aprovados.
- Teste de estabilidade da galeria compara a altura antes e depois do JavaScript em 390 e 1.440 px, com diferença inferior a 2 px.
- Matriz de escala dos heros e de overflow aprovada, incluindo celulares em paisagem.
- Auditoria automática inicial das quatro páginas em 390 e 1.440 px: nenhum erro de acessibilidade, overflow ou exceção de página. Evidência em `project-accessibility.json`.

Os textos usam o conteúdo existente do repositório como fonte. Não foram acrescentadas novas métricas, atribuições profissionais ou alegações de pioneirismo.
