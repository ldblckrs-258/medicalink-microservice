# Hướng Dẫn Deploy MedicaLink Microservices Lên Google Cloud Platform

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Yêu Cầu Trước Khi Deploy](#2-yêu-cầu-trước-khi-deploy)
3. [Lựa Chọn Phương Án Deploy](#3-lựa-chọn-phương-án-deploy)
4. [Phương Án 1: Deploy Trên VM (Compute Engine)](#4-phương-án-1-deploy-trên-vm-compute-engine)
5. [Phương Án 2: Deploy Với Cloud Run](#5-phương-án-2-deploy-với-cloud-run)
6. [Phương Án 3: Deploy Với GKE (Kubernetes)](#6-phương-án-3-deploy-với-gke-kubernetes)
7. [Cấu Hình Database & Cache](#7-cấu-hình-database--cache)
8. [Cấu Hình Domain & SSL](#8-cấu-hình-domain--ssl)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Bảo Mật & Best Practices](#11-bảo-mật--best-practices)
12. [Chi Phí Ước Tính](#12-chi-phí-ước-tính)

---

## 1. Tổng Quan Kiến Trúc

### Kiến Trúc Hệ Thống Hiện Tại
```
Client (Web/Mobile)
        ↓
    Nginx (Load Balancer)
        ↓
    API Gateway (Port 3000)
        ↓
    RabbitMQ (Message Broker)
        ↓
Microservices:
├── Accounts Service (Port 3001)
├── Provider Directory Service (Port 3002)
├── Booking Service (Port 3003)
├── Content Service (Port 3004)
├── Notification Service (Port 3005)
└── Orchestrator Service
        ↓
    ┌─────────┴─────────┐
PostgreSQL           Redis
```

### Kiến Trúc Deploy Trên GCP (Khuyến Nghị)
```
Internet
    ↓
Cloud Load Balancer (HTTP(S))
    ↓
Cloud Armor (WAF)
    ↓
┌──────────────────────────────────┐
│  Cloud Run / GKE / Compute Engine │
│  ├── API Gateway                  │
│  ├── Accounts Service             │
│  ├── Provider Service             │
│  ├── Booking Service              │
│  ├── Content Service              │
│  ├── Notification Service         │
│  └── Orchestrator Service         │
└──────────────────────────────────┘
    ↓                    ↓
Cloud SQL           Memorystore
(PostgreSQL)        (Redis)
    ↓
Cloud Pub/Sub (thay RabbitMQ - optional)
```

---

## 2. Yêu Cầu Trước Khi Deploy

### 2.1. Tài Khoản & Công Cụ
- [ ] Tài khoản Google Cloud Platform (có thể dùng free tier $300)
- [ ] Cài đặt Google Cloud SDK (`gcloud`)
- [ ] Cài đặt `kubectl` (nếu dùng GKE)
- [ ] Cài đặt Docker
- [ ] Cài đặt `terraform` (optional - Infrastructure as Code)

### 2.2. Cài Đặt Google Cloud SDK

**Windows (PowerShell):**
```powershell
# Download và cài đặt
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Khởi tạo
gcloud init
gcloud auth login
gcloud auth application-default login
```

### 2.3. Tạo Project & Enable APIs
```bash
# Tạo project mới
gcloud projects create medicalink-prod --name="MedicaLink Production"

# Set project hiện tại
gcloud config set project medicalink-prod

# Enable các APIs cần thiết
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
```

---

## 3. Lựa Chọn Phương Án Deploy

| Phương Án | Ưu Điểm | Nhược Điểm | Chi Phí/Tháng | Phù Hợp |
|-----------|---------|------------|---------------|---------|
| **Compute Engine (VM)** | - Setup đơn giản<br>- Kiểm soát cao<br>- Giống môi trường local | - Phải quản lý infra<br>- Scale thủ công | ~$50-100 | Dev/Staging, MVP |
| **Cloud Run** | - Serverless, auto-scale<br>- Pay-per-use<br>- Zero ops | - Cold start<br>- Stateless only<br>- Container limits | ~$20-80 | Production, cost-sensitive |
| **GKE (Kubernetes)** | - Auto-scale<br>- High availability<br>- Production-grade | - Phức tạp<br>- Cần kiến thức K8s<br>- Chi phí cao | ~$150-300 | Large-scale, enterprise |

**Khuyến nghị:**
- **MVP/Testing:** Compute Engine (đơn giản nhất)
- **Production nhỏ:** Cloud Run (tiết kiệm chi phí)
- **Production lớn:** GKE (scalable, reliable)

---

## 4. Phương Án 1: Deploy Trên VM (Compute Engine)

### 4.1. Tạo VM Instance

```bash
# Tạo VM với Docker pre-installed
gcloud compute instances create medicalink-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
    # Install Docker Compose
    mkdir -p /opt/medicalink
    cd /opt/medicalink
  '
```

### 4.2. Cấu Hình Firewall

```bash
# Allow HTTP/HTTPS
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server,https-server

# Allow application ports (optional, for debugging)
gcloud compute firewall-rules create allow-app-ports \
  --allow tcp:3000-3005 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

### 4.3. SSH Vào VM & Deploy

```bash
# SSH vào VM
gcloud compute ssh medicalink-vm --zone=us-central1-a

# Trong VM:
# Clone repository
git clone https://github.com/your-username/medicalink-microservice.git
cd medicalink-microservice

# Tạo .env file
cat > .env << 'EOF'
# Database (sẽ cấu hình Cloud SQL sau)
DATABASE_URL=postgresql://user:password@/medicalink?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME

# Redis (sẽ cấu hình Memorystore sau)
REDIS_HOST=10.x.x.x
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@localhost:5672

# JWT
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# Services
API_GATEWAY_PORT=3000
NODE_ENV=production
SERVICE_NAME=medicalink

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

# Build và start services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4.4. Script Tự Động Deploy

File đã có sẵn: `deployment/deploy-gcp.sh` - chạy:

```bash
# Từ máy local
export PROJECT_ID=medicalink-prod
export REGION=us-central1
export ZONE=us-central1-a

chmod +x deployment/deploy-gcp.sh
./deployment/deploy-gcp.sh deploy
```

---

## 5. Phương Án 2: Deploy Với Cloud Run

### 5.1. Tạo Artifact Registry

```bash
# Tạo Docker registry
gcloud artifacts repositories create medicalink-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="MedicaLink Docker images"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 5.2. Build & Push Docker Images

Tạo file `deployment/build-and-push.sh`:

```bash
#!/bin/bash

PROJECT_ID="medicalink-prod"
REGION="us-central1"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/medicalink-repo"

# Build base image
docker build -t ${REGISTRY}/medicalink-base:latest -f Dockerfile .

# Push
docker push ${REGISTRY}/medicalink-base:latest

echo "✅ Images pushed successfully!"
```

### 5.3. Deploy Services Lên Cloud Run

Tạo file `deployment/deploy-cloud-run.sh`:

```bash
#!/bin/bash

PROJECT_ID="medicalink-prod"
REGION="us-central1"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/medicalink-repo"

# Common environment variables
ENV_VARS="NODE_ENV=production,SERVICE_NAME=medicalink"
ENV_VARS="${ENV_VARS},DATABASE_URL=${DATABASE_URL}"
ENV_VARS="${ENV_VARS},REDIS_HOST=${REDIS_HOST}"
ENV_VARS="${ENV_VARS},RABBITMQ_URL=${RABBITMQ_URL}"
ENV_VARS="${ENV_VARS},JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}"
ENV_VARS="${ENV_VARS},JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}"

# Deploy API Gateway
gcloud run deploy api-gateway \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3000 \
  --set-env-vars "${ENV_VARS},API_GATEWAY_PORT=3000" \
  --command "node" \
  --args "dist/apps/api-gateway/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Accounts Service
gcloud run deploy accounts-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3001 \
  --set-env-vars "${ENV_VARS},ACCOUNTS_SERVICE_PORT=3001" \
  --command "node" \
  --args "dist/apps/accounts-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Provider Directory Service
gcloud run deploy provider-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3002 \
  --set-env-vars "${ENV_VARS},PROVIDER_SERVICE_PORT=3002" \
  --command "node" \
  --args "dist/apps/provider-directory-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Booking Service
gcloud run deploy booking-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3003 \
  --set-env-vars "${ENV_VARS},BOOKING_SERVICE_PORT=3003" \
  --command "node" \
  --args "dist/apps/booking-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Content Service
gcloud run deploy content-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3004 \
  --set-env-vars "${ENV_VARS},CONTENT_SERVICE_PORT=3004" \
  --command "node" \
  --args "dist/apps/content-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Notification Service
gcloud run deploy notification-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --port 3005 \
  --set-env-vars "${ENV_VARS},NOTIFICATION_SERVICE_PORT=3005" \
  --command "node" \
  --args "dist/apps/notification-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

# Deploy Orchestrator Service
gcloud run deploy orchestrator-service \
  --image ${REGISTRY}/medicalink-base:latest \
  --region ${REGION} \
  --platform managed \
  --set-env-vars "${ENV_VARS}" \
  --command "node" \
  --args "dist/apps/orchestrator-service/main.js" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --no-allow-unauthenticated \
  --vpc-connector medicalink-vpc-connector

echo "✅ All services deployed to Cloud Run!"
```

**Lưu ý:** Cloud Run có một số hạn chế với RabbitMQ (cần connection pool phức tạp). Khuyến nghị:
- Dùng Cloud Pub/Sub thay RabbitMQ
- Hoặc dùng CloudAMQP (managed RabbitMQ service)
- Hoặc host RabbitMQ trên VM riêng

---

## 6. Phương Án 3: Deploy Với GKE (Kubernetes)

### 6.1. Tạo GKE Cluster

```bash
# Tạo cluster với autopilot (recommended)
gcloud container clusters create-auto medicalink-cluster \
  --region=us-central1 \
  --release-channel=regular

# Hoặc standard cluster (nhiều control hơn)
gcloud container clusters create medicalink-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-2 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade

# Get credentials
gcloud container clusters get-credentials medicalink-cluster \
  --zone=us-central1-a
```

### 6.2. Tạo Kubernetes Manifests

Tạo thư mục `k8s/` với các files:

**k8s/namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: medicalink
```

**k8s/secrets.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: medicalink-secrets
  namespace: medicalink
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@cloud-sql-proxy:5432/medicalink"
  REDIS_HOST: "10.x.x.x"
  REDIS_PORT: "6379"
  RABBITMQ_URL: "amqp://admin:admin123@rabbitmq:5672"
  JWT_ACCESS_SECRET: "your-secret-here"
  JWT_REFRESH_SECRET: "your-secret-here"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_USER: "your-email@gmail.com"
  SMTP_PASS: "your-app-password"
```

**k8s/api-gateway-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: medicalink
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: us-central1-docker.pkg.dev/medicalink-prod/medicalink-repo/medicalink-base:latest
        command: ["node", "dist/apps/api-gateway/main.js"]
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_GATEWAY_PORT
          value: "3000"
        - name: SERVICE_NAME
          value: "medicalink"
        envFrom:
        - secretRef:
            name: medicalink-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: medicalink
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  selector:
    app: api-gateway
```

**Tương tự cho các services khác** (accounts, provider, booking, content, notification, orchestrator)

### 6.3. Deploy Lên GKE

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/accounts-deployment.yaml
kubectl apply -f k8s/provider-deployment.yaml
kubectl apply -f k8s/booking-deployment.yaml
kubectl apply -f k8s/content-deployment.yaml
kubectl apply -f k8s/notification-deployment.yaml
kubectl apply -f k8s/orchestrator-deployment.yaml

# Check status
kubectl get pods -n medicalink
kubectl get services -n medicalink

# Get external IP
kubectl get service api-gateway -n medicalink
```

---

## 7. Cấu Hình Database & Cache

### 7.1. Cloud SQL (PostgreSQL)

```bash
# Tạo Cloud SQL instance
gcloud sql instances create medicalink-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=03 \
  --deletion-protection

# Set root password
gcloud sql users set-password postgres \
  --instance=medicalink-db \
  --password=YOUR_SECURE_PASSWORD

# Tạo database
gcloud sql databases create medicalink \
  --instance=medicalink-db

# Tạo user cho application
gcloud sql users create medicalink \
  --instance=medicalink-db \
  --password=YOUR_APP_PASSWORD

# Get connection name
gcloud sql instances describe medicalink-db --format="get(connectionName)"
# Output: medicalink-prod:us-central1:medicalink-db
```

**Connection từ VM:**
```bash
# Cài Cloud SQL Proxy
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# Run proxy
./cloud_sql_proxy -instances=medicalink-prod:us-central1:medicalink-db=tcp:5432 &

# Connection string
DATABASE_URL=postgresql://medicalink:password@localhost:5432/medicalink
```

**Connection từ Cloud Run/GKE:**
- Dùng Cloud SQL Proxy sidecar container
- Hoặc dùng Unix socket: `/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`

### 7.2. Memorystore (Redis)

```bash
# Tạo Redis instance
gcloud redis instances create medicalink-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --network=default \
  --connect-mode=DIRECT_PEERING

# Get connection info
gcloud redis instances describe medicalink-redis \
  --region=us-central1 \
  --format="get(host,port)"

# Output: 10.x.x.x, 6379
```

**Update .env:**
```bash
REDIS_HOST=10.x.x.x
REDIS_PORT=6379
```

### 7.3. Message Broker Options

**Option 1: Self-hosted RabbitMQ trên VM**
```bash
# Trong docker-compose.prod.yml đã có RabbitMQ
# Expose port và connect từ các services
```

**Option 2: CloudAMQP (Managed RabbitMQ)**
```bash
# Sign up tại cloudamqp.com
# Get connection URL
RABBITMQ_URL=amqps://user:pass@your-instance.cloudamqp.com/vhost
```

**Option 3: Cloud Pub/Sub (Khuyến nghị cho GCP)**

Cần refactor code để dùng Pub/Sub thay RabbitMQ:

```typescript
// libs/pubsub/pubsub.service.ts
import { PubSub } from '@google-cloud/pubsub';

export class PubSubService {
  private pubsub = new PubSub();

  async publish(topic: string, data: any) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    await this.pubsub.topic(topic).publish(dataBuffer);
  }

  async subscribe(subscription: string, handler: (data: any) => void) {
    this.pubsub
      .subscription(subscription)
      .on('message', (message) => {
        handler(JSON.parse(message.data.toString()));
        message.ack();
      });
  }
}
```

---

## 8. Cấu Hình Domain & SSL

### 8.1. Reserve Static IP

```bash
# Cho Compute Engine
gcloud compute addresses create medicalink-ip \
  --region=us-central1

# Cho Load Balancer (global)
gcloud compute addresses create medicalink-lb-ip \
  --global

# Get IP
gcloud compute addresses describe medicalink-lb-ip \
  --global \
  --format="get(address)"
```

### 8.2. Cấu Hình DNS

Tại nhà cung cấp domain (GoDaddy, Namecheap, etc.):

```
Type    Name    Value               TTL
A       @       35.x.x.x            300
A       api     35.x.x.x            300
CNAME   www     medicalink.com      300
```

### 8.3. SSL Certificate

**Option 1: Let's Encrypt (Free)**

```bash
# Cài Certbot trên VM
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d medicalink.com -d www.medicalink.com

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

**Option 2: Google-managed SSL (cho Load Balancer)**

```bash
gcloud compute ssl-certificates create medicalink-ssl \
  --domains=medicalink.com,www.medicalink.com \
  --global
```

### 8.4. Cấu Hình Load Balancer với SSL

```bash
# Tạo backend service
gcloud compute backend-services create medicalink-backend \
  --protocol=HTTP \
  --port-name=http \
  --health-checks=medicalink-health-check \
  --global

# Tạo URL map
gcloud compute url-maps create medicalink-lb \
  --default-service=medicalink-backend

# Tạo target HTTPS proxy
gcloud compute target-https-proxies create medicalink-https-proxy \
  --url-map=medicalink-lb \
  --ssl-certificates=medicalink-ssl

# Tạo forwarding rule
gcloud compute forwarding-rules create medicalink-https-rule \
  --address=medicalink-lb-ip \
  --target-https-proxy=medicalink-https-proxy \
  --ports=443 \
  --global
```

---

## 9. Monitoring & Logging

### 9.1. Cloud Logging

```bash
# View logs từ Cloud Run/GKE
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-gateway" \
  --limit 50 \
  --format json

# Tạo log-based metric
gcloud logging metrics create error_count \
  --description="Count of error logs" \
  --log-filter='severity>=ERROR'
```

### 9.2. Cloud Monitoring

```bash
# Tạo uptime check
gcloud monitoring uptime-checks create medicalink-uptime \
  --resource-type=uptime-url \
  --host=medicalink.com \
  --path=/health \
  --check-interval=60

# Tạo alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

### 9.3. Application Performance Monitoring

Cài đặt Google Cloud Trace trong code:

```typescript
// main.ts
import { TraceAgent } from '@google-cloud/trace-agent';
TraceAgent.start();

// Hoặc dùng OpenTelemetry
import { NodeTracerProvider } from '@opentelemetry/node';
const provider = new NodeTracerProvider();
provider.register();
```

---

## 10. CI/CD Pipeline

### 10.1. Cloud Build Setup

Tạo file `cloudbuild.yaml`:

```yaml
steps:
  # Install dependencies
  - name: 'node:20'
    entrypoint: npm
    args: ['install', '-g', 'pnpm']
  
  - name: 'node:20'
    entrypoint: pnpm
    args: ['install', '--frozen-lockfile']
  
  # Generate Prisma clients
  - name: 'node:20'
    entrypoint: pnpm
    args: ['run', 'prisma:generate']
  
  # Build application
  - name: 'node:20'
    entrypoint: pnpm
    args: ['run', 'build']
  
  # Run tests
  - name: 'node:20'
    entrypoint: pnpm
    args: ['test']
  
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/medicalink-repo/medicalink-base:$SHORT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/medicalink-repo/medicalink-base:latest'
      - '-f'
      - 'Dockerfile'
      - '.'
  
  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/medicalink-repo/medicalink-base:$SHORT_SHA'
  
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/medicalink-repo/medicalink-base:latest'
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'api-gateway'
      - '--image'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/medicalink-repo/medicalink-base:$SHORT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

timeout: 1800s
options:
  machineType: 'E2_HIGHCPU_8'
```

### 10.2. GitHub Actions Setup

Tạo file `.github/workflows/deploy-gcp.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

env:
  PROJECT_ID: medicalink-prod
  REGION: us-central1
  REGISTRY: us-central1-docker.pkg.dev

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Generate Prisma clients
        run: pnpm run prisma:generate
      
      - name: Run tests
        run: pnpm test
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGISTRY }}
      
      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/medicalink-repo/medicalink-base:${{ github.sha }} .
          docker tag ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/medicalink-repo/medicalink-base:${{ github.sha }} \
                     ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/medicalink-repo/medicalink-base:latest
      
      - name: Push Docker image
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/medicalink-repo/medicalink-base:${{ github.sha }}
          docker push ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/medicalink-repo/medicalink-base:latest
      
      - name: Deploy to Cloud Run
        run: |
          ./deployment/deploy-cloud-run.sh
```

**Setup GitHub Secrets:**
```bash
# Tạo service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding medicalink-prod \
  --member="serviceAccount:github-actions@medicalink-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding medicalink-prod \
  --member="serviceAccount:github-actions@medicalink-prod.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@medicalink-prod.iam.gserviceaccount.com

# Add to GitHub Secrets as GCP_SA_KEY
```

---

## 11. Bảo Mật & Best Practices

### 11.1. Secret Management

Dùng Secret Manager thay vì environment variables:

```bash
# Tạo secrets
echo -n "your-jwt-secret" | gcloud secrets create jwt-access-secret --data-file=-
echo -n "your-refresh-secret" | gcloud secrets create jwt-refresh-secret --data-file=-
echo -n "postgresql://..." | gcloud secrets create database-url --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding jwt-access-secret \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

**Sử dụng trong code:**
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/jwt-access-secret/versions/latest',
});
const secret = version.payload.data.toString();
```

### 11.2. Network Security

```bash
# Tạo VPC
gcloud compute networks create medicalink-vpc \
  --subnet-mode=custom

# Tạo subnet
gcloud compute networks subnets create medicalink-subnet \
  --network=medicalink-vpc \
  --region=us-central1 \
  --range=10.0.0.0/24

# Cloud SQL private IP
gcloud sql instances patch medicalink-db \
  --network=projects/medicalink-prod/global/networks/medicalink-vpc \
  --no-assign-ip
```

### 11.3. Cloud Armor (WAF)

```bash
# Tạo security policy
gcloud compute security-policies create medicalink-waf \
  --description="WAF for MedicaLink"

# Block specific countries (optional)
gcloud compute security-policies rules create 1000 \
  --security-policy=medicalink-waf \
  --expression="origin.region_code == 'CN'" \
  --action=deny-403

# Rate limiting
gcloud compute security-policies rules create 2000 \
  --security-policy=medicalink-waf \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60

# Attach to backend service
gcloud compute backend-services update medicalink-backend \
  --security-policy=medicalink-waf \
  --global
```

### 11.4. IAM Best Practices

```bash
# Service account cho từng service (principle of least privilege)
gcloud iam service-accounts create api-gateway-sa
gcloud iam service-accounts create accounts-service-sa

# Grant chỉ permissions cần thiết
gcloud projects add-iam-policy-binding medicalink-prod \
  --member="serviceAccount:api-gateway-sa@medicalink-prod.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

---

## 12. Chi Phí Ước Tính

### 12.1. Compute Engine (VM)

| Resource | Spec | Price/Month |
|----------|------|-------------|
| VM (e2-medium) | 2 vCPU, 4GB RAM | $24.27 |
| Disk (50GB SSD) | 50GB | $8.50 |
| Network Egress | ~100GB | $12.00 |
| **Total** | | **~$45/month** |

### 12.2. Cloud Run

| Resource | Usage | Price/Month |
|----------|-------|-------------|
| CPU | 1 vCPU × 1M requests × 200ms | $12.00 |
| Memory | 512MB × 1M requests × 200ms | $1.33 |
| Requests | 1M requests | $0.40 |
| Network Egress | ~50GB | $6.00 |
| **Total** | | **~$20-80/month** |

### 12.3. GKE

| Resource | Spec | Price/Month |
|----------|------|-------------|
| Cluster management | 1 cluster | $74.40 |
| Nodes (3 × e2-standard-2) | 6 vCPU, 12GB RAM | $97.09 |
| Load Balancer | 1 LB | $18.26 |
| Network Egress | ~200GB | $24.00 |
| **Total** | | **~$214/month** |

### 12.4. Shared Resources (Tất Cả Phương Án)

| Resource | Spec | Price/Month |
|----------|------|-------------|
| Cloud SQL (db-f1-micro) | 1 vCPU, 3.75GB RAM | $7.67 |
| Memorystore Redis (1GB) | Basic tier | $21.17 |
| Cloud Storage | 10GB | $0.20 |
| Cloud Logging | 10GB | $5.00 |
| **Total** | | **~$34/month** |

### 12.5. Tổng Chi Phí

- **Compute Engine:** $45 + $34 = **~$79/month**
- **Cloud Run:** $50 + $34 = **~$84/month** (biến động theo traffic)
- **GKE:** $214 + $34 = **~$248/month**

**Khuyến nghị:**
- **Development/Staging:** Compute Engine ($79/month)
- **Production nhỏ (< 1M requests/month):** Cloud Run ($50-150/month)
- **Production lớn (> 5M requests/month):** GKE ($250-500/month)

---

## 🚀 Quick Start Guide

### Bắt Đầu Nhanh (Compute Engine)

```bash
# 1. Clone repository
git clone https://github.com/your-username/medicalink-microservice.git
cd medicalink-microservice

# 2. Set environment
export PROJECT_ID=medicalink-prod
export REGION=us-central1
export ZONE=us-central1-a

# 3. Login GCP
gcloud auth login
gcloud config set project $PROJECT_ID

# 4. Enable APIs
gcloud services enable compute.googleapis.com sqladmin.googleapis.com redis.googleapis.com

# 5. Run deploy script
chmod +x deployment/deploy-gcp.sh
./deployment/deploy-gcp.sh deploy

# 6. Get connection info
./deployment/deploy-gcp.sh info
```

### Bắt Đầu Nhanh (Cloud Run)

```bash
# 1-4: Same as above

# 5. Build & push images
chmod +x deployment/build-and-push.sh
./deployment/build-and-push.sh

# 6. Deploy services
chmod +x deployment/deploy-cloud-run.sh
./deployment/deploy-cloud-run.sh
```

---

## 📞 Support & Troubleshooting

### Common Issues

**1. Cloud SQL Connection Timeout**
```bash
# Check Cloud SQL Proxy
ps aux | grep cloud_sql_proxy

# Restart proxy
pkill cloud_sql_proxy
./cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &
```

**2. RabbitMQ Connection Failed**
```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Check logs
docker logs medicalink-rabbitmq
```

**3. Redis Connection Error**
```bash
# Test Redis connection
redis-cli -h REDIS_IP -p 6379 ping

# Check firewall
gcloud compute firewall-rules list | grep redis
```

### Monitoring Commands

```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# GKE pods
kubectl get pods -n medicalink
kubectl logs -f POD_NAME -n medicalink

# Cloud SQL status
gcloud sql instances describe medicalink-db

# Redis status
gcloud redis instances describe medicalink-redis --region=us-central1
```

---

## 📚 Tài Liệu Tham Khảo

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Memorystore Redis Best Practices](https://cloud.google.com/memorystore/docs/redis/redis-best-practices)

---

**Được xây dựng với ❤️ cho MedicaLink Platform**

_Last updated: 2025-10-04_
