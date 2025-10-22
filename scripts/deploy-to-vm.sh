#!/bin/bash
# Script to deploy a specific service to VM server
# Usage: ./scripts/deploy-to-vm.sh <service_name> <image_tag>
# Example: ./scripts/deploy-to-vm.sh accounts-service staging-abc123

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Validate arguments
if [ $# -lt 2 ]; then
    print_error "Usage: $0 <service_name> <image_tag>"
    print_error "Example: $0 accounts-service staging-abc123"
    exit 1
fi

SERVICE_NAME=$1
IMAGE_TAG=$2

# Validate service name
case $SERVICE_NAME in
    accounts-service|api-gateway|booking-service|content-service|notification-service|orchestrator-service|provider-service|infrastructure)
        ;;
    *)
        print_error "Invalid service name: $SERVICE_NAME"
        print_error "Valid services: accounts-service, api-gateway, booking-service, content-service, notification-service, orchestrator-service, provider-service, infrastructure"
        exit 1
        ;;
esac

# Get GitHub repository info
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-"ldblcks-258/medicalink-microservice"}
GITHUB_OWNER=$(echo $GITHUB_REPOSITORY | cut -d'/' -f1)

# Construct image name
IMAGE_NAME="ghcr.io/${GITHUB_OWNER}/medicalink-${SERVICE_NAME}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

print_header "Deploying $SERVICE_NAME with image $FULL_IMAGE_NAME"

# Check if required environment variables are set
if [ -z "$VM_HOST" ] || [ -z "$VM_USER" ]; then
    print_error "VM_HOST and VM_USER environment variables must be set"
    exit 1
fi

# Create temporary SSH key file
SSH_KEY_FILE=$(mktemp)
echo "$VM_SSH_KEY" > "$SSH_KEY_FILE"
chmod 600 "$SSH_KEY_FILE"

# Function to execute SSH commands
ssh_exec() {
    ssh -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VM_USER@$VM_HOST" "$@"
}

# Function to copy files via SCP
scp_copy() {
    scp -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" "$VM_USER@$VM_HOST:$2"
}

# Cleanup function
cleanup() {
    rm -f "$SSH_KEY_FILE"
}
trap cleanup EXIT

print_header "Connecting to VM server..."

# Test SSH connection
if ! ssh_exec "echo 'SSH connection successful'"; then
    print_error "Failed to connect to VM server"
    exit 1
fi

print_success "Connected to VM server"

# Navigate to project directory on VM
PROJECT_DIR="/home/$VM_USER/medicalink-microservice"

print_header "Pulling latest image from GHCR..."

# Login to GHCR and pull image
ssh_exec "cd $PROJECT_DIR && echo '$GHCR_TOKEN' | docker login ghcr.io -u '$GITHUB_OWNER' --password-stdin"
ssh_exec "cd $PROJECT_DIR && docker pull $FULL_IMAGE_NAME"

print_success "Image pulled successfully"

# Create docker-compose override file for the specific service
print_header "Creating deployment override..."

# Map service names to compose files
case $SERVICE_NAME in
    accounts-service)
        COMPOSE_FILE="docker-compose.accounts.yml"
        ;;
    api-gateway)
        COMPOSE_FILE="docker-compose.gateway.yml"
        ;;
    booking-service)
        COMPOSE_FILE="docker-compose.booking.yml"
        ;;
    content-service)
        COMPOSE_FILE="docker-compose.content.yml"
        ;;
    notification-service)
        COMPOSE_FILE="docker-compose.notification.yml"
        ;;
    orchestrator-service)
        COMPOSE_FILE="docker-compose.orchestrator.yml"
        ;;
    provider-service)
        COMPOSE_FILE="docker-compose.provider.yml"
        ;;
    infrastructure)
        COMPOSE_FILE="docker-compose.infrastructure.yml"
        ;;
esac

# Debug: Show input service name
print_header "Debug: Input service name: $SERVICE_NAME"

# Create override file content
# Map service name to docker-compose service name and container name
case $SERVICE_NAME in
    accounts-service)
        COMPOSE_SERVICE_NAME="accounts-service"
        CONTAINER_NAME="medicalink-accounts"
        ;;
    api-gateway)
        COMPOSE_SERVICE_NAME="api-gateway"
        CONTAINER_NAME="medicalink-gateway"
        ;;
    booking-service)
        COMPOSE_SERVICE_NAME="booking-service"
        CONTAINER_NAME="medicalink-booking"
        ;;
    content-service)
        COMPOSE_SERVICE_NAME="content-service"
        CONTAINER_NAME="medicalink-content"
        ;;
    notification-service)
        COMPOSE_SERVICE_NAME="notification-service"
        CONTAINER_NAME="medicalink-notification"
        ;;
    orchestrator-service)
        COMPOSE_SERVICE_NAME="orchestrator-service"
        CONTAINER_NAME="medicalink-orchestrator"
        ;;
    provider-service)
        COMPOSE_SERVICE_NAME="provider-service"
        CONTAINER_NAME="medicalink-provider"
        ;;
