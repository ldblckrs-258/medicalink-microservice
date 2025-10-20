# API Gateway Dockerfile - Optimized for I/O performance
# Build from project root: docker build -f apps/api-gateway/Dockerfile -t medicalink-gateway .

# Stage 1: Dependencies stage with BuildKit cache
FROM node:20-alpine AS deps

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install

# Stage 2: Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml ./

# Copy only necessary source files for building
COPY libs/ ./libs/
COPY apps/api-gateway/ ./apps/api-gateway/
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Build API gateway only (no Prisma needed)
RUN npx nest build api-gateway

# Stage 3: Production stage
FROM node:20-alpine AS production

# Install pnpm globally and wget for health check
RUN npm install -g pnpm && \
    apk add --no-cache wget

# Create non-root user first
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medicalink -u 1001

# Set working directory with proper ownership
WORKDIR /app

# Copy package files with correct ownership
COPY --chown=medicalink:nodejs package.json pnpm-lock.yaml ./

# Install only production dependencies with BuildKit cache
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    pnpm install --prod --ignore-scripts

# Copy only necessary files from builder stage with correct ownership
COPY --from=builder --chown=medicalink:nodejs /app/dist/apps/api-gateway ./dist/apps/api-gateway

# Switch to non-root user
USER medicalink

# Expose port for API gateway
EXPOSE 3000

# Health check - API Gateway has HTTP server, so we can use wget
HEALTHCHECK --interval=120s --timeout=10s --start-period=20s --retries=2 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start API gateway
CMD ["node", "dist/apps/api-gateway/main.js"]