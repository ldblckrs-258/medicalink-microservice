# Thiết kế Microservice cho Ứng dụng Đặt lịch Khám Bệnh
# 1) Sơ đồ "bounded context" → 6 service

1. **Accounts & Identity Service**
   Quản lý "đăng nhập/đăng ký/đổi mật khẩu/khôi phục", RBAC (Super Admin, Admin, Doctor).
   • Own dữ liệu: `staff_accounts`, `patients` (ID bệnh nhân 12 ký tự), `permissions`
   • Từ SRS: các use case Đăng nhập/Đổi mật khẩu/Reset mật khẩu; các actor Super Admin/Admin/Doctor/User.

2. **Provider Directory Service**
   Danh bạ nhà cung cấp dịch vụ khám: hồ sơ bác sĩ, chuyên khoa, cơ sở khám, lịch làm việc chuẩn (schedules).
   • Own dữ liệu: `doctors` (1–1 `staff_accounts`), `specialties`, `work_locations`, `doctor_specialties`, `schedules` (slot rảnh)
   • Lý do tách: Đây là "catalog" phục vụ tìm kiếm bác sĩ/chuyên khoa/địa điểm và hiển thị hồ sơ.

3. **Booking & Appointments Service**
   Đặt lịch, xác nhận, huỷ/đổi, chống trùng slot; thực thi 2 luồng "theo bác sĩ" và "theo ngày (hệ thống tự gán bác sĩ phù hợp)".
   • Own dữ liệu: `appointments` (tham chiếu `schedule_id` do Provider quản lý)
   • Business rules: kiểm tra slot, giữ chỗ tạm (TTL) → xác nhận; trạng thái `BOOKED/CONFIRMED/RESCHEDULED/CANCELLED/...`.
   • Hồ sơ `patients`: bao gồm thông tin bệnh nhân.

4. **Content & Community Service**
   Blog/Categories, Hỏi–Đáp (Q\&A), Reviews cho bác sĩ.
   • Own dữ liệu: `blogs`, `blog_categories`, `questions`, `answers`, `reviews`
   • Phục vụ các chức năng đọc blog, đặt câu hỏi, bác sĩ trả lời, bệnh nhân viết cảm nhận.

5. **Notification & Comms Service**
   Gửi email/SMS/push/websocket khi: tạo/đổi/huỷ lịch, bác sĩ trả lời Q\&A, v.v.
   • Own cấu hình kênh gửi và template; không own dữ liệu nghiệp vụ.
   • Nhận sự kiện từ các service khác và fan-out thông báo.

6. **Orchestrator Service**
   Điều phối tất cả giao tiếp giữa các service, quản lý saga và đảm bảo tính nhất quán dữ liệu. Đóng vai trò trung tâm trong kiến trúc, không cho phép các service giao tiếp trực tiếp với nhau.
   • Quản lý cache và read-composition cho các truy vấn phức tạp
   • Xử lý và điều phối tất cả các command và event giữa các service
   • Đảm bảo tính nhất quán dữ liệu xuyên suốt hệ thống
   • Là điểm trung gian bắt buộc cho mọi giao tiếp giữa các service

> **Không tính vào 6 service:** API Gateway/BFF (lớp vào), Message Broker, Observability—xem như lớp hạ tầng.

---

# 2) Biên giới dữ liệu & mapping từ ERD

* **Accounts**: `staff_accounts`, `permissions`.
* **Provider**: `doctors`(link 1–1 `staff_accounts`), `specialties`, `work_locations`, `doctor_specialties`, `schedules` (slot rảnh duy nhất theo (doctor, location, date, time\_range); chống chồng lấp qua ràng buộc logic trong service).
* **Booking**: `appointments` (mỗi lịch hẹn "chiếm" đúng 1 `schedule_id`; service này chịu trách nhiệm vòng đời trạng thái hẹn), `patients` (bao gồm thông tin bệnh nhân).
* **Content**: `blogs`/`blog_categories`, `questions`/`answers`, `reviews` (review có thể ẩn danh; liên kết doctor theo `doctor_id`).
* **Notification**: Quản lý các template thông báo và cấu hình kênh gửi.

Mỗi service có **DB riêng (PostgreSQL)** và **Prisma schema riêng**; chỉ lưu "khóa ngoại logic" (IDs) tới entity của service khác—tránh FK vật lý xuyên DB.

---

# 3) API (tóm tắt) & event giữa các service

### Accounts & Identity

