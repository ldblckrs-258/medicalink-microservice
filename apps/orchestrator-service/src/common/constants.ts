/**
 * Cache key prefixes for different entity types
 */
export const CACHE_PREFIXES = {
  DOCTOR_COMPOSITE: 'doctor:composite:',
  DOCTOR_COMPOSITE_LIST: 'doctor:composite:list:',
  DOCTOR_LIST: 'doctor:list',
  DOCTOR_SEARCH: 'doctor:search',
  APPOINTMENT_COMPOSITE: 'appointment:composite',
  PATIENT_COMPOSITE: 'patient:composite',
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 120, // 2 minutes - for lists and search results
  MEDIUM: 300, // 5 minutes - for single entities
  LONG: 600, // 10 minutes - for rarely changing data
} as const;

/**
 * Timeout configurations in milliseconds
 */
export const TIMEOUTS = {
  SAGA: 30000, // 30 seconds for saga execution
  SERVICE_CALL: 10000, // 10 seconds for individual service calls
  CACHE_OPERATION: 5000, // 5 seconds for cache operations
} as const;

/**
 * Message patterns for orchestrator service
 */
export const ORCHESTRATOR_PATTERNS = {
  // Health
  HEALTH_CHECK: 'orchestrator.health.check',
  HEALTH_PING: 'orchestrator.health.ping',

  // Doctor orchestration
  DOCTOR_CREATE: 'orchestrator.doctor.create',
  DOCTOR_UPDATE: 'orchestrator.doctor.update',
  DOCTOR_DELETE: 'orchestrator.doctor.delete',

  // Doctor composition (read)
  DOCTOR_GET_COMPOSITE: 'orchestrator.doctor.getComposite',
  DOCTOR_SEARCH_COMPOSITE: 'orchestrator.doctor.searchComposite',
  DOCTOR_LIST_COMPOSITE: 'orchestrator.doctor.listComposite',

  // Appointment orchestration (future)
  APPOINTMENT_CREATE: 'orchestrator.appointment.create',
  APPOINTMENT_RESCHEDULE: 'orchestrator.appointment.reschedule',
  APPOINTMENT_CANCEL: 'orchestrator.appointment.cancel',

  // Cache management
  CACHE_INVALIDATE: 'orchestrator.cache.invalidate',
  CACHE_CLEAR: 'orchestrator.cache.clear',
} as const;

/**
 * Event patterns that orchestrator listens to
 */
export const ORCHESTRATOR_EVENTS = {
  // Doctor events
  DOCTOR_PROFILE_CREATED: 'doctor.profile.created',
  DOCTOR_PROFILE_UPDATED: 'doctor.profile.updated',
  DOCTOR_PROFILE_DELETED: 'doctor.profile.deleted',

  // Account events
  STAFF_ACCOUNT_CREATED: 'staff.account.created',
  STAFF_ACCOUNT_UPDATED: 'staff.account.updated',
  STAFF_ACCOUNT_DELETED: 'staff.account.deleted',

  // Appointment events (future)
  APPOINTMENT_CREATED: 'appointment.created',
  APPOINTMENT_UPDATED: 'appointment.updated',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',

  // Assets events
  ASSET_CREATED: 'asset.created',
  ASSET_UPDATED: 'asset.updated',
  ASSET_DELETED: 'asset.deleted',
  ASSETS_BULK_DELETED: 'assets.bulk.deleted',
} as const;

/**
 * Service patterns that orchestrator calls
 */
export const SERVICE_PATTERNS = {
  // Accounts Service
  ACCOUNTS: {
    DOCTOR_CREATE: 'doctor-accounts.create',
    DOCTOR_FIND_ONE: 'doctor-accounts.findOne',
    DOCTOR_GET_BY_ID: 'doctor-accounts.findOne',
    DOCTOR_UPDATE: 'doctor-accounts.update',
    DOCTOR_DELETE: 'doctor-accounts.remove',
    DOCTOR_FIND_ALL: 'doctor-accounts.findAll',
    DOCTOR_SEARCH: 'doctor-accounts.findAll',
  },

  // Provider Directory Service
  PROVIDER: {
    PROFILE_CREATE_EMPTY: 'doctor-profile.createEmpty',
    PROFILE_FIND_ONE: 'doctor-profile.findOne',
    PROFILE_GET_BY_ACCOUNT_ID: 'doctor-profile.getByAccountId',
    PROFILE_GET_BY_ACCOUNT_IDS: 'doctor-profile.getByAccountIds',
    PROFILE_UPDATE: 'doctor-profile.update',
    PROFILE_DELETE: 'doctor-profile.remove',
    PROFILE_GET_PUBLIC_LIST: 'doctor-profile.getPublicList',
  },

  // Booking Service
  BOOKING: {
    APPOINTMENT_CREATE: 'appointments.create',
    APPOINTMENT_FIND_ONE: 'appointments.findOne',
    APPOINTMENT_CANCEL: 'appointments.cancel',
  },

  // Notification service
  NOTIFICATION: {
    EMAIL_SEND: 'notification.email.send',
    SMS_SEND: 'notification.sms.send',
  },

  // Content service - Assets
  CONTENT_ASSETS: {
    CREATE: 'assets.create',
    GET_BY_ID: 'assets.get_by_id',
    GET_BY_PUBLIC_ID: 'assets.get_by_public_id',
    GET_LIST: 'assets.get_list',
    GET_BY_ENTITY: 'assets.get_by_entity',
    UPDATE: 'assets.update',
    DELETE: 'assets.delete',
    DELETE_BY_PUBLIC_ID: 'assets.delete_by_public_id',
    DELETE_BY_ENTITY: 'assets.delete_by_entity',
    CLEANUP_ORPHANED: 'assets.cleanup_orphaned',
    RECONCILE_ENTITY: 'assets.reconcile_entity',
    HEALTH_CHECK: 'assets.health_check',
  },
} as const;
