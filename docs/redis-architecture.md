# Redis Architecture Implementation

## Overview

This implementation provides a shared Redis module with ioredis for all microservices, featuring:

- **Global Redis Module**: Shared across all services with proper TLS support
- **BullMQ Integration**: For job queues (email, notifications)
- **Rate Limiting**: Distributed rate limiting with Redis
- **Health Checks**: Redis ping/pong endpoint
- **Key Prefixing**: Service-specific key prefixes to avoid conflicts

## Usage Examples

### 1. Basic Cache Operations

```typescript
import { RedisService } from '@app/redis';

@Injectable()
export class SomeService {
  constructor(private readonly redisService: RedisService) {}

  async cacheUserData(userId: string, userData: any): Promise<void> {
    await this.redisService.setJson(`user:${userId}`, userData, 3600); // 1 hour TTL
  }

  async getUserData(userId: string): Promise<any> {
    return await this.redisService.getJson(`user:${userId}`);
  }
}
```

### 2. Job Queue Usage

```typescript
import { QueueService, EmailJobData } from '@app/redis';

@Injectable()
export class NotificationService {
  constructor(private readonly queueService: QueueService) {}

  async sendWelcomeEmail(userEmail: string): Promise<void> {
    const emailJob: EmailJobData = {
      to: userEmail,
      subject: 'Welcome to MedicaLink',
      body: 'Welcome to our platform!',
      template: 'welcome',
    };

    await this.queueService.addEmailJob(emailJob, {
      delay: 5000, // 5 second delay
      priority: 1,
    });
  }
}
```

### 3. Pub/Sub for Real-time Updates

```typescript
import { RedisService } from '@app/redis';

@Injectable()
export class RealtimeService {
  constructor(private readonly redisService: RedisService) {}

  async publishAppointmentUpdate(appointmentId: string, status: string): Promise<void> {
    const message = JSON.stringify({ appointmentId, status, timestamp: Date.now() });
    await this.redisService.publish('appointment:updates', message);
  }

  async subscribeToAppointmentUpdates(): Promise<void> {
    await this.redisService.subscribe('appointment:updates', (message) => {
      const data = JSON.parse(message);
      console.log('Appointment update:', data);
      // Handle the update (emit to WebSocket clients, etc.)
    });
  }
}
```

### 4. Rate Limiting

```typescript
import { RedisService } from '@app/redis';

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    return await this.redisService.isRateLimited(key, 100, 60000); // 100 requests per minute
  }
}
```

### 5. Health Check Usage

Access the health check endpoint:
```
GET /health/redis
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Configuration

For Redis Cloud (recommended for production):
```env
REDIS_URL=rediss://username:password@host:port
SERVICE_NAME=api-gateway  # Different for each service
```

For local Redis:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
SERVICE_NAME=api-gateway
```

## Key Features

### 1. Automatic TLS Detection
- Uses `rediss://` protocol for TLS connections
- Automatic fallback to non-TLS for local development

### 2. Service Key Prefixing
- Each service gets its own key namespace: `{SERVICE_NAME}:`
- Prevents key conflicts between services
- Example: `api-gateway:user:123` vs `accounts-service:user:123`

### 3. Connection Pooling
- Separate connections for cache, pub, and sub operations
- Prevents blocking on long-running operations

### 4. Error Handling & Retries
- Exponential backoff strategy
- Connection timeout protection
- Automatic reconnection

### 5. Job Queue Management
- BullMQ for reliable job processing
- Automatic retry with exponential backoff
- Job cleanup (completed/failed jobs)
- Queue pause/resume functionality

## Production Considerations

1. **Always use TLS** (`rediss://`) for Redis Cloud connections
2. **Set appropriate TTL** for all cached data
3. **Monitor queue sizes** and set up alerts
4. **Use Redis Cluster** for high availability
5. **Regular cleanup** of old jobs and expired keys
6. **Separate Redis instances** for cache vs. queues if needed

## Integration with Existing Services

The Redis module is now integrated into:
- **API Gateway**: Rate limiting, caching, health checks
- **Accounts Service**: Session management, user data caching
- **All Services**: Job queues, pub/sub messaging

Each service maintains its own key namespace to prevent conflicts.