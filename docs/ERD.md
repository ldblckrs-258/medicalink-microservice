/////////////////////////////////////////////////////
// MICROSERVICE 1 — ACCOUNTS & IDENTITY (PostgreSQL)
/////////////////////////////////////////////////////

Enum "staff_role" {
  SUPER_ADMIN
  ADMIN
  DOCTOR
}

Table staff_accounts {
  id              varchar(27) [pk, not null, note: 'cuid string, generated in app']
  full_name       varchar(100) [not null]
  email           varchar(255) [not null, unique]
  password_hash   varchar(255) [not null]
  role            staff_role   [not null, default: 'ADMIN']
  phone           varchar(32)
  is_male         boolean
  date_of_birth   date
  created_at      timestamptz  [not null, default: `now()`]
  updated_at      timestamptz  [not null, default: `now()`]
  deleted_at      timestamptz
  Note: 'Tài khoản nhân sự; DOCTOR sẽ map sang Provider.doctors qua staff_account_id (logic, không FK cross-DB).'
}

Enum "permission_effect" {
  ALLOW
  DENY
}

Table "permissions" {
  id          varchar(27) [pk, not null, note: 'cuid']
  resource    varchar(100) [not null] // e.g., appointments, doctors, schedules
  action      varchar(50)  [not null] // e.g., create, read, update, delete
  description varchar(255)
  created_at  timestamptz  [not null, default: `now()`]
  unique {
    resource, action
  }
}

Table "user_permission" {
  id          varchar(27) [pk, not null, note: 'cuid']
  userId      varchar(27) [not null, note: 'ref Accounts.staff_accounts.id (same DB)']
  permissionId varchar(27) [not null, note: 'ref Accounts.permissions.id (same DB)']
  effect      permission_effect [not null, default: 'ALLOW']
  tenantId    varchar(27) // optional, for multi-tenant scenarios
  conditions  jsonb     // optional, e.g., {"location_id": "loc_123"}
  created_at  timestamptz [not null, default: `now()`]
  updated_at  timestamptz [not null, default: `now()`]
  unique {
    userId, permissionId, tenantId
  }
}

Table "groups" {
  id          varchar(27) [pk, not null, note: 'cuid']
  name        varchar(100) [not null, unique]
  description varchar(255)
  tenantId    varchar(27) // optional, for multi-tenant scenarios
  is_active   boolean    [not null, default: true]
  created_at  timestamptz [not null, default: `now()`]
  updated_at  timestamptz [not null, default: `now()`]
}

Table "user_group" {
  id        varchar(27) [pk, not null, note: 'cuid']
  userId    varchar(27) [not null, note: 'ref Accounts.staff_accounts.id (same DB)']
  groupId   varchar(27) [not null, note: 'ref Accounts.groups.id (same DB)']
  tenantId  varchar(27) // optional, for multi-tenant scenarios
  created_at timestamptz [not null, default: `now()`]
  unique {
    userId, groupId
  }
}

Table "group_permission" {
  id          varchar(27) [pk, not null, note: 'cuid']
  groupId     varchar(27) [not null, note: 'ref Accounts.groups.id (same DB)']
  permissionId varchar(27) [not null, note: 'ref Accounts.permissions.id (same DB)']
  effect      permission_effect [not null, default: 'ALLOW']
  conditions  jsonb     // optional, e.g., {"location_id": "loc_123"}
  created_at  timestamptz [not null, default: `now()`]
  updated_at  timestamptz [not null, default: `now()`]
  unique {
    groupId, permissionId
  }
}

Table "auth_version" {
  id          varchar(27) [pk, not null, note: 'cuid']
  userId      varchar(27) [not null, note: 'ref Accounts.staff_accounts.id (same DB)']
  version     integer    [not null, default: 1]
  updated_at  timestamptz [not null, default: `now()`]
  unique {
    userId
  }
  Note: 'Dùng để invalid token khi thay đổi quyền hoặc mật khẩu.'
}

/////////////////////////////////////////////////////
// MICROSERVICE 2 — PROVIDER DIRECTORY (PostgreSQL)
/////////////////////////////////////////////////////

