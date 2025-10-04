#!/bin/bash

# MedicaLink Google Cloud Deployment Script
# This script automates deployment to Google Cloud Platform

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-asia-southeast1}"
ZONE="${ZONE:-asia-southeast1-a}"
INSTANCE_NAME="${INSTANCE_NAME:-medicalink-instance}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-medium}"
DISK_SIZE="${DISK_SIZE:-20GB}"
APP_NAME="medicalink-microservice"

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

# Function to check prerequisites
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
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Please authenticate with Google Cloud: gcloud auth login"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to setup Google Cloud project
setup_gcp_project() {
    log_info "Setting up Google Cloud project..."
    
    gcloud config set project "$PROJECT_ID"
    gcloud config set compute/region "$REGION"
    gcloud config set compute/zone "$ZONE"
    
    # Enable required APIs
    gcloud services enable compute.googleapis.com
    gcloud services enable container.googleapis.com
    gcloud services enable sqladmin.googleapis.com
    gcloud services enable redis.googleapis.com
    
    log_success "Google Cloud project configured"
}

# Function to create VM instance
create_vm_instance() {
    log_info "Creating VM instance..."
    
    # Check if instance already exists
    if gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" >/dev/null 2>&1; then
        log_warning "Instance $INSTANCE_NAME already exists"
        return 0
    fi
    
    # Create startup script
    cat > startup-script.sh << 'EOF'
#!/bin/bash
# Update system
apt-get update
apt-get install -y git curl

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $(whoami)

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install nginx
apt-get install -y nginx

# Create application directory
mkdir -p /opt/medicalink-microservice
chown -R $(whoami):$(whoami) /opt/medicalink-microservice
EOF

    # Create instance
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --network-interface=network-tier=PREMIUM,subnet=default \
        --metadata-from-file startup-script=startup-script.sh \
        --maintenance-policy=MIGRATE \
        --provisioning-model=STANDARD \
        --scopes=https://www.googleapis.com/auth/cloud-platform \
        --tags=http-server,https-server \
        --create-disk=auto-delete=yes,boot=yes,device-name="$INSTANCE_NAME",image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts,mode=rw,size="$DISK_SIZE",type=projects/"$PROJECT_ID"/zones/"$ZONE"/diskTypes/pd-standard \
        --no-shielded-secure-boot \
        --shielded-vtpm \
        --shielded-integrity-monitoring \
        --reservation-affinity=any
    
    # Clean up startup script
    rm -f startup-script.sh
    
    log_success "VM instance created"
}

# Function to create firewall rules
setup_firewall() {
    log_info "Setting up firewall rules..."
    
    # Allow HTTP traffic
    if ! gcloud compute firewall-rules describe allow-http >/dev/null 2>&1; then
        gcloud compute firewall-rules create allow-http \
            --allow tcp:80 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow HTTP traffic" \
            --target-tags http-server
    fi
    
    # Allow HTTPS traffic
    if ! gcloud compute firewall-rules describe allow-https >/dev/null 2>&1; then
        gcloud compute firewall-rules create allow-https \
            --allow tcp:443 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow HTTPS traffic" \
            --target-tags https-server
    fi
    
    # Allow application ports
    if ! gcloud compute firewall-rules describe allow-medicalink-ports >/dev/null 2>&1; then
        gcloud compute firewall-rules create allow-medicalink-ports \
            --allow tcp:3000-3005 \
            --source-ranges 0.0.0.0/0 \
            --description "Allow MedicaLink application ports" \
            --target-tags http-server
    fi
    
    log_success "Firewall rules configured"
}

# Function to create Cloud SQL instance
create_cloud_sql() {
    local sql_instance_name="$1"
    
    log_info "Creating Cloud SQL instance..."
    
    if gcloud sql instances describe "$sql_instance_name" >/dev/null 2>&1; then
        log_warning "Cloud SQL instance $sql_instance_name already exists"
        return 0
    fi
    
    gcloud sql instances create "$sql_instance_name" \
        --database-version=POSTGRES_13 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --storage-type=SSD \
        --storage-size=10GB \
        --availability-type=zonal \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --maintenance-release-channel=production \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03 \
        --deletion-protection
    
    # Create database
    gcloud sql databases create medicalink --instance="$sql_instance_name"
    
    # Create user
    gcloud sql users create medicalink --instance="$sql_instance_name" --password=changeme123
    
    log_success "Cloud SQL instance created"
}

