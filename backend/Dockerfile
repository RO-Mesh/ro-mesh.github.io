# ── Backend — Dockerfile ─────────────────────────────────────────────────────
FROM node:20-alpine

LABEL maintainer="ro-mesh-community"
LABEL description="RO-MESH backend utility service (stub)"

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy source
COPY . .

# Non-root user for security
RUN addgroup -S romesh && adduser -S romesh -G romesh
USER romesh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
