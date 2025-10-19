# Accounts Service Dockerfile

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

# Generate Prisma client for accounts service only
RUN cd apps/accounts-service && npx prisma generate && cd ../..

# Build accounts service only
RUN npx nest build accounts-service

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

# Copy Prisma schema files for accounts service only
COPY --from=builder /app/apps/accounts-service/prisma ./apps/accounts-service/prisma

# Generate Prisma client in production stage
RUN cd apps/accounts-service && npx prisma generate && cd ../..

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/accounts-service ./dist/apps/accounts-service
COPY --from=builder /app/dist/libs ./dist/libs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for accounts service
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/accounts-service/main.js --health-check || exit 1

# Start accounts service
CMD ["node", "dist/apps/accounts-service/main.js"]