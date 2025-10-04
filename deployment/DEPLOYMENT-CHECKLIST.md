# MedicaLink GCP Deployment Checklist

## Pre-Deployment (Lần Đầu)

### 1. GCP Account Setup
- [ ] Tạo GCP account (hoặc sử dụng existing)
- [ ] Enable billing (có thể dùng $300 free credit)
- [ ] Tạo project mới: `medicalink-prod`
- [ ] Cài đặt Google Cloud SDK (`gcloud`)
- [ ] Authenticate: `gcloud auth login`

### 2. Local Environment
- [ ] Clone repository
- [ ] Cài đặt dependencies: `pnpm install`
- [ ] Generate Prisma clients: `pnpm run prisma:generate`
- [ ] Run tests: `pnpm test`
- [ ] Build locally: `pnpm run build` (để verify)

### 3. Environment Configuration
- [ ] Chạy setup script: `./deployment/setup-gcp-environment.sh`
- [ ] Review `.env.production` file
- [ ] Update SMTP credentials (Gmail app password)
- [ ] Update Super Admin credentials
- [ ] Setup RabbitMQ (CloudAMQP hoặc self-hosted)
- [ ] Generate secure JWT secrets: `openssl rand -base64 32`

## Infrastructure Setup

### 4. Database (Cloud SQL)
- [ ] Cloud SQL instance created
- [ ] Database `medicalink` created
- [ ] User `medicalink` created with password
- [ ] Connection string saved securely
- [ ] Backup schedule configured (mặc định 3AM)
- [ ] Test connection từ local (qua Cloud SQL Proxy)

### 5. Cache (Memorystore Redis)
- [ ] Redis instance created
- [ ] Connection info (host, port) saved
- [ ] Test connection: `redis-cli -h HOST -p PORT ping`

### 6. Message Broker
**Option A: CloudAMQP (Recommended)**
- [ ] Sign up at cloudamqp.com
- [ ] Create instance (Free tier có sẵn)
- [ ] Get connection URL
- [ ] Update `RABBITMQ_URL` in `.env.production`

**Option B: Self-hosted trên VM**
- [ ] Deploy RabbitMQ container
- [ ] Configure management UI
- [ ] Create vhost và user
- [ ] Setup network security

### 7. Container Registry
- [ ] Artifact Registry repository created
- [ ] Docker authentication configured
- [ ] Test push a dummy image

## Application Deployment

### 8. Build & Push Images
- [ ] Update Dockerfile nếu cần
- [ ] Run build script: `./deployment/build-and-push.sh`
- [ ] Verify images in Artifact Registry
- [ ] Tag images properly (latest, git SHA)

### 9A. Deploy to Cloud Run (Option 1)
- [ ] VPC Connector created
- [ ] Update `.env.production` với actual values
- [ ] Source env: `source .env.production`
- [ ] Run deploy script: `./deployment/deploy-cloud-run.sh`
- [ ] Verify all services deployed
- [ ] Test API Gateway health endpoint
- [ ] Configure IAM permissions cho internal services

### 9B. Deploy to Compute Engine (Option 2)
- [ ] VM instance created
- [ ] Firewall rules configured
- [ ] SSH access working
- [ ] Docker & Docker Compose installed
- [ ] Application files uploaded
- [ ] Run deploy script: `./deployment/deploy-gcp.sh deploy`
- [ ] Test health endpoint

