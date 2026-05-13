"use client"

import { useLenis } from "@/hooks/useLenis"

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  useLenis()
  return <>{children}</>
}
