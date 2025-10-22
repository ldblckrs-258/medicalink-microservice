# GitHub Actions CI/CD Setup Guide

## Tổng Quan

Hệ thống CI/CD này sử dụng GitHub Actions để:
- **Build Docker images** trên GitHub-hosted runners (giảm tải cho VM server)
- **Push images** lên GitHub Container Registry (GHCR)
- **Deploy selective** - chỉ build và deploy services có thay đổi
- **Manual trigger** - cho phép deploy bất kỳ service nào theo ý muốn

## Kiến Trúc

```
Developer Push → GitHub Actions → Build on Cloud → Push to GHCR → Deploy to VM
```

### Lợi Ích
- **Giảm 80-90% tải cho VM server** (chỉ pull image và run)
- **Build parallel** trên GitHub infrastructure
- **Selective deployment** tiết kiệm thời gian
- **Manual control** cho từng service

## Setup Requirements

### 1. GitHub Secrets

Cần thiết lập các secrets sau trong GitHub repository:

#### VM Server Secrets
```bash
VM_HOST=your-vm-server-ip-or-domain
VM_USER=your-ssh-username
VM_SSH_KEY=your-private-ssh-key
```

#### Environment Variables
```bash
# Copy từ .env.production
POSTGRES_PASSWORD=your-db-password
RABBITMQ_PASS=your-rabbitmq-password
# ... other environment variables
```

### 2. SSH Key Setup

#### Tạo SSH Key Pair
```bash
# Trên máy local
ssh-keygen -t ed25519 -C "github-actions@medicalink" -f ~/.ssh/medicalink_github_actions

# Copy public key lên VM server
ssh-copy-id -i ~/.ssh/medicalink_github_actions.pub user@your-vm-server
```

#### Cấu hình SSH Key trong GitHub
1. Vào repository → Settings → Secrets and variables → Actions
2. Tạo secret mới:
   - **Name**: `VM_SSH_KEY`
   - **Value**: Nội dung file `~/.ssh/medicalink_github_actions` (private key)

### 3. VM Server Setup

