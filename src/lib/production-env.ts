import { DEFAULT_SITE_URL } from "./site"

type Environment = Readonly<Record<string, string | undefined>>

type BuildValidationResult = {
  issues: string[]
  siteOrigin?: string
}

type IntegerRule = {
  name: string
  fallback: number
  min: number
  max: number
}

const PLACEHOLDER_SECRET_TOKENS = new Set([
  "placeholder",
  "example",
  "dummy",
  "fixture",
  "changeme",
])

const PLACEHOLDER_SECRET_FRAGMENTS = [
  "replacewith",
  "changeme",
  "developmentonly",
  "examplekey",
  "notasecret",
  "cionly",
]

const PLACEHOLDER_HOST_LABELS = new Set([
  "placeholder",
  "example",
  "dummy",
  "fixture",
  "changeme",
  "yourdomain",
])

const EXAMPLE_HOSTS = new Set(["example.com", "example.net", "example.org"])

const INTEGER_RULES: IntegerRule[] = [
  { name: "CONTACT_RATE_LIMIT_WINDOW_SECONDS", fallback: 60, min: 1, max: 3_600 },
  { name: "CONTACT_RATE_LIMIT_MAX", fallback: 5, min: 1, max: 1_000 },
  { name: "CONTACT_RATE_LIMIT_GLOBAL_MAX", fallback: 100, min: 1, max: 100_000 },
  { name: "CONTACT_RATE_LIMIT_MAX_ENTRIES", fallback: 5_000, min: 10, max: 100_000 },
  { name: "CONTACT_MAX_BODY_BYTES", fallback: 16_384, min: 1_024, max: 1_048_576 },
  { name: "CONTACT_EMAIL_TIMEOUT_MS", fallback: 8_000, min: 1_000, max: 30_000 },
  { name: "CONTACT_TRUST_PROXY_HOPS", fallback: 1, min: 1, max: 20 },
]

export class ProductionEnvironmentError extends Error {
  readonly issues: readonly string[]

  constructor(issues: string[]) {
    super(`Invalid production environment:\n${issues.map((issue) => `- ${issue}`).join("\n")}`)
    this.name = "ProductionEnvironmentError"
    this.issues = issues
  }
}

function hasPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean)
  const compact = normalized.replace(/[^a-z0-9]/g, "")

  return (
    tokens.some((token) => PLACEHOLDER_SECRET_TOKENS.has(token)) ||
    PLACEHOLDER_SECRET_FRAGMENTS.some((fragment) => compact.includes(fragment))
  )
}

function shannonEntropy(value: string): number {
  const frequencies = new Map<string, number>()

  for (const character of value) {
    frequencies.set(character, (frequencies.get(character) ?? 0) + 1)
  }

  return [...frequencies.values()].reduce((entropy, frequency) => {
    const probability = frequency / value.length
    return entropy - probability * Math.log2(probability)
  }, 0)
}

function isIpv4Hostname(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
}

function isReservedIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number)
  const [first = 0, second = 0, third = 0] = octets

  return (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255) ||
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && [0, 2].includes(third)) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 198 && [18, 19].includes(second)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  )
}

function isReservedIpv6(hostname: string): boolean {
  return (
    hostname === "::" ||
    hostname === "::1" ||
    hostname.startsWith("::ffff:") ||
    /^(?:fc|fd)/.test(hostname) ||
    /^fe[89ab]/.test(hostname) ||
    hostname.startsWith("ff") ||
    hostname.startsWith("2001:db8:")
  )
}

function isValidDnsHostname(hostname: string): boolean {
  if (hostname.length > 253 || !hostname.includes(".")) return false

  const labels = hostname.split(".")
  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  )
}

function isSpecialUseHostname(hostname: string): boolean {
  if ([...EXAMPLE_HOSTS].some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    return true
  }

  const specialUseSuffixes = [
    "localhost",
    "local",
    "test",
    "invalid",
    "example",
    "internal",
    "onion",
    "alt",
    "home.arpa",
  ]

  return specialUseSuffixes.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
  )
}

function isPublicHostname(rawHostname: string): boolean {
  if (rawHostname.endsWith(".")) return false

  const hostname = rawHostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (isIpv4Hostname(hostname)) return !isReservedIpv4(hostname)
  if (hostname.includes(":")) return !isReservedIpv6(hostname)

  return (
    isValidDnsHostname(hostname) &&
    !isSpecialUseHostname(hostname) &&
    !hostname.split(".").some((label) => PLACEHOLDER_HOST_LABELS.has(label))
  )
}

