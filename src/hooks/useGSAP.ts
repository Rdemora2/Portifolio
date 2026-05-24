"use client";

import { useEffect, useRef } from "react";
import type { DependencyList } from "react";

interface GSAPContextSelf {
  add: (callback: () => void) => void;
}

/**
 * Hook that lazily loads GSAP and runs animations within a scoped context.
 * Automatically reverts on cleanup.
 *
 * @param callback - Animation setup function receiving a GSAP context
 * @param deps - Dependency list (same semantics as useEffect)
 * @returns Ref to attach to the scope container element
 */
export function useGSAP(
  callback: (ctx: GSAPContextSelf) => void,
  deps: DependencyList = [],
) {
  const ref = useRef<HTMLElement>(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      ctx = mod.gsap.context((self) => {
        callbackRef.current(self as GSAPContextSelf);
      }, ref);
    };

    run();

    return () => {
      isActive = false;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps forwarded from caller
  }, deps);

  return ref;
}
