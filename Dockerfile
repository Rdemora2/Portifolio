ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

RUN useradd --system --uid 1001 --create-home nextjs

COPY --from=builder /app/public ./public
RUN mkdir -p .next && chown nextjs:nextjs .next
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

FROM base AS dev
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
