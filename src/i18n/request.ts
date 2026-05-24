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
