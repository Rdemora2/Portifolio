---
description: "Orquestrar demanda e gerar plano com delegacoes"
name: "Orquestrar Demanda"
argument-hint: "Objetivo, escopo, restricoes, prazo, criterio de aceite"
agent: "Orquestrador"
---

Pre-requisitos:

- Objetivo, escopo, restricoes, prazo e criterio de aceite.

Passos:

1. Crie um plano completo para a demanda informada.
2. Quebre em etapas pequenas e verificaveis.
3. Liste dependencias e riscos com mitigacao.
4. Defina delegacoes por agente quando fizer sentido.

Formato de saida:
Contexto:

- Objetivo, escopo, restricoes

Delegacoes:

- Agente -> objetivo

Plano:

- Etapas priorizadas

Riscos:

- Risco -> mitigacao

Perguntas Abertas:

- Lista

Como validar:

- O plano contem etapas, riscos e delegacoes consistentes.
