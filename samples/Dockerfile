# syntax=docker/dockerfile:1.7
# Multi-stage build: exercises most Dockerfile token categories.

ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.20

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base
LABEL org.opencontainers.image.title="inventory-service" \
      org.opencontainers.image.source="https://example.com/inventory"
ENV NODE_ENV=production \
    PORT=8080 \
    PATH="/app/node_modules/.bin:${PATH}"
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && \
    rm -rf src tests *.md

FROM base AS runtime
ARG BUILD_SHA=unknown
ENV BUILD_SHA=${BUILD_SHA}

RUN addgroup -S app && adduser -S app -G app \
    && apk add --no-cache tini=~0.19 curl
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=deps --chown=app:app /app/node_modules ./node_modules

USER app
EXPOSE 8080/tcp
VOLUME ["/app/data"]
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT}/healthz" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js", "--port", "8080"]
