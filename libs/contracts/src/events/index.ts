// Base Event Interface
export interface BaseEvent {
  event: string;
  occurredAt: string;
}

// Account Events
export interface PatientProfileUpdated extends BaseEvent {
  event: 'PatientProfileUpdated';
  data: {
    patientId: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
}

export interface StaffCreated extends BaseEvent {
  event: 'StaffCreated';
  data: {
    staffId: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
    fullName: string;
  };
}

export interface StaffUpdated extends BaseEvent {
  event: 'StaffUpdated';
  data: {
    staffId: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
    fullName: string;
  };
}

export interface StaffRoleChanged extends BaseEvent {
  event: 'StaffRoleChanged';
  data: {
    staffId: string;
    oldRole: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
    newRole: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
  };
}

// Provider Events
export interface ScheduleSlotCreated extends BaseEvent {
  event: 'ScheduleSlotCreated';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
    serviceDate: string;
    timeStart: string;
    timeEnd: string;
    capacity: number;
  };
}

export interface ScheduleSlotUpdated extends BaseEvent {
  event: 'ScheduleSlotUpdated';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
    serviceDate: string;
    timeStart: string;
    timeEnd: string;
    capacity: number;
  };
}

export interface ScheduleSlotDeleted extends BaseEvent {
  event: 'ScheduleSlotDeleted';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
    serviceDate: string;
  };
}

// Booking Events
export interface AppointmentBooked extends BaseEvent {
  event: 'AppointmentBooked';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    scheduleId: string;
    locationId: string;
    serviceDate: string;
    timeStart: string;
    timeEnd: string;
    reason?: string;
  };
}

export interface AppointmentConfirmed extends BaseEvent {
  event: 'AppointmentConfirmed';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    serviceDate: string;
    timeStart: string;
    timeEnd: string;
  };
}

export interface AppointmentRescheduled extends BaseEvent {
  event: 'AppointmentRescheduled';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    oldScheduleId: string;
    newScheduleId: string;
    oldServiceDate: string;
    newServiceDate: string;
    oldTimeStart: string;
    newTimeStart: string;
    oldTimeEnd: string;
    newTimeEnd: string;
  };
}

export interface AppointmentCancelled extends BaseEvent {
  event: 'AppointmentCancelled';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    serviceDate: string;
    timeStart: string;
    timeEnd: string;
    cancelledBy: 'PATIENT' | 'STAFF';
    reason?: string;
  };
}

// Content Events
export interface QuestionCreated extends BaseEvent {
  event: 'QuestionCreated';
  data: {
    questionId: string;
    patientId: string;
    title: string;
    body: string;
  };
}

export interface AnswerPosted extends BaseEvent {
  event: 'AnswerPosted';
  data: {
    answerId: string;
    questionId: string;
    doctorId: string;
    body: string;
    patientId: string;
  };
}

export interface ReviewCreated extends BaseEvent {
  event: 'ReviewCreated';
  data: {
    reviewId: string;
    doctorId: string;
    patientId: string;
    rating: number;
    title?: string;
    body?: string;
  };
}

// Union type for all events
export type AllEvents =
  | PatientProfileUpdated
  | StaffCreated
  | StaffUpdated
  | StaffRoleChanged
  | ScheduleSlotCreated
  | ScheduleSlotUpdated
  | ScheduleSlotDeleted
  | AppointmentBooked
  | AppointmentConfirmed
  | AppointmentRescheduled
  | AppointmentCancelled
  | QuestionCreated
  | AnswerPosted
  | ReviewCreated;

export type EventType = AllEvents['event'];
