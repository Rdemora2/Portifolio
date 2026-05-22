---
description: "Use when: animacao, motion, transicoes, gsap, threejs, interacoes"
applyTo: "src/**/*.{ts,tsx,js,jsx,css}"
---

# Motion and Animation Guidelines

Pre-requisitos:

- Objetivo da animacao e publico alvo.
- Confirmacao de suporte a prefers-reduced-motion.

Passos:

- Respeite prefers-reduced-motion e ofereca fallback.
- Prefira transform e opacity para evitar layout thrash.
- Limite duracao e easing para consistencia.
- Pausar animacoes fora da viewport quando possivel.

Como validar:

- Teste reduced motion e avalie consumo de CPU/GPU.
