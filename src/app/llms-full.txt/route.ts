import { createLlmsFull } from "@/lib/llms-content"

export const dynamic = "force-static"

export function GET() {
  return new Response(createLlmsFull(), {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
