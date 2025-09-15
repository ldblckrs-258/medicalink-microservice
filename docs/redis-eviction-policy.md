# 🚨 CRITICAL: Redis Production Configuration

## Eviction Policy Configuration

### ⚠️ **IMPORTANT**: Set `maxmemory-policy` to `noeviction`

**Why this is critical for microservices:**
- **Job Queues**: BullMQ jobs stored in Redis must not be evicted
- **Message Broker**: Redis pub/sub and microservice communication data
- **Session Data**: User sessions and authentication tokens
- **Cache Coherency**: Distributed locks and coordination data

### How to Configure:

#### 1. Redis Cloud (Managed Service)
```bash
# In Redis Cloud dashboard, set:
# Configuration > maxmemory-policy = noeviction
```

#### 2. Self-Managed Redis
```bash
# In redis.conf
maxmemory-policy noeviction

# Or via Redis CLI
redis-cli CONFIG SET maxmemory-policy noeviction
redis-cli CONFIG REWRITE  # To persist
```

#### 3. Docker Redis
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory-policy noeviction
```

## Eviction Policy Comparison

| Policy | Use Case | Risk for Microservices |
|--------|----------|----------------------|
| `noeviction` | ✅ **Microservices** | ✅ **SAFE** - Returns error when memory full |
| `volatile-lru` | ❌ Cache-only | ❌ **DANGEROUS** - Can delete job queue data |
| `allkeys-lru` | ❌ Cache-only | ❌ **DANGEROUS** - Can delete any data |
| `volatile-ttl` | ❌ Cache-only | ❌ **DANGEROUS** - Can delete message broker data |

## Memory Management with `noeviction`

When using `noeviction`, implement proper memory management:

### 1. Set Appropriate `maxmemory`
```bash
# Set 80% of available RAM
CONFIG SET maxmemory 1600mb  # For 2GB RAM
```

### 2. Monitor Memory Usage
```bash
# Check memory usage
redis-cli INFO memory

# Key metrics:
# used_memory_human: Current memory usage
# used_memory_peak_human: Peak memory usage
# maxmemory_human: Memory limit
```

### 3. Implement TTL for Cache Data
```typescript
// Set TTL for cache data (not job queues)
await redisService.set('cache:user:123', userData, 3600); // 1 hour TTL

// Job queues should NOT have TTL
await queueService.addEmailJob(jobData); // No TTL - handled by BullMQ
```

## Health Check Integration

Our Redis health check now monitors eviction policy:

```bash
GET /health/redis
```

Response with warning:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "evictionPolicy": "volatile-lru",
  "warning": "Redis eviction policy is 'volatile-lru'. For microservices with job queues, consider using 'noeviction' to prevent data loss."
}
```

## Production Checklist

- [ ] ✅ Set `maxmemory-policy noeviction`
- [ ] ✅ Configure appropriate `maxmemory` (80% of RAM)
- [ ] ✅ Enable TLS (`rediss://`) for Redis Cloud
- [ ] ✅ Set up memory monitoring and alerts
- [ ] ✅ Implement TTL for cache data only
- [ ] ✅ Monitor `/health/redis` endpoint
- [ ] ✅ Set up Redis persistence (RDB + AOF)
- [ ] ✅ Configure proper backup strategy

## Monitoring Commands

```bash
# Check current eviction policy
redis-cli CONFIG GET maxmemory-policy

# Monitor memory usage
redis-cli --latency-history -i 1

# Watch for evicted keys (should be 0 with noeviction)
redis-cli INFO stats | grep evicted

# Monitor queue sizes
redis-cli LLEN bull:email:waiting
redis-cli LLEN bull:notification:waiting
```

## Emergency Response

If Redis memory fills up with `noeviction`:

1. **Scale up Redis memory** (preferred solution)
2. **Clean old completed jobs**:
   ```typescript
   await queueService.cleanEmailQueue();
   await queueService.cleanNotificationQueue();
   ```
3. **Remove old cache data**:
   ```bash
   redis-cli --scan --pattern "medicalink:cache:*" | xargs redis-cli DEL
   ```
4. **Pause job queues temporarily**:
   ```typescript
   await queueService.pauseEmailQueue();
   ```

## Why Not Other Policies?

### `volatile-lru` (Default in many setups)
- ❌ Deletes keys with TTL when memory full
- ❌ Job queue data might have internal TTL from BullMQ
- ❌ Can cause job loss during memory pressure

### `allkeys-lru`
- ❌ Can delete ANY key, including:
  - Active job queues
  - Message broker channels
  - Authentication sessions
  - Distributed locks

### The Solution: `noeviction`
- ✅ Fails fast when memory full
- ✅ Forces proper memory management
- ✅ Prevents silent data loss
- ✅ Alerts you to scale up resources

**Remember**: With microservices, losing data is worse than temporary service unavailability.