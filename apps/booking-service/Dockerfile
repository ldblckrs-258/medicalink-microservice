# Booking Service Dockerfile

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

# Generate Prisma client for booking service only
RUN cd apps/booking-service && npx prisma generate && cd ../..

# Build booking service only
RUN npx nest build booking-service

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

# Copy Prisma schema files for booking service only
COPY --from=builder /app/apps/booking-service/prisma ./apps/booking-service/prisma

# Copy generated Prisma client from builder stage (avoid regenerating)
COPY --from=builder /app/apps/booking-service/prisma/generated ./apps/booking-service/prisma/generated

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/booking-service ./dist/apps/booking-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for booking service
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/booking-service/main.js --health-check || exit 1

# Start booking service
CMD ["node", "dist/apps/booking-service/main.js"]