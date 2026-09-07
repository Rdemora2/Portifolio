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

import { useInView } from "@/hooks/useInView"

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
        <FormLoadBoundary fallback={
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]" role="status">
            {t("formUnavailable")}
          </p>
        }>
          <ContactForm />
        </FormLoadBoundary>
      ) : (
        <ContactFormSkeleton />
      )}
    </div>
  )
}
