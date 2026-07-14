FROM node:24.18.0-trixie-slim@sha256:366fdef91728b1b7fa18c84fba63b6e79ed77b7e10cc206878e9705da4d7b169 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json .npmrc ./
RUN npm ci --ignore-scripts --no-audit --no-fund
RUN npm audit signatures
COPY scripts/dev-workspace.mjs ./scripts/dev-workspace.mjs
RUN node scripts/dev-workspace.mjs --mark-dependencies

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=https://robertomoraes.dev
ARG NEXT_PUBLIC_WEB_VITALS_ENDPOINT=
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_WEB_VITALS_ENDPOINT=${NEXT_PUBLIC_WEB_VITALS_ENDPOINT}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM deps AS dev
ENV NODE_ENV=development
CMD ["sh", "-c", "node scripts/dev-workspace.mjs && exec npm run dev -- -H 0.0.0.0 -p 3000"]

FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:70a2c12a0d76018b54d7bd01c5e3677632eeed9f890ba318d6db55fc54cf3baa AS runner
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL=https://robertomoraes.dev
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# The production image contains only the Node runtime and the standalone
# artifact: no shell, package manager, compiler, or build toolchain.
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./

USER 65532:65532
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/robots.txt').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

STOPSIGNAL SIGTERM
CMD ["server.js"]
