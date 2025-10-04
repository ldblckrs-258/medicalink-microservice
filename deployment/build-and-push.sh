#!/bin/bash

# MedicaLink - Build and Push Docker Images to Artifact Registry
# This script builds the Docker image and pushes it to Google Artifact Registry

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
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")

log_info "🏥 MedicaLink - Build and Push to Artifact Registry"
echo "=================================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Registry: $REGISTRY"
echo "Image Tag: $IMAGE_TAG"
echo "Git SHA: $GIT_SHA"
echo ""

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ -z "$PROJECT_ID" ]; then
        log_error "PROJECT_ID environment variable is required"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        log_error "Google Cloud SDK is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup Artifact Registry
setup_artifact_registry() {
    log_info "Setting up Artifact Registry..."
    
    # Check if repository exists
    if gcloud artifacts repositories describe medicalink-repo \
        --location="$REGION" \
        --project="$PROJECT_ID" >/dev/null 2>&1; then
        log_warning "Repository medicalink-repo already exists"
    else
        log_info "Creating Artifact Registry repository..."
        gcloud artifacts repositories create medicalink-repo \
            --repository-format=docker \
            --location="$REGION" \
            --description="MedicaLink Docker images" \
            --project="$PROJECT_ID"
        log_success "Repository created"
    fi
    
    # Configure Docker authentication
    log_info "Configuring Docker authentication..."
    gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
    
    log_success "Artifact Registry setup completed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    # Build with multiple tags
    docker build \
        -t "${REGISTRY}/medicalink-base:${IMAGE_TAG}" \
        -t "${REGISTRY}/medicalink-base:${GIT_SHA}" \
        -f Dockerfile \
        --build-arg NODE_ENV=production \
        --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
        --build-arg VCS_REF=${GIT_SHA} \
        .
    
    log_success "Docker image built successfully"
}

# Push Docker image
push_image() {
    log_info "Pushing Docker image to Artifact Registry..."
    
    # Push both tags
    docker push "${REGISTRY}/medicalink-base:${IMAGE_TAG}"
    docker push "${REGISTRY}/medicalink-base:${GIT_SHA}"
    
    log_success "Docker image pushed successfully"
}

# Display image info
display_image_info() {
    log_info "Getting image information..."
    
    gcloud artifacts docker images list \
        "${REGISTRY}/medicalink-base" \
        --include-tags \
        --format="table(
            IMAGE,
            TAGS,
            CREATE_TIME.date(),
            SIZE_BYTES.size()
        )" \
        --project="$PROJECT_ID"
    
    echo ""
    log_success "Build and push completed successfully!"
    echo ""
    echo "📦 Image Information:"
    echo "  Registry: ${REGISTRY}"
    echo "  Image: medicalink-base"
    echo "  Tags: ${IMAGE_TAG}, ${GIT_SHA}"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Deploy to Cloud Run: ./deployment/deploy-cloud-run.sh"
    echo "  2. Deploy to GKE: kubectl apply -f k8s/"
    echo "  3. Deploy to VM: See deployment/deploy-gcp.sh"
}

# Main execution
main() {
    check_prerequisites
    setup_artifact_registry
    build_image
    push_image
    display_image_info
}

# Run main function
main "$@"
