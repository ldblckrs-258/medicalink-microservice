#!/bin/bash
# MedicaLink Deployment Script for Linux/macOS
# Usage: ./deploy.sh [command] [service]
# Commands: start, stop, restart, logs, build, status, update
# Services: all, infrastructure, gateway, accounts, provider, booking, content, notification, orchestrator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${CYAN} $1 $2...${NC}"
}

print_success() {
    echo -e "${GREEN} $1${NC}"
}

print_error() {
    echo -e "${RED} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  $1${NC}"
}

# Validate arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 [command] [service]"
    echo "Commands: start, stop, restart, logs, build, status, update"
    echo "Services: all, infrastructure, gateway, accounts, provider, booking, content, notification, orchestrator"
    exit 1
fi

COMMAND=$1
SERVICE=${2:-all}

# Validate command
case $COMMAND in
    start|stop|restart|logs|build|status|update)
        ;;
    *)
        print_error "Invalid command: $COMMAND"
        exit 1
        ;;
esac

# Validate service
case $SERVICE in
    all|infrastructure|gateway|accounts|provider|booking|content|notification|orchestrator)
        ;;
    *)
        print_error "Invalid service: $SERVICE"
        exit 1
        ;;
esac

# Set working directory to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    print_success "Environment variables loaded from .env.production"
else
    print_warning ".env.production not found!"
fi

# Define service file mappings
declare -A SERVICE_FILES
SERVICE_FILES[all]="$PROJECT_ROOT/deployment/docker-compose.yml"
SERVICE_FILES[infrastructure]="$PROJECT_ROOT/deployment/docker-compose.infrastructure.yml"
SERVICE_FILES[gateway]="$PROJECT_ROOT/deployment/docker-compose.gateway.yml"
SERVICE_FILES[accounts]="$PROJECT_ROOT/deployment/docker-compose.accounts.yml"
SERVICE_FILES[provider]="$PROJECT_ROOT/deployment/docker-compose.provider.yml"
SERVICE_FILES[booking]="$PROJECT_ROOT/deployment/docker-compose.booking.yml"
SERVICE_FILES[content]="$PROJECT_ROOT/deployment/docker-compose.content.yml"
SERVICE_FILES[notification]="$PROJECT_ROOT/deployment/docker-compose.notification.yml"
SERVICE_FILES[orchestrator]="$PROJECT_ROOT/deployment/docker-compose.orchestrator.yml"

# Get compose file for the specified service
COMPOSE_FILE=${SERVICE_FILES[$SERVICE]}

# Execute commands
case $COMMAND in
    start)
        print_header "Starting" $SERVICE
        docker compose -f "$COMPOSE_FILE" up -d
        print_success "$SERVICE started successfully"
        ;;
    
    stop)
        print_header "Stopping" $SERVICE
        docker compose -f "$COMPOSE_FILE" down
        print_success "$SERVICE stopped successfully"
        ;;
    
    restart)
        print_header "Restarting" $SERVICE
        docker compose -f "$COMPOSE_FILE" restart
        print_success "$SERVICE restarted successfully"
        ;;
    
    logs)
        print_header "Showing logs for" $SERVICE
        if [ "$SERVICE" != "all" ] && [ "$SERVICE" != "infrastructure" ]; then

            if ! docker network ls | grep -q medicalink-network; then
                echo -e "${YELLOW}  Creating medicalink-network...${NC}"
                docker network create medicalink-network 2>/dev/null || true
            fi

            docker compose -f "$COMPOSE_FILE" logs -f
        else
            docker compose -f "$COMPOSE_FILE" logs -f
        fi
        ;;
    
    build)
        print_header "Building" $SERVICE
        docker compose -f "$COMPOSE_FILE" build --no-cache
        print_success "$SERVICE built successfully"
        ;;
    
    status)
        print_header "Checking status of" $SERVICE
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    update)
        print_header "Updating" $SERVICE
        echo -e "${YELLOW} Building application...${NC}"
        cd "$PROJECT_ROOT"
        pnpm install
        
        # Handle different service types
        if [ "$SERVICE" = "infrastructure" ]; then
            echo -e "${YELLOW}  Infrastructure service doesn't require code build${NC}"
        elif [ "$SERVICE" = "gateway" ] || [ "$SERVICE" = "orchestrator" ]; then
            echo -e "${YELLOW}  Building $SERVICE (no Prisma needed)...${NC}"
            pnpm run "build:$SERVICE"
        elif [ "$SERVICE" != "all" ]; then
            echo -e "${YELLOW} Generating Prisma for $SERVICE...${NC}"
            pnpm run "prisma:generate:$SERVICE"
            echo -e "${YELLOW}  Building $SERVICE...${NC}"
            pnpm run "build:$SERVICE"
        else
            echo -e "${YELLOW} Generating Prisma for all services...${NC}"
            pnpm run prisma:generate
            echo -e "${YELLOW}  Building all services...${NC}"
            pnpm run build
        fi
        
        echo -e "${YELLOW} Building Docker images...${NC}"
        docker compose -f "$COMPOSE_FILE" build --no-cache
        
        echo -e "${YELLOW} Restarting services...${NC}"
        docker compose -f "$COMPOSE_FILE" up -d --force-recreate
        
        print_success "$SERVICE updated successfully"
        ;;
esac

echo -e "\n${MAGENTA} Current Status:${NC}"
docker compose -f "$COMPOSE_FILE" ps