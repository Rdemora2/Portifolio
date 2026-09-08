"use client"

import dynamic from "next/dynamic"
import {
  Component,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useTranslations } from "next-intl"

import { personalInfo } from "@/data/portfolio"
import { useInView } from "@/hooks/useInView"

const directEmail = personalInfo.contacts.find((contact) => contact.type === "email")

function DirectContactFallback({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-edge)] bg-white/[0.02] p-5">
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]" role="status">
        {message}
      </p>
      {directEmail ? (
        <a
          href={directEmail.href}
          className="mt-4 inline-flex min-h-12 max-w-full break-all items-center rounded-full border border-[var(--color-control-edge)] px-5 text-sm text-[var(--color-text-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:border-[var(--color-signal)] hover:text-[var(--color-signal)] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ outlineColor: "var(--color-highlight)" }}
        >
          {directEmail.label}
        </a>
      ) : null}
    </div>
  )
}

function ContactFormSkeleton() {
  const t = useTranslations("Contact")
  return (
    <div className="contact-form-loader min-h-[40rem] sm:min-h-[35rem]">
      <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]" role="status">
        {t("formLoading")}
      </p>
      <div className="contact-form-skeleton space-y-6 py-1" aria-hidden="true">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-16 rounded-xl bg-white/[0.025]" />
          <div className="h-16 rounded-xl bg-white/[0.025]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-16 rounded-xl bg-white/[0.025]" />
          <div className="h-16 rounded-xl bg-white/[0.025]" />
        </div>
        <div className="h-36 rounded-xl bg-white/[0.025]" />
        <div className="h-16 rounded-xl bg-white/[0.025]" />
        <div className="h-12 rounded-full bg-[rgba(99,102,241,0.055)]" />
      </div>
    </div>
  )
}

const ContactForm = dynamic(
  () => import("./ContactForm").then((module) => module.ContactForm),
  { loading: ContactFormSkeleton, ssr: false },
)

const subscribeToWebMcpAvailability = () => () => undefined
const getWebMcpAvailability = () =>
  "modelContext" in document || "modelContext" in navigator
const getServerWebMcpAvailability = () => false

class FormLoadBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function ContactFormLoader() {
  const t = useTranslations("Contact")
  const [requestedByHash, setRequestedByHash] = useState(false)
  const webMcpAvailable = useSyncExternalStore(
    subscribeToWebMcpAvailability,
    getWebMcpAvailability,
    getServerWebMcpAvailability,
  )
  const [ref, shouldLoad] = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "900px 0px",
    triggerOnce: true,
  })

  useEffect(() => {
    const updateFromHash = () => {
      setRequestedByHash(window.location.hash === "#contact")
    }

    updateFromHash()
    window.addEventListener("hashchange", updateFromHash)
    return () => window.removeEventListener("hashchange", updateFromHash)
  }, [])

  return (
    <div ref={ref} className="contact-form-loader min-h-[40rem] sm:min-h-[35rem]">
      {/*
        Declarative tools only exist while their form is in the DOM. Load the
        deferred form eagerly for WebMCP agents, while preserving lazy loading
        for every other browser.
      */}
      {shouldLoad || requestedByHash || webMcpAvailable ? (
        <FormLoadBoundary fallback={<DirectContactFallback message={t("formUnavailable")} />}>
          <ContactForm />
        </FormLoadBoundary>
      ) : (
        <ContactFormSkeleton />
      )}
      <noscript>
        <style>{`
          .contact-form-loader { min-height: 0 !important; }
          .contact-form-loader > .contact-form-loader { display: none; }
        `}</style>
        <DirectContactFallback message={t("formUnavailable")} />
      </noscript>
    </div>
  )
}
