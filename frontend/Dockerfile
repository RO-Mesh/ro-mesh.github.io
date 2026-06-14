# ── Frontend — Multi-stage Dockerfile ────────────────────────────────────────
# Stage 1: "build" — simply copies static PWA assets
# (No bundler needed for vanilla HTML/CSS/JS)
FROM alpine:3.19 AS build

WORKDIR /app
COPY public/ ./public/

# Stage 2: "serve" — Nginx production server
FROM nginx:1.25-alpine AS serve

LABEL maintainer="ro-mesh-community"
LABEL description="RO-MESH PWA frontend served via Nginx"

# Remove default nginx config and add our custom one
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/ro-mesh.conf

# Copy built static assets
COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
