#!/bin/bash

# MediLink Microservices Setup Script

echo "🏥 Setting up MediLink Microservices..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm and try again."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🗄️ Generating Prisma clients..."
# Generate Prisma clients for each service
cd apps/accounts-service && npx prisma generate && cd ../..
cd apps/provider-directory-service && npx prisma generate && cd ../..
cd apps/booking-service && npx prisma generate && cd ../..
cd apps/content-service && npx prisma generate && cd ../..
cd apps/notification-service && npx prisma generate && cd ../..

echo "🔄 Running database migrations..."
# Run migrations for each service
cd apps/accounts-service && npx prisma db push && cd ../..
cd apps/provider-directory-service && npx prisma db push && cd ../..
cd apps/booking-service && npx prisma db push && cd ../..
cd apps/content-service && npx prisma db push && cd ../..
cd apps/notification-service && npx prisma db push && cd ../..

echo "🌱 Seeding databases (optional)..."
# Add seed commands here if needed

echo "✅ Setup complete!"
echo ""
echo "🚀 To start all services:"
echo "   pnpm run dev"
echo ""
echo "🚀 To start individual services:"
echo "   pnpm run start:accounts"
echo "   pnpm run start:provider"
echo "   pnpm run start:booking"
echo "   pnpm run start:content"
echo "   pnpm run start:notification"
echo "   pnpm run start:gateway"
echo ""
echo "📖 To view Prisma Studio:"
echo "   cd apps/[service-name] && npx prisma studio"