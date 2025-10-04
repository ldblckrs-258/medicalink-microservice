# Multi-stage Dockerfile for MedicaLink Microservices

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/*/package.json ./apps/*/
COPY libs/*/package.json ./libs/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma clients
RUN cd apps/accounts-service && npx prisma generate && cd ../..
RUN cd apps/provider-directory-service && npx prisma generate && cd ../..
RUN cd apps/booking-service && npx prisma generate && cd ../..
RUN cd apps/content-service && npx prisma generate && cd ../..
RUN cd apps/notification-service && npx prisma generate && cd ../..

# Build the application
RUN pnpm run build

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

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/*/prisma ./apps/*/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose ports (will be overridden by docker-compose)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/api-gateway/main.js --health-check || exit 1

# Default command (will be overridden by docker-compose)
CMD ["node", "dist/apps/api-gateway/main.js"]