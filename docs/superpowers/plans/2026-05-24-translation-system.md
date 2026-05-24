# Translation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete, SEO-optimized translation system (Next.js 15+ App Router) supporting pt, en, and es using `next-intl`.

**Architecture:** Locale-prefixed routing (`/[locale]`), centralized JSON messages, server-side configuration for performance, and a custom `LocaleSwitcher` for UX.

**Tech Stack:** next-intl, Next.js App Router, TypeScript.

---

### Task 1: Environment & Dependency Setup

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `next-intl`**

Run: `npm install next-intl`

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: install next-intl"
```

---

### Task 2: Core Configuration & Messages

**Files:**
- Create: `src/i18n.config.ts` (Locale definitions)
- Create: `src/i18n/request.ts` (Server configuration)
- Create: `src/messages/pt.json`, `src/messages/en.json`, `src/messages/es.json`
- Create: `src/navigation.ts` (Localized navigation utilities)

- [ ] **Step 1: Define i18n config**

Create `src/i18n.config.ts`:
```typescript
export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';
```

- [ ] **Step 2: Create initial message files with common UI strings**

Example for `src/messages/pt.json`:
```json
{
  "Nav": {
    "hero": "Início",
    "about": "Sobre"
  }
}
```

- [ ] **Step 3: Setup server-side request handler**

Create `src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales } from '../i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as any)) locale = 'pt';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

- [ ] **Step 4: Create navigation utilities**

Create `src/navigation.ts`:
```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './i18n.config';

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n.config.ts src/i18n/request.ts src/messages src/navigation.ts
git commit -m "feat(i18n): setup core configuration and message files"
```

---

### Task 3: Middleware & Routing Restructure

**Files:**
- Create: `src/middleware.ts`
- Modify: Move `src/app/*` to `src/app/[locale]/*` (Except API routes)

- [ ] **Step 1: Create middleware**

Create `src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

- [ ] **Step 2: Restructure app directory**

Run:
```bash
mkdir -p src/app/[locale]
mv src/app/page.tsx src/app/[locale]/
mv src/app/layout.tsx src/app/[locale]/
mv src/app/template.tsx src/app/[locale]/
mv src/app/not-found.tsx src/app/[locale]/
mv src/app/insights src/app/[locale]/
```
*Note: Keep `api`, `favicon.ico`, `globals.css`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx` at the root.*

- [ ] **Step 3: Update `src/app/[locale]/layout.tsx` to handle locale**

```typescript
export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  // ...
  return (
    <html lang={locale}>
      {/* ... */}
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app
git commit -m "feat(i18n): implement middleware and locale-prefixed routing"
```

---

### Task 4: UI Translation Integration

**Files:**
- Modify: `src/components/layout/Navigation.tsx`
- Modify: `src/components/sections/Hero.tsx` (and others)

- [ ] **Step 1: Use `useTranslations` in Navigation**

```typescript
import { useTranslations } from 'next-intl';
// ...
const t = useTranslations('Nav');
// Use t('hero'), t('about'), etc.
```

- [ ] **Step 2: Create `LocaleSwitcher` component**

- [ ] **Step 3: Commit**

```bash
git add src/components
git commit -m "feat(i18n): integrate translations into UI components"
```

---

### Task 5: Content Translation (Data Extraction)

**Files:**
- Modify: `src/data/portfolio.ts`
- Modify: `src/messages/*.json`

- [ ] **Step 1: Extract all content from `portfolio.ts` to `pt.json`, `en.json`, `es.json`**
- [ ] **Step 2: Update components to fetch data based on locale**

- [ ] **Step 3: Commit**

```bash
git add src/data src/messages
git commit -m "feat(i18n): migrate all portfolio content to i18n messages"
```

---

### Task 6: Final Verification & Type Safety

- [ ] **Step 1: Setup global types for `next-intl`**
- [ ] **Step 2: Run `npm run build` to verify everything**
- [ ] **Step 3: Commit**

```bash
git commit -m "chore(i18n): finalize type safety and build verification"
```
