import { expect, type Page } from "@playwright/test"

type LayoutOffender = {
  bottom: number
  left: number
  right: number
  selector: string
  textLength: number
  top: number
}

export async function expectNoContentClipping(
  page: Page,
  context = "Page",
) {
  let latestOffenders: LayoutOffender[] = []

  try {
    await expect
      .poll(
        async () => {
          latestOffenders = await page.evaluate<LayoutOffender[]>(() => {
            const tolerance = 1
            const isInsideManagedHorizontalOverflow = (element: Element) => {
              let ancestor = element.parentElement

              while (ancestor && ancestor !== document.documentElement) {
                const ancestorStyle = getComputedStyle(ancestor)
                const managesInlineOverflow = [
                  "auto",
                  "clip",
                  "hidden",
                  "scroll",
                ].includes(ancestorStyle.overflowX)

                if (
                  managesInlineOverflow &&
                  ancestor.scrollWidth > ancestor.clientWidth + tolerance
                ) {
                  const ancestorRect = ancestor.getBoundingClientRect()
                  return (
                    ancestorRect.left >= -tolerance &&
                    ancestorRect.right <= window.innerWidth + tolerance
                  )
                }

                ancestor = ancestor.parentElement
              }

              return false
            }
            const contentSelector = [
              "nav a",
              "nav button",
              "main section",
              "main article",
              "main [data-article-title] > span",
              "main form",
              "main h1",
              "main h2",
              "main h3",
              "main p",
              "main a",
              "main button",
              "main input",
              "main textarea",
              "main select",
              "main dl",
              "main ul",
              "main ol",
              "footer a",
            ].join(",")

            return Array.from(document.querySelectorAll<HTMLElement>(contentSelector))
              .filter((element) => {
                if (element.closest('[aria-hidden="true"], [inert]')) return false

                const style = getComputedStyle(element)
                if (style.display === "none" || style.visibility === "hidden") {
                  return false
                }

                const rect = element.getBoundingClientRect()
                if (rect.width === 0 || rect.height === 0) return false

                const escapesViewport =
                  rect.left < -tolerance ||
                  rect.right > window.innerWidth + tolerance

                return (
                  escapesViewport &&
                  !isInsideManagedHorizontalOverflow(element)
                )
              })
              .slice(0, 10)
              .map((element) => {
                const rect = element.getBoundingClientRect()
                const identity = [
                  element.tagName.toLowerCase(),
                  element.id ? `#${element.id}` : "",
                  ...Array.from(element.classList)
                    .filter((className) => !className.includes("__"))
                    .slice(0, 2)
                    .map((className) => `.${className}`),
                ].join("")

                return {
                  bottom: Math.round(rect.bottom),
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                  selector: identity,
                  textLength: (element.textContent ?? "").trim().length,
                  top: Math.round(rect.top),
                }
              })
          })
          return latestOffenders
        },
        {
          message: `${context} must keep semantic content inside the viewport`,
        },
      )
      .toEqual([])
  } catch (error) {
    throw new Error(
      `${context} clipping geometry: ${JSON.stringify(latestOffenders)}`,
      { cause: error },
    )
  }
}
