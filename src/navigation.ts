import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales } from './i18n.config';

export const routing = defineRouting({
  locales,
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  localeDetection: true,
  // Metadata emits canonical, regional hreflang links and x-default from the
  // configured public origin. Avoid a second, request-host-derived Link header
  // that can conflict behind proxies and on local audits.
  alternateLinks: false
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
