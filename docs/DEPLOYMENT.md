# Hướng Dẫn Deploy MedicaLink lên Google Cloud Platform

## 📋 Tổng Quan

Hướng dẫn này giúp bạn deploy MedicaLink Microservices lên Google Cloud Platform sử dụng **Ubuntu VM** và **Docker Compose**.

**Thời gian:** ~30 phút  
**Chi phí:** ~$80/tháng  
**Yêu cầu:** Tài khoản GCP (có thể dùng $300 free credit)

---

## 🚀 Bước 1: Chuẩn Bị (Trên Máy Local)

### 1.1. Cài Đặt Google Cloud SDK

**Windows (PowerShell):**
```powershell
# Download và cài đặt
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

**macOS/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 1.2. Đăng Nhập và Setup Project

```bash
# Đăng nhập
gcloud auth login

# Tạo project mới (hoặc dùng existing)
gcloud projects create medicalink-prod --name="MedicaLink Production"

# Set project
gcloud config set project medicalink-prod
gcloud config set compute/region asia-southeast1
gcloud config set compute/zone asia-southeast1-a

# Enable APIs
gcloud services enable compute.googleapis.com
```

---

## 🖥️ Bước 2: Tạo VM Ubuntu

### 2.1. Tạo VM Instance

```powershell
gcloud compute instances create medicalink-vm --zone=asia-southeast1-a --machine-type=e2-medium --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud --boot-disk-size=50GB --boot-disk-type=pd-standard --tags=http-server,https-server --metadata=startup-script="apt-get update && curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && apt-get install -y docker-compose-plugin git curl vim && usermod -aG docker ubuntu"
```

### 2.2. Cấu Hình Firewall

```powershell
gcloud compute firewall-rules create allow-http-https --allow tcp:80,tcp:443 --source-ranges 0.0.0.0/0 --target-tags http-server,https-server --description="Allow HTTP and HTTPS traffic"
```

### 2.3. Lấy External IP

**PowerShell (Windows):**
```powershell
# Get VM external IP
gcloud compute instances describe medicalink-vm --zone=asia-southeast1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# Lưu IP này lại - bạn sẽ cần dùng sau
```

---

## 📦 Bước 3: Setup Application (Trên VM)

### 3.1. SSH vào VM

```bash
# SSH from local machine
gcloud compute ssh medicalink-vm --zone=asia-southeast1-a
```

### 3.2. Clone Repository

```bash
# Clone your repository
git clone https://github.com/ldblckrs-258/medicalink-microservice.git
cd medicalink-microservice

# Checkout staging branch (or main)
git checkout staging
```

### 3.3. Tạo File Environment

```bash
# Create production environment file (copy and paste this entire block)
cat > .env.production << 'EOF'
# Node Environment
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://medicalink:MedicalinkDB2024!@postgres:5432/medicalink
POSTGRES_DB=medicalink
POSTGRES_USER=medicalink
POSTGRES_PASSWORD=MedicalinkDB2024!

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=default
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_URL=amqp://admin:RabbitMQ2024!@rabbitmq:5672
RABBITMQ_USER=admin
RABBITMQ_PASS=RabbitMQ2024!

# JWT Configuration (Generate new secrets!)
JWT_ACCESS_SECRET=CHANGE_ME_USE_openssl_rand_base64_32
JWT_REFRESH_SECRET=CHANGE_ME_USE_openssl_rand_base64_32
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# Service Configuration
SERVICE_NAME=medicalink
API_GATEWAY_PORT=3000

# Orchestrator Configuration
ORCHESTRATOR_CACHE_TTL_SHORT=120
ORCHESTRATOR_CACHE_TTL_MEDIUM=300
ORCHESTRATOR_SAGA_TIMEOUT=30000
ORCHESTRATOR_SERVICE_TIMEOUT=10000

# SMTP Configuration (Update with your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Super Admin (Update these!)
SUPER_ADMIN_EMAIL=admin@medicalink.com
SUPER_ADMIN_PASSWORD=AdminSecure2024!
SUPER_ADMIN_FULL_NAME=Super Administrator

# Application Info
APP_NAME=MedicaLink Microservices
API_VERSION=v1
EOF

# Generate and update JWT secrets
JWT_ACCESS=$(openssl rand -base64 32) && JWT_REFRESH=$(openssl rand -base64 32) && sed -i "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$JWT_ACCESS/" .env.production && sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env.production

