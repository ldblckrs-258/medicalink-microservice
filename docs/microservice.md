# Thiết kế Microservice cho Ứng dụng Đặt lịch Khám Bệnh
# 1) Sơ đồ “bounded context” → 5 service

1. **Accounts & Identity Service**
   Quản lý “đăng nhập/đăng ký/đổi mật khẩu/khôi phục”, RBAC (Super Admin, Admin, Doctor), và hồ sơ **Patient** tối thiểu để đặt lịch/tra cứu.
   • Own dữ liệu: `staff_accounts`, `patients` (ID bệnh nhân 12 ký tự)
   • Từ SRS: các use case Đăng nhập/Đổi mật khẩu/Reset mật khẩu; các actor Super Admin/Admin/Doctor/User. &#x20;

2. **Provider Directory Service**
   Danh bạ nhà cung cấp dịch vụ khám: hồ sơ bác sĩ, chuyên khoa, cơ sở khám, lịch làm việc chuẩn (schedules).
   • Own dữ liệu: `doctors` (1–1 `staff_accounts`), `specialties`, `work_locations`, `doctor_specialties`, `schedules` (slot rảnh)
   • Lý do tách: Đây là “catalog” phục vụ tìm kiếm bác sĩ/chuyên khoa/địa điểm và hiển thị hồ sơ.&#x20;

3. **Booking & Appointments Service**
   Đặt lịch, xác nhận, huỷ/đổi, chống trùng slot; thực thi 2 luồng “theo bác sĩ” và “theo ngày (hệ thống tự gán bác sĩ phù hợp)”.
   • Own dữ liệu: `appointments` (tham chiếu `schedule_id` do Provider quản lý)
   • Business rules: kiểm tra slot, giữ chỗ tạm (TTL) → xác nhận; trạng thái `BOOKED/CONFIRMED/RESCHEDULED/CANCELLED/...`. &#x20;

4. **Content & Community Service**
   Blog/Categories, Hỏi–Đáp (Q\&A), Reviews cho bác sĩ.
   • Own dữ liệu: `blogs`, `blog_categories`, `questions`, `answers`, `reviews`
   • Phục vụ các chức năng đọc blog, đặt câu hỏi, bác sĩ trả lời, bệnh nhân viết cảm nhận. &#x20;

5. **Notification & Comms Service**
   Gửi email/SMS/push/websocket khi: tạo/đổi/huỷ lịch, bác sĩ trả lời Q\&A, v.v.
   • Own cấu hình kênh gửi và template; không own dữ liệu nghiệp vụ.
   • Nhận sự kiện từ các service khác và fan-out thông báo.

> **Không tính vào 5 service:** API Gateway/BFF (lớp vào), Message Broker, Observability—xem như lớp hạ tầng.

---

# 2) Biên giới dữ liệu & mapping từ ERD

* **Accounts**: `staff_accounts`, `patients` (chứa định danh bệnh nhân để các service khác reference theo “ID ngoại” kiểu string/number – *không FK cross-DB*).&#x20;
* **Provider**: `doctors`(link 1–1 `staff_accounts`), `specialties`, `work_locations`, `doctor_specialties`, `schedules` (slot rảnh duy nhất theo (doctor, location, date, time\_range); chống chồng lấp qua ràng buộc logic trong service).&#x20;
* **Booking**: `appointments` (mỗi lịch hẹn “chiếm” đúng 1 `schedule_id`; service này chịu trách nhiệm vòng đời trạng thái hẹn).&#x20;
* **Content**: `blogs`/`blog_categories`, `questions`/`answers`, `reviews` (review có thể ẩn danh; liên kết doctor theo `doctor_id`).&#x20;

Mỗi service có **DB riêng (PostgreSQL)** và **Prisma schema riêng**; chỉ lưu “khóa ngoại logic” (IDs) tới entity của service khác—tránh FK vật lý xuyên DB.

---

# 3) API (tóm tắt) & event giữa các service

### Accounts & Identity

