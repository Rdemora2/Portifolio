"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSyncExternalStore, type ReactNode } from "react"

import {
  getDocumentLanguage,
  locales,
  type Locale,
} from "@/i18n.config"
import { Link, usePathname } from "@/navigation"

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  window.addEventListener("popstate", onChange)

  return () => {
    window.removeEventListener("hashchange", onChange)
    window.removeEventListener("popstate", onChange)
  }
}

function getHash() {
  return window.location.hash
}

type LocaleRouteLinkProps = {
  children: ReactNode
  className: string
  current: boolean
  hash: string
  label: string
  locale: Locale
  onNavigate?: () => void
  pathname: string
  query: Record<string, string>
  slug?: string
}

function LocaleRouteLink({
  children,
  className,
  current,
  hash,
  label,
  locale,
  onNavigate,
  pathname,
  query,
  slug,
}: LocaleRouteLinkProps) {
  const sharedProps = {
    className,
    hrefLang: getDocumentLanguage(locale),
    locale,
    prefetch: false as const,
    onClick: onNavigate,
    "aria-current": current ? ("page" as const) : undefined,
    "aria-label": label,
  }

  if (pathname === "/work/[slug]" && slug) {
    return (
      <Link
        {...sharedProps}
        href={{
          pathname: "/work/[slug]",
          params: { slug },
          query,
          hash,
        }}
      >
        {children}
      </Link>
    )
  }

  const staticPathname =
    pathname === "/" ||
    pathname === "/work" ||
    pathname === "/experience" ||
    pathname === "/about" ||
    pathname === "/insights" ||
    pathname === "/insights/go-em-producao" ||
    pathname === "/contact"
      ? pathname
      : "/"

  switch (staticPathname) {
    case "/work":
      return (
        <Link {...sharedProps} href={{ pathname: "/work", query, hash }}>
          {children}
        </Link>
      )
    case "/experience":
      return (
        <Link {...sharedProps} href={{ pathname: "/experience", query, hash }}>
          {children}
        </Link>
      )
    case "/about":
      return (
        <Link {...sharedProps} href={{ pathname: "/about", query, hash }}>
          {children}
        </Link>
      )
    case "/insights":
      return (
        <Link {...sharedProps} href={{ pathname: "/insights", query, hash }}>
          {children}
        </Link>
      )
    case "/insights/go-em-producao":
      return (
        <Link
          {...sharedProps}
          href={{
            pathname: "/insights/go-em-producao",
            query,
            hash,
          }}
        >
          {children}
        </Link>
      )
    case "/contact":
      return (
        <Link {...sharedProps} href={{ pathname: "/contact", query, hash }}>
          {children}
        </Link>
      )
    default:
      return (
        <Link {...sharedProps} href={{ pathname: "/", query, hash }}>
          {children}
        </Link>
      )
  }
}

export function LocaleSwitcher({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const currentLocale = useLocale()
  const t = useTranslations("Nav")
  const pathname = usePathname()
  const params = useParams<{ slug?: string | string[] }>()
  const searchParams = useSearchParams()
  const hash = useSyncExternalStore(subscribeToHash, getHash, () => "")
  const query = Object.fromEntries(searchParams.entries())
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t("languageSelector")}
    >
      {locales.map((locale) => (
        <LocaleRouteLink
          key={locale}
          locale={locale}
          pathname={pathname}
          slug={slug}
          query={query}
          hash={hash}
          current={currentLocale === locale}
          onNavigate={onNavigate}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded border px-2 text-[10px] font-bold transition-all duration-200 ${
            currentLocale === locale
              ? "border-[var(--color-signal)] bg-[rgba(99,102,241,0.1)] text-[var(--color-signal)]"
              : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-edge)] hover:text-[var(--color-text-primary)]"
          }`}
          label={`${locale.toUpperCase()} — ${t("switchLanguage", {
            language: t(`languages.${locale}`),
          })}`}
        >
          <span lang={getDocumentLanguage(locale)}>
            {locale.toUpperCase()}
          </span>
        </LocaleRouteLink>
      ))}
    </div>
  )
}
