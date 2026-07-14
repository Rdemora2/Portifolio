export function ContactBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(105deg, transparent 46%, rgba(99,102,241,0.12) 47%, transparent 48%), linear-gradient(75deg, transparent 47%, rgba(0,212,255,0.08) 48%, transparent 49%)",
          backgroundSize: "96px 48px",
          maskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
      <div className="absolute -bottom-64 left-1/2 h-[34rem] w-[70rem] -translate-x-1/2 rounded-[50%] border border-[rgba(99,102,241,0.16)] shadow-[0_0_120px_rgba(99,102,241,0.1)]" />
    </div>
  )
}
