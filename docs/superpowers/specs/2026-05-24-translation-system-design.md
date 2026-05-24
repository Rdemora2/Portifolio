# Design Document: Multi-Language Translation System

**Date:** 2026-05-24
**Topic:** i18n Implementation for Portfolio
**Status:** Approved

## Goal
Implement a complete, high-performance, and SEO-optimized translation system for Portuguese (Default), English, and Spanish.

## Architecture
- **Library:** `next-intl` (App Router optimized).
- **Routing:** Locale-prefixed URLs (`/pt`, `/en`, `/es`).
- **Middleware:** Automatic locale detection from browser headers and cookie persistence.
- **Messages:** JSON-based message files in `src/messages/`.

## Implementation Details

### 1. Structure
- Move `src/app/*` to `src/app/[locale]/*`.
- Create `src/i18n.ts` for server-side configuration.
- Create `src/middleware.ts` for routing logic.
- Create `src/navigation.ts` for locale-aware navigation utilities.

### 2. Content Extraction
- Refactor `src/data/portfolio.ts` to use translation keys.
- Move all UI text (Nav, Footer, Form labels) to `src/messages/*.json`.
- Support three locales: `pt` (Portuguese), `en` (English), `es` (Spanish).

### 3. Components
- **LocaleSwitcher:** A new component in the Navigation bar to change languages.
- **Metadata:** Use `generateMetadata` in `layout.tsx` and `page.tsx` for dynamic SEO.
- **Type Safety:** Integrate `IntlMessages` with TypeScript for autocompletion.

### 4. Technical Excellence
- **Static Generation:** All locale routes will be pre-rendered.
- **Performance:** Server-side translations to minimize client bundle.
- **SEO:** Correct `hreflang` and `lang` attributes.

## Verification Plan
- Verify automatic redirect from `/` to `/pt` (or detected locale).
- Verify metadata changes correctly between languages.
- Verify all portfolio content (bio, projects, experience) is fully translated.
- Verify type safety for translation keys during build.
