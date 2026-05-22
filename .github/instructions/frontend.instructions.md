---
description: "Use when: frontend, react, nextjs, app router, componentes, css, animacao, threejs"
applyTo: "src/**/*.{ts,tsx,js,jsx,css}"
---

# Frontend Guidelines

Pre-requisitos:

- Componentes e paginas alvo.
- Criterios de aceite e comportamento esperado.

Passos:

- Priorize componentes existentes em src/components antes de criar novos.
- Mantenha consistencia visual com tokens em src/styles/variables.css quando aplicavel.
- Garanta responsividade e estados de foco visiveis.
- Evite novas dependencias sem justificar ganho claro.
- Se houver duvida de comportamento do Next.js, consulte node_modules/next/dist/docs.

Como validar:

- Validar o layout em desktop e mobile.
- Confirmar ausencia de regressao visual evidente.
