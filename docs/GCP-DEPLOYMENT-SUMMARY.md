# MedicaLink - Google Cloud Platform Deployment

## 📚 Tài Liệu Deploy Đầy Đủ

Hệ thống MedicaLink đã được chuẩn bị đầy đủ để deploy lên Google Cloud Platform với 3 phương án:

1. **Cloud Run** (Serverless, khuyến nghị cho MVP)
2. **Compute Engine** (VM, đơn giản, dễ debug)
3. **Google Kubernetes Engine** (GKE, production-grade, scalable)

## 🚀 Quick Start (5 phút)

### Bước 1: Setup GCP Environment
```bash
# Set project info
export PROJECT_ID=medicalink-prod
export REGION=us-central1

# Login và setup tất cả resources (Cloud SQL, Redis, Artifact Registry)
gcloud auth login
chmod +x deployment/setup-gcp-environment.sh
./deployment/setup-gcp-environment.sh
```

### Bước 2: Build & Deploy
```bash
# Build Docker images
chmod +x deployment/build-and-push.sh
./deployment/build-and-push.sh

# Deploy lên Cloud Run (recommended)
source .env.production
chmod +x deployment/deploy-cloud-run.sh
./deployment/deploy-cloud-run.sh
```

### Bước 3: Verify
```bash
# Get API Gateway URL
GATEWAY_URL=$(gcloud run services describe api-gateway \
  --region=$REGION --format='value(status.url)')

# Test health endpoint
curl $GATEWAY_URL/health

# Test API
curl $GATEWAY_URL/api/specialties
```

## 📁 Cấu Trúc Deployment Files

```
deployment/
├── README.md                      # Quick reference guide
├── DEPLOYMENT-CHECKLIST.md        # Checklist đầy đủ cho deployment
├── setup-gcp-environment.sh       # Setup GCP resources (run once)
├── build-and-push.sh              # Build & push Docker images
├── deploy-cloud-run.sh            # Deploy to Cloud Run
├── deploy-gcp.sh                  # Deploy to Compute Engine
└── deploy-ec2.sh                  # Deploy to AWS (reference)

docs/
└── gcp-deployment-guide.md        # Hướng dẫn chi tiết 200+ pages

k8s/
├── namespace.yaml                 # Kubernetes namespace
├── secrets.yaml                   # Secrets configuration
├── configmap.yaml                 # ConfigMap
├── api-gateway.yaml               # API Gateway deployment
└── accounts-service.yaml          # Accounts service deployment
    # ... other service manifests
```

## 📖 Tài Liệu Chi Tiết

### 1. Hướng Dẫn Deployment Toàn Diện
**File:** [`docs/gcp-deployment-guide.md`](docs/gcp-deployment-guide.md)

Bao gồm:
- Kiến trúc hệ thống trên GCP
- Hướng dẫn setup từng bước cho cả 3 phương án
- Cấu hình Database (Cloud SQL), Cache (Redis), Message Broker
- Setup Domain & SSL
- Monitoring & Logging
- CI/CD với GitHub Actions
- Security best practices
- Chi phí ước tính chi tiết
- Troubleshooting guide

### 2. Quick Reference Guide
**File:** [`deployment/README.md`](deployment/README.md)

Tài liệu tham khảo nhanh với:
- Commands thường dùng
- Troubleshooting tips
- Monitoring commands
- Cost optimization

### 3. Deployment Checklist
**File:** [`deployment/DEPLOYMENT-CHECKLIST.md`](deployment/DEPLOYMENT-CHECKLIST.md)

Checklist đầy đủ từ A-Z:
- Pre-deployment setup
- Infrastructure provisioning
- Application deployment
- Security configuration
- Monitoring setup
- Post-deployment verification
- Maintenance tasks

## 🎯 Phương Án Deploy

### Option 1: Cloud Run (Khuyến Nghị)

**Ưu điểm:**
- Serverless, tự động scale
- Pay-per-use (chỉ trả khi có request)
- Zero ops, không cần quản lý infra
- Deployment đơn giản

**Chi phí:** ~$50-150/tháng (tùy traffic)

**Phù hợp:** MVP, startup, traffic không đều

**Deploy:**
```bash
./deployment/deploy-cloud-run.sh
```

### Option 2: Compute Engine (VM)

**Ưu điểm:**
- Setup đơn giản, dễ hiểu
- Control hoàn toàn
- Giống môi trường local
- Dễ debug

**Chi phí:** ~$80-120/tháng

**Phù hợp:** Dev/Staging, POC, demo

**Deploy:**
```bash
./deployment/deploy-gcp.sh deploy
```

### Option 3: GKE (Kubernetes)

**Ưu điểm:**
- Production-grade
- Auto-scaling
- High availability
- Enterprise features

**Chi phí:** ~$250-400/tháng

**Phù hợp:** Large-scale production, >1M requests/month

**Deploy:**
```bash
# Update k8s/*.yaml với PROJECT_ID
kubectl apply -f k8s/
```

## 🛠️ Scripts Có Sẵn

### 1. Setup GCP Environment
```bash
./deployment/setup-gcp-environment.sh
```
Tạo tất cả GCP resources:
- Cloud SQL (PostgreSQL)
- Memorystore (Redis)
- Artifact Registry
- Secret Manager
- Generate secure secrets
- Tạo file `.env.production`

### 2. Build & Push Images
```bash
./deployment/build-and-push.sh
```
- Build Docker image với multi-stage
- Tag với git SHA và latest
- Push lên Artifact Registry
- Verify upload

### 3. Deploy to Cloud Run
```bash
./deployment/deploy-cloud-run.sh
```
- Setup VPC Connector
- Deploy 7 microservices
- Configure auto-scaling
- Setup IAM permissions
- Test health endpoints

