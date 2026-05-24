# UI Translation Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the translation system into UI components (Navigation, Hero, Layout) and add a Locale Switcher.

**Architecture:** Use `next-intl` hooks (`useTranslations`, `useLocale`) to provide localized content. Refactor `layout.tsx` to use dynamic metadata generation.

**Tech Stack:** Next.js, next-intl, TypeScript, GSAP.

---

### Task 1: Expand Translation Messages

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/pt.json`
- Modify: `src/messages/es.json`

- [ ] **Step 1: Update `en.json`**
```json
{
  "Nav": {
    "hero": "Home",
    "about": "About",
    "projects": "Projects",
    "tech": "Stack",
    "metrics": "Metrics",
    "experience": "Experience",
    "insights": "Insights",
    "contact": "Contact",
    "skipToContent": "Skip to content",
    "ariaLabel": "Main navigation",
    "mobileMenuLabel": "Navigation menu",
    "openMenu": "Open menu",
    "closeMenu": "Close menu"
  },
  "Hero": {
    "title": "IT Manager & Software Engineer",
    "subtitle": "Go · Next.js · Kotlin · AWS · GCP",
    "viewProjects": "View Projects",
    "contact": "Contact"
  },
  "Metadata": {
    "title": "Roberto Zarzur | IT Manager & Software Engineer",
    "description": "IT Manager and tech lead with a hands-on profile. I lead teams, build high-performance backends in Go, manage cloud infrastructure (AWS, GCP) and ensure observability and DevOps in mission-critical systems."
  }
}
```

- [ ] **Step 2: Update `pt.json`**
```json
{
  "Nav": {
    "hero": "Início",
    "about": "Sobre",
    "projects": "Projetos",
    "tech": "Stack",
    "metrics": "Métricas",
    "experience": "Experiência",
    "insights": "Insights",
    "contact": "Contato",
    "skipToContent": "Pular para o conteúdo principal",
    "ariaLabel": "Navegação principal",
    "mobileMenuLabel": "Menu de navegação",
    "openMenu": "Abrir menu",
    "closeMenu": "Fechar menu"
  },
  "Hero": {
    "title": "Gerente de TI & Engenheiro de Software",
    "subtitle": "Go · Next.js · Kotlin · AWS · GCP",
    "viewProjects": "Ver projetos",
    "contact": "Contato"
  },
  "Metadata": {
    "title": "Roberto Zarzur | Gerente de TI & Engenheiro de Software",
    "description": "Gerente de TI e líder técnico com perfil hands-on. Lidero times, construo backends de alta performance em Go, gerencio infraestrutura cloud (AWS, GCP) e garanto observabilidade e DevOps em sistemas de missão crítica."
  }
}
```

- [ ] **Step 3: Update `es.json`**
```json
{
  "Nav": {
    "hero": "Inicio",
    "about": "Sobre mí",
    "projects": "Proyectos",
    "tech": "Stack",
    "metrics": "Métricas",
    "experience": "Experiencia",
    "insights": "Insights",
    "contact": "Contacto",
    "skipToContent": "Saltar al contenido principal",
    "ariaLabel": "Navegación principal",
    "mobileMenuLabel": "Menú de navegación",
    "openMenu": "Abrir menú",
    "closeMenu": "Cerrar menú"
  },
  "Hero": {
    "title": "Gerente de TI e Ingeniero de Software",
    "subtitle": "Go · Next.js · Kotlin · AWS · GCP",
    "viewProjects": "Ver proyectos",
    "contact": "Contacto"
  },
  "Metadata": {
    "title": "Roberto Zarzur | Gerente de TI e Ingeniero de Software",
    "description": "Gerente de TI y líder técnico con perfil hands-on. Lidero equipos, construyo backends de alto rendimiento en Go, gestiono infraestructura cloud (AWS, GCP) y garantizo observabilidad y DevOps en sistemas de misión crítica."
  }
}
```

- [ ] **Step 4: Commit**
```bash
git add src/messages/*.json
git commit -m "feat(i18n): expand translation messages for Nav, Hero and Metadata"
```

### Task 2: Create LocaleSwitcher Component

**Files:**
- Create: `src/components/layout/LocaleSwitcher.tsx`

- [ ] **Step 1: Implement `LocaleSwitcher`**
```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { locales } from "@/i18n.config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleLocaleChange(l)}
          className={`text-xs font-bold transition-colors duration-200 ${
            locale === l ? "text-[var(--color-signal)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
          aria-label={`Switch to ${l.toUpperCase()}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/layout/LocaleSwitcher.tsx
git commit -m "feat(i18n): add LocaleSwitcher component"
```

### Task 3: Integrate Translations into Navigation

**Files:**
- Modify: `src/components/layout/Navigation.tsx`

- [ ] **Step 1: Use `useTranslations` and `LocaleSwitcher`**
```tsx
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
// ... inside Navigation component
const t = useTranslations("Nav");
// ... replace nav labels
{navLinks.slice(1).map(({ id }) => (
  <a key={id} ...>{t(id)}</a>
))}
// ... add LocaleSwitcher in the desktop nav and mobile menu
```

- [ ] **Step 2: Update ARIA labels and alt text**
Replace hardcoded Portuguese strings with `t('ariaLabel')`, `t('openMenu')`, etc.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/Navigation.tsx
git commit -m "feat(i18n): localize Navigation component and add LocaleSwitcher"
```

### Task 4: Integrate Translations into Hero

**Files:**
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Use `useTranslations` in Hero**
```tsx
import { useTranslations } from "next-intl";
// ... inside Hero component
const t = useTranslations("Hero");
// ... replace personalInfo text with t('title'), t('subtitle'), etc.
```

- [ ] **Step 2: Commit**
```bash
git add src/components/sections/Hero.tsx
git commit -m "feat(i18n): localize Hero component"
```

### Task 5: Localize Root Layout and Metadata

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Implement `generateMetadata`**
```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  const t = messages.Metadata as any;

  return {
    title: {
      default: t.title,
      template: "%s | Roberto Zarzur",
    },
    description: t.description,
    // ... rest of metadata
  };
}
```

- [ ] **Step 2: Localize "Skip to content"**
```tsx
const t = useTranslations("Nav");
// ...
<a href="#main-content" className="sr-only focus:not-sr-only">
  {t("skipToContent")}
</a>
```

- [ ] **Step 3: Commit**
```bash
git add src/app/\[locale\]/layout.tsx
git commit -m "feat(i18n): localize root layout and dynamic metadata"
```
