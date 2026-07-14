"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { useRouter, usePathname } from "@/navigation";
import {
  defaultLocale,
  getDocumentLanguage,
  locales,
  type Locale,
} from "@/i18n.config";
import { getLocalizedPath } from "@/lib/constants";

function getLocaleSelectionPath(locale: Locale, pathname: string) {
  const canonicalPath = getLocalizedPath(locale, pathname);
  if (locale !== defaultLocale) return canonicalPath;

  return canonicalPath === "/"
    ? `/${defaultLocale}`
    : `/${defaultLocale}${canonicalPath}`;
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function getLocationSuffix() {
  return `${window.location.search}${window.location.hash}`;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const locationSuffix = useSyncExternalStore(
    subscribeToLocation,
    getLocationSuffix,
    () => "",
  );
  const hashIndex = locationSuffix.indexOf("#");
  const search =
    hashIndex === -1 ? locationSuffix : locationSuffix.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : locationSuffix.slice(hashIndex);

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
        <Link
          key={l}
          href={{
            // A default-locale selection must remain explicit so middleware
            // can update its locale cookie before canonicalizing /pt to /.
            pathname: getLocaleSelectionPath(l, pathname),
            search,
            hash,
          }}
          hrefLang={getDocumentLanguage(l)}
          prefetch={false}
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return;
            }

            event.preventDefault();
            handleLocaleChange(l);
          }}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded border px-2 text-[10px] font-bold transition-all duration-200 ${
            locale === l 
              ? "text-[var(--color-signal)] border-[var(--color-signal)] bg-[rgba(99,102,241,0.1)]" 
              : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)] hover:border-[var(--color-edge)]"
          }`}
          aria-current={locale === l ? "page" : undefined}
          aria-label={`${l.toUpperCase()} — ${t("switchLanguage", {
            language: t(`languages.${l}`),
          })}`}
        >
          <span lang={getDocumentLanguage(l)}>{l.toUpperCase()}</span>
        </Link>
      ))}
    </div>
  );
}
