export type ProjectCategory = "infrastructure" | "backend" | "frontend" | "mobile" | "fullstack" | "leadership" | "management"
export type TechCategory = "cloud" | "backend" | "frontend" | "mobile" | "devops" | "ai" | "video"
export type Proficiency = 1 | 2 | 3 | 4 | 5
export type ContactType = "email" | "linkedin" | "github" | "whatsapp"
export type RoleType = "engineering" | "management" | "hybrid"

export interface Contact {
  type: ContactType
  label: string
  href: string
}

export interface PersonalInfo {
  name: string
  contacts: Contact[]
}

export interface Metric {
  id: string
  label: string
  value: number
  suffix: string
  prefix?: string
  description: string
}

export interface CaseStudyDetail {
  problem: string
  solution: string
  robertoRole: string
  keyDecisions: string[]
  lessonsLearned: string[]
  results: string[]
  images?: {
    src: string
    width: number
    height: number
    alt: string
    blurDataURL: string
  }[]
}

export interface ManagedDigitalProduct {
  id: string
  name: string
  href: string
}

export type ManagedProductGroupId = "editorialPortals" | "newcoPlay"

export interface ManagedDigitalProductGroup {
  id: ManagedProductGroupId
  products: readonly ManagedDigitalProduct[]
}

export interface Project {
  id: string
  slug: string
  title: string
  category: ProjectCategory
  roleType: RoleType
  client: string
  period: string
  role: string
  shortDescription: string
  description: string
  challenge: string
  solution: string
  impact: string
  metrics: Metric[]
  stack: string[]
  highlights: string[]
  featured: boolean
  order: number
  international?: boolean
  caseStudy?: CaseStudyDetail
  managedProductGroups?: readonly ManagedDigitalProductGroup[]
}

export type WebsiteExperienceTag =
  | "editorialExperience"
  | "institutionalStrategy"
  | "motionDesign"
  | "responsiveExperience"
  | "frontendEngineering"

export interface WebsiteExperience {
  id: string
  href: string
  domain: string
  image: {
    src: string
    width: number
    height: number
    blurDataURL: string
  }
  tagIds: readonly WebsiteExperienceTag[]
}

export interface TechItem {
  name: string
  category: TechCategory
  proficiency: Proficiency
  yearsUsed: number
  featured: boolean
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  period: string
  current: boolean
  description: string
  highlights: string[]
  stack: string[]
}

export interface Insight {
  id: string
  title: string
  summary: string
  category: "cloud" | "devops" | "leadership" | "architecture" | "observability"
  readTime: string
  date: string
  tags: string[]
  slug?: string
  hasFullArticle?: boolean
}
