"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { locales } from "@/i18n.config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // router.replace is localized and will handle the prefix
    router.replace(pathname, { locale: newLocale as any });
  };

  return (
    <div className="flex items-center gap-2" aria-label="Select Language">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleLocaleChange(l)}
          className={`px-1 text-[10px] font-bold transition-all duration-200 border rounded ${
            locale === l 
              ? "text-[var(--color-signal)] border-[var(--color-signal)] bg-[rgba(99,102,241,0.1)]" 
              : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)] hover:border-[var(--color-edge)]"
          }`}
          aria-current={locale === l ? "true" : undefined}
          aria-label={`Switch to ${l.toUpperCase()}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
