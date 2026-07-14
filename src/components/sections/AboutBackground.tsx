export function AboutBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 72% 42%, black, transparent)",
        }}
      />
      <div className="absolute -right-48 top-10 h-[38rem] w-[38rem] rounded-full bg-[var(--color-signal)] opacity-[0.055] blur-[130px]" />
      <div className="absolute -left-48 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[var(--color-highlight)] opacity-[0.035] blur-[110px]" />
    </div>
  )
}
