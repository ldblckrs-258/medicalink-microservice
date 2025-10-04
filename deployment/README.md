# MedicaLink - GCP Deployment Quick Reference

## 📚 Tài Liệu Chi Tiết
Xem file đầy đủ: [docs/gcp-deployment-guide.md](../docs/gcp-deployment-guide.md)

## 🚀 Deployment Nhanh

### 1. Setup Môi Trường (Lần Đầu)

```bash
# Set project ID
export PROJECT_ID=medicalink-prod
export REGION=us-central1

# Login GCP
gcloud auth login
gcloud config set project $PROJECT_ID

# Chạy script setup (tạo Cloud SQL, Redis, Artifact Registry, etc.)
chmod +x deployment/setup-gcp-environment.sh
./deployment/setup-gcp-environment.sh

# Kết quả: file .env.production sẽ được tạo
```

### 2. Build & Push Images

```bash
# Build và push Docker images lên Artifact Registry
chmod +x deployment/build-and-push.sh
./deployment/build-and-push.sh
```

### 3. Deploy

#### Option A: Cloud Run (Khuyến nghị cho MVP)

```bash
# Load environment variables
source .env.production

# Deploy tất cả services
chmod +x deployment/deploy-cloud-run.sh
./deployment/deploy-cloud-run.sh
```

#### Option B: Compute Engine (VM)

```bash
# Deploy lên VM
chmod +x deployment/deploy-gcp.sh
./deployment/deploy-gcp.sh deploy

# Xem thông tin kết nối
./deployment/deploy-gcp.sh info
```

#### Option C: GKE (Kubernetes)

```bash
# Tạo GKE cluster
gcloud container clusters create-auto medicalink-cluster \
  --region=$REGION

# Get credentials
gcloud container clusters get-credentials medicalink-cluster \
  --region=$REGION

# Update k8s manifests với PROJECT_ID của bạn
# Sau đó deploy:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/accounts-service.yaml
# ... các services khác

# Check status
kubectl get pods -n medicalink
kubectl get svc -n medicalink
```

## 📝 Scripts Có Sẵn

| Script | Mô Tả | Sử Dụng |
|--------|-------|---------|
| `setup-gcp-environment.sh` | Setup toàn bộ GCP resources | `./deployment/setup-gcp-environment.sh` |
| `build-and-push.sh` | Build & push Docker images | `./deployment/build-and-push.sh` |
| `deploy-cloud-run.sh` | Deploy lên Cloud Run | `./deployment/deploy-cloud-run.sh` |
| `deploy-gcp.sh` | Deploy lên Compute Engine | `./deployment/deploy-gcp.sh deploy` |

## 🔧 Configuration Files

- `.env.production` - Environment variables (được tạo tự động)
- `k8s/*.yaml` - Kubernetes manifests
- `docker-compose.prod.yml` - Docker Compose production
- `Dockerfile` - Multi-stage production Dockerfile

## 🌐 Sau Khi Deploy

### Kiểm Tra Health

```bash
# Cloud Run
GATEWAY_URL=$(gcloud run services describe api-gateway \
  --region=$REGION --format='value(status.url)')
curl $GATEWAY_URL/health

# GKE
kubectl get svc api-gateway -n medicalink
# Lấy EXTERNAL-IP và test
curl http://EXTERNAL-IP/health
```

### Run Migrations & Seeds

```bash
# SSH vào VM hoặc exec vào pod
kubectl exec -it POD_NAME -n medicalink -- bash

# Trong container:
cd apps/accounts-service
npx prisma migrate deploy
npx prisma db seed
```

### View Logs

```bash
# Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# GKE
kubectl logs -f deployment/api-gateway -n medicalink
```

## 📊 Monitoring

```bash
# View metrics
gcloud monitoring dashboards list

# View logs
gcloud logging read "severity>=ERROR" --limit 50

# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate"
```

## 🔒 Security

### Update Secrets

```bash
# Cloud Run
gcloud run services update api-gateway \
  --update-env-vars JWT_ACCESS_SECRET=new-secret

# GKE
kubectl create secret generic medicalink-secrets \
  --from-literal=JWT_ACCESS_SECRET=new-secret \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/api-gateway -n medicalink
```

### Setup SSL

```bash
# Reserve static IP
gcloud compute addresses create medicalink-ip --global

# Create SSL certificate
gcloud compute ssl-certificates create medicalink-ssl \
  --domains=medicalink.com,www.medicalink.com \
  --global

# Map domain to Cloud Run
gcloud run domain-mappings create \
  --service=api-gateway \
  --domain=api.medicalink.com \
  --region=$REGION
```

## 🧹 Cleanup Resources

```bash
# Cloud Run
gcloud run services delete api-gateway --region=$REGION
# ... delete other services

# Compute Engine
./deployment/deploy-gcp.sh cleanup

# GKE
gcloud container clusters delete medicalink-cluster --region=$REGION

# Shared resources
gcloud sql instances delete medicalink-db
gcloud redis instances delete medicalink-redis --region=$REGION
```

## 💰 Chi Phí

### Ước Tính Hàng Tháng

- **Cloud Run:** ~$50-150 (tùy traffic)
- **Compute Engine:** ~$80-120
- **GKE:** ~$250-400
- **Shared (DB + Redis):** ~$35

### Giảm Chi Phí

1. Dùng Cloud Run với min-instances=0
2. Dùng db-f1-micro cho Cloud SQL (dev/staging)
3. Schedule VM stop khi không dùng
4. Optimize Docker image size
5. Enable Cloud CDN cho static assets

## 🆘 Troubleshooting

### Cloud SQL Connection Error
```bash
# Check Cloud SQL Proxy
ps aux | grep cloud_sql_proxy

# Restart proxy
./cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &
```

### Service Not Starting
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR"

# Check env vars
gcloud run services describe api-gateway --format=yaml
```

### Out of Memory
```bash
# Increase memory limit
gcloud run services update api-gateway \
  --memory 1Gi \
  --region=$REGION
```

## 📞 Support

- Xem docs chi tiết: [gcp-deployment-guide.md](../docs/gcp-deployment-guide.md)
- GCP Issues: [Google Cloud Console](https://console.cloud.google.com)
- Application Issues: Check application logs

---

**MedicaLink Platform - Production Deployment**
