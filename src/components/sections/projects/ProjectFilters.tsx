"use client";

import type { FilterType } from "./types";

type ProjectFiltersProps = {
  activeFilter: FilterType;
  filters: { key: FilterType; label: string }[];
  onFilterChange: (filter: FilterType) => void;
  label: string;
};

export function ProjectFilters({
  activeFilter,
  filters,
  onFilterChange,
  label,
}: ProjectFiltersProps) {
  return (
    <div
      className="mb-8 flex flex-wrap gap-2 sm:mb-12"
      role="group"
      aria-label={label}
    >
      {filters.map(({ key, label: filterLabel }) => (
        <button
          key={key}
          id={`project-filter-${key}`}
          aria-controls="project-list"
          onClick={() => onFilterChange(key)}
          className="cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300 sm:px-6 sm:py-2 sm:text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            borderColor:
              activeFilter === key
                ? "var(--color-signal)"
                : "var(--glass-border)",
            backgroundColor:
              activeFilter === key
                ? "rgba(99,102,241,0.12)"
                : "var(--glass-surface-subtle)",
            backdropFilter:
              activeFilter === key ? "var(--glass-blur-xs)" : "none",
            color:
              activeFilter === key
                ? "var(--color-signal)"
                : "var(--color-text-secondary)",
          }}
          aria-pressed={activeFilter === key}
        >
          {filterLabel}
        </button>
      ))}
    </div>
  );
}