Table specialty {
  id          varchar(27) [pk, not null, note: 'cuid']
  name        varchar(120) [not null, unique]
  slug        varchar(140) [not null, unique]
  description text
  is_active   boolean      [not null, default: true]
  created_at  timestamptz  [not null, default: `now()`]
  updated_at  timestamptz  [not null, default: `now()`]
}

Table specialty_info_section {
  id           varchar(27) [pk, not null, note: 'cuid']
  specialty_id varchar(27) [not null, note: 'ref Provider.specialties.id (same DB)']
  name         varchar(120) [not null]
  content      text
  created_at   timestamptz [not null, default: `now()`]
  updated_at   timestamptz [not null, default: `now()`]
  indexes {
    (specialty_id)
  }
  Note: 'Thông tin chi tiết theo section của chuyên khoa; content có thể là HTML/Markdown.'
}

Table specialty_info_section {
  id           varchar(27) [pk, not null, note: 'cuid']
  specialty_id varchar(27) [not null, note: 'ref Provider.specialties.id (same DB)']
  name         varchar(120) [not null]
  content      text
  created_at   timestamptz [not null, default: `now()`]
  updated_at   timestamptz [not null, default: `now()`]
  indexes {
    (specialty_id)
  }
  Note: 'Thông tin chi tiết theo section của chuyên khoa; content có thể là HTML/Markdown.'
}

Table work_location {
  id          varchar(27) [pk, not null, note: 'cuid']
  name        varchar(160) [not null]
  address     varchar(255)
  phone       varchar(32)
  timezone    varchar(64)  [not null, default: 'Asia/Ho_Chi_Minh']
  is_active   boolean      [not null, default: true]
  created_at  timestamptz  [not null, default: `now()`]
  updated_at  timestamptz  [not null, default: `now()`]
  indexes {
    (name)
  }
}

Table doctor {
  id                varchar(27) [pk, not null, note: 'cuid']
  staff_account_id  varchar(27) [unique, not null, note: 'ref Accounts.staff_accounts.id (logical)']
  degree            varchar(100)
  position          text[]
  introduction      text
  memberships       text[]
  awards            text[]
  research          text
  training_process  text[]
  experience        text[]
  avatar_url        varchar
  portrait          varchar
  is_active         boolean      [not null, default: true]
  created_at        timestamptz  [not null, default: `now()`]
  updated_at        timestamptz  [not null, default: `now()`]
  indexes {
    (staff_account_id)
  }
}

Table doctor_specialty {
  id           varchar(27) [pk, not null, note: 'cuid']
  doctor_id    varchar(27) [not null, note: 'ref Provider.doctors.id (same DB)']
  specialty_id varchar(27) [not null, note: 'ref Provider.specialties.id (same DB)']
  created_at   timestamptz [not null, default: `now()`]
  unique {
    doctor_id, specialty_id
  }
  indexes {
    (specialty_id)
  }
}

Table doctor_work_location {
  id           varchar(27) [pk, not null, note: 'cuid']
  doctor_id    varchar(27) [not null, note: 'ref Provider.doctors.id (same DB)']
  location_id  varchar(27) [not null, note: 'ref Provider.work_locations.id (same DB)']
  created_at   timestamptz [not null, default: `now()`]
  unique {
    doctor_id, location_id
  }
}

Table schedules {
  id           varchar(27) [pk, not null, note: 'cuid']
  doctor_id    varchar(27) [not null, note: 'ref Provider.doctors.id (same DB)']
  location_id  varchar(27) [not null, note: 'ref Provider.work_locations.id (same DB)']
  service_date date        [not null]
  time_start   time        [not null]
  time_end     time        [not null]
  capacity     smallint    [not null, default: 1, note: 'Số chỗ khả dụng cho slot']
  is_active    boolean     [not null, default: true]
  created_at   timestamptz [not null, default: `now()`]
  updated_at   timestamptz [not null, default: `now()`]
  unique {
    doctor_id, location_id, service_date, time_start, time_end
  }
  indexes {
    (service_date)
    (doctor_id, service_date)
    (location_id, service_date)
  }
}

/////////////////////////////////////////////////////
// MICROSERVICE 3 — BOOKING & APPOINTMENTS (PostgreSQL)
/////////////////////////////////////////////////////