function isPublicDnsHostname(rawHostname: string): boolean {
  const hostname = rawHostname.toLowerCase()
  return !isIpv4Hostname(hostname) && !hostname.includes(":") && isPublicHostname(hostname)
}

function validateHttpsOrigin(name: string, rawValue: string, issues: string[]): string | undefined {
  const value = rawValue.trim()

  if (!value || value !== rawValue) {
    issues.push(`${name} must be a non-empty origin without surrounding whitespace`)
    return undefined
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    issues.push(`${name} must be an absolute HTTPS origin`)
    return undefined
  }

  if (url.protocol !== "https:") {
    issues.push(`${name} must use HTTPS`)
  }
  if (url.username || url.password) {
    issues.push(`${name} must not contain credentials`)
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    issues.push(`${name} must contain only an origin, without a path, query, or fragment`)
  }
  if (!isPublicHostname(url.hostname)) {
    issues.push(`${name} must use a public, non-reserved hostname`)
  }

  return issues.some((issue) => issue.startsWith(`${name} `)) ? undefined : url.origin
}

function validateWebVitalsEndpoint(rawValue: string | undefined, issues: string[]): void {
  if (rawValue === undefined || rawValue === "") return

  const value = rawValue.trim()
  if (
    value !== rawValue ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#")
  ) {
    issues.push(
      "NEXT_PUBLIC_WEB_VITALS_ENDPOINT must be an origin-relative path without query or fragment"
    )
    return
  }

  try {
    const parsed = new URL(value, DEFAULT_SITE_URL)
    if (parsed.origin !== DEFAULT_SITE_URL || parsed.pathname !== value) {
      issues.push("NEXT_PUBLIC_WEB_VITALS_ENDPOINT must be a normalized same-origin path")
    }
  } catch {
    issues.push("NEXT_PUBLIC_WEB_VITALS_ENDPOINT must be a valid same-origin path")
  }
}

function collectBuildValidation(env: Environment): BuildValidationResult {
  const issues: string[] = []
  const siteValue = env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  const siteOrigin = validateHttpsOrigin("NEXT_PUBLIC_SITE_URL", siteValue, issues)

  validateWebVitalsEndpoint(env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, issues)

  return { issues, siteOrigin }
}

function requiredValue(name: string, env: Environment, issues: string[]): string | undefined {
  const rawValue = env[name]

  if (rawValue === undefined || !rawValue.trim()) {
    issues.push(`${name} is required`)
    return undefined
  }
  if (rawValue !== rawValue.trim()) {
    issues.push(`${name} must not contain surrounding whitespace`)
    return undefined
  }
  return rawValue
}

function validateResendKey(env: Environment, issues: string[]): void {
  const value = requiredValue("RESEND_API_KEY", env, issues)
  if (!value) return

  if (hasPlaceholderSecret(value)) {
    issues.push("RESEND_API_KEY must not contain a placeholder value")
    return
  }

  const token = value.slice(3)
  if (!/^re_[A-Za-z0-9_-]{20,}$/.test(value)) {
    issues.push("RESEND_API_KEY does not match the expected Resend key format")
  } else if (shannonEntropy(token) < 3.5) {
    issues.push("RESEND_API_KEY does not have enough variability for a production credential")
  }
}

function extractEmailAddress(value: string): string | undefined {
  if (/[\r\n]/.test(value)) return undefined

  if (!value.includes("<") && !value.includes(">")) return value

  const displayAddress = /^[^<>]+<([^<>]+)>$/.exec(value)
  return displayAddress?.[1]?.trim()
}

function validateEmail(name: string, env: Environment, issues: string[]): void {
  const value = requiredValue(name, env, issues)
  if (!value) return

  const address = extractEmailAddress(value)
  const match = address?.match(/^([^\s@]+)@([^\s@]+)$/)
  if (!match) {
    issues.push(`${name} must contain one valid email address`)
    return
  }

  const localPart = match[1] ?? ""
  const hostname = match[2] ?? ""
  if (
    !address ||
    address.length > 254 ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(localPart)
  ) {
    issues.push(`${name} must contain one valid email address`)
    return
  }

  if (
    !hostname.includes(".") ||
    hostname.startsWith(".") ||
    hostname.endsWith(".") ||
    !isPublicDnsHostname(hostname)
  ) {
    issues.push(`${name} must use a public, non-reserved email domain`)
  }
}