## 📊 Infrastructure Components

### Compute Resources
| Service | Cloud Run | Compute Engine | GKE |
|---------|-----------|----------------|-----|
| API Gateway | ✅ | ✅ | ✅ |
| Accounts Service | ✅ | ✅ | ✅ |
| Provider Service | ✅ | ✅ | ✅ |
| Booking Service | ✅ | ✅ | ✅ |
| Content Service | ✅ | ✅ | ✅ |
| Notification Service | ✅ | ✅ | ✅ |
| Orchestrator Service | ✅ | ✅ | ✅ |

### Shared Services
- **Database:** Cloud SQL (PostgreSQL 15)
- **Cache:** Memorystore (Redis 7)
- **Storage:** Cloud Storage (backups, logs)
- **Registry:** Artifact Registry (Docker images)
- **Networking:** Cloud Load Balancer, Cloud Armor

### Optional Services
- **Message Broker:** CloudAMQP (managed RabbitMQ)
- **Monitoring:** Cloud Monitoring + Logging
- **CDN:** Cloud CDN
- **WAF:** Cloud Armor

## 💰 Chi Phí Ước Tính

### Phương Án 1: Cloud Run
| Resource | Spec | Cost/Month |
|----------|------|------------|
| Cloud Run Services | 7 services, avg traffic | $50-120 |
| Cloud SQL (db-f1-micro) | 1 vCPU, 3.75GB RAM | $8 |
| Memorystore Redis | 1GB | $21 |
| Load Balancer | HTTP(S) | $18 |
| Network Egress | ~50GB | $6 |
| **Total** | | **~$103-173/month** |

### Phương Án 2: Compute Engine
| Resource | Spec | Cost/Month |
|----------|------|------------|
| VM (e2-medium) | 2 vCPU, 4GB RAM | $24 |
| Disk (50GB SSD) | 50GB | $9 |
| Cloud SQL | Same as above | $8 |
| Redis | Same as above | $21 |
| Network | ~100GB | $12 |
| **Total** | | **~$74/month** |

### Phương Án 3: GKE
| Resource | Spec | Cost/Month |
|----------|------|------------|
| Cluster Management | 1 cluster | $74 |
| Nodes (3x e2-standard-2) | 6 vCPU, 12GB RAM | $97 |
| Cloud SQL | Same as above | $8 |
| Redis | Same as above | $21 |
| Load Balancer | Same as above | $18 |
| **Total** | | **~$218/month** |

> **Lưu ý:** Giá trên là ước tính. Chi phí thực tế phụ thuộc vào:
> - Traffic volume
> - Data transfer
> - Storage usage
> - Region selection
> - Reserved instances / committed use

## 🔐 Security Features

- [x] Cloud SQL with private IP
- [x] VPC networking
- [x] Secret Manager for sensitive data
- [x] IAM least privilege principle
- [x] Cloud Armor WAF
- [x] SSL/TLS certificates
- [x] Security headers (nginx)
- [x] Rate limiting
- [x] Audit logging

## 📈 Monitoring & Logging

### Cloud Logging
```bash
# View logs
gcloud logging read "severity>=ERROR" --limit 50

# Service-specific logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-gateway"
```

### Cloud Monitoring
```bash
# List dashboards
gcloud monitoring dashboards list

# Create uptime check
gcloud monitoring uptime-checks create medicalink-health \
  --resource-type=uptime-url \
  --host=YOUR_DOMAIN \
  --path=/health
```

### Alerts
- High error rate (>5%)
- High CPU usage (>80%)
- High memory usage (>85%)
- Service unavailable
- Database connection errors

## 🔄 CI/CD Integration

### GitHub Actions
File có sẵn: `.github/workflows/deploy-gcp.yml`

Workflow tự động:
1. Run tests
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run/GKE
5. Verify deployment
6. Notify team

### Setup
```bash
# Create service account
gcloud iam service-accounts create github-actions

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Create key và add to GitHub Secrets
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

## 🆘 Troubleshooting

### Common Issues

**1. Cloud SQL Connection Failed**
```bash
# Check Cloud SQL Proxy
ps aux | grep cloud_sql_proxy

# Restart proxy
./cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &
```

**2. Service Won't Start**
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR"

# Check environment variables
gcloud run services describe SERVICE_NAME --format=yaml
```

**3. Out of Memory**
```bash
# Increase memory limit
gcloud run services update SERVICE_NAME --memory 1Gi
```

## 📞 Support & Resources

- **Full Guide:** [docs/gcp-deployment-guide.md](docs/gcp-deployment-guide.md)
- **Quick Ref:** [deployment/README.md](deployment/README.md)
- **Checklist:** [deployment/DEPLOYMENT-CHECKLIST.md](deployment/DEPLOYMENT-CHECKLIST.md)
- **GCP Console:** https://console.cloud.google.com
- **GCP Documentation:** https://cloud.google.com/docs

## 🎓 Learning Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Architecture Center](https://cloud.google.com/architecture)

---

## Next Steps

1. ✅ Review [docs/gcp-deployment-guide.md](docs/gcp-deployment-guide.md)
2. ✅ Follow [deployment/DEPLOYMENT-CHECKLIST.md](deployment/DEPLOYMENT-CHECKLIST.md)
3. ✅ Run `./deployment/setup-gcp-environment.sh`
4. ✅ Build & Deploy với scripts
5. ✅ Configure domain & SSL
6. ✅ Setup monitoring & alerts
7. ✅ Run tests & verify

---

**Built with ❤️ for MedicaLink Platform**

_Last updated: 2025-10-04_
