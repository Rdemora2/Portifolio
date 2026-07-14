"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  wrapperClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  strength = 0.3,
  wrapperClassName = "",
  className = "",
  style,
  onClick,
  href,
  type = "button",
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const reducedMotionRef = useRef(false);
  const pointerFrameRef = useRef(0);
  const targetTransformRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let rafId = 0;
    const updateRect = () => {
      rectRef.current = el.getBoundingClientRect();
    };

    updateRect();

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateRect();
      });
    };

    const resizeObserver = new ResizeObserver(() => updateRect());
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        cancelAnimationFrame(pointerFrameRef.current);
        pointerFrameRef.current = 0;
        targetTransformRef.current = { x: 0, y: 0 };
        if (buttonRef.current) {
          buttonRef.current.style.transform = "translate3d(0, 0, 0)";
        }
      }
    };
    updateMotionPreference();
    resizeObserver.observe(el);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateRect);
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateRect);
      motionQuery.removeEventListener("change", updateMotionPreference);
      if (rafId) cancelAnimationFrame(rafId);
      cancelAnimationFrame(pointerFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!disabled) return;

    cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = 0;
    targetTransformRef.current = { x: 0, y: 0 };
    if (buttonRef.current) {
      buttonRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  }, [disabled]);

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!buttonRef.current || disabled || reducedMotionRef.current) return;
    const rect = rectRef.current;
    if (!rect) return;
    targetTransformRef.current = {
      x: (event.clientX - rect.left - rect.width / 2) * strength,
      y: (event.clientY - rect.top - rect.height / 2) * strength,
    };
    if (pointerFrameRef.current) return;

    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = 0;
      const button = buttonRef.current;
      if (!button) return;
      const { x, y } = targetTransformRef.current;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = 0;
    targetTransformRef.current = { x: 0, y: 0 };
    const button = buttonRef.current;
    if (!button) return;
    button.style.transform = "translate3d(0, 0, 0)";
  };

  const commonProps = {
    className: `inline-flex items-center justify-center gap-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform] duration-200 ease-out motion-reduce:transition-colors ${className}`,
    style,
    "aria-label": ariaLabel,
  };

  const innerElement = href ? (
    <a
      ref={buttonRef as React.RefObject<HTMLAnchorElement>}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      {...commonProps}
    >
      {children}
    </a>
  ) : (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...commonProps}
    >
      {children}
    </button>
  );

  return (
    <div
      ref={wrapperRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className={`relative inline-flex items-center justify-center ${wrapperClassName}`}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {innerElement}
    </div>
  );
}
