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
};
