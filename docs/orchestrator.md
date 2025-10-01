# Orchestrator Service

This document explains the design, responsibilities and usage of the Orchestrator Service in the MedicaLink microservices system.

## Overview

The Orchestrator Service is responsible for coordinating long running business processes (command orchestration) across multiple domain services and for implementing read composition (BFF-style aggregation) with caching. It uses RabbitMQ for inter-service communication and Redis for caching aggregated read results.

Primary responsibilities:
- Command orchestration using a Saga-style pattern for multi-step operations (e.g., doctor creation)
- Read composition: aggregate data from `accounts-service` and `provider-directory-service` and return a consolidated DTO
- Cache aggregated read results and invalidate cache on domain events
- Provide message patterns for API Gateway to call (no HTTP controller for direct user traffic)

## Architecture

- Message broker: RabbitMQ (NestJS ClientProxy, message patterns)
- Cache: Redis (CacheService wrapper around Redis client)
- Shared types/events: `libs/contracts`
- Database access: Each service manages its own database; Orchestrator must not access other services' DBs directly

Components:
- `saga/` - Saga base classes and helpers
- `command-orchestration/` - Orchestrator-specific flows (e.g., doctor creation)
- `read-composition/` - DTOs and services that fetch and merge data from multiple services
- `event-handlers/` - Event listeners to invalidate caches
- `clients/` - ClientProxy providers for inter-service RPC
- `cache/` - CacheService with typed get/set/invalidate methods

## Message Patterns

Command patterns (examples):
- `orchestrator.doctor.create` — payload: `CreateDoctorCommandDto` — starts doctor creation saga

Read patterns (examples):
- `orchestrator.doctor.getComposite` — payload: `DoctorCompositeQueryDto` — returns `DoctorCompositeResultDto`
- `orchestrator.doctor.searchComposite` — payload: `DoctorCompositeQueryDto` — returns paginated `DoctorCompositeListResultDto`

Event patterns listened for cache invalidation:
- `doctor.profile.updated`
- `staff.account.updated`

Naming convention: Use `orchestrator.<resource>.<action>` for orchestrator message patterns.

## Saga Pattern (Command Orchestration)

The orchestrator implements a simplified Saga pattern:

- A saga is a sequence of steps (SagaStep) implemented as async operations that call other services via RPC.
- Each step has a compensating action defined; if a downstream step fails, the orchestrator executes compensating actions in reverse order.

Example: Doctor creation saga
1. `createAccount` — call `accounts-service` to create user account
2. `createProfile` — call `provider-directory-service` to create doctor profile
3. `assignPermissions` — call `accounts-service` to assign doctor role/permissions

If `assignPermissions` fails, run compensations:
- `createProfile` compensation: delete doctor profile
- `createAccount` compensation: delete user account

Implementation notes:
- Saga steps are executed sequentially or parallel when safe; compensation is always sequential in reverse order.
- Each saga emits intermediate events/logs for observability
- SagaOrchestrator exposes helpers to build steps and run the saga with timeout and retries

## Read Composition (Aggregation)

Read composition services are optimized for low latency and cache friendly responses.

Flow:
1. Check Redis cache with a deterministic key (based on query DTO)
2. If cache hit, return cached result with `cache: { hit: true, ttl }`
3. If miss, concurrently request data from `accounts-service` and `provider-directory-service` via RPC
4. Merge data into composite DTOs (e.g., combine account.fullName/dob into doctor profile)
5. Store result in cache with TTL (e.g., 120s for lists, 300s for single resources)
6. Return result with `cache: { hit: false, ttl }`

Cache keys and TTL values are defined in `cache/CacheService` and used consistently across read composition methods.

## Shared DTOs & Types

Use `libs/contracts` for shared DTOs and events. Key types used by the orchestrator:
- `PaginationMetadata` — standard pagination metadata
- `PaginatedResponse<T>` — generic paginated response used by services
- `CacheMetadata` — structure containing cache hit and TTL information
- Command and composite DTOs under `read-composition/doctor-composite/dto`

Why: centralizing shared types prevents duplication and guarantees consistent API shapes across services.

## Error Handling & Exceptions

- Business errors propagated from other services are wrapped into domain errors and re-thrown so the gateway and calling services can translate them appropriately.
- Saga failures include root cause message at top-level and saga metadata in details for debugging.
- RpcDomainErrorFilter converts domain errors into `RpcException` with consistent payload shape.

Example error shape:
{
  "message": "validation failed: account.email already exists",
  "details": { "saga": { "step": "createProfile", "state": "compensating" } }
}

## Event-Driven Cache Invalidation

Event handlers listen for domain events and invalidate relevant cache keys. Typical event handlers:
- `DoctorEventHandler` — listens for `doctor.profile.updated` and invalidates cached lists and single items related to that doctor
- `AccountEventHandler` — listens for `staff.account.updated` and invalidates cached composite responses referencing that account

Implementation notes:
- Use key patterns and `invalidatePattern` to drop groups of keys
- Prefer eventual consistency: a small time window where stale data may be served is acceptable

## Testing Checklist

- Unit tests for SagaOrchestrator including compensation flows
- Integration tests: Simulate RPC client responses and verify compensation executes on downstream failure
- E2E tests: API Gateway -> Orchestrator -> Accounts + Provider services (verify rollback)
- Cache tests: Hit/miss scenarios and event-driven invalidation

## Operational Notes

Start commands (root package scripts):
- `pnpm start:orchestrator` — start orchestrator in production mode
- `pnpm run dev:orchestrator` — start orchestrator in dev mode with watch

Environment variables:
- `RABBITMQ_URL`, `REDIS_URL`, `ORCHESTRATOR_PORT`, `ACCOUNTS_SERVICE_CLIENT_OPTIONS`, `PROVIDER_DIRECTORY_CLIENT_OPTIONS`— defined in `.env.example`

Logging & Monitoring:
- Saga steps should be logged with correlation IDs
- Cache metrics (hit/miss) should be emitted to metrics exporter

## How to extend

- Add a new saga flow: create a new folder under `command-orchestration/<flow-name>` with DTOs, a service implementing the steps, and register compensation handlers
- Add new read composer: create DTOs in `read-composition/<resource>/dto`, implement service which uses clients and `CacheService`, and add message patterns to the controller

## Troubleshooting

- "Cannot read properties of undefined (reading 'page')": Check pagination shapes between services — ensure services use `meta: PaginationMetadata`
- Missing data in composite response: Verify RPC client patterns and that `provider-directory-service` returns `isActive=true` for public lists
- Stale cache after update: Ensure event handlers subscribe to `doctor.profile.updated` and call `CacheService.invalidatePattern`

---
Last updated: 2025-10-01
