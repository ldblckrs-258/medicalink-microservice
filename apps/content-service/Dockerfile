# Content Service Dockerfile

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

# Generate Prisma client for content service only
RUN cd apps/content-service && npx prisma generate && cd ../..

# Build content service only
RUN npx nest build content-service

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

# Copy Prisma schema files for content service only
COPY --from=builder /app/apps/content-service/prisma ./apps/content-service/prisma

# Copy generated Prisma client from builder stage (avoid regenerating)
COPY --from=builder /app/apps/content-service/prisma/generated ./apps/content-service/prisma/generated

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/content-service ./dist/apps/content-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for content service
EXPOSE 3004

# Health check - Check if the Node.js process is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*content-service" > /dev/null || exit 1

# Start content service
CMD ["node", "dist/apps/content-service/main.js"]