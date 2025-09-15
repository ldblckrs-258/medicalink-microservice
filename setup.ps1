# MedicaLink Microservices Setup Script for Windows
# Enhanced version with cloud deployment support

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

Write-Host "🏥 Setting up MedicaLink Microservices..." -ForegroundColor Cyan

# Function to detect environment
function Get-Environment {
    if ($env:NODE_ENV -eq "production") {
        return "production"
    }
    elseif ($env:NODE_ENV -eq "staging") {
        return "staging"
    }
    elseif (Test-Path "/.dockerenv") {
        return "docker"
    }
    else {
        return "development"
    }
}

# Function to detect cloud provider
function Get-CloudProvider {
    try {
        # Check for AWS EC2
        $awsResponse = Invoke-WebRequest -Uri "http://169.254.169.254/latest/meta-data/instance-id" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($awsResponse.StatusCode -eq 200) {
            return "aws"
        }
    }
    catch { }

    try {
        # Check for Google Cloud
        $gcpResponse = Invoke-WebRequest -Uri "http://metadata.google.internal/computeMetadata/v1/instance/id" -Headers @{"Metadata-Flavor" = "Google"} -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($gcpResponse.StatusCode -eq 200) {
            return "gcp"
        }
    }
    catch { }

    return "local"
}

# Detect environment and cloud
$Environment = Get-Environment
$CloudProvider = Get-CloudProvider

Write-Info "Detected environment: $Environment"
Write-Info "Detected cloud provider: $CloudProvider"

# Check if Docker is running (skip for cloud environments with managed services)
if ($CloudProvider -eq "local" -and $Environment -ne "production") {
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm is not installed. Please install pnpm and try again."
    exit 1
}

Write-Info "Installing dependencies..."
try {
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) {
        throw "pnpm install failed"
    }
}
catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Setup environment file based on detected environment
if (Test-Path ".env.$Environment") {
    Write-Info "Using environment file: .env.$Environment"
    Copy-Item ".env.$Environment" .env -Force
}
elseif (!(Test-Path ".env")) {
    Write-Warning "No environment file found, copying from .env.example"
    Copy-Item .env.example .env -Force
}

# Start infrastructure services for local development
if ($Environment -eq "development" -and $CloudProvider -eq "local") {
    Write-Info "Starting local development services..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    Write-Info "Waiting for services to be ready..."
    Start-Sleep 15
}

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