esac

# Debug: Show mapped service names
print_header "Debug: COMPOSE_SERVICE_NAME=$COMPOSE_SERVICE_NAME, CONTAINER_NAME=$CONTAINER_NAME"

OVERRIDE_CONTENT="services:
  $COMPOSE_SERVICE_NAME:
    image: $FULL_IMAGE_NAME
    pull_policy: always"

# Remove old override file if exists
ssh_exec "cd $PROJECT_DIR && rm -f docker-compose.override.yml"

# Write override file to VM using echo instead of heredoc
ssh_exec "cd $PROJECT_DIR && echo 'services:' > docker-compose.override.yml"
ssh_exec "cd $PROJECT_DIR && echo '  $COMPOSE_SERVICE_NAME:' >> docker-compose.override.yml"
ssh_exec "cd $PROJECT_DIR && echo '    image: $FULL_IMAGE_NAME' >> docker-compose.override.yml"
ssh_exec "cd $PROJECT_DIR && echo '    pull_policy: always' >> docker-compose.override.yml"

print_success "Override file created"

# Debug: Show override file content
print_header "Override file content:"
ssh_exec "cd $PROJECT_DIR && cat docker-compose.override.yml"

# Stop and restart only the specific service
print_header "Updating service with new image..."

# Stop the specific container if it exists
print_header "Stopping existing container..."
if ssh_exec "cd $PROJECT_DIR && docker ps -q --filter name=$CONTAINER_NAME" | grep -q .; then
    ssh_exec "cd $PROJECT_DIR && docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    print_success "Container stopped and removed"
else
    print_warning "Container $CONTAINER_NAME not found, skipping stop"
fi

# Start the specific service with new image using docker-compose
print_header "Starting service with new image..."
ssh_exec "cd $PROJECT_DIR && docker compose -f deployment/docker-compose.yml -f docker-compose.override.yml up -d --no-deps $COMPOSE_SERVICE_NAME"

print_success "Service started"

# Run Prisma migrations for database services
if [[ "$SERVICE_NAME" =~ ^(accounts-service|booking-service|content-service|notification-service|provider-service)$ ]]; then
    print_header "Running Prisma migrations for $SERVICE_NAME..."
    
    # Map service name to container name and directory
    case $SERVICE_NAME in
        accounts-service)
            CONTAINER_NAME="medicalink-accounts"
            SERVICE_DIR="accounts-service"
            ;;
        booking-service)
            CONTAINER_NAME="medicalink-booking"
            SERVICE_DIR="booking-service"
            ;;
        content-service)
            CONTAINER_NAME="medicalink-content"
            SERVICE_DIR="content-service"
            ;;
        notification-service)
            CONTAINER_NAME="medicalink-notification"
            SERVICE_DIR="notification-service"
            ;;
        provider-service)
            CONTAINER_NAME="medicalink-provider"
            SERVICE_DIR="provider-directory-service"
            ;;
    esac
    
    # Wait for service to be ready before running migrations
    print_header "Waiting for $SERVICE_NAME to be ready for migrations..."
    sleep 10
    
    # Run Prisma migrations
    if ssh_exec "docker exec $CONTAINER_NAME sh -c 'cd apps/$SERVICE_DIR && npx prisma migrate deploy'"; then
        print_success "Prisma migrations completed for $SERVICE_NAME"
    else
        print_warning "Prisma migrations failed for $SERVICE_NAME (this might be normal if no new migrations exist)"
    fi
else
    print_header "Skipping Prisma migrations for $SERVICE_NAME (not a database service)"
fi

# Wait for service to be ready
print_header "Waiting for service to be ready..."
sleep 15

# Health check
print_header "Checking service health..."
if ssh_exec "cd $PROJECT_DIR && docker compose -f deployment/$COMPOSE_FILE ps | grep -q 'Up'"; then
    print_success "$SERVICE_NAME deployed successfully!"
    
    # Show service status
    print_header "Service status:"
    ssh_exec "cd $PROJECT_DIR && docker compose -f deployment/$COMPOSE_FILE ps"
    
    # Show recent logs
    print_header "Recent logs:"
    ssh_exec "cd $PROJECT_DIR && docker compose -f deployment/$COMPOSE_FILE logs --tail=20"
else
    print_error "Service health check failed"
    print_header "Service logs:"
    ssh_exec "cd $PROJECT_DIR && docker compose -f deployment/$COMPOSE_FILE logs --tail=50"
    exit 1
fi

# Clean up old images (keep last 3 versions)
print_header "Cleaning up old images..."
ssh_exec "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}' | grep 'medicalink-$SERVICE_NAME' | tail -n +4 | awk '{print \$3}' | xargs -r docker rmi -f || true"

print_success "Deployment completed successfully!"