#### Cài đặt Docker và Docker Compose
```bash
# Trên VM server
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

#### Clone Repository
```bash
git clone https://github.com/your-username/medicalink-microservice.git
cd medicalink-microservice
```

#### Tạo Network
```bash
docker network create medicalink-network
```

## Workflows

### 1. Auto Deploy (deploy-staging.yml)

**Trigger**: Push vào branch `staging`

**Quy trình**:
1. Detect changes trong code
2. Build chỉ services có thay đổi
3. Push images lên GHCR
4. Deploy lên VM server

**Manual Trigger**:
- Vào Actions → Deploy to Staging → Run workflow
- Có thể force rebuild tất cả services

### 2. Manual Deploy (manual-deploy-service.yml)

**Trigger**: Manual qua GitHub UI

**Tính năng**:
- Dropdown chọn service cần deploy
- Input image tag (để trống = latest staging)
- Option force rebuild

**Cách sử dụng**:
1. Vào Actions → Manual Deploy Service → Run workflow
2. Chọn service từ dropdown
3. Nhập image tag (optional)
4. Chọn force rebuild nếu cần
5. Click "Run workflow"

### 3. Manual Deploy All (manual-deploy-all.yml)

**Trigger**: Manual qua GitHub UI

**Tính năng**:
- Deploy tất cả services hoặc danh sách tùy chỉnh
- Force rebuild option
- Input image tag

**Cách sử dụng**:
1. Vào Actions → Manual Deploy All Services → Run workflow
2. Nhập image tag (optional)
3. Chọn force rebuild (default: true)
4. Nhập services tùy chỉnh (optional, để trống = all)
5. Click "Run workflow"

### 4. Deploy Existing Images (deploy-existing-images.yml)

**Trigger**: Manual qua GitHub UI

**Tính năng**:
- Deploy từ images đã có sẵn trên GHCR
- Không build, chỉ deploy
- Hữu ích cho rollback hoặc deploy lại

**Cách sử dụng**:
1. Vào Actions → Deploy Existing Images → Run workflow
2. Nhập image tag (required, ví dụ: staging-abc123)
3. Nhập services tùy chỉnh (optional)
4. Click "Run workflow"

## Service Detection Logic

Script `scripts/detect-changes.sh` detect services cần rebuild dựa trên:

```bash
# Thay đổi trong service cụ thể
apps/accounts-service/** → accounts-service
apps/api-gateway/** → api-gateway
apps/booking-service/** → booking-service
apps/content-service/** → content-service
apps/notification-service/** → notification-service
apps/orchestrator-service/** → orchestrator-service
apps/provider-directory-service/** → provider-service

# Thay đổi trong shared libraries → tất cả services
libs/** → all services

# Thay đổi trong deployment configs → tất cả services
deployment/** → all services

# Thay đổi trong root configs → tất cả services
package.json, pnpm-lock.yaml, tsconfig*.json → all services
```

## Image Naming Convention

```
ghcr.io/[github-owner]/medicalink-[service]:[tag]
```

**Ví dụ**:
- `ghcr.io/ldblcks-258/medicalink-accounts-service:staging-abc123`
- `ghcr.io/ldblcks-258/medicalink-api-gateway:staging-latest`

## Deployment Process

### 1. Build Phase
- Build Docker image trên GitHub runner
- Push lên GHCR với tag `staging-{SHA}`
- Tag thêm `staging-latest`

### 2. Deploy Phase
- SSH vào VM server
- Login vào GHCR
- Pull image mới
- Tạo docker-compose override
- Restart service
- Health check

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/medicalink_github_actions user@your-vm-server

# Check SSH key permissions
chmod 600 ~/.ssh/medicalink_github_actions
```

### Docker Login Issues
```bash
# Manual login test
echo $GHCR_TOKEN | docker login ghcr.io -u $GITHUB_OWNER --password-stdin
```

### Service Health Check Failed
```bash
# Check service logs
docker compose -f deployment/docker-compose.accounts.yml logs

# Check service status
docker compose -f deployment/docker-compose.accounts.yml ps
```

### Image Pull Issues
```bash
# Check image exists
docker pull ghcr.io/ldblcks-258/medicalink-accounts-service:staging-latest

# Check GHCR permissions
# Repository → Settings → Actions → General → Workflow permissions
```

## Local Development

### Sử dụng Build Context
```bash
# Local development với build
docker compose -f deployment/docker-compose.yml -f deployment/docker-compose.override.yml up
```

### Sử dụng GHCR Images
```bash
# Production deployment với images từ GHCR
docker compose -f deployment/docker-compose.yml up
```

## Migration từ Deploy Script

### Backup Current Setup
```bash
# Backup current deploy script
cp deployment/deploy.sh deployment/deploy.sh.backup
```

### Test với Service Nhỏ
1. Deploy notification-service trước
2. Verify hoạt động bình thường
3. Rollout cho các services khác

### Keep Emergency Script
- Giữ `deploy.sh` cho emergency manual deployment
- Có thể sử dụng khi GitHub Actions gặp sự cố

## Monitoring

### GitHub Actions
- Vào Actions tab để xem workflow runs
- Check logs nếu có lỗi
- Monitor build times và success rates

### VM Server
```bash
# Check running containers
docker ps

# Check resource usage
docker stats

# Check service health
./deployment/deploy.sh status all
```

## Best Practices

1. **Test trước khi merge** vào staging
2. **Monitor logs** sau mỗi deployment
3. **Keep backup** của deploy script cũ
4. **Regular cleanup** old images trên VM
5. **Document changes** trong commit messages

## Security Notes

- SSH keys được lưu trong GitHub Secrets
- GHCR images private cho repository
- VM server chỉ accessible qua SSH
- Environment variables được bảo mật trong secrets
