# Provider Directory Service Dockerfile

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client for provider directory service only
RUN cd apps/provider-directory-service && npx prisma generate && cd ../..

# Build provider directory service only
RUN npx nest build provider-directory-service

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies (ignore scripts to avoid husky error)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy Prisma schema files for provider directory service only
COPY --from=builder /app/apps/provider-directory-service/prisma ./apps/provider-directory-service/prisma

# Generate Prisma client in production stage
RUN cd apps/provider-directory-service && npx prisma generate && cd ../..

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/provider-directory-service ./dist/apps/provider-directory-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for provider directory service
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/provider-directory-service/main.js --health-check || exit 1

# Start provider directory service
CMD ["node", "dist/apps/provider-directory-service/main.js"]