echo "✅ Environment file created at .env.production"
echo "⚠️  Please update SMTP credentials before starting!"
```

### 3.4. Build Application

```bash
# Install Node.js and pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt-get install -y nodejs && sudo npm install -g pnpm

# Install dependencies, generate Prisma clients, and build
pnpm install && pnpm run prisma:generate && pnpm run build

echo "✅ Application built successfully!"
```

---

## 🐳 Bước 4: Deploy với Docker Compose

### 4.1. Start All Services

```bash
# Thêm user hiện tại vào group docker
sudo usermod -aG docker $USER

# Áp dụng thay đổi group ngay lập tức
newgrp docker

# Load environment variables and start services
export $(cat .env.production | grep -v '^#' | xargs) && docker compose -f docker-compose.prod.yml up -d && echo "Waiting for services to start..." && sleep 30
```

### 4.2. Verify Deployment

```bash
# Check running containers
docker ps

# Should see 10 containers:
# - medicalink-gateway (API Gateway)
# - medicalink-accounts
# - medicalink-provider
# - medicalink-booking
# - medicalink-content
# - medicalink-notification
# - medicalink-orchestrator
# - medicalink-postgres
# - medicalink-redis
# - medicalink-rabbitmq

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4.3. Test Health Endpoint

```bash
# Test health endpoints
curl http://localhost/health && echo "" && curl http://localhost:3000/health
```

---

## 🗄️ Bước 5: Setup Database

### 5.1. Run Migrations

```bash
# Run migrations for all services
docker exec medicalink-accounts sh -c "cd apps/accounts-service && npx prisma migrate deploy"
docker exec medicalink-provider sh -c "cd apps/provider-directory-service && npx prisma migrate deploy"
docker exec medicalink-booking sh -c "cd apps/booking-service && npx prisma migrate deploy"
docker exec medicalink-content sh -c "cd apps/content-service && npx prisma migrate deploy"
docker exec medicalink-notification sh -c "cd apps/notification-service && npx prisma migrate deploy"
```

### 5.2. Seed Initial Data

```bash
# Run seed scripts
cd ~/medicalink-microservice && pnpm run script -- --service=accounts-service --filename=create-super-admin && pnpm run script -- --service=accounts-service --filename=permission-seeds && echo "✅ Database setup complete!"
```

---

## 🌐 Bước 6: Test từ Internet

### 6.1. Get External IP

**PowerShell (Windows):**
```powershell
# From your local machine
$VM_IP = gcloud compute instances describe medicalink-vm --zone=asia-southeast1-a --format="get(networkInterfaces[0].accessConfigs[0].natIP)" ; Write-Host "Your API is available at: http://$VM_IP"
```

**Linux/macOS (Bash):**
```bash
# From your local machine
VM_IP=$(gcloud compute instances describe medicalink-vm --zone=asia-southeast1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)') && echo "Your API is available at: http://$VM_IP"
```

### 6.2. Test Endpoints

**PowerShell (Windows):**
```powershell
# Test health
curl "http://$VM_IP/health"

# Test API endpoints
curl "http://$VM_IP/api/specialties"

# Test login
$body = @{
    email = "admin@medicalink.com"
    password = "AdminSecure2024!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://$VM_IP/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Linux/macOS (Bash):**
```bash
# Test health
curl http://$VM_IP/health

# Test API endpoints
curl http://$VM_IP/api/specialties

# Test login
curl -X POST http://$VM_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicalink.com",
    "password": "AdminSecure2024!"
  }'
```

---

## 🔐 Bước 7: Setup Domain & SSL (Optional)

### 7.1. Point Domain to VM

Tại nhà cung cấp domain của bạn (GoDaddy, Namecheap, etc.):

```
Type    Name    Value           TTL
A       @       VM_IP_ADDRESS   300
A       api     VM_IP_ADDRESS   300
```

### 7.2. Setup SSL Certificate

```bash
# SSH back to VM
gcloud compute ssh medicalink-vm --zone=asia-southeast1-a

# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
docker stop medicalink-nginx

# Get SSL certificate and copy to nginx
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com --email your-email@gmail.com --agree-tos --non-interactive && sudo mkdir -p ~/medicalink-microservice/nginx/ssl && sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/medicalink-microservice/nginx/ssl/cert.pem && sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/medicalink-microservice/nginx/ssl/key.pem && sudo chown -R $USER:$USER ~/medicalink-microservice/nginx/ssl

# Update nginx config to enable SSL
cd ~/medicalink-microservice
nano nginx/nginx.conf
# Uncomment SSL server block and update domain

