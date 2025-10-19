# API Gateway Dockerfile

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY libs/*/package.json ./libs/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build API gateway only (no Prisma needed)
RUN npx nest build api-gateway

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
COPY --from=builder /app/dist/apps/api-gateway ./dist/apps/api-gateway
COPY --from=builder /app/dist/libs ./dist/libs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medicalink -u 1001

# Change ownership of the app directory
RUN chown -R medicalink:nodejs /app
USER medicalink

# Expose port for API gateway
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/apps/api-gateway/main.js --health-check || exit 1

# Start API gateway
CMD ["node", "dist/apps/api-gateway/main.js"]