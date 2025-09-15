#!/bin/bash

# MedicaLink Microservices Setup Script
# Enhanced version with cloud deployment support

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🏥 Setting up MedicaLink Microservices..."

# Function to detect environment
detect_environment() {
    if [ "${NODE_ENV:-}" = "production" ]; then
        echo "production"
    elif [ "${NODE_ENV:-}" = "staging" ]; then
        echo "staging"
    elif [ -f "/.dockerenv" ]; then
        echo "docker"
    else
        echo "development"
    fi
}

# Function to detect cloud provider
detect_cloud_provider() {
    # Check for AWS EC2
    if curl -s --max-time 1 http://169.254.169.254/latest/meta-data/instance-id >/dev/null 2>&1; then
        echo "aws"
        return
    fi
    
    # Check for Google Cloud
    if curl -s --max-time 1 -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/id >/dev/null 2>&1; then
        echo "gcp"
        return
    fi
    
    echo "local"
}

# Detect environment and cloud
ENVIRONMENT=$(detect_environment)
CLOUD_PROVIDER=$(detect_cloud_provider)

log_info "Detected environment: $ENVIRONMENT"
log_info "Detected cloud provider: $CLOUD_PROVIDER"

# Check if Docker is running (skip for cloud environments with managed services)
if [ "$CLOUD_PROVIDER" = "local" ] && [ "$ENVIRONMENT" != "production" ]; then
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install pnpm and try again."
    exit 1
fi

log_info "Installing dependencies..."
if ! pnpm install --frozen-lockfile; then
    log_error "Failed to install dependencies"
    exit 1
fi

# Setup environment file based on detected environment
if [ -f ".env.$ENVIRONMENT" ]; then
    log_info "Using environment file: .env.$ENVIRONMENT"
    cp ".env.$ENVIRONMENT" .env
elif [ ! -f ".env" ]; then
    log_warning "No environment file found, copying from .env.example"
    cp .env.example .env
fi

# Start infrastructure services for local development
if [ "$ENVIRONMENT" = "development" ] && [ "$CLOUD_PROVIDER" = "local" ]; then
    log_info "Starting local development services..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    log_info "Waiting for services to be ready..."
    sleep 15
fi

log_info "Generating Prisma clients..."
# Generate Prisma clients for each service
services=("accounts-service" "provider-directory-service" "booking-service" "content-service" "notification-service")

for service in "${services[@]}"; do
    if [ -d "apps/$service/prisma" ]; then
        log_info "Generating Prisma client for $service..."
        (cd "apps/$service" && npx prisma generate) || {
            log_error "Failed to generate Prisma client for $service"
            exit 1
        }
    fi
done

log_info "Running database migrations..."
# Run migrations for each service
for service in "${services[@]}"; do
    if [ -d "apps/$service/prisma" ]; then
        log_info "Running migrations for $service..."
        (cd "apps/$service" && npx prisma db push) || {
            log_error "Failed to run migrations for $service"
            exit 1
        }
    fi
done

# Create super admin account if in development
if [ "$ENVIRONMENT" = "development" ]; then
    log_info "Creating super admin account..."
    if pnpm run create-super-admin; then
        log_success "Super admin account created"
    else
        log_warning "Super admin account creation failed or already exists"
    fi
fi

log_success "Setup complete!"
echo ""

# Provide environment-specific instructions
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🚀 Development environment ready!"
    echo "   - Start all services: pnpm run dev"
    echo "   - Start individual services:"
    echo "     • pnpm run start:accounts"
    echo "     • pnpm run start:provider"
    echo "     • pnpm run start:booking"
    echo "     • pnpm run start:content"
    echo "     • pnpm run start:notification"
    echo "     • pnpm run start:gateway"
    echo ""
    echo "📖 Development tools:"
    echo "   - Prisma Studio: cd apps/[service] && npx prisma studio"
    echo "   - API Documentation: http://localhost:3000/api"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "🚀 Production environment ready!"
    echo "   - Services will be managed by Docker Compose"
    echo "   - Health Check: http://localhost/health"
    echo "   - Monitor logs: docker-compose logs -f"
fi

# Cloud-specific instructions
if [ "$CLOUD_PROVIDER" = "aws" ]; then
    echo ""
    echo "☁️ AWS EC2 detected:"
    echo "   - Use ./deployment/deploy-ec2.sh for automated deployment"
    echo "   - Configure RDS for production database"
    echo "   - Use ElastiCache for Redis"
elif [ "$CLOUD_PROVIDER" = "gcp" ]; then
    echo ""
    echo "☁️ Google Cloud detected:"
    echo "   - Use ./deployment/deploy-gcp.sh for automated deployment"
    echo "   - Configure Cloud SQL for production database"
    echo "   - Use Memorystore for Redis"
fi