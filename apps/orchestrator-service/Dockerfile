# Orchestrator Service Dockerfile - Optimized for I/O performance
# Build from project root: docker build -f apps/orchestrator-service/Dockerfile -t medicalink-orchestrator .

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
COPY apps/orchestrator-service/ ./apps/orchestrator-service/
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Build orchestrator service only (no Prisma needed)
RUN npx nest build orchestrator-service

# Stage 3: Production stage
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

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

# Copy built application from builder stage with correct ownership
COPY --from=builder --chown=medicalink:nodejs /app/dist/apps/orchestrator-service ./dist/apps/orchestrator-service

# Switch to non-root user
USER medicalink

# Expose port for orchestrator service
EXPOSE 3006

# Health check - Check if the Node.js process is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*orchestrator-service" > /dev/null || exit 1

# Start orchestrator service
CMD ["node", "dist/apps/orchestrator-service/main.js"]