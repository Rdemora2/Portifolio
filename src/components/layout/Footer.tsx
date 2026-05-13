import { personalInfo, navLinks } from "@/data/portfolio"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer
      className="relative border-t px-6 py-16"
      style={{
        backgroundColor: "var(--color-void)",
        borderColor: "var(--color-edge)",
      }}
    >
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-signal), var(--color-matrix), var(--color-signal), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p
              className="mb-2 text-lg font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              RZ<span style={{ color: "var(--color-signal)" }}>.</span>
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
              }}
            >
              Gerente de TI & Engenheiro de Software.
              <br />
              Construindo software que aguenta a pressão de produção.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Navegação
            </p>
            <nav aria-label="Navegação no rodapé">
              <ul className="grid grid-cols-2 gap-2">
                {navLinks.slice(1).map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-sm transition-colors duration-300 hover:text-[var(--color-signal)]"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Contato
            </p>
            <div className="space-y-2">
              {personalInfo.contacts.slice(0, 3).map((contact) => (
                <a
                  key={contact.type}
                  href={contact.href}
                  target={contact.type !== "email" ? "_blank" : undefined}
                  rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                  className="block text-sm transition-colors duration-300 hover:text-[var(--color-signal)]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {contact.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row"
          style={{ borderColor: "var(--color-edge)" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            © {year} · {personalInfo.name}
          </p>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            Feito com código, café e ambição
          </p>
        </div>
      </div>
    </footer>
  )
}
