# Multi-stage build for Nuxt 4 application
# Stage 1: Dependencies
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NUXT_PUBLIC_SIGNALING_SERVER
ARG NUXT_PUBLIC_APP_URL
ARG NUXT_SESSION_PASSWORD

# Set environment variables for build
ENV NUXT_PUBLIC_SIGNALING_SERVER=${NUXT_PUBLIC_SIGNALING_SERVER:-http://localhost:3001}
ENV NUXT_PUBLIC_APP_URL=${NUXT_PUBLIC_APP_URL:-http://localhost:3000}
ENV NUXT_SESSION_PASSWORD=${NUXT_SESSION_PASSWORD:-super-secret-password-at-least-32-chars-long}

# Build the application
RUN bun run build

# Stage 3: Production
FROM oven/bun:1-slim AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 --ingroup nuxt nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
COPY --from=builder --chown=nuxt:nuxt /app/package.json ./package.json

# Runtime environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Switch to non-root user
USER nuxt

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api || exit 1

# Start the application
CMD ["bun", "run", ".output/server/index.mjs"]
