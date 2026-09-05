import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"

import { routing } from "@/i18n/routing"

const handleI18nRouting = createMiddleware(routing)
const nextIntlLocaleHeader = "x-next-intl-locale"
const legacyArticleRedirects = new Map([
  ["/en/insights/go-em-producao", "/en/insights/go-in-production"],
  ["/es/insights/go-em-producao", "/es/insights/go-en-produccion"],
])

export function proxy(request: NextRequest) {
  // Next 16.3's standalone server resolves an i18n rewrite through Proxy a
  // second time. next-intl adds this upstream-only header to rewritten
  // requests, so let the already-normalized internal pathname reach the app.
  if (request.headers.has(nextIntlLocaleHeader)) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  const destination = legacyArticleRedirects.get(request.nextUrl.pathname)

  if (destination !== undefined) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = destination

    return NextResponse.redirect(redirectUrl, 308)
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}
