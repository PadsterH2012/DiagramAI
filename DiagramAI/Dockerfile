# Dockerfile
# Multi-stage build for optimal production image

# Stage 1: Dependencies
FROM node:18-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
# Skip all scripts (including husky prepare) during Docker build
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine3.20 AS builder
WORKDIR /app

# Accept build arguments
ARG VERSION_STRING=1.0.45
ARG BUILD_DATE
ARG GIT_COMMIT

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV HUSKY=0
ENV APP_VERSION=${VERSION_STRING}
ENV BUILD_DATE=${BUILD_DATE}
ENV GIT_COMMIT=${GIT_COMMIT}

# Generate Prisma client for Alpine Linux
RUN npx prisma generate

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine3.20 AS runner
WORKDIR /app

# Accept build arguments for runtime
ARG VERSION_STRING=1.0.45
ARG BUILD_DATE
ARG GIT_COMMIT

# Install OpenSSL for Prisma engines
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create empty public directory (project doesn't have static assets)
RUN mkdir -p ./public

# Set runtime environment variables
ENV APP_VERSION=${VERSION_STRING}
ENV BUILD_DATE=${BUILD_DATE}
ENV GIT_COMMIT=${GIT_COMMIT}

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
