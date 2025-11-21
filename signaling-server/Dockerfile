# Multi-stage build for CoFall Signaling Server
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

# Build TypeScript
RUN bun run build || true

# Stage 3: Production
FROM oven/bun:1-slim AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 server && \
    adduser --system --uid 1001 --ingroup server server

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R server:server /app/data

# Copy built application
COPY --from=builder --chown=server:server /app/dist ./dist
COPY --from=builder --chown=server:server /app/package.json ./package.json
COPY --from=builder --chown=server:server /app/node_modules ./node_modules

# Runtime environment variables
ENV HOST=0.0.0.0
ENV PORT=3001

# Switch to non-root user
USER server

# Expose port
EXPOSE 3001

# Volume for persistent data
VOLUME ["/app/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the server
CMD ["bun", "run", "dist/server.js"]