### 9C. Deploy to GKE (Option 3)
- [ ] GKE cluster created
- [ ] `kubectl` configured với cluster credentials
- [ ] Update all k8s/*.yaml files với PROJECT_ID
- [ ] Update secrets.yaml với actual credentials
- [ ] Deploy namespace: `kubectl apply -f k8s/namespace.yaml`
- [ ] Deploy secrets: `kubectl apply -f k8s/secrets.yaml`
- [ ] Deploy configmap: `kubectl apply -f k8s/configmap.yaml`
- [ ] Deploy services: `kubectl apply -f k8s/*.yaml`
- [ ] Verify pods running: `kubectl get pods -n medicalink`
- [ ] Get external IP: `kubectl get svc -n medicalink`

## Database Migration & Seeding

### 10. Initial Setup
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Create super admin account
- [ ] Seed permissions data
- [ ] Seed initial specialties/locations (if needed)
- [ ] Verify database schemas created correctly

### 11. Testing
- [ ] Health check endpoint: `/health`
- [ ] Auth endpoints: `/api/auth/login`
- [ ] Get specialties: `/api/specialties`
- [ ] Get doctors: `/api/doctors`
- [ ] Create test appointment
- [ ] Test notification sending
- [ ] Load test với tool (optional)

## Networking & Security

### 12. Domain & SSL
- [ ] Reserve static IP address
- [ ] Configure DNS A records
- [ ] Request SSL certificate (Let's Encrypt hoặc Google-managed)
- [ ] Map domain to service
- [ ] Verify HTTPS working
- [ ] Configure HTTP to HTTPS redirect

### 13. Security Configuration
- [ ] Setup Cloud Armor (WAF)
- [ ] Configure rate limiting
- [ ] Setup DDoS protection
- [ ] Review IAM permissions (least privilege)
- [ ] Enable audit logging
- [ ] Setup Secret Manager cho sensitive data
- [ ] Configure VPC firewall rules
- [ ] Setup private Google access nếu cần

### 14. Monitoring & Logging
- [ ] Setup Cloud Logging
- [ ] Create log-based metrics
- [ ] Setup Cloud Monitoring dashboards
- [ ] Configure uptime checks
- [ ] Create alert policies:
  - [ ] High error rate (>5%)
  - [ ] High CPU usage (>80%)
  - [ ] High memory usage (>85%)
  - [ ] Service unavailable
  - [ ] Database connection errors
- [ ] Setup notification channels (email, SMS)
- [ ] Configure log retention policies

### 15. Backup & Disaster Recovery
- [ ] Verify automated Cloud SQL backups
- [ ] Test backup restoration process
- [ ] Export database schema to file
- [ ] Backup application configs to Cloud Storage
- [ ] Document recovery procedures
- [ ] Create DR runbook

## CI/CD Setup

### 16. GitHub Actions
- [ ] Create GCP service account for CI/CD
- [ ] Grant necessary IAM roles
- [ ] Create service account key
- [ ] Add key to GitHub Secrets (`GCP_SA_KEY`)
- [ ] Update `.github/workflows/deploy-gcp.yml`
- [ ] Test workflow bằng cách push code
- [ ] Setup branch protection rules

### 17. Cloud Build (Alternative)
- [ ] Connect GitHub repository
- [ ] Configure build triggers
- [ ] Update `cloudbuild.yaml`
- [ ] Test build process
- [ ] Setup approval steps cho production

## Performance Optimization

### 18. Caching Strategy
- [ ] Implement Redis caching cho frequently accessed data
- [ ] Configure cache TTL appropriately
- [ ] Setup cache warming strategy
- [ ] Monitor cache hit rate

### 19. Database Optimization
- [ ] Review and optimize queries
- [ ] Add necessary indexes
- [ ] Configure connection pooling
- [ ] Setup read replicas nếu cần
- [ ] Monitor slow queries

### 20. CDN Setup (Optional)
- [ ] Enable Cloud CDN
- [ ] Configure cache policies
- [ ] Setup custom domain
- [ ] Test CDN performance

## Documentation & Handoff

### 21. Documentation
- [ ] Update README.md
- [ ] Document deployment process
- [ ] Create runbook cho common tasks
- [ ] Document troubleshooting procedures
- [ ] Create architecture diagram
- [ ] Document API endpoints

### 22. Team Handoff
- [ ] Share GCP console access
- [ ] Share credentials securely (1Password, etc.)
- [ ] Train team on deployment process
- [ ] Train team on monitoring tools
- [ ] Share on-call procedures
- [ ] Document escalation paths

## Post-Deployment

### 23. Verification
- [ ] All services running healthy
- [ ] All endpoints responding correctly
- [ ] No errors in logs
- [ ] Monitoring dashboards showing normal metrics
- [ ] SSL certificate valid
- [ ] Domain resolving correctly
- [ ] Email notifications working
- [ ] Database connections stable

### 24. Performance Monitoring
- [ ] Check response times
- [ ] Monitor error rates
- [ ] Monitor resource usage
- [ ] Review cost reports
- [ ] Setup budget alerts

### 25. User Acceptance Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking flow
- [ ] Test notifications
- [ ] Test admin functions
- [ ] Get feedback từ users

## Maintenance Tasks

### 26. Regular Maintenance
- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check resource usage trends
- [ ] Monthly: Review and optimize costs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security alerts
- [ ] Quarterly: Disaster recovery drill
- [ ] Quarterly: Performance audit

### 27. Updates & Patches
- [ ] Setup process cho regular updates
- [ ] Test updates in staging first
- [ ] Schedule maintenance windows
- [ ] Notify users of maintenance
- [ ] Document rollback procedures

## Cost Optimization

### 28. Cost Management
- [ ] Setup billing alerts
- [ ] Review monthly cost reports
- [ ] Optimize instance sizes
- [ ] Use committed use discounts
- [ ] Delete unused resources
- [ ] Implement auto-scaling policies
- [ ] Schedule VM shutdowns khi không dùng

---

## Quick Commands Reference

```bash
# Deploy new version
./deployment/build-and-push.sh
./deployment/deploy-cloud-run.sh

# Check logs
gcloud logging read "severity>=ERROR" --limit 50

# Check service status
gcloud run services list --region=$REGION

# Rollback deployment
gcloud run services update-traffic api-gateway \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=$REGION

# Scale service
gcloud run services update api-gateway \
  --min-instances=2 \
  --max-instances=20 \
  --region=$REGION

# Update environment variable
gcloud run services update api-gateway \
  --update-env-vars NEW_VAR=value \
  --region=$REGION
```

---

**Checklist được cập nhật lần cuối:** 2025-10-04

**Next Review Date:** Monthly