function validateIdempotencySecret(env: Environment, issues: string[]): void {
  const value = requiredValue("CONTACT_IDEMPOTENCY_SECRET", env, issues)
  if (!value) return

  if (hasPlaceholderSecret(value)) {
    issues.push("CONTACT_IDEMPOTENCY_SECRET must not contain a placeholder value")
  } else if (value.length < 32) {
    issues.push("CONTACT_IDEMPOTENCY_SECRET must contain at least 32 characters")
  } else if (shannonEntropy(value) < 3.5) {
    issues.push("CONTACT_IDEMPOTENCY_SECRET must be a high-entropy production secret")
  }
}

function validateAllowedOrigins(
  env: Environment,
  siteOrigin: string | undefined,
  issues: string[]
): void {
  const value = requiredValue("CONTACT_ALLOWED_ORIGINS", env, issues)
  if (!value) return

  const originValues = value.split(",")
  const origins = new Set<string>()

  if (originValues.some((origin) => !origin.trim())) {
    issues.push("CONTACT_ALLOWED_ORIGINS must not contain empty entries")
  }

  originValues.forEach((origin, index) => {
    const validatedOrigin = validateHttpsOrigin(
      `CONTACT_ALLOWED_ORIGINS entry ${index + 1}`,
      origin.trim(),
      issues
    )
    if (validatedOrigin) origins.add(validatedOrigin)
  })

  if (siteOrigin && !origins.has(siteOrigin)) {
    issues.push("CONTACT_ALLOWED_ORIGINS must include NEXT_PUBLIC_SITE_URL")
  }
}

function validateIntegerEnvironment(env: Environment, issues: string[]): void {
  const resolved = new Map<string, number>()

  for (const rule of INTEGER_RULES) {
    const rawValue = env[rule.name]
    if (rawValue === undefined) {
      resolved.set(rule.name, rule.fallback)
      continue
    }

    if (!/^\d+$/.test(rawValue)) {
      issues.push(`${rule.name} must be an integer between ${rule.min} and ${rule.max}`)
      continue
    }

    const value = Number(rawValue)
    if (!Number.isSafeInteger(value) || value < rule.min || value > rule.max) {
      issues.push(`${rule.name} must be an integer between ${rule.min} and ${rule.max}`)
      continue
    }

    resolved.set(rule.name, value)
  }

  const perClient = resolved.get("CONTACT_RATE_LIMIT_MAX") ?? 5
  const global = resolved.get("CONTACT_RATE_LIMIT_GLOBAL_MAX")
  if (global !== undefined && global < perClient) {
    issues.push("CONTACT_RATE_LIMIT_GLOBAL_MAX must be greater than or equal to CONTACT_RATE_LIMIT_MAX")
  }
}

function throwIfInvalid(issues: string[]): void {
  if (issues.length) throw new ProductionEnvironmentError(issues)
}

export function assertProductionBuildEnv(env: Environment = process.env): void {
  throwIfInvalid(collectBuildValidation(env).issues)
}

export function assertProductionRuntimeEnv(env: Environment = process.env): void {
  const { issues, siteOrigin } = collectBuildValidation(env)

  validateResendKey(env, issues)
  validateEmail("CONTACT_FROM_EMAIL", env, issues)
  validateEmail("CONTACT_TO_EMAIL", env, issues)
  validateIdempotencySecret(env, issues)
  validateAllowedOrigins(env, siteOrigin, issues)

  if (env.CONTACT_TRUST_PROXY !== "true" && env.CONTACT_TRUST_PROXY !== "false") {
    issues.push("CONTACT_TRUST_PROXY is required and must be exactly true or false")
  }

  const clientIpHeader = env.CONTACT_CLIENT_IP_HEADER?.trim().toLowerCase()
  if (clientIpHeader !== undefined && !/^[a-z0-9-]+$/.test(clientIpHeader)) {
    issues.push("CONTACT_CLIENT_IP_HEADER must be a lowercase HTTP header name")
  }

  validateIntegerEnvironment(env, issues)
  throwIfInvalid(issues)
}
