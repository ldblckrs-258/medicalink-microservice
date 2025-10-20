# Accounts Service Dockerfile - Optimized for I/O performance
# Build from project root: docker build -f apps/accounts-service/Dockerfile -t medicalink-accounts .

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
COPY apps/accounts-service/ ./apps/accounts-service/
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Generate Prisma client for accounts service only
RUN cd apps/accounts-service && npx prisma generate

# Build accounts service only
RUN npx nest build accounts-service

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

# Copy only necessary files from builder stage with correct ownership
COPY --from=builder --chown=medicalink:nodejs /app/apps/accounts-service/prisma ./apps/accounts-service/prisma
COPY --from=builder --chown=medicalink:nodejs /app/dist/apps/accounts-service ./dist/apps/accounts-service

# Switch to non-root user
USER medicalink

# Expose port for accounts service
EXPOSE 3001

# Health check - Check if the Node.js process is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*accounts-service" > /dev/null || exit 1

# Start accounts service
CMD ["node", "dist/apps/accounts-service/main.js"]