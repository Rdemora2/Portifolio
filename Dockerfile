FROM node:26.8.1-trixie-slim@sha256:c0753125a3789977aefe869cbebccf70e3cfd7ea84ca48547458f02e4f1d7146 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json .npmrc ./
RUN npm ci --ignore-scripts --no-audit --no-fund
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

# The stock Node distroless image currently includes the system OpenSSL
# package, although the official Node binary embeds its own OpenSSL runtime.
# Recompose the runner on the supported no-SSL base and copy only the two
# dynamically linked C++ runtime libraries, together with their package
# metadata and license, so vulnerability scanners retain full provenance.
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:ffab599740d4aaa66029d02b9e6d3de4f622fefb7410081c5ef69c86430f364d AS runtime-libs

FROM gcr.io/distroless/base-nossl-debian13:nonroot@sha256:5cab74e7f8a5e7c5f1c8a9e6268b1f352f053c36c656f493308340bcecbc636c AS runner
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL=https://robertomoraes.dev
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV LD_LIBRARY_PATH=/nodejs/lib

# The production image contains only the Node runtime and the standalone
# artifact: no shell, package manager, compiler, or build toolchain.
COPY --from=base /usr/local/bin/node /nodejs/bin/node
COPY --from=base /usr/local/LICENSE /usr/share/doc/nodejs/LICENSE
COPY --from=runtime-libs /usr/lib/*/libstdc++.so.6* /nodejs/lib/
COPY --from=runtime-libs /usr/lib/*/libgcc_s.so.1 /nodejs/lib/
COPY --from=runtime-libs \
  /var/lib/dpkg/status.d/gcc-14-base* \
  /var/lib/dpkg/status.d/libgcc-s1* \
  /var/lib/dpkg/status.d/libstdc++6* \
  /var/lib/dpkg/status.d/
COPY --from=runtime-libs /usr/share/doc/gcc-14-base /usr/share/doc/gcc-14-base
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./

USER 65532:65532
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/robots.txt').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

STOPSIGNAL SIGTERM
ENTRYPOINT ["/nodejs/bin/node"]
CMD ["server.js"]
