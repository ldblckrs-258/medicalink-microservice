# Patient Module Migration Plan

## Mục tiêu
Chuyển patient module từ `accounts-service` sang `booking-service` để tách biệt trách nhiệm và cải thiện kiến trúc microservice.

## Nguyên tắc
- Accounts-service chỉ xử lý authentication/authorization cho staff
- Booking-service sẽ được đổi tên thành patient-booking-service và xử lý cả patient management và appointment booking
- Sử dụng Prisma migration để quản lý database schema
- Không cần migrate data vì chưa có patient records nào

---

## Phase 1: Preparation & Service Restructure

### 1.1 Đổi tên service
```bash
# Đổi tên booking-service thành patient-booking-service
mv apps/booking-service apps/patient-booking-service
```

### 1.2 Update configuration files

#### package.json
```json
{
  "scripts": {
    "start:patient-booking": "nest start patient-booking-service",
    "start:patient-booking:dev": "nest start patient-booking-service --watch"
  }
}
```

#### nest-cli.json
```json
{
  "projects": {
    "patient-booking-service": {
      "type": "application",
      "root": "apps/patient-booking-service",
      "entryFile": "main",
      "sourceRoot": "apps/patient-booking-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/patient-booking-service/tsconfig.app.json"
      }
    }
  }
}
```

---

## Phase 2: Database Schema Migration với Prisma

### 2.1 Update Prisma Schema cho patient-booking-service

```prisma
// apps/patient-booking-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("PATIENT_BOOKING_DATABASE_URL")
}

// Patient model - migrated từ accounts-service
model Patient {
  id            String    @id @default(cuid()) @db.VarChar(27)
  fullName      String    @map("full_name") @db.VarChar(120)
  email         String?   @unique @db.VarChar(255)
  phone         String?   @db.VarChar(32)
  isMale        Boolean?  @map("is_male")
  dateOfBirth   DateTime? @map("date_of_birth") @db.Date
  addressLine1  String?   @map("address_line1") @db.VarChar(255)
  addressLine2  String?   @map("address_line2") @db.VarChar(255)
  district          String?   @db.VarChar(100)
  province      String?   @db.VarChar(100)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz(6)

  // Relations
  appointments  Appointment[]
  scheduleHolds ScheduleHold[]

  @@index([fullName], map: "idx_patients_full_name")
  @@index([phone], map: "idx_patients_phone")
  @@map("patients")
}

// Update existing Appointment model để add relation
model Appointment {
  id            String            @id @default(cuid()) @db.VarChar(27)
  patientId     String            @map("patient_id") @db.VarChar(27)
  doctorId      String            @map("doctor_id") @db.VarChar(27)
  scheduleId    String            @map("schedule_id") @db.VarChar(27)
  locationId    String            @map("location_id") @db.VarChar(27)
  serviceDate   DateTime          @map("service_date") @db.Date
  timeStart     DateTime          @map("time_start") @db.Time(6)
  timeEnd       DateTime          @map("time_end") @db.Time(6)
  status        AppointmentStatus @default(BOOKED)
  reason        String?           @db.VarChar(255)
  notes         String?
  priceAmount   Decimal?          @map("price_amount") @db.Decimal(12, 2)
  createdAt     DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime          @updatedAt @map("updated_at") @db.Timestamptz(6)
  cancelledAt   DateTime?         @map("cancelled_at") @db.Timestamptz(6)
  completedAt   DateTime?         @map("completed_at") @db.Timestamptz(6)

  // Add relation to Patient
  patient       Patient           @relation(fields: [patientId], references: [id])

  @@unique([scheduleId, patientId], map: "unique_schedule_patient")
  @@index([patientId, serviceDate], map: "idx_appointments_patient_date")
  @@index([doctorId, serviceDate], map: "idx_appointments_doctor_date")
  @@index([status, serviceDate], map: "idx_appointments_status_date")
  @@index([serviceDate, timeStart], map: "idx_appointments_date_time")
  @@map("appointments")
}

enum AppointmentStatus {
  BOOKED
  CONFIRMED
  RESCHEDULED
  CANCELLED_BY_PATIENT
  CANCELLED_BY_STAFF
  NO_SHOW
  COMPLETED
}

// ScheduleHold model - nếu chưa có
model ScheduleHold {
  id         String   @id @default(cuid()) @db.VarChar(27)
  scheduleId String   @map("schedule_id") @db.VarChar(27)
  patientId  String   @map("patient_id") @db.VarChar(27)
  expiresAt  DateTime @map("expires_at") @db.Timestamptz(6)
  status     String   @default("HELD") @db.VarChar(16)
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  // Add relation to Patient
  patient    Patient  @relation(fields: [patientId], references: [id])

  @@index([scheduleId], map: "idx_schedule_holds_schedule")
  @@index([patientId], map: "idx_schedule_holds_patient")
  @@index([expiresAt], map: "idx_schedule_holds_expires")
  @@map("schedule_holds")
}
```

