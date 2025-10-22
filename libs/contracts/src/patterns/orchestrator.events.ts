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
};
