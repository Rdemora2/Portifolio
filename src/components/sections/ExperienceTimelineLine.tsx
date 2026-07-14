export function ExperienceTimelineLine() {
  return (
    <div
      className="absolute left-0 top-0 hidden h-full w-[1.5px] origin-top md:left-1/2 md:block md:-translate-x-1/2"
      style={{
        background:
          "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-signal) 38%, transparent) 8%, color-mix(in srgb, var(--color-signal) 22%, transparent) 92%, transparent)",
      }}
      aria-hidden="true"
    />
  );
}