### 2.2 Generate và run Prisma migration

```bash
# Tạo migration cho patient-booking-service
cd apps/patient-booking-service
npx prisma migrate dev --name "add-patient-model"

# Generate Prisma client
npx prisma generate
```

### 2.3 Remove Patient model từ accounts-service schema

```prisma
// apps/accounts-service/prisma/schema.prisma
// Xóa Patient model và related references
```

```bash
# Tạo migration để remove patient model từ accounts-service
cd apps/accounts-service
npx prisma migrate dev --name "remove-patient-model"
```

---

## Phase 3: Code Migration

### 3.1 Copy Patient module từ accounts-service

```typescript
// apps/patient-booking-service/src/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patient.repository';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule {}
```

```typescript
// apps/patient-booking-service/src/patients/patient.repository.ts
import { Injectable } from '@nestjs/common';
import { CreatePatientDto, UpdatePatientDto } from '@app/contracts';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePatientDto) {
    return this.prisma.patient.create({
      data,
    });
  }

  async findMany(skip?: number, take?: number) {
    return this.prisma.patient.findMany({
      skip,
      take,
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.patient.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.patient.findFirst({
      where: { phone },
    });
  }

  async update(id: string, data: UpdatePatientDto) {
    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.patient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
```

### 3.2 Update main module

```typescript
// apps/patient-booking-service/src/patient-booking-service.module.ts
import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { PatientsModule } from './patients/patients.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AppointmentsModule, PatientsModule],
  providers: [PrismaService],
})
export class PatientBookingServiceModule {}
```

### 3.3 Update appointments service để sử dụng local patient repository

```typescript
// apps/patient-booking-service/src/appointments/appointments.service.ts
import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../patients/patient.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientRepository: PatientRepository,
  ) {}

  async createAppointment(createAppointmentDto: any) {
    // Kiểm tra patient tồn tại locally
    const patient = await this.patientRepository.findById(
      createAppointmentDto.patientId
    );
    
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Create appointment với patient relation
    return this.prisma.appointment.create({
      data: createAppointmentDto,
      include: {
        patient: true,
      },
    });
  }

  async findAppointmentsByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        patient: true,
      },
      orderBy: {
        serviceDate: 'desc',
      },
    });
  }
}
```

### 3.4 Update appointments module để inject PatientRepository

```typescript
// apps/patient-booking-service/src/appointments/appointments.module.ts
import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [PatientsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
```

---

## Phase 4: Update API Gateway

### 4.1 Update message patterns và routing

### 4.2 Update microservice configuration

### 4.3 Update patients controller để sử dụng PATIENT_BOOKING_SERVICE

### 5.2 Update main.ts cho patient-booking-service

---

## Phase 6: Cleanup

### 6.1 Remove patient module từ accounts-service
### 6.2 Update accounts-service module
### 6.3 Update API Gateway để remove patient routes từ accounts-service

## Lưu ý

1. **No data migration**: Vì chưa có patient records, không cần migrate data
2. **Prisma migrations**: Sử dụng Prisma CLI để quản lý schema changes
3. **Service boundaries**: Đảm bảo clear separation giữa accounts (staff) và patients
4. **API consistency**: Maintain existing API endpoints, chỉ thay đổi internal routing
