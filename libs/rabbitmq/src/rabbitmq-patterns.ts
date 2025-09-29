/**
 * RabbitMQ Message Patterns
 * Định nghĩa các pattern cho giao tiếp giữa các microservice
 */

// Service Names
export const SERVICES = {
  ACCOUNTS: 'accounts',
  PROVIDER_DIRECTORY: 'provider-directory',
  BOOKING: 'booking',
  CONTENT: 'content',
  NOTIFICATION: 'notification',
  API_GATEWAY: 'api-gateway',
} as const;

// Message Patterns cho Accounts Service
export const ACCOUNTS_PATTERNS = {
  // Auth patterns
  LOGIN: 'accounts.auth.login',
  REFRESH_TOKEN: 'accounts.auth.refresh',
  LOGOUT: 'accounts.auth.logout',
  VERIFY_TOKEN: 'accounts.auth.verify',

  // User management
  CREATE_USER: 'accounts.user.create',
  GET_USER: 'accounts.user.get',
  UPDATE_USER: 'accounts.user.update',
  DELETE_USER: 'accounts.user.delete',

  // Patient management
  CREATE_PATIENT: 'accounts.patient.create',
  GET_PATIENT: 'accounts.patient.get',
  UPDATE_PATIENT: 'accounts.patient.update',

  // Permission management
  CHECK_PERMISSION: 'accounts.permission.check',
  GET_USER_PERMISSIONS: 'accounts.permission.get',
} as const;

// Message Patterns cho Provider Directory Service
export const PROVIDER_PATTERNS = {
  // Doctor management
  GET_DOCTORS: 'provider.doctor.list',
  GET_DOCTOR: 'provider.doctor.get',
  CREATE_DOCTOR: 'provider.doctor.create',
  UPDATE_DOCTOR: 'provider.doctor.update',

  // Specialty management
  GET_SPECIALTIES: 'provider.specialty.list',
  GET_SPECIALTY: 'provider.specialty.get',

  // Location management
  GET_LOCATIONS: 'provider.location.list',
  GET_LOCATION: 'provider.location.get',

  // Schedule management
  GET_SCHEDULES: 'provider.schedule.list',
  GET_AVAILABLE_SLOTS: 'provider.schedule.available',
  CREATE_SCHEDULE: 'provider.schedule.create',
  UPDATE_SCHEDULE: 'provider.schedule.update',
} as const;

// Message Patterns cho Booking Service
export const BOOKING_PATTERNS = {
  // Appointment management
  CREATE_APPOINTMENT: 'booking.appointment.create',
  GET_APPOINTMENT: 'booking.appointment.get',
  UPDATE_APPOINTMENT: 'booking.appointment.update',
  CANCEL_APPOINTMENT: 'booking.appointment.cancel',
  CONFIRM_APPOINTMENT: 'booking.appointment.confirm',

  // Booking by doctor
  BOOK_BY_DOCTOR: 'booking.by.doctor',

  // Booking by date
  BOOK_BY_DATE: 'booking.by.date',

  // Slot management
  HOLD_SLOT: 'booking.slot.hold',
  RELEASE_SLOT: 'booking.slot.release',
  COMMIT_SLOT: 'booking.slot.commit',
} as const;

// Message Patterns cho Content Service
export const CONTENT_PATTERNS = {
  // Blog management
  GET_BLOGS: 'content.blog.list',
  GET_BLOG: 'content.blog.get',
  CREATE_BLOG: 'content.blog.create',
  UPDATE_BLOG: 'content.blog.update',
  DELETE_BLOG: 'content.blog.delete',

  // Q&A management
  GET_QUESTIONS: 'content.question.list',
  GET_QUESTION: 'content.question.get',
  CREATE_QUESTION: 'content.question.create',
  CREATE_ANSWER: 'content.answer.create',

  // Review management
  GET_REVIEWS: 'content.review.list',
  CREATE_REVIEW: 'content.review.create',
} as const;

// Message Patterns cho Notification Service
export const NOTIFICATION_PATTERNS = {
  // Email notifications
  SEND_EMAIL: 'notification.email.send',
  SEND_BULK_EMAIL: 'notification.email.bulk',

  // SMS notifications
  SEND_SMS: 'notification.sms.send',

  // Push notifications
  SEND_PUSH: 'notification.push.send',

  // WebSocket notifications
  SEND_WEBSOCKET: 'notification.websocket.send',
} as const;

// Health check patterns
export const HEALTH_PATTERNS = {
  PING: 'health.ping',
  STATUS: 'health.status',
} as const;

// Event Types cho Event-Driven Architecture
export const EVENT_TYPES = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Patient events
  PATIENT_CREATED: 'patient.created',
  PATIENT_UPDATED: 'patient.updated',

  // Doctor events
  DOCTOR_CREATED: 'doctor.created',
  DOCTOR_UPDATED: 'doctor.updated',

  // Schedule events
  SCHEDULE_CREATED: 'schedule.created',
  SCHEDULE_UPDATED: 'schedule.updated',
  SCHEDULE_DELETED: 'schedule.deleted',

  // Appointment events
  APPOINTMENT_BOOKED: 'appointment.booked',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment.rescheduled',

  // Content events
  QUESTION_CREATED: 'question.created',
  ANSWER_POSTED: 'answer.posted',
  REVIEW_CREATED: 'review.created',

  // Notification events
  EMAIL_SENT: 'email.sent',
  SMS_SENT: 'sms.sent',
  PUSH_SENT: 'push.sent',
} as const;

// Queue Names
export const QUEUE_NAMES = {
  ACCOUNTS_QUEUE: 'accounts_queue',
  PROVIDER_QUEUE: 'provider_queue',
  BOOKING_QUEUE: 'booking_queue',
  CONTENT_QUEUE: 'content_queue',
  NOTIFICATION_QUEUE: 'notification_queue',

  // Event queues
  USER_EVENTS_QUEUE: 'user_events_queue',
  APPOINTMENT_EVENTS_QUEUE: 'appointment_events_queue',
  CONTENT_EVENTS_QUEUE: 'content_events_queue',
} as const;

// Exchange Names
export const EXCHANGE_NAMES = {
  MEDICALINK_DIRECT: 'medicalink.direct',
  MEDICALINK_TOPIC: 'medicalink.topic',
  MEDICALINK_FANOUT: 'medicalink.fanout',
} as const;

// Routing Keys
export const ROUTING_KEYS = {
  // User routing keys
  USER_ALL: 'user.*',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Appointment routing keys
  APPOINTMENT_ALL: 'appointment.*',
  APPOINTMENT_BOOKED: 'appointment.booked',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',

  // Content routing keys
  CONTENT_ALL: 'content.*',
  QUESTION_CREATED: 'question.created',
  ANSWER_POSTED: 'answer.posted',
} as const;
