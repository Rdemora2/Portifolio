# UI Translation Integration Design

This design outlines the integration of the translation system into the UI components of the portfolio, specifically the Navigation, Hero, and the addition of a Locale Switcher.

## 1. Translation Schema Expansion

We will expand the message files (`src/messages/*.json`) to include localized strings for the main UI components.

### Namespace: `Nav`
- `hero`, `about`, `projects`, `tech`, `metrics`, `experience`, `insights`, `contact`: Labels for navigation links.
- `skipToContent`: Text for accessibility "Skip to content" link.
- `ariaLabel`, `mobileMenuLabel`, `openMenu`, `closeMenu`: ARIA labels and button text for mobile menu.

### Namespace: `Hero`
- `title`: Professional title.
- `subtitle`: Core tech stack string.
- `viewProjects`: CTA button text.
- `contact`: Contact button text.

### Namespace: `Metadata`
- `title`, `description`: Values for SEO metadata.

## 2. LocaleSwitcher Component

- **File**: `src/components/layout/LocaleSwitcher.tsx`
- **Logic**: Use `useLocale` to get current locale and `useRouter`/`usePathname` from `src/navigation.ts` to switch locales without losing current path.
- **UI**: A minimalist dropdown or toggle showing locale codes (EN, PT, ES). It will be integrated into the `Navigation` bar.

## 3. Component Integrations

### Navigation
- Update `src/components/layout/Navigation.tsx` to use `useTranslations('Nav')`.
- Map `navLinks` from `portfolio.ts` to their translated counterparts using `t(link.id)`.
- Replace hardcoded ARIA labels with translations.

### Hero
- Update `src/components/sections/Hero.tsx` to use `useTranslations('Hero')`.
- Replace `personalInfo` hardcoded access for title/subtitle with `t('title')` and `t('subtitle')`.

### Root Layout
- **Metadata**: Refactor static `metadata` to an `async function generateMetadata({ params })` to fetch localized metadata from messages.
- **Accessibility**: Translate the "Skip to content" anchor.

## 4. Testing & Verification
- Verify that changing the locale via the URL (e.g., `/en`, `/pt`) updates all UI elements correctly.
- Verify that the `LocaleSwitcher` correctly redirects to the localized path.
- Verify SEO metadata is correctly localized in the `<head>`.
