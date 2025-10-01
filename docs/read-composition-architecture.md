# Read Composition Architecture

## Module Structure

```
read-composition/
├── base/
│   ├── base-composite.service.ts    # Abstract base class
│   └── index.ts
├── helpers/
│   ├── composition.helper.ts        # Utility functions
│   └── index.ts
├── doctor-composite/
│   ├── doctor-composite.service.ts  # Concrete implementation
│   ├── doctor-composite.controller.ts
│   ├── doctor-composite.module.ts
│   └── dto/
├── index.ts                          # Public exports
└── README.md                         # Documentation
```

## Class Diagram

```mermaid
classDiagram
    class BaseCompositeService {
        <<abstract>>
        #logger: Logger
        #cacheService: CacheService
        #clientHelper: MicroserviceClientHelper
        #cachePrefix: string
        #listCachePrefix: string
        #defaultCacheTtl: number
        +getCompositeWithCache()
        +searchCompositeWithCache()
        +invalidateEntityCache()
        +invalidateListCache()
        #buildEntityCacheKey()
        #buildListCacheKey()
    }

    class DoctorCompositeService {
        -accountsClient: ClientProxy
        -providerClient: ClientProxy
        +getDoctorComposite()
        +searchDoctorComposites()
        +invalidateDoctorCache()
        +invalidateDoctorListCache()
        -mergeData()
    }

    class CompositionHelper {
        <<static>>
        +safeMerge()
        +extractIds()
        +toMap()
        +filterNulls()
        +mergeArraysByKey()
        +batchArray()
        +createPaginationMeta()
        +retry()
    }

    BaseCompositeService <|-- DoctorCompositeService
    DoctorCompositeService ..> CompositionHelper : uses
```

## Sequence Diagram - Get Single Entity

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as DoctorCompositeService
    participant B as BaseCompositeService
    participant Cache as CacheService
    participant A as AccountsClient
    participant P as ProviderClient

    C->>S: getDoctorComposite(id)
    S->>B: getCompositeWithCache(id, config, merger)
    
    B->>Cache: get(cacheKey)
    alt Cache Hit
        Cache-->>B: cached data
        B-->>S: CompositeResult (cached)
        S-->>C: DoctorCompositeResult
    else Cache Miss
        Cache-->>B: null
        
        par Parallel Fetch
            B->>A: send(DOCTOR_GET_BY_ID)
            B->>P: send(PROFILE_GET_BY_ACCOUNT_ID)
        end
        
        A-->>B: IStaffAccount
        P-->>B: DoctorProfileData
        
        B->>S: merger(account, profile)
        S->>S: mergeData(account, profile)
        S-->>B: DoctorCompositeData
        
        B->>Cache: set(cacheKey, data, ttl)
        B-->>S: CompositeResult (fresh)
        S-->>C: DoctorCompositeResult
    end
```

## Sequence Diagram - Search/List

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as DoctorCompositeService
    participant B as BaseCompositeService
    participant Cache as CacheService
    participant A as AccountsClient
    participant P as ProviderClient

    C->>S: searchDoctorComposites(query)
    S->>B: searchCompositeWithCache(query, config, merger)
    
    B->>Cache: get(cacheKey)
    alt Cache Hit
        Cache-->>B: cached list
        B-->>S: PaginatedCompositeResult (cached)
        S-->>C: DoctorCompositeListResult
    else Cache Miss
        Cache-->>B: null
        
        B->>A: send(DOCTOR_SEARCH, query)
        A-->>B: {data: accounts[], meta: pagination}
        
        alt Has Results
            B->>P: send(PROFILE_GET_BY_ACCOUNT_IDS, ids)
            P-->>B: profiles[]
            
            loop For each account
                B->>S: merger(account, profiles)
                S->>S: mergeData(account, profile)
                S-->>B: DoctorCompositeData | null
            end
            
            B->>Cache: set(cacheKey, result, ttl)
            B-->>S: PaginatedCompositeResult (fresh)
        else No Results
            B->>Cache: set(cacheKey, emptyResult, ttl)
            B-->>S: PaginatedCompositeResult (empty)
        end
        
        S-->>C: DoctorCompositeListResult
    end
```

## Data Flow

```mermaid
graph LR
    A[API Gateway] -->|Message Pattern| B[Orchestrator Controller]
    B -->|Call| C[DoctorCompositeService]
    C -->|Extends| D[BaseCompositeService]
    D -->|Check| E[Cache]
    
    E -->|Miss| F[Parallel Fetch]
    F -->|Pattern 1| G[Accounts Service]
    F -->|Pattern 2| H[Provider Service]
    
    G -->|IStaffAccount| I[Merger]
    H -->|DoctorProfileData| I
    
    I -->|mergeData| J[DoctorCompositeData]
    J -->|Cache| E
    J -->|Return| C
    C -->|Response| B
    B -->|Reply| A
    
    style D fill:#e1f5ff
    style C fill:#fff4e1
    style E fill:#ffe1e1
```

