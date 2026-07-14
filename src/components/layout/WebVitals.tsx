"use client"

import { useReportWebVitals } from "next/web-vitals"
import { useCallback } from "react"

type ReportWebVitals = Parameters<typeof useReportWebVitals>[0]

export function WebVitals({ endpoint }: { endpoint: string }) {
  const reportWebVitals = useCallback<ReportWebVitals>((metric) => {
    const detail = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: window.location.pathname,
      timestamp: Date.now(),
    }
    const body = JSON.stringify(detail)
    const blob = new Blob([body], { type: "application/json" })

    if (navigator.sendBeacon?.(endpoint, blob)) return

    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // Telemetry must never affect the experience or generate unhandled errors.
    })
  }, [endpoint])

  useReportWebVitals(reportWebVitals)
  return null
}
