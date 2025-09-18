Kế hoạch refactor/implement dựa đúng ERD hiện tại của bạn theo yêu cầu: **(A) bỏ role, chuyển sang DB-source-of-truth**.

---

# A) Loại bỏ role, chuyển sang DB-source-of-truth

## 1) Thay đổi dữ liệu (ở **Accounts & Identity**)

Hiện `staff_accounts` có trường `role staff_role` (SUPER\_ADMIN/ADMIN/DOCTOR). Ta **deprecate và thay bằng bảng permission**. Giai đoạn đầu cho phép đọc (backward-compatible), sau đó drop hẳn.&#x20;

**Bảng mới (tối thiểu):**

* `permissions(id, resource, action)` – ví dụ: `appointments:read`, `appointments:update`, `blogs:publish`…
* `user_permissions(user_id, permission_id, effect, tenant_id, conditions jsonb)` – cấp quyền theo user, có thể điều kiện theo clinic/location…
* (tuỳ chọn) `groups`, `user_groups`, `group_permissions` để gom quyền theo “vai” nhưng **quyết định vẫn dựa permission**, không dựa tên role.
* `auth_versions(user_id, version)` – tăng version mỗi khi đổi quyền để **inval cache**.

**Ràng buộc đa domain:** vì `doctors` liên kết logic qua `staff_account_id`, bạn có thể cấp quyền theo **tư cách** (staff/patient) và theo **tenant/location**. Thông tin map doctor↔staff đã có sẵn trong Provider (`doctors.staff_account_id`).&#x20;

## 2) Thay đổi JWT và Gateway

* **JWT** chỉ chứa danh tính tối thiểu: `sub` (id user), `tenant`, `ver` (đọc từ `auth_versions`). **Không nhúng roles**.
* **API Gateway** thay guard:
  `verify JWT ➜ load/caching permission snapshot theo {tenant:user:ver} ➜ enforce('resource','action', ctx)`

  * Cache 30–60s trong Redis; khi đổi quyền tăng `auth_versions.version` ⇒ tự động **invalidate**.
  * Với tác vụ yêu cầu điều kiện (ví dụ chỉ sửa lịch của chính mình), truyền `ctx` (doctor\_id/location\_id) để **enforce theo conditions**.

> Tất cả service phía sau **không tự đọc roles**; chúng nhận `ctx` đã được Gateway chuẩn hoá (hoặc nhận **internal JWT 60–120s** chứa `sub/tenant/ver`) và **tin quyết định allow/deny** của Gateway.