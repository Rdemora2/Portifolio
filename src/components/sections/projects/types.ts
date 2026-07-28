import type { ProjectViewModel } from "@/types";

export type FilterType = "all" | "engineering" | "management" | "international";

export function matchesFilter(project: ProjectViewModel, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "international") return project.international === true;
  if (filter === "engineering")
    return project.roleType === "engineering" || project.roleType === "hybrid";
  if (filter === "management")
    return project.roleType === "management" || project.roleType === "hybrid";
  return true;
}
