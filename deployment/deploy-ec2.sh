#!/bin/bash

# MedicalLink EC2 Deployment Script
# This script automates deployment to AWS EC2 instances

set -euo pipefail

# Configuration
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
APP_NAME="medicalink-microservice"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO: $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS: $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Function to check if running on EC2
check_ec2() {
    if ! curl -s --max-time 1 http://169.254.169.254/latest/meta-data/instance-id >/dev/null 2>&1; then
        log_error "This script must be run on an EC2 instance"
        exit 1
    fi
    log_info "Confirmed running on EC2 instance"
}

# Function to install prerequisites
install_prerequisites() {
    log_info "Installing prerequisites..."
    
    # Update system
    sudo apt-get update
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Install Node.js and pnpm
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Install nginx
    if ! command -v nginx &> /dev/null; then
        log_info "Installing Nginx..."
        sudo apt-get install -y nginx
    fi
    
    # Install certbot for SSL
    if ! command -v certbot &> /dev/null; then
        log_info "Installing Certbot..."
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    log_success "Prerequisites installed"
}

# Function to setup directories
setup_directories() {
    log_info "Setting up directories..."
    
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    
    sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
    sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$BACKUP_DIR"
    
    log_success "Directories created"
}

# Function to backup current deployment
backup_current_deployment() {
    if [ -d "$APP_DIR/.git" ]; then
        log_info "Creating backup of current deployment..."
        
        local backup_name="backup-$(date '+%Y%m%d-%H%M%S')"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/$backup_name"
        
        # Keep only last 5 backups
        sudo find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" | sort -r | tail -n +6 | xargs -r sudo rm -rf
        
        log_success "Backup created: $backup_name"
    fi
}

# Function to deploy application
deploy_application() {
    log_info "Deploying application..."
    
    cd "$APP_DIR"
    
    # Pull latest code
    if [ -d ".git" ]; then
        git fetch origin
        git reset --hard origin/master
    else
        log_error "Git repository not found. Please clone the repository first."
        exit 1
    fi
    
    # Copy environment file
    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env
        else
            log_error "No environment file found"
            exit 1
        fi
    fi
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml down || true
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Application deployed"
}

# Function to setup nginx configuration
setup_nginx() {
    local domain="${1:-localhost}"
    
    log_info "Setting up Nginx configuration for domain: $domain"
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $domain;

    # Redirect to HTTPS if SSL is configured
    # return 301 https://\$server_name\$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    
    log_success "Nginx configured"
}

# Function to setup SSL certificate
setup_ssl() {
    local domain="$1"
    local email="$2"
    
    if [ "$domain" != "localhost" ] && [ -n "$email" ]; then
        log_info "Setting up SSL certificate for $domain"
        
        sudo certbot --nginx -d "$domain" --email "$email" --agree-tos --non-interactive
        
        log_success "SSL certificate configured"
    else
        log_warning "Skipping SSL setup (localhost or no email provided)"
    fi
}

# Function to perform health check
health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Function to rollback deployment
rollback() {
    log_warning "Rolling back deployment..."
    
    local latest_backup=$(sudo find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" | sort -r | head -n 1)
    
    if [ -n "$latest_backup" ]; then
        sudo rm -rf "$APP_DIR"
        sudo cp -r "$latest_backup" "$APP_DIR"
        sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
        
        cd "$APP_DIR"
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d
        
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  --domain DOMAIN     Domain name for the application (default: localhost)"
    echo "  --email EMAIL       Email for SSL certificate"
    echo "  --rollback          Rollback to previous deployment"
    echo "  --no-ssl            Skip SSL setup"
    echo "  --help              Show this help message"
}

# Main deployment function
main() {
    local domain="localhost"
    local email=""
    local skip_ssl=false
    local rollback_flag=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                domain="$2"
                shift 2
                ;;
            --email)
                email="$2"
                shift 2
                ;;
            --rollback)
                rollback_flag=true
                shift
                ;;
            --no-ssl)
                skip_ssl=true
                shift
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
    
    echo "🏥 MedicaLink EC2 Deployment Script"
    echo "================================="
    
    # Check if rollback is requested
    if [ "$rollback_flag" = true ]; then
        rollback
        health_check
        exit 0
    fi
    
    # Main deployment flow
    check_ec2
    install_prerequisites
    setup_directories
    backup_current_deployment
    
    if ! deploy_application; then
        log_error "Deployment failed"
        rollback
        exit 1
    fi
    
    if ! health_check; then
        log_error "Health check failed"
        rollback
        exit 1
    fi
    
    setup_nginx "$domain"
    
    if [ "$skip_ssl" = false ]; then
        setup_ssl "$domain" "$email"
    fi
    
    log_success "Deployment completed successfully!"
    echo ""
    echo "🚀 Application is available at:"
    if [ "$domain" = "localhost" ]; then
        echo "   - HTTP: http://localhost"
    else
        echo "   - HTTP: http://$domain"
        if [ "$skip_ssl" = false ] && [ -n "$email" ]; then
            echo "   - HTTPS: https://$domain"
        fi
    fi
    echo "   - Health Check: http://$domain/health"
}

# Run main function
main "$@"