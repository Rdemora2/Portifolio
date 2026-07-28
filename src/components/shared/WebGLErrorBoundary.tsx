"use client"

import React, { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

// WHY: WebGL initialization and shader compilation can fail unpredictably on
// older mobile GPUs, headless browsers, or hardened privacy modes. Wrapping WebGL
// surfaces in a dedicated ErrorBoundary guarantees that a 3D context crash will
// never bring down the React layout or cause a white screen of death.
export class WebGLErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.warn("WebGL Error Boundary captured a 3D surface failure:", error, errorInfo)
    }
  }

  public override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_64%_28%,rgba(99,102,241,0.12),transparent_40%),linear-gradient(180deg,#050a12_0%,#07101a_100%)]"
            aria-hidden="true"
          />
        )
      )
    }

    return this.props.children
  }
}