Enum "appointment_status" {
  BOOKED
  CONFIRMED
  RESCHEDULED
  CANCELLED_BY_PATIENT
  CANCELLED_BY_STAFF
  NO_SHOW
  COMPLETED
}

Table appointments {
  id              varchar(27) [pk, not null, note: 'cuid']
  // snapshot các khóa để tránh join cross-service khi đọc
  patient_id      varchar(27) [not null, note: 'ref Accounts.patients.id (logical)']
  doctor_id       varchar(27) [not null, note: 'ref Provider.doctors.id (logical)']
  schedule_id     varchar(27) [not null, note: 'ref Provider.schedules.id (logical)']
  location_id     varchar(27) [not null, note: 'ref Provider.work_locations.id (logical)']

  // thời gian hẹn (copy từ schedule để đọc nhanh)
  service_date    date        [not null]
  time_start      time        [not null]
  time_end        time        [not null]

  status          appointment_status [not null, default: 'BOOKED']
  reason          varchar(255)
  notes           text
  price_amount    numeric(12,2)
  currency        varchar(3)  [default: 'VND']

  created_at      timestamptz [not null, default: `now()`]
  updated_at      timestamptz [not null, default: `now()`]
  cancelled_at    timestamptz
  completed_at    timestamptz

  unique {
    schedule_id, patient_id // 1 bệnh nhân chỉ giữ 1 booking cho đúng 1 slot
  }
  indexes {
    (patient_id, service_date)
    (doctor_id, service_date)
    (status, service_date)
    (service_date, time_start)
  }

  Note: 'Business rule chống trùng slot thực thi trong service; nếu capacity > 1, cần trường slot_index (optional).'
}

Table appointment_events {
  id             varchar(27) [pk, not null, note: 'cuid']
  appointment_id varchar(27) [not null, note: 'ref Booking.appointments.id (same DB)']
  event_type     varchar(40) [not null, note: 'BOOKED|CONFIRMED|RESCHEDULED|...']
  occurred_at    timestamptz [not null, default: `now()`]
  metadata       jsonb
  indexes {
    (appointment_id, occurred_at)
  }
}

Table schedule_holds {
  id             varchar(27) [pk, not null, note: 'cuid']
  schedule_id    varchar(27) [not null, note: 'ref Provider.schedules.id (logical)']
  patient_id     varchar(27) [not null, note: 'ref Accounts.patients.id (logical)']
  expires_at     timestamptz [not null]
  status         varchar(16) [not null, default: 'HELD'] // HELD|RELEASED|COMMITTED
  created_at     timestamptz [not null, default: `now()`]
  indexes {
    (schedule_id)
    (patient_id)
    (expires_at)
  }
  Note: 'Giữ chỗ tạm thời (TTL) trong quá trình đặt lịch theo mô hình Saga.'
}

Table patients {
  id              varchar(27) [pk, not null, note: 'cuid string, generated in app']
  full_name       varchar(120) [not null]
  email           varchar(255) [unique] // optional
  phone           varchar(32)
  is_male         boolean
  date_of_birth   date
  address_line    varchar(255)
  district        varchar(100)
  province        varchar(100)
  created_at      timestamptz [not null, default: `now()`]
  updated_at      timestamptz [not null, default: `now()`]
  deleted_at      timestamptz
  indexes {
    (full_name)
    (phone)
  }
  Note: 'Hồ sơ bệnh nhân; được tham chiếu logic từ Booking/Content theo patients.id.'
}

/////////////////////////////////////////////////////
// MICROSERVICE 4 — CONTENT & COMMUNITY (PostgreSQL)
/////////////////////////////////////////////////////

Enum "question_status" {
  PENDING
  ANSWERED
  CLOSED
}

Enum "post_status" {
  DRAFT
  PUBLISHED
  ARCHIVED
}

Table blog_categories {
  id          varchar(27) [pk, not null, note: 'cuid']
  name        varchar(120) [not null, unique]
  slug        varchar(140) [not null, unique]
  created_at  timestamptz  [not null, default: `now()`]
  updated_at  timestamptz  [not null, default: `now()`]
}