# Restart Nginx
docker compose -f docker-compose.prod.yml restart nginx

# Setup auto-renewal
echo "0 0 * * * certbot renew --quiet && docker restart medicalink-nginx" | sudo crontab -
```

---

## 📊 Bước 8: Monitoring & Maintenance

### 8.1. View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api-gateway
docker compose -f docker-compose.prod.yml logs -f accounts-service

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### 8.2. Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart api-gateway

# Stop all
docker compose -f docker-compose.prod.yml down

# Start all
docker compose -f docker-compose.prod.yml up -d
```

### 8.3. Update Application

**Từ máy local (Windows PowerShell):**
```powershell
# SSH to VM
gcloud compute ssh medicalink-vm --zone=asia-southeast1-a
```

**Trên VM (Linux):**
```bash
# Update and rebuild application
cd ~/medicalink-microservice && git pull origin staging && pnpm install && pnpm run prisma:generate && pnpm run build && docker compose -f docker-compose.prod.yml up -d --build && docker compose -f docker-compose.prod.yml logs -f
```

### 8.4. Backup Database

```bash
# Create backup
docker exec medicalink-postgres pg_dump -U medicalink medicalink > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
cat backup_20250104_120000.sql | docker exec -i medicalink-postgres psql -U medicalink medicalink
```

---

## 🛠️ Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs service-name

# Check if port is already in use
sudo netstat -tulpn | grep :3000

# Restart Docker
sudo systemctl restart docker
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs medicalink-postgres

# Test connection
docker exec medicalink-postgres psql -U medicalink -d medicalink -c "SELECT 1"
```

### RabbitMQ Connection Failed

```bash
# Check RabbitMQ
docker ps | grep rabbitmq
docker logs medicalink-rabbitmq

# Check management UI (if exposed)
curl http://localhost:15672
```

### Out of Memory

**Trên VM (kiểm tra):**
```bash
# Check memory usage
free -h
docker stats
```

**Từ máy local - tăng memory (PowerShell):**
```powershell
# Increase VM memory
gcloud compute instances stop medicalink-vm --zone=asia-southeast1-a ; gcloud compute instances set-machine-type medicalink-vm --machine-type=e2-standard-2 --zone=asia-southeast1-a ; gcloud compute instances start medicalink-vm --zone=asia-southeast1-a
```

**Linux/macOS:**
```bash
gcloud compute instances stop medicalink-vm --zone=asia-southeast1-a && gcloud compute instances set-machine-type medicalink-vm --machine-type=e2-standard-2 --zone=asia-southeast1-a && gcloud compute instances start medicalink-vm --zone=asia-southeast1-a
```

### Disk Full

**Trên VM (kiểm tra và clean):**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes -f

# Resize filesystem (sau khi tăng disk size)
sudo resize2fs /dev/sda1
```

**Từ máy local - tăng disk (PowerShell):**
```powershell
# Increase disk size
gcloud compute disks resize medicalink-vm --size=100GB --zone=asia-southeast1-a
```

**Linux/macOS:**
```bash
gcloud compute disks resize medicalink-vm --size=100GB --zone=asia-southeast1-a
```

---

## 💰 Chi Phí Ước Tính

| Resource | Spec | Price/Month |
|----------|------|-------------|
| VM (e2-medium) | 2 vCPU, 4GB RAM | $24 |
| Disk (50GB SSD) | 50GB | $9 |
| Network Egress | ~100GB | $12 |
| **Total** | | **~$45/month** |

**Lưu ý:** Sử dụng free tier $300 credit của GCP trong 90 ngày đầu.

---

## 🔥 Quick Commands Reference

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
docker compose -f docker-compose.prod.yml restart

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check status
docker ps

# Update code
git pull && pnpm install && pnpm run build && docker compose -f docker-compose.prod.yml up -d --build

# Backup database
docker exec medicalink-postgres pg_dump -U medicalink medicalink > backup.sql

# SSH to VM
gcloud compute ssh medicalink-vm --zone=asia-southeast1-a
```

---

## 📞 Support

- **Documentation:** [docs/](../docs/)
- **Issues:** [GitHub Issues](https://github.com/ldblckrs-258/medicalink-microservice/issues)
- **Email:** support@medicalink.com

---

**✅ Deployment Complete!**

Your MedicaLink application is now running on GCP!

Access at: `http://YOUR_VM_IP` or `https://your-domain.com`

_Last updated: 2025-10-04_