* REST: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot`, `POST /auth/reset`, `GET /me`
* REST: `POST /patients` (tạo nhanh hồ sơ khi đặt lịch), `GET /patients/:id`
* REST: `GET /permissions`, `POST /permissions`, `PUT /permissions/:id`, `DELETE /permissions/:id`
* REST: `GET /staffs`, `POST /staffs`, `PUT /staffs/:id`, `DELETE /staffs/:id`
* Publish to Orchestrator: `PatientProfileUpdated`, `StaffCreated|Updated|RoleChanged`

### Provider Directory

* REST: `GET /doctors?specialty=&date=&location=`, `GET /specialties`, `GET /locations`
* REST: `GET /work-locations`, `POST /work-locations`, `PUT /work-locations/:id`, `DELETE /work-locations/:id`
* REST (internal): `GET /schedules?doctorId=&date=` (trả slot rảnh)
* Publish to Orchestrator: `ScheduleSlotCreated|Updated|Deleted`

### Booking & Appointments

* REST:
  * Theo bác sĩ: `POST /appointments/by-doctor` (doctorId, date, time)
  * Theo ngày: `POST /appointments/by-date` (date, time\[, preferredDoctorId]) → service tự gán bác sĩ phù hợp.
  * `PATCH /appointments/:id/cancel|confirm|reschedule`
* Saga (orchestration): **HoldSlot → ValidatePatient → CreateAppointment → CommitHold**, nếu lỗi → **ReleaseSlot**.
* Publish to Orchestrator: `AppointmentBooked|Confirmed|Rescheduled|Cancelled`
* Consume from Orchestrator: `ScheduleSlot*`, `Patient*`

### Content & Community

* REST: `GET /blogs`, `GET /blogs/:id`, `POST /blogs` (admin), `PUT/DELETE /blogs/:id` (admin)
* REST: `POST /questions`, `GET /questions`, `POST /answers` (doctor); `POST /reviews`
* Publish to Orchestrator: `QuestionCreated`, `AnswerPosted`, `ReviewCreated`

### Notification & Comms

* REST: `GET /notifications`, `POST /notifications`
* Consume from Orchestrator: `Appointment*`, `AnswerPosted`
* Gửi: Email/SMS/FCM/WebSocket tới người dùng/bác sĩ theo template.

### Orchestrator Service

* Quản lý tất cả các saga và quy trình nghiệp vụ phức tạp
* Xử lý read-composition cho các truy vấn phức tạp
* Quản lý cache và đảm bảo tính nhất quán dữ liệu
* Điều phối tất cả event giữa các service:
  * Consume từ tất cả service: `PatientProfileUpdated`, `StaffCreated|Updated|RoleChanged`, `ScheduleSlotCreated|Updated|Deleted`, `AppointmentBooked|Confirmed|Rescheduled|Cancelled`, `QuestionCreated`, `AnswerPosted`, `ReviewCreated`
  * Publish đến các service cần thiết sau khi xử lý logic nghiệp vụ

---

# 4) Giao tiếp & hạ tầng

* **Kiểu giao tiếp**:
   * **Client → Gateway → REST** tới từng service.
   * **Service ↔ Orchestrator ↔ Service**: Không cho phép giao tiếp trực tiếp giữa các service. Tất cả giao tiếp phải thông qua Orchestrator Service sử dụng async **event** qua broker (**RabbitMQ**).
* **Auth**: JWT (access/refresh) do Accounts phát hành; Gateway verify.
* **Cache**: Redis (search bác sĩ theo ngày/chuyên khoa; slot rảnh).
* **Idempotency**: header `Idempotency-Key` cho API đặt/huỷ lịch.
* **Outbox pattern**: phát sự kiện từ DB giao dịch một cách tin cậy (Booking, Content).
* **Observability**: OpenTelemetry (trace), Prometheus (metrics), Loki (logs).
* **Triển khai**: Docker Compose (dev), K8s + HorizontalPodAutoscaler (prod).

---

# 5) Quy tắc nghiệp vụ trọng yếu (điểm kiểm soát)

* **Chống trùng slot**: Provider là nguồn chân lý của `schedules`; Booking chỉ "giữ" & "chiếm" slot đã có. (Đã mô tả slot và unique/index trong ERD).
* **Luồng đặt lịch từ SRS**:
  * *Theo bác sĩ*: chọn bác sĩ → thấy lịch trống → chọn slot → xác nhận.
  * *Theo ngày*: chọn ngày/giờ → gợi ý bác sĩ phù hợp (matching specialty & free slot) → xác nhận.
* **Q\&A/Blog/Reviews**: tách riêng Content, để team content có thể scale/triển khai độc lập.
* **Orchestration**: Sử dụng Orchestrator Service để quản lý các quy trình nghiệp vụ phức tạp và đảm bảo tính nhất quán dữ liệu.

---

# 6) NestJS & Prisma – tổ chức mã nguồn

* **Mono-repo** với **NestJS** + **Prisma** riêng cho mỗi service, `DATABASE_URL` riêng.
* **Repository pattern với Prisma**: Được sử dụng trong một số service để tách domain khỏi ORM và dễ dàng test.
* **DTO & Validation**: `class-validator`, `class-transformer` ở rìa API.
* **Contracts sự kiện**: Sử dụng thư viện `@libs/contracts` (TypeScript type) để chia sẻ định nghĩa giữa các service.
* **Error handling**: Sử dụng `@libs/domain-errors` và `@libs/error-adapters` để xử lý lỗi một cách nhất quán.
* **Message broker**: Sử dụng `@libs/rabbitmq` để giao tiếp giữa các service.
* **Cache**: Sử dụng `@libs/redis` để quản lý cache.

---

# 7) Kế hoạch triển khai và phát triển

1. **Phát triển song song các service**: Mỗi service có thể được phát triển độc lập bởi các team khác nhau.
2. **Tích hợp CI/CD**: Sử dụng GitHub Actions hoặc Jenkins để tự động hóa quy trình build, test và deploy.
3. **Monitoring và logging**: Triển khai ELK stack hoặc Grafana + Prometheus để giám sát hệ thống.
4. **Bảo mật**: Triển khai HTTPS, rate limiting, và các biện pháp bảo mật khác.
5. **Backup và disaster recovery**: Thiết lập quy trình backup và khôi phục dữ liệu.

---
