**Đề tài:** 

**Xây dựng Hệ thống Quản lý và** 

**đặt lịch khám bệnh trực tuyến dành cho bệnh viện**

##  **I. Mục tiêu hệ thống**

Cung cấp một nền tảng trực tuyến cho bệnh viện nhằm:

* Hệ thống bao gồm 2 nền tảng là website và mobile app.  
* Quản lý thông tin bác sĩ, chuyên khoa, địa điểm khám và lịch khám.  
* Cho phép người dùng dễ dàng đặt lịch khám theo quy trình linh hoạt.  
* Hỗ trợ giao tiếp giữa người bệnh và bác sĩ thông qua hỏi đáp và đánh giá.

## **II. Các actor chính**

1. Quản lý (Admin)  
2. Siêu quản lý (Super Admin)  
3. Bác sĩ (Doctor)  
4. Người dùng (User)

## **III. Phân tích chức năng theo Actor**

### **1\. Quản lý (Admin)**

* Quản lý tài khoản cá nhân  
  * Đăng nhập, đổi mật khẩu  
* Quản lý tài khoản Bác sĩ  
  * Tạo, cập nhật, xoá tài khoản bác sĩ  
  * Quản lý chuyên khoa, địa điểm làm việc, khung giờ khám của bác sĩ  
  * Đặt lại mật khẩu  
* Quản lý địa điểm khám bệnh  
  * Thêm, sửa, xoá địa điểm khám  
* Quản lý chuyên khoa  
  * Thêm, sửa, xoá chuyên khoa  
* Quản lý Blog  
  * CRUD bài viết (Create, Read, Update, Delete)  
* Quản lý mục Hỏi \- Đáp  
  * Duyệt bài hỏi đáp người dùng gửi  
  * Xoá bài không phù hợp


  

### **2\. Siêu quản lý (Super Admin)**

* Bao gồm toàn bộ vai trò, chức năng và tính năng của Admin  
* Quản lý tài khoản Admin  
  * Thêm, sửa, xoá tài khoản  
  * Đặt lại mật khẩu

### **3\. Bác sĩ (Doctor)**

* Quản lý tài khoản cá nhân  
  * Đăng nhập, đổi mật khẩu  
* Cập nhật hồ sơ bác sĩ  
  * Thông tin cá nhân, chuyên môn  
  * Thời lượng khám mỗi bệnh nhân  
* Quản lý lịch trình  
  * Xem lịch trình cá nhân  
  * Xem danh sách cuộc hẹn (lịch khám của bệnh nhân)  
  * Chỉnh sửa cuộc hẹn  
  * Gửi thông báo qua email cho bệnh nhân (khi thay đổi trạng thái, thời gian,...)  
* Trả lời các bài hỏi đáp của người dùng

### **4\. Người dùng (User)**

* Không yêu cầu tài khoản  
* Xem thông tin:  
  * Bệnh viện, chuyên khoa, bài viết blog  
  * Hồ sơ bác sĩ: giới thiệu, chuyên môn, đánh giá, thành tựu  
* Viết cảm nhận cho bác sĩ  
* Gửi bài hỏi đáp cho bác sĩ  
* Đặt lịch khám: Sau khi chọn địa điểm khám, chọn 1 trong 2 quy trình  
  * **Theo bác sĩ:**  
    * Chọn bác sĩ \-\> chọn ngày \-\> chọn khung giờ còn trống  
  * **Theo ngày:**  
    * Chọn ngày và khung giờ \-\> chọn bác sĩ ưu tiên (không bắt buộc)  
    * Hệ thống sẽ tự sắp xếp bác sĩ phù hợp dựa trên chuyên môn và thời gian rảnh  
  * Nhập thông tin cá nhân và xác nhận đặt lịch  
* Tra cứu trạng thái cuộc hẹn, lịch sử khám bệnh bằng ID được cấp sau khi đặt lịch