* REST: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot`, `POST /auth/reset`, `GET /me`
* REST: `POST /patients` (tạo nhanh hồ sơ khi đặt lịch), `GET /patients/:id`
* Publish: `PatientProfileUpdated`, `StaffCreated|Updated|RoleChanged`

### Provider Directory

* REST: `GET /doctors?specialty=&date=&location=`, `GET /specialties`, `GET /locations`
* REST (internal): `GET /schedules?doctorId=&date=` (trả slot rảnh)
* Publish: `ScheduleSlotCreated|Updated|Deleted`

### Booking & Appointments

* REST:

  * Theo bác sĩ: `POST /appointments/by-doctor` (doctorId, date, time)
  * Theo ngày: `POST /appointments/by-date` (date, time\[, preferredDoctorId]) → service tự gán bác sĩ phù hợp.
  * `PATCH /appointments/:id/cancel|confirm|reschedule`
* Saga (orchestration ngắn): **HoldSlot → ValidatePatient → CreateAppointment → CommitHold**, nếu lỗi → **ReleaseSlot**.
* Publish: `AppointmentBooked|Confirmed|Rescheduled|Cancelled`
* Consume: `ScheduleSlot*` (Provider), `Patient*` (Accounts)

### Content & Community

* REST: `GET /blogs`, `GET /blogs/:id`, `POST /blogs` (admin), `PUT/DELETE /blogs/:id` (admin)
* REST: `POST /questions`, `GET /questions`, `POST /answers` (doctor); `POST /reviews`
* Publish: `QuestionCreated`, `AnswerPosted`, `ReviewCreated`

### Notification & Comms

* Consume: `Appointment*`, `AnswerPosted`
* Gửi: Email/SMS/FCM/WebSocket tới người dùng/bác sĩ theo template.

---

# 4) Giao tiếp & hạ tầng

* **Kiểu giao tiếp**:

  * **Client → Gateway → REST** tới từng service.
  * **Service ↔ Service**: async **event** qua broker (**NATS**/**RabbitMQ**).
* **Auth**: JWT (access/refresh) do Accounts phát hành; Gateway verify.
* **Cache**: Redis (search bác sĩ theo ngày/chuyên khoa; slot rảnh).
* **Idempotency**: header `Idempotency-Key` cho API đặt/huỷ lịch.
* **Outbox pattern**: phát sự kiện từ DB giao dịch một cách tin cậy (Booking, Content).
* **Observability**: OpenTelemetry (trace), Prometheus (metrics), Loki (logs).
* **Triển khai**: Docker Compose (dev), K8s + HorizontalPodAutoscaler (prod).

---

# 5) Quy tắc nghiệp vụ trọng yếu (điểm kiểm soát)

* **Chống trùng slot**: Provider là nguồn chân lý của `schedules`; Booking chỉ “giữ” & “chiếm” slot đã có. (Đã mô tả slot và unique/index trong ERD).&#x20;
* **Luồng đặt lịch từ SRS**:

  * *Theo bác sĩ*: chọn bác sĩ → thấy lịch trống → chọn slot → xác nhận.
  * *Theo ngày*: chọn ngày/giờ → gợi ý bác sĩ phù hợp (matching specialty & free slot) → xác nhận.&#x20;
* **Q\&A/Blog/Reviews**: tách riêng Content, để team content có thể scale/triển khai độc lập.&#x20;

---

# 6) NestJS & Prisma – tổ chức mã nguồn

* **Mỗi service = 1 repo** (hoặc mono-repo Nx) với **NestJS** + **Prisma** riêng, `DATABASE_URL` riêng.
* **Repository pattern với Prisma?** Thường **không bắt buộc** (Prisma đã là data mapper); chỉ tạo repository nếu bạn cần **tách domain khỏi ORM** (ví dụ swap storage, fake repo cho test). Còn lại, dùng `PrismaService` trực tiếp trong layer `*.service.ts` là đủ “clean”.
* **DTO & Validation**: `class-validator`, `class-transformer` ở rìa API.
* **Contracts sự kiện**: share package `@contracts` (TypeScript type) giữa các service.

---

# 7) Kế hoạch chuyển đổi theo từng giai đoạn (strangler)

1. **Đặt Gateway + Accounts** (JWT, RBAC) – cắm vào monolith hiện có.
2. **Tách Provider Directory** (doctors/specialties/locations/schedules) – ít rủi ro giao dịch.
3. **Tách Booking** – đưa luồng đặt lịch vào service mới, vẫn dùng UI cũ qua Gateway.
4. **Tách Content** (Blog/Q\&A/Reviews).
5. **Bổ sung Notification** + event hoá toàn bộ.
6. Xoá dần logic trùng trong monolith; giữ “thông tin tham chiếu” bằng IDs giữa các DB.

---

## Bonus: Event mẫu (TypeScript)

```ts
// booking.contracts.ts
export type AppointmentBooked = {
  event: 'AppointmentBooked';
  data: {
    appointmentId: number;
    patientId: string;   // from Accounts.patients
    doctorId: number;    // resolved by Provider from schedule
    scheduleId: number;
    date: string;        // ISO
    timeStart: string;   // HH:mm
    timeEnd: string;     // HH:mm
  };
  occurredAt: string;    // ISO
};
```