## Component Dependencies

```mermaid
graph TD
    subgraph "Read Composition Module"
        BASE[BaseCompositeService]
        HELPER[CompositionHelper]
        DOCTOR[DoctorCompositeService]
        CTRL[DoctorCompositeController]
    end
    
    subgraph "Infrastructure"
        CACHE[CacheService]
        CLIENT[MicroserviceClientHelper]
    end
    
    subgraph "External Services"
        ACCOUNTS[Accounts Service]
        PROVIDER[Provider Service]
    end
    
    DOCTOR --> BASE
    DOCTOR -.-> HELPER
    BASE --> CACHE
    BASE --> CLIENT
    CTRL --> DOCTOR
    
    DOCTOR --> ACCOUNTS
    DOCTOR --> PROVIDER
    
    style BASE fill:#e1f5ff
    style HELPER fill:#e1ffe1
    style DOCTOR fill:#fff4e1
```

## Error Handling Flow

```mermaid
graph TD
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Parallel Fetch]
    
    D --> E[Service 1]
    D --> F[Service 2]
    
    E --> G{Success?}
    F --> H{Success?}
    
    G -->|Yes| I[Data 1]
    G -->|No| J[Error 1]
    
    H -->|Yes| K[Data 2]
    H -->|No| L[Error 2]
    
    I --> M{Both OK?}
    K --> M
    J --> N[Track Error]
    L --> N
    
    N --> M
    
    M -->|Yes| O[Merge Data]
    M -->|No| P[Throw CompositionError]
    
    O --> Q[Cache Result]
    Q --> R[Return Success]
    
    P --> S[Return Error with Sources]
    
    style P fill:#ffcccc
    style R fill:#ccffcc
    style N fill:#ffffcc
```

## Cache Strategy

```mermaid
graph LR
    subgraph "Entity Cache"
        E1[doctor:composite:id1]
        E2[doctor:composite:id2]
        E3[doctor:composite:id3]
    end
    
    subgraph "List Cache"
        L1[doctor:composite:list:hash1]
        L2[doctor:composite:list:hash2]
        L3[doctor:composite:list:hash3]
    end
    
    subgraph "TTL"
        T1[Entity: 5 min]
        T2[List: 2 min]
    end
    
    E1 -.-> T1
    L1 -.-> T2
    
    style E1 fill:#e1f5ff
    style L1 fill:#ffe1e1
```

## Performance Optimization

```mermaid
graph TD
    A[Request] --> B{Cache Check}
    B -->|Hit| C[Instant Return ~1ms]
    B -->|Miss| D[Parallel Fetch]
    
    D --> E[Service 1<br/>Timeout: 8s]
    D --> F[Service 2<br/>Timeout: 8s]
    
    E --> G[Promise.allSettled]
    F --> G
    
    G --> H[Process Results<br/>~1ms]
    H --> I[Merge Data<br/>~1ms]
    I --> J[Cache Set<br/>~2ms]
    J --> K[Return<br/>Total: ~8s]
    
    style C fill:#ccffcc
    style K fill:#ffffcc
```

---

## Key Benefits Visualized

| Aspect | Before | After | 
|--------|--------|-------|
| **Code Reuse** | ❌ Each service duplicates logic | ✅ Base class shared by all |
| **Cache Strategy** | 🟡 Implemented per service | ✅ Consistent across all |
| **Error Handling** | 🟡 Different per service | ✅ Standardized |
| **Testing** | 🟡 Test each service fully | ✅ Test base once + merge logic |
| **New Services** | ❌ Copy-paste 300+ lines | ✅ Extend + implement merge (~50 lines) |
| **Maintenance** | 🟡 Update multiple places | ✅ Update once in base class |

---

## Extensibility Example

```typescript
// Adding a new PatientCompositeService is just:

@Injectable()
export class PatientCompositeService extends BaseCompositeService<PatientData, PatientQuery> {
  // 1. Set required properties
  protected readonly logger = new Logger(PatientCompositeService.name);
  protected readonly cachePrefix = 'patient:composite:';
  protected readonly listCachePrefix = 'patient:composite:list:';
  protected readonly defaultCacheTtl = 300;
  
  // 2. Inject dependencies
  constructor(
    @Inject('BOOKING_SERVICE') private bookingClient: ClientProxy,
    protected cacheService: CacheService,
    protected clientHelper: MicroserviceClientHelper,
  ) { super(); }
  
  // 3. Use base methods + implement merge
  async getPatient(id: string) {
    return this.getCompositeWithCache(id, config, this.merge);
  }
  
  private merge(booking, account): PatientData {
    return { ...booking, ...account };
  }
}

// That's it! ~30 lines instead of 300+
```
