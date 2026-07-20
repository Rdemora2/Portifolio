"use client";

import { useTranslations } from "next-intl";

import type { ManagedDigitalProductGroup } from "@/types";

const lifecycleStages = [
  "concept",
  "development",
  "deployment",
  "support",
] as const;

interface ProjectManagedProductsProps {
  projectId: string;
  groups: readonly ManagedDigitalProductGroup[];
}

function formatProductUrl(href: string) {
  const url = new URL(href);
  return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
}

export function ProjectManagedProducts({
  projectId,
  groups,
}: ProjectManagedProductsProps) {
  const t = useTranslations("Projects");
  const productCount = groups.reduce(
    (total, group) => total + group.products.length,
    0,
  );

  if (productCount === 0) return null;

  return (
    <section
      aria-labelledby={`project-managed-products-title-${projectId}`}
      aria-describedby={`project-managed-products-description-${projectId}`}
      className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{
        borderColor: "rgba(129, 140, 248, 0.22)",
        background:
          "linear-gradient(145deg, rgba(129, 140, 248, 0.09), rgba(0, 212, 255, 0.025) 48%, rgba(5, 10, 18, 0.5))",
      }}
      data-managed-products
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-signal), var(--color-highlight), transparent)",
        }}
      />

      <div className="relative">
        <p
          className="mb-2 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] sm:text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-signal)",
          }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{
              backgroundColor: "var(--color-matrix)",
              boxShadow: "0 0 0.75rem rgba(0, 255, 136, 0.58)",
            }}
          />
          {t("managedProducts.eyebrow")}
        </p>
        <h3
          id={`project-managed-products-title-${projectId}`}
          className="text-lg font-bold leading-tight sm:text-xl"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {t("managedProducts.title")}
        </h3>
        <p
          id={`project-managed-products-description-${projectId}`}
          className="mt-3 max-w-[66ch] text-sm leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-secondary)",
          }}
        >
          {t("managedProducts.description", { count: productCount })}
        </p>

        <ol
          aria-label={t("managedProducts.lifecycleLabel")}
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {lifecycleStages.map((stage, index) => (
            <li
              key={stage}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-[rgba(161,193,216,0.12)] bg-[rgba(5,10,18,0.36)] px-3 py-2"
            >
              <span
                aria-hidden="true"
                className="text-[0.5625rem] tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-highlight)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[0.625rem] font-medium uppercase tracking-[0.08em]"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t(`managedProducts.stages.${stage}`)}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-6 space-y-5">
          {groups.map((group, groupIndex) => {
            const productOffset = groups
              .slice(0, groupIndex)
              .reduce((total, item) => total + item.products.length, 0);

            return (
              <section
                key={group.id}
                aria-labelledby={`project-managed-products-${projectId}-${group.id}`}
                data-managed-product-group={group.id}
              >
                <div className="mb-2.5 flex items-center justify-between gap-4">
                  <h4
                    id={`project-managed-products-${projectId}-${group.id}`}
                    className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] sm:text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {t(`managedProducts.groups.${group.id}`)}
                  </h4>
                  <span
                    aria-hidden="true"
                    className="rounded-full border border-[rgba(161,193,216,0.14)] px-2 py-0.5 text-[0.5625rem] tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {String(group.products.length).padStart(2, "0")}
                  </span>
                </div>

                <ul className="grid gap-2 sm:grid-cols-3">
                  {group.products.map((product, index) => (
                    <li key={product.id} className="min-w-0">
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noopener noreferrer external"
                        className="group flex min-h-20 scroll-mt-24 scroll-mb-6 items-center gap-3 rounded-xl border border-[rgba(161,193,216,0.14)] bg-[rgba(5,10,18,0.48)] px-3 py-3 no-underline transition-[transform,border-color,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-[rgba(129,140,248,0.48)] hover:bg-[rgba(129,140,248,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)] motion-reduce:transform-none motion-reduce:transition-none"
                        style={{ color: "var(--color-text-primary)" }}
                        data-managed-product-link={product.id}
                      >
                        <span
                          aria-hidden="true"
                          className="flex-none text-[0.625rem] tracking-wider"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-signal)",
                          }}
                        >
                          {String(productOffset + index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-xs font-semibold leading-snug sm:text-sm"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {product.name}
                          </span>
                          <span
                            className="mt-1 block text-[0.5625rem] leading-tight tracking-[0.02em]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-text-muted)",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {formatProductUrl(product.href)}
                          </span>
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          width="16"
                          height="16"
                          fill="none"
                          aria-hidden="true"
                          className="flex-none transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                          style={{ color: "var(--color-highlight)" }}
                        >
                          <path
                            d="M7 5h8v8M15 5 5 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="sr-only">
                          {" — "}
                          {t("managedProducts.newTab")}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
