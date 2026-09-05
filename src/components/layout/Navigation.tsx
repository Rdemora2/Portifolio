"use client"

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"
import { useTranslations } from "next-intl"

import { siteNavigation } from "@/data/site-navigation"
import { Link, usePathname } from "@/navigation"

import { LocaleSwitcher } from "./LocaleSwitcher"
import styles from "./Navigation.module.css"

type MobileNavItemStyle = CSSProperties & {
  "--nav-item-delay": string
}

const subscribeToHydration = () => () => undefined
const getHydratedSnapshot = () => true
const getServerHydrationSnapshot = () => false

function isCurrentRoute(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
}

export function Navigation() {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  )
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const navigationRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const t = useTranslations("Nav")
  const isHome = pathname === "/"
  const isArticle = pathname.startsWith("/insights/")

  useEffect(() => {
    let animationFrame = 0

    const updateNavigationSurface = () => {
      if (animationFrame) return

      animationFrame = requestAnimationFrame(() => {
        const progress = isHome ? Math.min(window.scrollY / 120, 1) : 1
        const navigation = navigationRef.current

        if (navigation) {
          navigation.style.setProperty("--nav-progress", String(progress))
          navigation.style.setProperty(
            "--nav-border-opacity",
            String(progress * 0.08),
          )
          navigation.style.setProperty(
            "--nav-background-opacity",
            String(progress * 0.82),
          )

          if (progress <= 0) {
            navigation.style.setProperty("--nav-backdrop-filter", "none")
            navigation.style.setProperty("--nav-specular-opacity", "0")
          } else if (progress >= 1) {
            navigation.style.setProperty(
              "--nav-backdrop-filter",
              "var(--glass-nav-blur)",
            )
            navigation.style.setProperty("--nav-specular-opacity", "1")
          } else {
            const blur = (progress * 16).toFixed(1)
            const saturation = Math.round(100 + progress * 80)
            navigation.style.setProperty(
              "--nav-backdrop-filter",
              `blur(${blur}px) saturate(${saturation}%)`,
            )
            navigation.style.setProperty(
              "--nav-specular-opacity",
              String(progress),
            )
          }
        }

        animationFrame = 0
      })
    }

    updateNavigationSurface()
    window.addEventListener("scroll", updateNavigationSurface, {
      passive: true,
    })

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", updateNavigationSurface)
    }
  }, [isHome])

  useEffect(() => {
    if (!isMobileOpen) return

    const menu = mobileMenuRef.current
    const trigger = menuButtonRef.current
    const closeButton = closeButtonRef.current

    if (!menu || !trigger || !closeButton) return

    const html = document.documentElement
    const previousOverflow = html.style.overflow
    const backgroundElements = [
      navigationRef.current,
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("footer"),
      document.querySelector<HTMLElement>('a[href="#main-content"]'),
    ].filter((element): element is HTMLElement => element !== null)
    const previousInert = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
    }))

    html.style.overflow = "hidden"
    backgroundElements.forEach((element) => {
      element.inert = true
    })

    const getFocusableElements = () =>
      Array.from(
        menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setIsMobileOpen(false)
        return
      }

      if (event.key !== "Tab") return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      )
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusableElements.length - 1
          : currentIndex - 1
        : currentIndex < 0 || currentIndex === focusableElements.length - 1
          ? 0
          : currentIndex + 1

      event.preventDefault()
      focusableElements[nextIndex]?.focus()
    }

    document.addEventListener("keydown", handleKeyDown)
    closeButton.focus({ preventScroll: true })

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      html.style.overflow = previousOverflow
      previousInert.forEach(({ element, inert }) => {
        element.inert = inert
      })
      trigger.focus({ preventScroll: true })
    }
  }, [isMobileOpen])

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileOpen(false)
    }

    desktopQuery.addEventListener("change", closeOnDesktop)
    return () => desktopQuery.removeEventListener("change", closeOnDesktop)
  }, [])

  const closeMobileNavigation = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      <nav
        ref={navigationRef}
        data-navigation-ready={isHydrated ? "true" : "false"}
        data-article-navigation={isArticle ? "" : undefined}
        className="glass-nav fixed inset-x-0 top-0 z-[100] transition-all duration-500"
        style={
          {
            borderBottomColor: isHome
              ? "rgb(255 255 255 / var(--nav-border-opacity, 0))"
              : "rgb(255 255 255 / var(--nav-border-opacity, 0.08))",
            backgroundColor: isHome
              ? "rgb(5 10 18 / var(--nav-background-opacity, 0))"
              : "rgb(5 10 18 / var(--nav-background-opacity, 0.82))",
            backdropFilter: isHome
              ? "var(--nav-backdrop-filter, none)"
              : "var(--nav-backdrop-filter, var(--glass-nav-blur))",
            WebkitBackdropFilter: isHome
              ? "var(--nav-backdrop-filter, none)"
              : "var(--nav-backdrop-filter, var(--glass-nav-blur))",
            "--nav-progress": isHome ? "0" : "1",
            "--nav-border-opacity": isHome ? "0" : "0.08",
            "--nav-background-opacity": isHome ? "0" : "0.82",
            "--nav-backdrop-filter": isHome ? "none" : "var(--glass-nav-blur)",
            "--nav-specular-opacity": isHome ? "0" : "1",
          } as CSSProperties
        }
        aria-label={t("ariaLabel")}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            prefetch={false}
            className={`${styles.brand} inline-flex min-h-11 min-w-11 items-center text-lg font-bold tracking-tight text-[var(--color-text-primary)]`}
            style={{ fontFamily: "var(--font-display)" }}
            aria-label={`RM. — Roberto Moraes, ${t("hero").toLowerCase()}`}
            aria-current={isHome ? "page" : undefined}
          >
            RM<span className="text-[var(--color-signal)]">.</span>
          </Link>

          <div className="hidden items-center gap-4 lg:flex xl:gap-6">
            {siteNavigation.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className={`${styles.desktopLink} flex min-h-11 items-center text-sm font-medium`}
                aria-current={
                  isCurrentRoute(pathname, href) ? "page" : undefined
                }
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t(key)}
              </Link>
            ))}
            <div
              className="ml-2 h-4 w-px bg-[var(--color-edge)]"
              aria-hidden="true"
            />
            <LocaleSwitcher />
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            data-navigation-menu-button
            className={`${styles.menuButton} relative z-[110] flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden ${
              isMobileOpen ? "invisible" : ""
            }`}
            onClick={() => setIsMobileOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation-menu"
            aria-hidden={isMobileOpen}
            tabIndex={isMobileOpen ? -1 : undefined}
          >
            <span className="block h-[1.5px] w-6 bg-[var(--color-text-primary)]" />
            <span className="block h-[1.5px] w-6 bg-[var(--color-text-primary)]" />
            <span className="block h-[1.5px] w-6 bg-[var(--color-text-primary)]" />
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation-menu"
        ref={mobileMenuRef}
        data-open={isMobileOpen ? "true" : "false"}
        className={`${styles.mobileMenu} fixed inset-0 z-[120] flex h-dvh w-full flex-col overflow-x-hidden overflow-y-auto bg-[var(--color-void)] transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          isMobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("mobileMenuLabel")}
        aria-hidden={!isMobileOpen}
      >
        <div
          data-navigation-menu-header
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
        >
          <span
            className="inline-flex min-h-11 min-w-11 items-center text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
            aria-hidden="true"
          >
            RM<span className="text-[var(--color-signal)]">.</span>
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            className={`${styles.menuCloseButton} relative flex h-11 w-11 items-center justify-center`}
            onClick={closeMobileNavigation}
            aria-label={t("closeMenu")}
          >
            <span
              className="absolute h-[1.5px] w-6 rotate-45 bg-[var(--color-text-primary)]"
              aria-hidden="true"
            />
            <span
              className="absolute h-[1.5px] w-6 -rotate-45 bg-[var(--color-text-primary)]"
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          className={`${styles.mobileMenuContent} mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col justify-center px-6 py-10 sm:px-10`}
        >
          <p
            className="mb-7 text-[0.625rem] uppercase tracking-[0.32em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t("navigationLabel")}
          </p>
          <div className="flex flex-col items-start gap-2 sm:gap-4">
            {siteNavigation.map(({ key, href }, index) => (
              <Link
                key={key}
                href={href}
                onClick={closeMobileNavigation}
                className={`${styles.mobileLink} inline-flex min-h-12 items-center text-3xl font-bold sm:text-4xl`}
                aria-current={
                  isCurrentRoute(pathname, href) ? "page" : undefined
                }
                style={
                  {
                    fontFamily: "var(--font-display)",
                    "--nav-item-delay": isMobileOpen
                      ? `${index * 45}ms`
                      : "0ms",
                  } as MobileNavItemStyle
                }
              >
                <span
                  className="mr-4 text-[0.625rem] font-medium tracking-widest text-[var(--color-text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {t(key)}
              </Link>
            ))}
          </div>

          <div className="mt-10 border-t border-[var(--color-edge)] pt-6">
            <LocaleSwitcher onNavigate={closeMobileNavigation} />
          </div>
        </div>
      </div>
    </>
  )
}
