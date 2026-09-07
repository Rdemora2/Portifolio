export const DEFAULT_SITE_URL = "https://portifolio-liard-zeta.vercel.app"

export function resolveSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  const url = new URL(value ?? DEFAULT_SITE_URL)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https')
  }

  return url.origin
}
