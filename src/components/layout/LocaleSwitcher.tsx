"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { locales, type Locale } from "@/i18n.config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    const locationSuffix = `${window.location.search}${window.location.hash}`;
    router.replace(`${pathname}${locationSuffix}`, { locale: newLocale });
  };

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("languageSelector")}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleLocaleChange(l)}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded border px-2 text-[10px] font-bold transition-all duration-200 ${
            locale === l 
              ? "text-[var(--color-signal)] border-[var(--color-signal)] bg-[rgba(99,102,241,0.1)]" 
              : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)] hover:border-[var(--color-edge)]"
          }`}
          aria-pressed={locale === l}
          aria-label={`${l.toUpperCase()} — ${t("switchLanguage", {
            language: t(`languages.${l}`),
          })}`}
          lang={l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
