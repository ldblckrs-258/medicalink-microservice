#!/bin/bash

# MedicaLink - Deploy to Cloud Run
# This script deploys all microservices to Google Cloud Run

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

# Configuration
PROJECT_ID="${PROJECT_ID:-medicalink-prod}"
REGION="${REGION:-us-central1}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/medicalink-repo"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Environment variables (should be set externally or via Secret Manager)
DATABASE_URL="${DATABASE_URL:-}"
REDIS_HOST="${REDIS_HOST:-}"
REDIS_PORT="${REDIS_PORT:-6379}"
RABBITMQ_URL="${RABBITMQ_URL:-}"
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-}"
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASS="${SMTP_PASS:-}"

log_info "🏥 MedicaLink - Deploy to Cloud Run"
echo "====================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Image: ${REGISTRY}/medicalink-base:${IMAGE_TAG}"
echo ""

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ -z "$PROJECT_ID" ]; then
        log_error "PROJECT_ID environment variable is required"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is required"
        exit 1
    fi
    
    if [ -z "$REDIS_HOST" ]; then
        log_error "REDIS_HOST environment variable is required"
        exit 1
    fi
    
    if [ -z "$RABBITMQ_URL" ]; then
        log_error "RABBITMQ_URL environment variable is required"
        exit 1
    fi
    
    if [ -z "$JWT_ACCESS_SECRET" ]; then
        log_error "JWT_ACCESS_SECRET environment variable is required"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud SDK is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup VPC Connector (for private networking)
setup_vpc_connector() {
    log_info "Setting up VPC Connector..."
    
    # Check if VPC connector exists
    if gcloud compute networks vpc-access connectors describe medicalink-vpc-connector \
        --region="$REGION" \
        --project="$PROJECT_ID" >/dev/null 2>&1; then
        log_warning "VPC Connector medicalink-vpc-connector already exists"
    else
        log_info "Creating VPC Connector..."
        gcloud compute networks vpc-access connectors create medicalink-vpc-connector \
            --network=default \
            --region="$REGION" \
            --range=10.8.0.0/28 \
            --project="$PROJECT_ID"
        log_success "VPC Connector created"
    fi
}

# Common environment variables
get_common_env_vars() {
    echo "NODE_ENV=production,\
SERVICE_NAME=medicalink,\
DATABASE_URL=${DATABASE_URL},\
REDIS_HOST=${REDIS_HOST},\
REDIS_PORT=${REDIS_PORT},\
RABBITMQ_URL=${RABBITMQ_URL},\
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET},\
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET},\
JWT_EXPIRES_IN=900,\
JWT_REFRESH_EXPIRES_IN=604800,\
SMTP_HOST=${SMTP_HOST},\
SMTP_PORT=${SMTP_PORT},\
SMTP_USER=${SMTP_USER},\
SMTP_PASS=${SMTP_PASS}"
}

# Deploy service to Cloud Run
deploy_service() {
    local service_name=$1
    local service_port=$2
    local service_path=$3
    local min_instances=${4:-0}
    local max_instances=${5:-10}
    local allow_unauthenticated=${6:-no}
    
    log_info "Deploying ${service_name}..."
    
    local env_vars=$(get_common_env_vars)
    env_vars="${env_vars},${service_name^^}_PORT=${service_port}"
    
    local auth_flag="--no-allow-unauthenticated"
    if [ "$allow_unauthenticated" = "yes" ]; then
        auth_flag="--allow-unauthenticated"
    fi
    
    gcloud run deploy "${service_name}" \
        --image "${REGISTRY}/medicalink-base:${IMAGE_TAG}" \
        --region "${REGION}" \
        --platform managed \
        --port "${service_port}" \
        --set-env-vars "${env_vars}" \
        --command "node" \
        --args "dist/apps/${service_path}/main.js" \
        --memory 512Mi \
        --cpu 1 \
        --min-instances "${min_instances}" \
        --max-instances "${max_instances}" \
        ${auth_flag} \
        --vpc-connector medicalink-vpc-connector \
        --vpc-egress all-traffic \
        --timeout 300 \
        --concurrency 80 \
        --project "${PROJECT_ID}" \
        --quiet
    
    log_success "${service_name} deployed successfully"
}

# Deploy all services
deploy_all_services() {
    log_info "Deploying all microservices..."
    
    # API Gateway (public-facing)
    deploy_service "api-gateway" 3000 "api-gateway" 1 10 "yes"
    
    # Accounts Service (internal)
    deploy_service "accounts-service" 3001 "accounts-service" 0 5 "no"
    
    # Provider Directory Service (internal)
    deploy_service "provider-service" 3002 "provider-directory-service" 0 5 "no"
    
    # Booking Service (internal)
    deploy_service "booking-service" 3003 "booking-service" 0 5 "no"
    
    # Content Service (internal)
    deploy_service "content-service" 3004 "content-service" 0 5 "no"
    
    # Notification Service (internal)
    deploy_service "notification-service" 3005 "notification-service" 0 5 "no"
    
    # Orchestrator Service (internal)
    deploy_service "orchestrator-service" 3006 "orchestrator-service" 0 5 "no"
    
    log_success "All services deployed successfully"
}

# Get service URLs
get_service_urls() {
    log_info "Getting service URLs..."
    
    echo ""
    echo "🚀 Deployed Services:"
    echo "===================="
    
    for service in api-gateway accounts-service provider-service booking-service content-service notification-service orchestrator-service; do
        local url=$(gcloud run services describe "$service" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --format="value(status.url)" 2>/dev/null || echo "Not deployed")
        echo "  $service: $url"
    done
    
    echo ""
    log_info "Getting API Gateway URL for health check..."
    local api_url=$(gcloud run services describe "api-gateway" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null)
    
    if [ -n "$api_url" ]; then
        echo ""
        echo "📍 Main Endpoints:"
        echo "  Health Check: ${api_url}/health"
        echo "  API Base URL: ${api_url}/api"
        echo ""
        
        log_info "Testing health check..."
        if curl -sf "${api_url}/health" > /dev/null; then
            log_success "Health check passed!"
        else
            log_warning "Health check failed - service may still be starting up"
        fi
    fi
}

# Setup IAM permissions
setup_iam() {
    log_info "Setting up IAM permissions..."
    
    # Allow internal services to invoke each other
    for service in accounts-service provider-service booking-service content-service notification-service orchestrator-service; do
        gcloud run services add-iam-policy-binding "$service" \
            --region="$REGION" \
            --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
            --role="roles/run.invoker" \
            --project="$PROJECT_ID" \
            --quiet 2>/dev/null || true
    done
    
    log_success "IAM permissions configured"
}

# Main execution
main() {
    check_prerequisites
    setup_vpc_connector
    deploy_all_services
    setup_iam
    get_service_urls
    
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Configure custom domain: gcloud run domain-mappings create"
    echo "  2. Set up Cloud Armor for WAF protection"
    echo "  3. Configure Cloud Monitoring alerts"
    echo "  4. Run database migrations: gcloud run jobs execute migrate-db"
    echo "  5. Seed initial data if needed"
}

# Run main function
main "$@"
