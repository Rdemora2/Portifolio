export type Availability = "open" | "selective" | "closed"
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

export interface Social {
  platform: string
  href: string
  label: string
}

export interface PersonalInfo {
  name: string
  title: string
  subtitle: string
  bio: string
  bioExtended: string
  location: string
  availability: Availability
  contacts: Contact[]
  social: Social[]
}

export interface Metric {
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
}

export interface TechItem {
  name: string
  category: TechCategory
  proficiency: Proficiency
  yearsUsed: number
  featured: boolean
  icon?: string
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

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  quote: string
  project?: string
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

export interface ContactFormData {
  name: string
  email: string
  company?: string
  projectType: string
  message: string
  budget?: string
}
