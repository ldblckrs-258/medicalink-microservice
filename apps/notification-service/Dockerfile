# Notification Service Dockerfile

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

# Generate Prisma client for notification service only
RUN cd apps/notification-service && npx prisma generate && cd ../..

# Build notification service only
RUN npx nest build notification-service

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

# Copy Prisma schema files for notification service only
COPY --from=builder /app/apps/notification-service/prisma ./apps/notification-service/prisma

# Generate Prisma client in production stage
RUN cd apps/notification-service && npx prisma generate && cd ../..

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/notification-service ./dist/apps/notification-service
COPY --from=builder /app/dist/libs ./dist/libs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for notification service
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/notification-service/main.js --health-check || exit 1

# Start notification service
CMD ["node", "dist/apps/notification-service/main.js"]