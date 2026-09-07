import { describe, expect, it } from "vitest"

import { GET } from "./route"

describe("GET /llms-full.txt", () => {
  it("serves shared portfolio context as cacheable plain text", async () => {
    const response = GET()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    )
    expect(await response.text()).toContain("## Estudos de caso em produção")
  })
})
