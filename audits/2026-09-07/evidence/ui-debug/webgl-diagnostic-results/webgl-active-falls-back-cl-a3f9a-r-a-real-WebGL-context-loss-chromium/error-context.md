# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webgl-active.spec.ts >> falls back cleanly after a real WebGL context loss
- Location: e2e/webgl-active.spec.ts:190:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-home-hero] canvas')
Expected: visible
Timeout: 7500ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 7500ms
  - waiting for locator('[data-home-hero] canvas')

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- navigation "Main navigation":
  - link "RM. — Roberto Moraes, home":
    - /url: /en
    - text: RM .
  - link "Work":
    - /url: /en/work
  - link "Experience":
    - /url: /en/experience
  - link "About":
    - /url: /en/about
  - link "Insights":
    - /url: /en/insights
  - group "Select language":
    - link "PT — Switch language to Portuguese":
      - /url: /pt
      - text: PT
    - link "EN — Switch language to English":
      - /url: /en
      - text: EN
    - link "ES — Switch language to Spanish":
      - /url: /es
      - text: ES
- main:
  - heading "Roberto Moraes" [level=1]
  - paragraph: Software Engineer
  - paragraph: Go · Next.js · Kotlin · AWS · GCP
  - link "Explore work":
    - /url: /en/work
  - link "View experience":
    - /url: /en/experience
  - paragraph: Profile
  - heading "Engineering at the core. Management as a multiplier." [level=2]
  - paragraph: My work starts with the technical problem and follows the product into operation. I design architectures, write and review code, shape cloud and observability, and—when the context calls for it—coordinate people, priorities, and risk to turn decisions into reliable software.
  - text: "01"
  - heading "End-to-end delivery" [level=3]
  - paragraph: Backend, web, mobile, integrations, and infrastructure followed through to production.
  - text: "02"
  - heading "Production & reliability" [level=3]
  - paragraph: Performance, observability, security, and operations treated as part of the product.
  - text: "03"
  - heading "Applied leadership" [level=3]
  - paragraph: Technical direction, quality standards, and team coordination grounded in engineering context.
  - paragraph: Selected work
  - heading "Production software. Context, decisions, and outcomes." [level=2]
  - paragraph: Cases showing how architecture, code, infrastructure, and coordination connect when performance, reliability, and continuity matter.
  - article:
    - 'link "Open case study: Hospital Sírio-Libanês"':
      - /url: /en/work/hospital-sirio-libanes
      - text: Case 01 Backend & Cloud Engineer · Technical Lead
      - heading "Hospital Sírio-Libanês" [level=3]
      - paragraph: End-to-end architecture and engineering for a digital hospitality platform. Its Go backend handles 20M+ requests per month at 6ms average latency.
      - term: Requests/month
      - definition: 20M
      - term: Average response
      - definition: 6ms
      - term: Cache hit rate
      - definition: 92%
  - article:
    - 'link "Open case study: Grupo Bandeirantes"':
      - /url: /en/work/band-news-bandsports
      - text: Case 02 Software Engineer & IT Manager
      - heading "Grupo Bandeirantes" [level=3]
      - paragraph: Led the full rebuild of 6+ Grupo Bandeirantes portals, modernizing a high-traffic media platform with zero downtime.
      - term: Portals migrated
      - definition: 6+
      - term: Downtime
      - definition: 0s
      - term: Partnership
      - definition: "1"
  - article:
    - 'link "Open case study: Fiesta Americana Resort"':
      - /url: /en/work/fiesta-americana
      - text: Case 03 International Project Manager
      - heading "Fiesta Americana Resort" [level=3]
      - paragraph: Led a cross-border hospitality project that unified Unicast streaming and coaxial broadcast in a single platform.
  - link "View all work":
    - /url: /en/work
  - paragraph: Practice
  - heading "From backend to operations, always centered on the product." [level=2]
  - paragraph: My experience combines implementation depth, systems architecture, and accountability for what happens after deployment.
  - heading "Backend & platforms" [level=3]
  - paragraph: High-throughput APIs, integrations, data, and services designed for real load.
  - heading "Web, mobile & media" [level=3]
  - paragraph: Next.js, Kotlin, and connected-device experiences, from interface to streaming.
  - heading "Cloud, reliability & operations" [level=3]
  - paragraph: AWS, GCP, observability, security, CI/CD, and operational response.
  - heading "Architecture, technical leadership & IT management" [level=3]
  - paragraph: Technical decisions, quality, priorities, and teams aligned with product context.
  - link "Explore capabilities":
    - /url: /en/about
  - paragraph: Career
  - heading "Continuous growth across development and leadership." [level=2]
  - paragraph: Since 2022, I have expanded from full-stack development into leading the technology function, adding architecture, cloud, operations, and leadership without losing proximity to the code.
  - link "View complete experience":
    - /url: /en/experience
  - list:
    - listitem:
      - text: 2022—2023
      - heading "Buser" [level=3]
      - paragraph: Evolving a digital product at scale.
    - listitem:
      - text: "2023"
      - heading "Weber Technologies" [level=3]
      - paragraph: End-to-end full-stack delivery.
    - listitem:
      - text: 2023—present
      - heading "Valiant Group" [level=3]
      - paragraph: Progression from developer to Software Engineer & IT Manager.
  - paragraph: Engineering thinking
  - heading "Production lessons, without unnecessary abstraction." [level=2]
  - paragraph: Architecture, performance, and technical leadership explained through real systems.
  - link "Read article":
    - /url: /en/insights/go-in-production
  - text: "{ }"
- contentinfo:
  - paragraph: RM.
  - paragraph: Software Engineer. Building software engineered for demanding production environments.
  - paragraph: Navigation
  - navigation "Footer navigation":
    - list:
      - listitem:
        - link "Work":
          - /url: /en/work
      - listitem:
        - link "Experience":
          - /url: /en/experience
      - listitem:
        - link "About":
          - /url: /en/about
      - listitem:
        - link "Insights":
          - /url: /en/insights
      - listitem:
        - link "Contact":
          - /url: /en/contact
      - listitem:
        - link "FAQ":
          - /url: /en/about#faq
  - paragraph: Contact
  - link "robertomoraeszar@gmail.com":
    - /url: mailto:robertomoraeszar@gmail.com
  - link "WhatsApp (opens in a new tab)":
    - /url: https://api.whatsapp.com/send?phone=5511973874345
  - link "LinkedIn (opens in a new tab)":
    - /url: https://www.linkedin.com/in/robertomoraes/
  - link "Privacy":
    - /url: /en/privacy
  - link "Back to top":
    - /url: "#top"
  - paragraph: © 2026 · Roberto Moraes
  - paragraph: Built with code, coffee, and ambition
- alert
```

```
Tearing down "context" exceeded the test timeout of 60000ms.
```