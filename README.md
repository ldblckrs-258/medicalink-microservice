# MedicaLink Microservices

A comprehensive microservices-based medical appointment booking system built with NestJS, Prisma, PostgreSQL, and Redis.

## 🏗️ Architecture

This system is built following microservices architecture with 5 core services:

1. **Accounts & Identity Service** - User authentication, staff accounts, and patient profiles
2. **Provider Directory Service** - Doctor profiles, specialties, work locations, and schedules
3. **Booking & Appointments Service** - Appointment booking, scheduling, and management
4. **Content & Community Service** - Blogs, Q&A, and reviews
5. **Notification & Communications Service** - Email, SMS, and push notifications

## 🛠️ Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Cache/Message Broker**: Redis
- **Authentication**: JWT
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📁 Project Structure

```
medicalink-microservice/
├── apps/
│   ├── api-gateway/                 # API Gateway (BFF)
│   ├── accounts-service/            # Authentication & User Management
│   ├── provider-directory-service/  # Doctors & Schedules
│   ├── booking-service/             # Appointments & Booking
│   ├── content-service/             # Blogs, Q&A, Reviews
│   └── notification-service/        # Notifications
├── libs/
│   ├── contracts/               # Shared types and events
│   ├── domain-errors/           # Shared error definitions
│   ├── error-adapters/          # Shared error handling
│   ├── redis/                   # Redis client and utilities
│   └── repositories/            # Shared base repositories
├── docs/                        # Documentation
├── docker-compose.yml           # Development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicalink-microservice
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URLs and configuration.

4. **Run setup script (Windows)**
   ```bash
   pnpm run setup
   ```

   Or manually:
   ```bash
   # Start infrastructure
   docker-compose up -d postgres redis
   
   # Generate Prisma clients
   pnpm run prisma:generate
   
   # Push database schemas
   pnpm run prisma:push
   ```

### Development

**Start all services**
```bash
pnpm run dev
```

**Start individual services**
```bash
pnpm run start:accounts      # Accounts Service
pnpm run start:provider      # Provider Directory Service  
pnpm run start:booking       # Booking Service
pnpm run start:content       # Content Service
pnpm run start:notification  # Notification Service
pnpm run start:gateway       # API Gateway
```

**Database management**
```bash
# View database in Prisma Studio
cd apps/accounts-service && npx prisma studio

# Reset database
cd apps/accounts-service && npx prisma db push --force-reset
```

## 🗄️ Database Structure

All services share a single PostgreSQL database with schema separation:

- `accounts` schema - Staff accounts and patient profiles
- `provider` schema - Doctors, specialties, locations, schedules
- `booking` schema - Appointments and booking management
- `content` schema - Blogs, questions, answers, reviews
- `notification` schema - Notification templates and deliveries

This approach reduces costs while maintaining logical separation between services.

## 🔌 Service Communication

- **Inter-service communication**: Redis-based message broker
- **Client communication**: REST API through API Gateway
- **Events**: Async event-driven architecture
- **Caching**: Redis for frequently accessed data

## 📡 API Endpoints

### API Gateway (Port 3000)
- `POST /auth/login` - Staff login
- `GET /doctors` - List doctors
- `POST /appointments` - Book appointment
- `GET /blogs` - List blog posts
- And more...

### Service Ports (Internal)
- Accounts Service: 3001
- Provider Directory: 3002
- Booking Service: 3003
- Content Service: 3004
- Notification Service: 3005

## 🐳 Docker Support

**Development with Docker**
```bash
docker-compose up -d          # Start infrastructure only
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

## 🔧 Configuration

Key environment variables: Read the `.env.example` file.

## 🧪 Testing

```bash
pnpm test              # Unit tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage
pnpm test:e2e          # End-to-end tests
```

## 📚 Documentation

See the `docs/` directory for detailed documentation:

- [Microservice Architecture](docs/microservice.md)
- [Database ERD](docs/ERD.md)
- [Requirements](docs/requirement.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `docs/`

---

**Built with ❤️ for modern healthcare solutions**