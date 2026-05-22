---
description: "Use when: backend, api, route handlers, validacao, erros, data flow"
applyTo: "src/app/api/**/*.{ts,js}"
---

# Backend Guidelines

Pre-requisitos:

- Endpoints e payloads envolvidos.
- Regras de negocio e compatibilidade esperada.

Passos:

- Valide entrada com regras explicitas e mensagens claras.
- Prefira helpers existentes em src/lib/validations.ts quando aplicavel.
- Respostas devem ser consistentes e sem dados sensiveis.
- Mantenha compatibilidade com clientes existentes.
- Consulte node_modules/next/dist/docs se houver duvida de comportamento.

Como validar:

- Verificar respostas com casos validos e invalidos.
- Confirmar ausencia de dados sensiveis na resposta.
