#!/bin/bash

# MedicaLink - GCP Environment Setup
# This script sets up the complete GCP environment for MedicaLink

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
ZONE="${ZONE:-us-central1-a}"

echo "🏥 MedicaLink - GCP Environment Setup"
echo "======================================"
echo ""

# Get project ID if not set
if [ -z "$PROJECT_ID" ]; then
    log_info "Enter your GCP Project ID:"
    read -r PROJECT_ID
fi

log_info "Project ID: $PROJECT_ID"
log_info "Region: $REGION"
log_info "Zone: $ZONE"
echo ""

# Set project
log_info "Setting active project..."
gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
gcloud config set compute/zone "$ZONE"

# Enable APIs
log_info "Enabling required GCP APIs..."
APIS=(
    "compute.googleapis.com"
    "container.googleapis.com"
    "sqladmin.googleapis.com"
    "redis.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "artifactregistry.googleapis.com"
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "logging.googleapis.com"
    "monitoring.googleapis.com"
    "secretmanager.googleapis.com"
    "vpcaccess.googleapis.com"
    "servicenetworking.googleapis.com"
)

for api in "${APIS[@]}"; do
    log_info "Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID" --quiet
done

log_success "All APIs enabled"

# Create Cloud SQL instance
log_info "Creating Cloud SQL (PostgreSQL) instance..."
if gcloud sql instances describe medicalink-db --project="$PROJECT_ID" >/dev/null 2>&1; then
    log_warning "Cloud SQL instance 'medicalink-db' already exists"
else
    gcloud sql instances create medicalink-db \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03 \
        --project="$PROJECT_ID"
    
    log_info "Setting root password..."
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users set-password postgres \
        --instance=medicalink-db \
        --password="$POSTGRES_PASSWORD" \
        --project="$PROJECT_ID"
    
    log_info "Creating database..."
    gcloud sql databases create medicalink \
        --instance=medicalink-db \
        --project="$PROJECT_ID"
    
    log_info "Creating application user..."
    APP_DB_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create medicalink \
        --instance=medicalink-db \
        --password="$APP_DB_PASSWORD" \
        --project="$PROJECT_ID"
    
    echo ""
    log_success "Cloud SQL instance created!"
    echo "  Instance: medicalink-db"
    echo "  Database: medicalink"
    echo "  User: medicalink"
    echo "  Password: $APP_DB_PASSWORD"
    echo ""
    echo "⚠️  IMPORTANT: Save this password securely!"
    echo ""
fi

# Get Cloud SQL connection name
SQL_CONNECTION=$(gcloud sql instances describe medicalink-db \
    --project="$PROJECT_ID" \
    --format="get(connectionName)")

log_info "Cloud SQL Connection: $SQL_CONNECTION"

# Create Memorystore Redis
log_info "Creating Memorystore Redis instance..."
if gcloud redis instances describe medicalink-redis \
    --region="$REGION" \
    --project="$PROJECT_ID" >/dev/null 2>&1; then
    log_warning "Redis instance 'medicalink-redis' already exists"
else
    gcloud redis instances create medicalink-redis \
        --size=1 \
        --region="$REGION" \
        --redis-version=redis_7_0 \
        --network=default \
        --connect-mode=DIRECT_PEERING \
        --project="$PROJECT_ID"
    
    log_success "Redis instance created!"
fi

# Get Redis connection info
REDIS_HOST=$(gcloud redis instances describe medicalink-redis \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="get(host)")
REDIS_PORT=$(gcloud redis instances describe medicalink-redis \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="get(port)")

log_info "Redis Host: $REDIS_HOST"
log_info "Redis Port: $REDIS_PORT"

# Create Artifact Registry
log_info "Creating Artifact Registry repository..."
if gcloud artifacts repositories describe medicalink-repo \
    --location="$REGION" \
    --project="$PROJECT_ID" >/dev/null 2>&1; then
    log_warning "Artifact Registry 'medicalink-repo' already exists"
else
    gcloud artifacts repositories create medicalink-repo \
        --repository-format=docker \
        --location="$REGION" \
        --description="MedicaLink Docker images" \
        --project="$PROJECT_ID"
    
    log_success "Artifact Registry created!"
fi

# Generate secrets
log_info "Generating secure secrets..."
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Create Secret Manager secrets
log_info "Creating Secret Manager secrets..."
SECRETS=(
    "jwt-access-secret:$JWT_ACCESS_SECRET"
    "jwt-refresh-secret:$JWT_REFRESH_SECRET"
)

for secret_pair in "${SECRETS[@]}"; do
    IFS=':' read -r secret_name secret_value <<< "$secret_pair"
    if gcloud secrets describe "$secret_name" \
        --project="$PROJECT_ID" >/dev/null 2>&1; then
        log_warning "Secret '$secret_name' already exists"
    else
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
        log_success "Secret '$secret_name' created"
    fi
done

# Create .env file
log_info "Creating .env.production file..."
cat > .env.production << EOF
# MedicaLink Production Environment Variables
# Generated on $(date)

# Database
DATABASE_URL="postgresql://medicalink:${APP_DB_PASSWORD:-CHANGE_ME}@/medicalink?host=/cloudsql/${SQL_CONNECTION}"

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=
REDIS_USERNAME=default
REDIS_DB=0

# RabbitMQ (you need to set this up separately)
RABBITMQ_URL="amqp://admin:CHANGE_ME@YOUR_RABBITMQ_HOST:5672"

# JWT
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# Service Configuration
SERVICE_NAME=medicalink
NODE_ENV=production
API_GATEWAY_PORT=3000

# Orchestrator
ORCHESTRATOR_CACHE_TTL_SHORT=120
ORCHESTRATOR_CACHE_TTL_MEDIUM=300
ORCHESTRATOR_SAGA_TIMEOUT=30000
ORCHESTRATOR_SERVICE_TIMEOUT=10000

# SMTP (update with your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Super Admin
SUPER_ADMIN_EMAIL=admin@medicalink.com
SUPER_ADMIN_PASSWORD=CHANGE_ME_SECURE_PASSWORD
SUPER_ADMIN_FULL_NAME="Super Administrator"
EOF

log_success ".env.production file created"

# Summary
echo ""
echo "=========================================="
log_success "🎉 GCP Environment Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Resource Summary:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo ""
echo "  ✅ Cloud SQL: medicalink-db"
echo "     Connection: $SQL_CONNECTION"
echo ""
echo "  ✅ Memorystore Redis: medicalink-redis"
echo "     Host: $REDIS_HOST"
echo "     Port: $REDIS_PORT"
echo ""
echo "  ✅ Artifact Registry: medicalink-repo"
echo "     Location: $REGION"
echo ""
echo "  ✅ Secret Manager: Secrets created"
echo ""
echo "📝 Next Steps:"
echo "  1. Review and update .env.production file"
echo "  2. Set up RabbitMQ (CloudAMQP or self-hosted)"
echo "  3. Update SMTP credentials in .env.production"
echo "  4. Build and push Docker images:"
echo "     export PROJECT_ID=$PROJECT_ID"
echo "     ./deployment/build-and-push.sh"
echo ""
echo "  5. Deploy to Cloud Run:"
echo "     source .env.production"
echo "     ./deployment/deploy-cloud-run.sh"
echo ""
echo "  6. Or deploy to GKE:"
echo "     Update k8s/*.yaml files with your PROJECT_ID"
echo "     kubectl apply -f k8s/"
echo ""
echo "⚠️  Important: Save .env.production file securely!"
echo ""
