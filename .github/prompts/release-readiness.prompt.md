---
description: "Checklist de release readiness e go/no-go"
name: "Release Readiness"
argument-hint: "Escopo, versao, data alvo, ambiente, riscos"
agent: "Orquestrador"
---

Pre-requisitos:

- Escopo, versao e ambiente alvo.
- Riscos conhecidos e criterio de aceite.

Passos:

1. Avaliar qualidade (lint/build), seguranca e performance.
2. Validar rollback, monitoramento e comunicacao.
3. Definir go/no-go e responsaveis.

Formato de saida:
Checklist:

- Item -> status, dono, observacao

Go/No-Go:

- Decisao e condicoes

Riscos:

- Risco -> mitigacao

Como validar:

- Checklist completo com donos e status.