# Function to create Redis instance
create_redis() {
    local redis_instance_name="$1"
    
    log_info "Creating Redis instance..."
    
    if gcloud redis instances describe "$redis_instance_name" --region="$REGION" >/dev/null 2>&1; then
        log_warning "Redis instance $redis_instance_name already exists"
        return 0
    fi
    
    gcloud redis instances create "$redis_instance_name" \
        --size=1 \
        --region="$REGION" \
        --redis-version=redis_6_x \
        --network=default \
        --connect-mode=DIRECT_PEERING
    
    log_success "Redis instance created"
}

# Function to deploy application to VM
deploy_to_vm() {
    local external_ip="$1"
    
    log_info "Deploying application to VM..."
    
    # Wait for instance to be ready
    log_info "Waiting for instance to be ready..."
    sleep 60
    
    # Copy deployment script to VM
    gcloud compute scp deployment/deploy-ec2.sh "$INSTANCE_NAME":/tmp/deploy.sh --zone="$ZONE"
    
    # Copy application files
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
        set -e
        cd /opt/medicalink-microservice
        
        # Clone repository if not exists
        if [ ! -d '.git' ]; then
            git clone https://github.com/your-username/medicalink-microservice.git .
        fi
        
        # Make deploy script executable and run it
        chmod +x /tmp/deploy.sh
        sudo /tmp/deploy.sh --domain=$external_ip --no-ssl
    "
    
    log_success "Application deployed to VM"
}

# Function to get connection strings
get_connection_info() {
    local sql_instance_name="$1"
    local redis_instance_name="$2"
    
    log_info "Getting connection information..."
    
    # Get external IP
    local external_ip=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
    
    # Get Cloud SQL connection
    local sql_connection=$(gcloud sql instances describe "$sql_instance_name" --format="get(connectionName)")
    
    # Get Redis connection
    local redis_host=$(gcloud redis instances describe "$redis_instance_name" --region="$REGION" --format="get(host)")
    local redis_port=$(gcloud redis instances describe "$redis_instance_name" --region="$REGION" --format="get(port)")
    
    echo ""
    echo "🚀 Deployment Information:"
    echo "=========================="
    echo "VM External IP: $external_ip"
    echo "Application URL: http://$external_ip"
    echo "Health Check: http://$external_ip/health"
    echo ""
    echo "Database Connection:"
    echo "  Cloud SQL Connection: $sql_connection"
    echo "  Database URL: postgresql://medicalink:changeme123@<CLOUD_SQL_PROXY>/medicalink"
    echo ""
    echo "Redis Connection:"
    echo "  Host: $redis_host"
    echo "  Port: $redis_port"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Update .env file with the connection strings above"
    echo "2. Configure Cloud SQL Proxy for secure database connection"
    echo "3. Set up domain name and SSL certificate"
    echo "4. Configure monitoring and logging"
}

# Function to cleanup resources
cleanup() {
    log_warning "Cleaning up resources..."
    
    # Delete VM instance
    gcloud compute instances delete "$INSTANCE_NAME" --zone="$ZONE" --quiet
    
    # Delete firewall rules
    gcloud compute firewall-rules delete allow-medicalink-ports --quiet
    
    log_success "Resources cleaned up"
}

# Function to show usage
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo "Commands:"
    echo "  deploy          Deploy the application"
    echo "  cleanup         Clean up all resources"
    echo "  info            Show connection information"
    echo ""
    echo "Options:"
    echo "  --project-id ID     Google Cloud project ID"
    echo "  --region REGION     Deployment region (default: us-central1)"
    echo "  --zone ZONE         Deployment zone (default: us-central1-a)"
    echo "  --instance NAME     VM instance name (default: medicalink-instance)"
    echo "  --help              Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PROJECT_ID          Google Cloud project ID (required)"
}

# Main function
main() {
    local command="deploy"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            deploy|cleanup|info)
                command="$1"
                shift
                ;;
            --project-id)
                PROJECT_ID="$2"
                shift 2
                ;;
            --region)
                REGION="$2"
                shift 2
                ;;
            --zone)
                ZONE="$2"
                shift 2
                ;;
            --instance)
                INSTANCE_NAME="$2"
                shift 2
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    echo "🏥 MedicaLink Google Cloud Deployment"
    echo "==================================="
    
    case $command in
        deploy)
            check_prerequisites
            setup_gcp_project
            create_vm_instance
            setup_firewall
            
            local sql_instance_name="medicalink-db"
            local redis_instance_name="medicalink-redis"
            
            create_cloud_sql "$sql_instance_name"
            create_redis "$redis_instance_name"
            
            local external_ip=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
            deploy_to_vm "$external_ip"
            
            get_connection_info "$sql_instance_name" "$redis_instance_name"
            ;;
        cleanup)
            cleanup
            ;;
        info)
            get_connection_info "medicalink-db" "medicalink-redis"
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"