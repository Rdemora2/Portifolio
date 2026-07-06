import type { TechCategory } from "@/types"

export const SITE_URL = "https://robertomoraes.dev"
export const SITE_NAME = "Roberto Moraes"
export const AUTHOR_NAME = "Roberto Moraes"

export const SECTION_IDS = {
  hero: "hero",
  about: "about",
  projects: "projects",
  tech: "tech",
  metrics: "metrics",
  experience: "experience",
  testimonials: "testimonials",
  insights: "insights",
  contact: "contact",
} as const

export const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&"

export const TECH_CATEGORY_COLORS: Record<TechCategory, string> = {
  cloud: "#6366f1",
  backend: "#00ff88",
  frontend: "#6366f1",
  mobile: "#ff6b35",
  devops: "#4f46e5",
  ai: "#a855f7",
  video: "#f59e0b",
}