Table blogs {
  id              varchar(27) [pk, not null, note: 'cuid']
  title           varchar(200) [not null]
  slug            varchar(220) [not null, unique]
  content         text         [not null]
  category_id     varchar(27)  [not null, note: 'ref Content.blog_categories.id (same DB)']
  author_staff_id varchar(27)  [not null, note: 'ref Accounts.staff_accounts.id (logical)']
  status          post_status  [not null, default: 'DRAFT']
  published_at    timestamptz
  created_at      timestamptz  [not null, default: `now()`]
  updated_at      timestamptz  [not null, default: `now()`]
  indexes {
    (category_id)
    (status, published_at)
  }
}

Table questions {
  id           varchar(27) [pk, not null, note: 'cuid']
  patient_id   varchar(27) [not null, note: 'ref Accounts.patients.id (logical)']
  title        varchar(200) [not null]
  body         text         [not null]
  status       question_status [not null, default: 'PENDING']
  created_at   timestamptz  [not null, default: `now()`]
  updated_at   timestamptz  [not null, default: `now()`]
  indexes {
    (patient_id, created_at)
    (status, created_at)
  }
}

Table answers {
  id           varchar(27) [pk, not null, note: 'cuid']
  question_id  varchar(27) [not null, note: 'ref Content.questions.id (same DB)']
  doctor_id    varchar(27) [not null, note: 'ref Provider.doctors.id (logical)']
  body         text         [not null]
  is_accepted  boolean      [not null, default: false]
  created_at   timestamptz  [not null, default: `now()`]
  updated_at   timestamptz  [not null, default: `now()`]
  indexes {
    (question_id)
    (doctor_id, created_at)
  }
}

Table reviews {
  id           varchar(27) [pk, not null, note: 'cuid']
  doctor_id    varchar(27) [not null, note: 'ref Provider.doctors.id (logical)']
  patient_id   varchar(27) [not null, note: 'ref Accounts.patients.id (logical)']
  rating       smallint     [not null, note: '1..5']
  title        varchar(160)
  body         text
  is_public    boolean      [not null, default: true]
  created_at   timestamptz  [not null, default: `now()`]
  indexes {
    (doctor_id)
    (patient_id)
    (rating)
  }
}

/////////////////////////////////////////////////////
// MICROSERVICE 5 — NOTIFICATION & COMMS (PostgreSQL)
/////////////////////////////////////////////////////

Enum "notification_channel" {
  EMAIL
  SMS
  PUSH
  WS
}

Enum "delivery_status" {
  QUEUED
  SENT
  FAILED
}

Enum "recipient_type" {
  PATIENT
  STAFF
}

Table notification_templates {
  id          varchar(27) [pk, not null, note: 'cuid']
  key         varchar(120) [not null, unique] // e.g., appointment_booked, answer_posted
  channel     notification_channel [not null]
  subject     varchar(200)
  body        text         // hoặc JSON template, tuỳ engine
  is_active   boolean      [not null, default: true]
  created_at  timestamptz  [not null, default: `now()`]
  updated_at  timestamptz  [not null, default: `now()`]
}

Table notification_preferences {
  id            varchar(27) [pk, not null, note: 'cuid']
  user_id       varchar(27) [not null, note: 'ref Accounts.patients.id | Accounts.staff_accounts.id (logical)']
  recipient_as  recipient_type [not null]
  channel       notification_channel [not null]
  enabled       boolean [not null, default: true]
  created_at    timestamptz [not null, default: `now()`]
  updated_at    timestamptz [not null, default: `now()`]
  unique {
    user_id, recipient_as, channel
  }
}

Table notification_deliveries {
  id             varchar(27) [pk, not null, note: 'cuid']
  template_key   varchar(120) [not null, note: 'ref Notification.notification_templates.key (same DB)']
  channel        notification_channel [not null]
  recipient_id   varchar(27) [not null, note: 'ref Accounts.patients.id | Accounts.staff_accounts.id (logical)']
  recipient_as   recipient_type [not null]
  payload        jsonb         [not null, note: 'data render template (doctor_name, time, link, etc.)']
  status         delivery_status [not null, default: 'QUEUED']
  error_message  text
  sent_at        timestamptz
  created_at     timestamptz  [not null, default: `now()`]
  indexes {
    (recipient_id, created_at)
    (status, created_at)
    (template_key)
  }
}
