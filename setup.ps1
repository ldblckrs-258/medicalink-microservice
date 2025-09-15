# MediLink Microservices Setup Script for Windows

Write-Host "🏥 Setting up MediLink Microservices..." -ForegroundColor Cyan

# Check if Docker is running
try {
  docker info | Out-Null
}
catch {
  Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
  exit 1
}

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "❌ pnpm is not installed. Please install pnpm and try again." -ForegroundColor Red
  exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d postgres redis

Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "🗄️ Generating Prisma clients..." -ForegroundColor Yellow
# Generate Prisma clients for each service
Set-Location apps/accounts-service
npx prisma generate
Set-Location ../..

Set-Location apps/provider-directory-service
npx prisma generate
Set-Location ../..

Set-Location apps/booking-service
npx prisma generate
Set-Location ../..

Set-Location apps/content-service
npx prisma generate
Set-Location ../..

Set-Location apps/notification-service
npx prisma generate
Set-Location ../..

Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
# Run migrations for each service
Set-Location apps/accounts-service
npx prisma db push
Set-Location ../..

Set-Location apps/provider-directory-service
npx prisma db push
Set-Location ../..

Set-Location apps/booking-service
npx prisma db push
Set-Location ../..

Set-Location apps/content-service
npx prisma db push
Set-Location ../..

Set-Location apps/notification-service
npx prisma db push
Set-Location ../..

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start all services:" -ForegroundColor Cyan
Write-Host "   pnpm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start individual services:" -ForegroundColor Cyan
Write-Host "   pnpm run start:accounts" -ForegroundColor White
Write-Host "   pnpm run start:provider" -ForegroundColor White
Write-Host "   pnpm run start:booking" -ForegroundColor White
Write-Host "   pnpm run start:content" -ForegroundColor White
Write-Host "   pnpm run start:notification" -ForegroundColor White
Write-Host "   pnpm run start:gateway" -ForegroundColor White
Write-Host ""
Write-Host "📖 To view Prisma Studio:" -ForegroundColor Cyan
Write-Host "   cd apps/[service-name] && npx prisma studio" -ForegroundColor White