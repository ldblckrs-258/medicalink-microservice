

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

**(Software Requirement Specification – SRS)**

**Xây dựng Hệ thống Quản lý và đặt lịch khám bệnh cho bệnh viện**

**Phiên bản 1.0**

**Hướng dẫn bởi: TS. Nguyễn Văn Hiệu**  
**Thực hiện bởi:** 

- **Lê Đức Bảo**  
- **Định Đức**  
  - **Lê Viết Vĩnh Phú**  
- **Hà Văn Nguyên**

  **Đà Nẵng, tháng 8, năm 2025**

1. # **Giới thiệu** {#giới-thiệu}

   1. ### ***Mục đích*** {#mục-đích}

Tài liệu này đặc tả các yêu cầu chức năng và phi chức năng cho "Hệ thống Quản lý và Đặt lịch khám bệnh trực tuyến". Mục tiêu của dự án là xây dựng một nền tảng số hóa toàn diện (bao gồm website và ứng dụng di động) nhằm tối ưu hóa quy trình quản lý và vận hành của bệnh viện, đồng thời mang lại trải nghiệm tiện lợi và hiện đại cho người dùng (bệnh nhân).

Hệ thống sẽ là cầu nối hiệu quả giữa bệnh nhân và đội ngũ y bác sĩ, giúp đơn giản hóa việc tìm kiếm thông tin, đặt lịch khám và tương tác với bệnh viện.

2. ### ***Phạm vi*** {#phạm-vi}

Hệ thống sẽ cung cấp các chức năng chính sau:

* Quản lý thông tin bệnh viện: Cho phép quản trị viên quản lý danh sách bác sĩ, chuyên khoa, địa điểm và lịch làm việc một cách chi tiết.  
* Đặt lịch khám trực tuyến: Cung cấp cho người dùng quy trình đặt lịch khám linh hoạt, cho phép lựa chọn theo bác sĩ hoặc theo ngày giờ cụ thể.  
* Tương tác người dùng: Hỗ trợ các tính năng hỏi đáp giữa người dùng và bác sĩ, cùng với việc cho phép người dùng gửi đánh giá, cảm nhận về chất lượng dịch vụ.  
* Quản lý nội dung: Cung cấp công cụ để quản lý các bài viết, tin tức (Blog) của bệnh viện.  
* Tra cứu thông tin: Người dùng có thể dễ dàng tra cứu thông tin về bệnh viện, bác sĩ, chuyên khoa, trạng thái lịch hẹn và lịch sử khám bệnh.  
* Phân quyền người dùng: Hệ thống có các vai trò người dùng khác nhau với các quyền hạn được xác định rõ ràng để đảm bảo an toàn và bảo mật thông tin.

  3. ### ***Từ điển thuật ngữ*** {#từ-điển-thuật-ngữ}

| Thuật ngữ | Diễn giải |
| :---- | :---- |
| Software Requirements Specifications  (SRS) | Tài liệu Đặc tả Yêu cầu Phần mềm |
| Use Case(s) | Biểu đồ mô tả những yêu cầu của hệ thống |
| Actor | Tác nhân \- Một người hoặc một hệ thống khác tương tác với hệ thống đang xây dựng. |
| User | Người dùng cuối, là bệnh nhân hoặc người có nhu cầu khám bệnh. |
| Doctor | Bác sĩ \- Người cung cấp dịch vụ khám chữa bệnh. |
| Admin | Quản lý \- Người quản trị nội dung và các hoạt động của hệ thống. |
| Super Admin | Siêu quản lý \- Người có quyền quản trị cao nhất, bao gồm cả việc quản lý tài khoản Admin. |
| CRUD | Create, Read, Update, Delete \- Các thao tác cơ bản để quản lý dữ liệu. |

**Bảng 1-1: Từ điển thuật ngữ**

4. ### ***Tài liệu tham khảo*** {#tài-liệu-tham-khảo}

* IEEE Recommended Practice for Software Requirements Specifications," in IEEE Std 830-1998, vol., no., pp.1-40, 20 Oct. 1998\.

* IEEE Guide for Developing System Requirements Specifications," in IEEE Std 1233-1996, vol., no., pp.1-30, 22 Dec. 1996\.

* Custom Software Requirements Specification Document Example (International Standard) \- Software Development Company.

* IT4490:	Software	Design	and	Construction	\-	Nguyen	Thi	Thu	Trang, [trangntt@soict.hust.edu.vn.](mailto:trangntt@soict.hust.edu.vn)

  5. ### ***Tổng quát*** {#tổng-quát}

Tài liệu này được viết dựa theo chuẩn của Tài liệu đặc tả yêu cầu phần mềm (Software Requirements Specifications \- SRS) được giải thích trong "IEEE Recommended Practice for Software Requirements Specifications" và " IEEE Guide for Developing System Requirements Specifications".

Với cấu trúc được chia làm ba phần:

1. Phần 1: Cung cấp cái nhìn tổng quan về các thành phần của SRS.

2. Phần 2: Mô tả tổng quan các nhân tố, ràng buộc, đặc điểm người dùng, môi trường thực thi tác động lên hệ thống và các yêu cầu của nó. Cung cấp thông tin chi tiết các yêu cầu chức năng, cung cấp cho các nhà phát triển phần mềm thông tin để phát triển phần mềm đáp ứng được các yêu cầu đó.

3. Phần 3: Các yêu cầu phi chức năng.

2. ## **Các yêu cầu chức năng** {#các-yêu-cầu-chức-năng}

   1. ### ***Các tác nhân*** {#các-tác-nhân}

Hệ thống có 4 tác nhân chính, mỗi tác nhân có vai trò và chức năng riêng biệt:

1. Người dùng (User): Là bệnh nhân hoặc người có nhu cầu tìm hiểu thông tin và đặt lịch khám.  
2. Bác sĩ (Doctor): Là các y bác sĩ làm việc tại bệnh viện, sử dụng hệ thống để quản lý công việc.  
3. Quản lý (Admin): Là nhân viên quản trị của bệnh viện, chịu trách nhiệm quản lý nội dung và các thông tin cốt lõi.  
4. Siêu quản lý (Super Admin): Là người có quyền hạn cao nhất trong hệ thống, bao gồm quản lý tài khoản Admin

   2. ### ***Các chức năng của hệ thống*** {#các-chức-năng-của-hệ-thống}

1. Đăng nhập: Chức năng này nhằm mục đích xác thực người dùng khi tương tác với hệ thống nhằm cung cấp quyền cũng như phạm vi truy cập hệ thống.

2. Đăng ký: Để truy cập sử dụng hệ thống thì Người dùng trước hết cần đăng ký tài khoản.

3. Quản trị người dùng: Quản trị viên có vai trò quản trị những người dùng trong hệ thống.

4. Các nhóm chức năng quản lý khóa học, bài giảng, bài tập: Công việc quản trị khóa học của Giảng viên.

5. Đăng ký khóa học: Người dùng sử dụng chức năng nhằm mục đích ghi danh, truy cập đến nguồn kiến thức từ những khóa học do Giảng viên tạo ra.

Để có thể hình dung rõ hơn về các tác nhân cũng như yêu cầu chức năng của hệ thống bằng cách mô hình hóa chúng dưới các sơ đồ use cases, các sơ đồ sẽ được trình bày phía sau.

3. ### ***Biểu đồ use case tổng quan*** {#biểu-đồ-use-case-tổng-quan}

***![][image1]***  
**Hình 2-1: Biểu đồ use case Tổng quan**

4. ### ***Biểu đồ use case phân rã*** {#biểu-đồ-use-case-phân-rã}

   1. #### Phân rã use case “Quản trị viên” {#phân-rã-use-case-“quản-trị-viên”}

![][image2]

**Hình 2-2: Biểu đồ use case Quản trị viên**

2. #### Phân rã use case “Bác sĩ” {#phân-rã-use-case-“bác-sĩ”}

![][image3]  
**Hình 2-3: Biểu đồ use case Bác sĩ**

3. #### Phân rã use case “Người dùng”

![][image4]  
**Hình 2-4: Biểu đồ use case Người dùng.**

5. ### ***Đặc tả các usecase*** {#đặc-tả-các-usecase}

   1. #### Đăng nhập {#đăng-nhập}

| Mã Use case | UC001 |  |  |  | Tên Use case | Đăng nhập |  |
| :---- | :---- | ----- | :---- | ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin và Doctor |  |  |  |  |  |  |
| **Mô tả** | Tác nhân đăng nhập vào hệ thống để sử dụng các chức năng hệ thống |  |  |  |  |  |  |
| **Sự kiện kích hoạt** | Click vào nút đăng nhập trên giao diện website |  |  |  |  |  |  |
| **Tiền điều kiện** | Tác nhân đã có tài khoản trên hệ thống |  |  |  |  |  |  |
| **Luồng sự kiện chính (Thành công)** |  | **STT** | **Thực hiện bởi** | **Hành động** |  |  |  |
|  |  | 1\. | Tác nhân | Chọn chức năng Đăng nhập |  |  |  |
|  |  | 2\. | Hệ thống | Hiển thị giao diện đăng nhập |  |  |  |
|  |  | 3\. | Tác nhân | Nhập email và mật khẩu (mô tả phía dưới \*) |  |  |  |
|  |  | 4\. | Tác nhân | Yêu cầu đăng nhập |  |  |  |
|  |  | 5\. | Hệ thống | Kiểm tra xem khách đã nhập các trường bắt buộc nhập hay chưa |  |  |  |
|  |  | 6\. | Hệ thống | Kiểm tra email và mật khẩu có hợp lệ do Tác nhân nhập trong hệ thống hay không |  |  |  |
|  |  | 7\. | Hệ thống | Hiển thị chức năng tương ứng đối với Tác nhân |  |  |  |
| **Luồng sự kiện thay thế** |  | **STT** | **Thực hiện bởi** | **Hành động** |  |  |  |
|  |  | 6a. | Hệ thống | Thông báo lỗi: Cần nhập các trường bắt buộc nhập nếu Tác nhân nhập thiếu |  |  |  |
|  |  | 7a. | Hệ thống | Thông báo lỗi: Email và/hoặc mật khẩu chưa đúng nếu không tìm thấy email và mật khẩu trong hệ thống |  |  |  |
| **Hậu điều kiện** | Tác nhân đăng nhập được vào hệ thống |  |  |  |  |  |  |

**Bảng 2-1: Đặc tả chức năng “Đăng nhập”**

0. Dữ liệu đầu vào gồm các trường dữ liệu sau:

|  STT | Trường dữ liệu |  Mô tả |  Bắt buộc? |  Điều kiện hợp lệ |  Ví dụ |
| ----- | :---- | ----- | :---- | :---- | ----- |
| 1\. | Email | Input email field | Có | Đúng định dạng email | [qndev@gmail.com](mailto:qndev@gmail.com) |
| 2\. | Mật khẩu | Password field | Có | Tối thiểu 8 ký tự, có ít nhất 1 chữ cái và 1 số | Password |

**Bảng 2-2: Dữ liệu chức năng “Đăng nhập”**

2. #### Thay đổi mật khẩu {#thay-đổi-mật-khẩu}

| Mã Use case | UC002 |  |  | Tên Use case | Thay đổi mật khẩu |  |
| :---- | :---- | ----- | :---- | ----- | :---- | :---- |
| **Tác nhân** | Doctor, Admin, Super admin |  |  |  |  |  |
| **Mô tả** | Tác nhân muốn thay đổi mật khẩu để bảo vệ tài khoản |  |  |  |  |  |
| **Sự kiện kích hoạt** | Click vào dropbox Profile item, đối với Super Admin và Admin, dropbox liên kết “Change Password” đối với Doctor trên phần đầu trang |  |  |  |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công vào hệ thống |  |  |  |  |  |
| **Luồng sự kiện chính (Thành công)** |  | **STT** | **Thực hiện bởi** | **Hành động** |  |  |
|  |  | 1\. | Tác nhân | Chọn chức năng Thay đổi mật khẩu |  |  |
|  |  | 2\. | Hệ thống | Hiển thị giao diện chức năng thay đổi mật khẩu |  |  |
|  |  | 3\. | Tác nhân | Điền thông tin mật khẩu cũ để xác minh, mật khẩu mới để thay đổi và xác minh lại mật khẩu mới trùng khớp với mật khẩu cần thay đổi |  |  |
|  |  | 4\. | Tác nhân | Yêu cầu thay đổi mật khẩu |  |  |
|  |  | 5\. | Hệ thống | Kiểm tra mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới có trùng khớp và tiến hành thay đổi mật khẩu |  |  |
| **Luồng sự kiện thay thế** |  | **STT** | **Thực hiện bởi** | **Hành động** |  |  |
|  |  | 5a. | Hệ thống | Thông báo lỗi nếu thông tin mật khẩu đối tượng cung cấp không đúng hoặc không trùng khớp |  |  |
| **Hậu điều kiện** | Cập nhật mật khẩu mới vào hệ thống |  |  |  |  |  |

**Bảng 2-3: Đặc tả chức năng “Thay đổi mật khẩu”**

\*Ghi chú: Đối với tác nhân là Nhân viên quản lý và Siêu quản lý thì use case thay đổi mật khẩu sẽ tích hợp vào use case cập nhật thông tin cá nhân với hai trường Input field là Password và Password Confirm. Đối với tác nhân là Bác sĩ thì cần cung cấp thông tin mật khẩu cũ để xác minh.

3. #### Thiết lập lại mật khẩu {#thiết-lập-lại-mật-khẩu}

| Mã Use case | UC003 | Tên Use case | Thiết lập lại mật khẩu |
| :---- | :---- | :---- | :---- |
| **Tác nhân** | Doctor, Admin, Super Admin |  |  |
| **Mô tả** | Tác nhân muốn thiết lập lại mật khẩu khi quên mật khẩu |  |  |
| **Sự kiện kích hoạt** | Click vào liên kết “Lost your password?” đối với Admin, Super Admin và “Forgot password?” đối với Doctor tại trang đăng nhập |  |  |
| **Tiền điều kiện** | Tồn tại tài khoản cần thiết lập lại mật khẩu trên hệ thống |  |  |

| Luồng sự kiện chính |  | STT | Thực hiện bởi | Hành động |  |
| :---- | :---- | ----- | :---- | ----- | :---- |
| **(Thành công)** |  | 1\. | Tác nhân | Chọn chức năng Thiết lập lại mật khẩu (sự kiện kích hoạt bên trên) |  |
|  |  | 2\. | Hệ thống | Hiển thị giao diện chức năng thiết lập lại mật khẩu |  |
|  |  | 3\. | Tác nhân | Nhập email tương ứng với tài khoản cần thiết lập lại mật khẩu |  |
|  |  | 4\. | Tác nhân | Yêu cầu thiết lập lại mật khẩu (submit nút để gửi yêu cầu) |  |
|  |  | 5\. | Hệ thống | Kiểm tra định dạng email có đúng không và có tồn tại tài khoản ứng với email mà Người dùng nhập không, nếu thỏa mãn hệ thống sẽ gửi liên kết thiết lập lại mật khẩu đến email cho Người dùng |  |
| **Luồng sự kiện thay thế** |  | **STT** | **Thực hiện bởi** | **Hành động** |  |
|  |  | 5a. | Hệ thống | Thông báo lỗi nếu thông tin mật khẩu đối tượng cung cấp không đúng hoặc không trùng khớp |  |
|  |  | 5b. | Hệ thống | Thông báo thành công nếu gửi được liên kết đến cho Người dùng |  |
| **Hậu điều kiện** | Hệ thống gửi được liên kết thiết lập lại mật khẩu đến email người yêu cầu thiết lập lại mật khẩu (liên kết thiết lập lại mật khẩu chỉ tồn tại trong vòng 10 phút) |  |  |  |  |

**Bảng 2-4: Đặc tả chức năng “Thiết lập lại mật khẩu”**

4. #### Quản lý tài khoản Admin {#quản-lý-tài-khoản-admin}

| Mã Use case | UC005 | Tên Use case | Quản lý tài khoản Admin |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem, thêm, sửa, xóa, đặt lại mật khẩu các tài khoản Admin |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý Admin” ở thanh điều hướng để vào trang Quản lý tài khoản Admin, sau đó click vào các nút tương ứng với các tác vụ  |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin Click vào “Quản lý Admin” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các tài khoản admin **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách tài khoản admin trống  **Tìm kiếm (S \- Search)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin Nhập từ khoá vào ô tìm kiếm 2 Hệ thống Lấy và hiển thị danh sách các tài khoản admin có email hoặc tên trùng khớp với từ khoá tìm kiếm **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách tài khoản admin phù hợp điều kiện là trống **Thêm tài khoản mới (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin Click vào nút “Thêm mới” 2 Hệ thống Hiển thị giao diện thêm tài khoản admin mới với form điển thông tin 3 Super Admin Nhập các thông tin cần thiết để tạo mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện thêm tài khoản **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Cập nhật tài khoản (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin Click vào nút “Chỉnh sửa” trên hàng của một tài khoản Admin 2 Hệ thống Hiển thị giao diện chỉnh sửa tài khoản admin 3 Super Admin Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện cập nhật tài khoản **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công **Xoá tài khoản (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin Click vào nút “Xoá” trên hàng của một tài khoản Admin 2 Hệ thống Hiển thị giao diện xác nhận xoá tài khoản admin 3 Super Admin Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xoá 4 Hệ thống Kiểm tra mật khẩu Super Admin 5 Hệ thống Xoá dữ liệu tài khoản Admin được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
|  **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

**Bảng 2-7: Đặc tả chức năng “Quản lý tài khoản Admin”**

0. Dữ liệu đầu vào chức năng Tìm kiếm tài khoản Admin:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Từ khoá tìm kiếm | Input text field | Không | Ít nhất 1 ký tự | dmin001@ |

**Bảng 2-8: Dữ liệu chức năng “Tìm kiếm tài khoản Admin”**

1. Dữ liệu đầu vào chức năng Tạo tài khoản Admin:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Có | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Họ tên | Input text field | Có | Chỉ chứa chữ cái và khoảng trắng, ít nhất 3 ký tự, nhiều nhất 50 ký tự | Nguyễn Văn A |
| 3 | Ngày sinh | Date picker | Không | Ngày hợp lệ, trước ngày hôm nay. | 01/01/2000 |

**Bảng 2-8: Dữ liệu chức năng “Tạo tài khoản Admin”**

2. Dữ liệu đầu vào chức năng Cập nhật tài khoản Admin:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Có | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Họ tên | Input text field | Có | Chỉ chứa chữ cái và khoảng trắng, ít nhất 3 ký tự, nhiều nhất 50 ký tự | Nguyễn Văn A |
| 3 | Ngày sinh | Date picker | Không | Ngày hợp lệ, trước ngày hôm nay. | 01/01/2000 |
| 4 | Mật khẩu mới | Input text field | Không | Ít nhất 8 ký tự, ít nhất chứa 1 chữ cái và 1 số | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Cập nhật khoản Admin”**

3. Dữ liệu đầu vào chức năng Xoá tài khoản Admin:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-9: Dữ liệu chức năng “Xoá tài khoản Admin”**

5. #### Quản lý Blog

| Mã Use case | UC006 | Tên Use case | Quản lý Blog |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem danh sách, thêm, sửa, xóa các bài viết (Blog) |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý Blog” ở thanh điều hướng để vào trang Quản lý Blog, sau đó click vào các nút tương ứng với các tác vụ |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào “Quản lý Blog” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các bài blog **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách blog trống  **Tìm kiếm (S \- Search)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Nhập từ khoá vào ô tìm kiếm và/hoặc lựa chọn các mục trong bộ lọc 2 Hệ thống Lấy và hiển thị danh sách các bài blog có tiêu đề hoặc mô tả khớp với từ khóa tìm kiếm và/hoặc phù hợp với bộ lọc **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách blog phù hợp điều kiện là trống **Thêm Blog mới (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Thêm mới” 2 Hệ thống Điều hướng sang trang “Thêm blog mới” 3 Tác nhân Nhập các thông tin cần thiết để tạo Blog mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và quay lại trang Quản lý Blog **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Chỉnh sửa Blog (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Chỉnh sửa” trên hàng của một Blog 2 Hệ thống Hiển thị giao diện chỉnh sửa Blog 3 Tác nhân Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và quay lại trang quản lý Blog **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công **Xoá Blog (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Xoá” trên hàng của một Blog 2 Hệ thống Hiển thị giao diện xác nhận xoá tài khoản Blog 3 Tác nhân Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xoá 4 Hệ thống Kiểm tra mật khẩu Admin/Super Admin 5 Hệ thống Xoá dữ liệu tài bài Blog được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
| **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

**Bảng 2-7: Đặc tả chức năng “Quản lý Blog”**

0. Dữ liệu đầu vào chức năng Tìm kiếm Blog:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Từ khóa tìm kiếm | Input text field | Không | Ít nhất 1 ký tự | Bệnh sởi |
| 2 | Bộ lọc Chuyên mục | Select Dropdown | Không | Chọn 1 trong các giá trị có sẵn trong danh sách Chuyên mục | Tin tức cộng đồng |
| 3 | Bộ lọc Sắp xếp | Select Dropdown | Không | Chọn 1 trong các giá trị có sẵn trong danh sách Bộ lọc sắp xếp | Được đăng gần nhất |

**Bảng 2-8: Dữ liệu chức năng “Tìm kiếm Blog”**

1. Dữ liệu đầu vào chức năng Tạo Blog:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tiêu đề | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 500 ký tự | Những thông tin cần biết về bệnh Sởi |
| 2 | Mô tả | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 1000 ký tự | Bài viết cung cấp những thông tin quan trọng về bệnh sởi, bao gồm… |
| 3 | Chuyên mục | Select Dropdown | Có | Chọn 1 trong các giá trị có sẵn trong danh sách Chuyên mục | Cẩm nang bệnh học |
| 4 | Nội dung | Text editor | Có | Chuỗi ký tự bất kì | Để bắt đầu với bài viết… |

**Bảng 2-8: Dữ liệu chức năng “Tạo Blog”**

2. Dữ liệu đầu vào chức năng Chỉnh sửa Blog:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tiêu đề | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 500 ký tự | Những thông tin cần biết về bệnh Sởi |
| 2 | Mô tả | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 1000 ký tự | Bài viết cung cấp những thông tin quan trọng về bệnh sởi, bao gồm… |
| 3 | Chuyên mục | Select Dropdown | Có | Chọn 1 trong các giá trị có sẵn trong danh sách Chuyên mục | Cẩm nang bệnh học |
| 4 | Nội dung | Text editor | Có | Chuỗi ký tự bất kì | Để bắt đầu với bài viết… |

**Bảng 2-8: Dữ liệu chức năng “Chỉnh sửa Blog”**

3. Dữ liệu đầu vào chức năng Xóa Blog:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Admin/ Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Xóa Blog”**

6. #### Quản lý mục Hỏi & Đáp

| Mã Use case | UC006 | Tên Use case | Quản lý Mục hỏi đáp |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem danh sách, và xóa bài hỏi đáp không phù hợp |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý mục Hỏi & Đáp” ở thanh điều hướng để vào trang Quản lý mục Hỏi & Đáp, sau đó click vào các nút tương ứng với các tác vụ |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào “Mục Hỏi & Đáp” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các bài hỏi đáp **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách blog trống  **Tìm kiếm (S \- Search)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Nhập từ khoá vào ô tìm kiếm 2 Hệ thống Lấy và hiển thị danh sách các bài hỏi đáp có nội dung  khớp với từ khóa tìm kiếm **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách bài hỏi đáp phù hợp điều kiện là trống **Xóa Bài hỏi đáp (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Xoá” trên hàng của một bài hỏi đáp 2 Hệ thống Hiển thị giao diện xác nhận xóa bài hỏi đáp 3 Tác nhân Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xóa 4 Hệ thống Kiểm tra mật khẩu Admin/Super Admin 5 Hệ thống Xoá dữ liệu tài bài hỏi đáp được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
| **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Khi xóa thành công, dữ liệu được lưu trữ sẽ được loại bỏ và không còn hiển thị ở bất kỳ đâu nữa. |  |  |

**Bảng 2-7: Đặc tả chức năng “Quản lý mục Hỏi & Đáp”**

0. Dữ liệu đầu vào chức năng Tìm kiếm bài hỏi đáp:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Từ khóa tìm kiếm | Input text field | Không | Ít nhất 1 ký tự | Triệu chứng của bệnh |

**Bảng 2-8: Dữ liệu chức năng “Tìm kiếm Blog”**

1. Dữ liệu đầu vào chức năng Xóa bài hỏi đáp:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Admin/ Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Xóa bài hỏi đáp”**

7. #### Quản lý Địa điểm làm việc

| Mã Use case | UC007 | Tên Use case | Quản lý Địa điểm làm việc |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem danh sách, thêm, sửa, xóa địa điểm làm việc |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý Địa điểm làm việc” ở thanh điều hướng để vào trang Quản lý Địa điểm làm việc, sau đó click vào các nút tương ứng với các tác vụ |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào “Quản lý Địa điểm làm việc” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các Địa điểm làm việc **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách Địa điểm làm việc trống  **Thêm Địa điểm làm việc mới (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Thêm mới” 2 Hệ thống Mở giao diện  “Thêm địa điểm làm việc mới” 3 Tác nhân Nhập các thông tin cần thiết để tạo Địa điểm làm việc mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện thêm mới **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Chỉnh sửa Địa điểm làm việc (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Chỉnh sửa” trên hàng của một Địa điểm làm việc 2 Hệ thống Hiển thị giao diện chỉnh sửa Địa điểm làm việc 3 Tác nhân Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện chỉnh sửa **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công  **Xóa Địa điểm làm việc (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Xoá” trên hàng của một Địa điểm làm việc 2 Hệ thống Hiển thị giao diện xác nhận xóa Địa điểm làm việc 3 Tác nhân Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xóa 4 Hệ thống Kiểm tra mật khẩu Admin/Super Admin 5 Hệ thống Xoá dữ liệu tài bài hỏi đáp được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
| **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

   0. Dữ liệu đầu vào chức năng Tạo Địa điểm làm việc:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tiêu đề | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 200 ký tự | Chi nhánh 01 |
| 2 | Địa chỉ | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 500 ký tự | 90 Nguyễn Lương Bằng |

**Bảng 2-8: Dữ liệu chức năng “Tạo Địa điểm làm việc”**

1. Dữ liệu đầu vào chức năng Chỉnh sửa Địa điểm làm việc:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tiêu đề | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 200 ký tự | Chi nhánh 01 |
| 2 | Địa chỉ | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 500 ký tự | 90 Nguyễn Lương Bằng |

**Bảng 2-8: Dữ liệu chức năng “Chỉnh sửa Địa điểm làm việc”**

2. Dữ liệu đầu vào chức năng Xóa Địa điểm làm việc:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Admin/ Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Xóa Địa điểm làm việc”**

8. #### Quản lý Chuyên khoa

| Mã Use case | UC008 | Tên Use case | Quản lý Chuyên khoa |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem danh sách, thêm, sửa, xóa Chuyên khoa |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý Chuyên khoa” ở thanh điều hướng để vào trang Quản lý Chuyên khoa, sau đó click vào các nút tương ứng với các tác vụ |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào “Quản lý Chuyên khoa” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các Chuyên khoa **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách Chuyên khoa trống  **Thêm Chuyên khoa (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Thêm mới” 2 Hệ thống Mở giao diện  “Thêm Chuyên khoa mới” 3 Tác nhân Nhập các thông tin cần thiết để tạo Chuyên khoa mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện thêm mới **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Chỉnh sửa Chuyên khoa (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Chỉnh sửa” trên hàng của một Chuyên khoa 2 Hệ thống Hiển thị giao diện chỉnh sửa Địa điểm làm việc 3 Tác nhân Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện chỉnh sửa **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công  **Xóa Chuyên khoa (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Xoá” trên hàng của một Chuyên khoa 2 Hệ thống Hiển thị giao diện xác nhận xóa Chuyên khoa 3 Tác nhân Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xóa 4 Hệ thống Kiểm tra mật khẩu Admin/Super Admin 5 Hệ thống Xoá dữ liệu tài bài hỏi đáp được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
| **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

   0. Dữ liệu đầu vào chức năng Tạo Chuyên khoa:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tên chuyên khoa | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 200 ký tự | Răng Hàm Mặt |
| 2 | Mô tả | Input text field | Không | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 1000 ký tự | Chuyên khoa Răng hàm mặt |

**Bảng 2-8: Dữ liệu chức năng “Tạo Chuyên khoa”**

1. Dữ liệu đầu vào chức năng Chỉnh sửa Chuyên khoa:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tên chuyên khoa | Input text field | Có | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 200 ký tự | Răng Hàm Mặt |
| 2 | Mô tả | Input text field | Không | Chuỗi ký tự, ít nhất 10 ký tự, nhiều nhất 1000 ký tự | Chuyên khoa Răng hàm mặt |

**Bảng 2-8: Dữ liệu chức năng “Chỉnh sửa Chuyên khoa”**

2. Dữ liệu đầu vào chức năng Xóa Chuyên khoa:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Admin/ Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Xóa Chuyên khoa”**

9. #### Quản lý tài khoản Bác sĩ. {#quản-lý-tài-khoản-bác-sĩ.}

| Mã Use case | UC009 | Tên Use case | Quản lý tài khoản Bác sĩ |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Super Admin, Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ như xem, thêm, sửa, xóa, đặt lại mật khẩu các tài khoản Bác sĩ (Doctor) |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý Bác sĩ” ở thanh điều hướng để vào trang Quản lý tài khoản Bác sĩ, sau đó click vào các nút tương ứng với các tác vụ  |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin, Admin Click vào “Quản lý Bác sĩ” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị danh sách các tài khoản bác sĩ. **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách tài khoản bác sĩ trống  **Tìm kiếm (S \- Search)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin, Admin Nhập từ khoá vào ô tìm kiếm 2 Hệ thống Lấy và hiển thị danh sách các tài khoản bác sĩ có email hoặc tên trùng khớp với từ khóa tìm kiếm **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách tài khoản bác sĩ phù hợp điều kiện là trống **Thêm tài khoản mới (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin, Admin Click vào nút “Thêm mới” 2 Hệ thống Hiển thị giao diện thêm tài khoản bác sĩ mới với form điển thông tin 3 Super Admin, Admin Nhập các thông tin cần thiết để tạo mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện thêm tài khoản **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Cập nhật tài khoản (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin, Admin Click vào nút “Chỉnh sửa” trên hàng của một tài khoản bác sĩ. 2 Hệ thống Hiển thị giao diện chỉnh sửa tài khoản bác sĩ. 3 Super Admin, Admin Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện cập nhật tài khoản **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công **Xóa tài khoản (D \- Delete)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Super Admin, Admin Click vào nút “Xoá” trên hàng của một tài khoản bác sĩ 2 Hệ thống Hiển thị giao diện xác nhận xoá tài khoản bác sĩ 3 Super Admin, Admin Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận xoá 4 Hệ thống Kiểm tra mật khẩu Super Admin/Admin 5 Hệ thống Xoá dữ liệu tài khoản bác sĩ được yêu cầu xoá 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ xóa không thành công  |  |  |  |
|  **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

**Bảng 2-9: Đặc tả chức năng “Quản lý tài khoản Bác sĩ”**

0. Dữ liệu đầu vào chức năng Tìm kiếm Bác sĩ:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Từ khoá tìm kiếm | Input text field | Không | Ít nhất 1 ký tự | nguyenvana@gmail |

**Bảng 2-8: Dữ liệu chức năng “Tìm kiếm tài khoản Bác sĩ”**

1. Dữ liệu đầu vào chức năng Tạo tài khoản Bác sĩ:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Có | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Họ tên | Input text field | Có | Chỉ chứa chữ cái và khoảng trắng, ít nhất 3 ký tự, nhiều nhất 50 ký tự | Nguyễn Văn A |
| 3 | Ngày sinh | Date picker | Không | Ngày hợp lệ, trước ngày hôm nay. | 01/01/2000 |
| 4 | Học hàm, học vị | Input text field | Không | Chuỗi ít hơn 100 ký tự | PGS TS |
| 5 | Chức vụ | Input text field | Không | Chuỗi ít hơn 100 ký tự | Trưởng Khoa RHM |

**Bảng 2-8: Dữ liệu chức năng “Tạo tài khoản Bác sĩ”**

2. Dữ liệu đầu vào chức năng Cập nhật tài khoản Bác sĩ:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Có | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Mật khẩu mới | Input text field (password) | Không | Chuỗi tối thiểu 8 ký tự, ít nhất 1 chữ cái và 1 số | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Cập nhật khoản Bác sĩ”**

3. Dữ liệu đầu vào chức năng Xoá tài khoản Bác sĩ:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Super Admin | Có | Ít nhất 1 ký tự | Password123 |

**Bảng 2-8: Dữ liệu chức năng “Xoá tài khoản Bác sĩ”**

10. #### Chỉnh sửa hồ sơ Bác sĩ.

| Mã Use case | UC010 | Tên Use case | Quản lý tài khoản Bác sĩ |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | Super Admin, Admin, Doctor |  |  |
| **Mô tả** | Thực hiện tác vụ Chỉnh sửa hồ sơ bác sĩ bất kì đối với Admin/Super Admin hoặc Chỉnh sửa hồ sơ cá nhân đối với Bác sĩ (Doctor) |  |  |
| **Sự kiện kích hoạt** | \- Đối với Admin/Super Admin: tại trang quản lý bác sĩ, nhấn nút chỉnh sửa hồ sơ tương ứng tại hàng của bác sĩ cần chỉnh sửa \- Đối với Bác sĩ: vào trang Thiết lập cá nhân |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | Tác nhân | Nhấn nút chỉnh sửa để vào chế độ chỉnh sửa |
|  | 2 | Hệ thống | Hiển thị giao diện chỉnh sửa hồ sơ bác sĩ |
|  | 3 | Tác nhân | Chỉnh sửa các trường thông tin cần cập nhật và nhấn nút “Cập nhật” |
|  | 4 | Hệ thống | Kiểm tra các trường nhập liệu |
|  | 5 | Hệ thống | Lưu dữ liệu cập nhật |
|  | 6 | Hệ thống | Hiển thị thông báo Cập nhật thành công và đóng giao diện chỉnh sửa |
| **Luồng sự kiện thay thế** | 5a | Hệ thống | Hiển thị cảnh báo nếu có bất kỳ trường nhập liệu nào không hợp lệ |
|  | 6a | Hệ thống | Hiển thị thông báo lỗi nếu thao tác cập nhật dữ liệu thất bại |
| **Hậu điều kiện** | Dữ liệu hồ sơ được cập nhật thành công và lưu lại trong hệ thống. |  |  |

**Bảng 2-9: Đặc tả chức năng “Chỉnh sửa hồ sơ Bác sĩ”**

0. Dữ liệu đầu vào chức năng Chỉnh sửa hồ sơ Bác sĩ:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Họ và tên | Input text field | Có | Ít nhất 1 ký tự | Nguyễn Văn A |
| 2 | Học hàm, học vị | Input text field | Có | Ít nhất 1 ký tự | PGS TS |
| 3 | Chức vụ | Multiple Input text fields | Có | Ít nhất 1 chuỗi Mỗi chuỗi ít nhất 1 ký tự | \- Trường khoa RHM \- Phó giám đốc |
| 4 | Giới thiệu | Input text field | Có | Ít nhất 1 ký tự | Bác sĩ Nguyễn Văn A là một… |
| 5 | Thành viên tổ chức | Multiple Input text fields | Không | Ít nhất 1 chuỗi Mỗi chuỗi ít nhất 1 ký tự | \- Ban biên tập tạp chí. \- Phó chủ tịch thường trực Hội ABC. |
| 6 | Danh hiệu, giải thưởng | Multiple Input text fields | Không | Ít nhất 1 chuỗi Mỗi chuỗi ít nhất 1 ký tự | \- Bằng khen của Thủ tướng… |
| 7 | Công trình nghiên cứu | Input text field | Không | Ít nhất 1 ký tự | 1\. Công trình khoa học: Đề tài cấp Bộ đã nghiệm thu… |
| 8 | Quá trình đào tạo | Multiple Input text fields | Có | Ít nhất 1 chuỗi Mỗi chuỗi ít nhất 1 ký tự | \- 2005 \- 2009: Trường đại học ABC |
| 9 | Kinh nghiệm công tác | Multiple Input text fields | Có | Ít nhất 1 chuỗi Mỗi chuỗi ít nhất 1 ký tự | \- 2015 \- 2017: Bác sĩ chính tại Bệnh viện… |

**Bảng 2-8: Dữ liệu chức năng “Chỉnh sửa hồ sơ Bác sĩ”**

11. #### Đọc Blog

| Mã Use case | UC011 | Tên Use case | Đọc Blog |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | User có thể truy cập và đọc các bài viết blog do Admin đăng tải để tham khảo thông tin y tế, sức khỏe hoặc thông tin liên quan đến bệnh viện. |  |  |
| **Sự kiện kích hoạt** | User chọn mục “Blog” trên website hoặc ứng dụng di động. |  |  |
| **Tiền điều kiện** | Hệ thống đã có sẵn các bài viết Blog được quản trị viên đăng tải. User truy cập vào hệ thống (không yêu cầu tài khoản). |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Chọn mục “Blog” trên giao diện chính. |
|  | 2 | Hệ thống | Hiển thị danh sách các bài viết (tiêu đề, tóm tắt, hình minh hoạ, ngày đăng). |
|  | 3 | User | Chọn một bài viết cụ thể từ danh sách. |
|  | 4 | Hệ thống | Tải và hiển thị chi tiết bài viết (tiêu đề, nội dung, tác giả, ngày đăng). |
|  | 5 | User | Đọc nội dung bài viết. |
| **Luồng sự kiện thay thế** | 1a | Hệ thống | Hiển thị thông báo: *“Chưa có bài viết nào”*. |
|  | 2a | Hệ thống | Kiểm tra thấy bài viết đã bị xoá → hiển thị thông báo: *“Bài viết không còn tồn tại”*. |
| **Hậu điều kiện** | Người dùng có thể xem chi tiết nội dung bài viết Blog. (Tuỳ chọn) Người dùng có thể chia sẻ liên kết bài viết ra ngoài hệ thống |  |  |

    12. #### Xem thông tin Bác sĩ

| Mã Use case | UC012 | Tên Use case | Xem thông tin Bác sĩ |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | Người dùng vào mục “Bác sĩ” hoặc tìm kiếm theo chuyên khoa, sau đó chọn một bác sĩ cụ thể để xem thông tin chi tiết. |  |  |
| **Sự kiện kích hoạt** | Người dùng chọn chức năng “Xem thông tin Bác sĩ” hoặc tìm kiếm bác sĩ trong hệ thống. |  |  |
| **Tiền điều kiện** | Hệ thống đã lưu trữ hồ sơ bác sĩ (do bác sĩ và admin cập nhật). Người dùng đang truy cập hệ thống (không bắt buộc đăng nhập). |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Chọn mục “Bác sĩ” hoặc sử dụng chức năng tìm kiếm theo tên/chuyên khoa. |
|  | 2 | Hệ thống | Hiển thị danh sách bác sĩ phù hợp (ảnh đại diện, họ tên, chuyên khoa, cơ sở làm việc). |
|  | 3 | User | Chọn một bác sĩ cụ thể từ danh sách. |
|  | 4 | Hệ thống | Hiển thị thông tin chi tiết: Thông tin cá nhân (họ tên, hình ảnh, giới thiệu ngắn). Chuyên môn, thành tựu, kinh nghiệm. Lịch khám/khung giờ làm việc. Đánh giá và phản hồi từ bệnh nhân khác. |
|  | 5 | User | Đọc và tham khảo thông tin bác sĩ. |
| **Luồng sự kiện thay thế** | 2a | Hệ thống | Hiển thị thông báo rằng hiện chưa có bác sĩ nào trong danh sách. |
|  | 3a | Hệ thống | Kiểm tra và thấy bác sĩ không còn trong dữ liệu thì hiển thị thông báo rằng bác sĩ không tồn tại. |
| **Hậu điều kiện** | Người dùng có thể xem chi tiết thông tin của bác sĩ. Người dùng có thể tiếp tục thực hiện các hành động khác như đặt lịch khám hoặc viết cảm nhận. |  |  |

        0. Dữ liệu đầu vào cho chức năng Xem thông tin Bác sĩ.

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Từ khóa tìm kiếm | Input text field (search box) | Không | \- Cho phép nhập tên bác sĩ hoặc chuyên khoa. \- Độ dài ≤ 50 ký tự. | “Nguyễn Văn A”, “Tim mạch” |
| 2 | Chuyên khoa | Dropdown list | Không | \- Nằm trong danh sách chuyên khoa hợp lệ. | “Nội tổng quát” |
| 3 | Địa điểm khám | Dropdown list | Không | \- Nằm trong danh sách địa điểm bệnh viện/cơ sở hợp lệ. | “Bệnh viện A – Cơ sở 2” |
| 4 | Ngày khám (lọc lịch) | Date picker | Không | \- Ngày phải ≥ ngày hiện tại. \- Đúng định dạng (dd/MM/yyyy). | 10/09/2025 |
| 5 | Sắp xếp kết quả | Dropdown list (tuỳ chọn: theo tên, theo chuyên khoa, theo đánh giá) | Không | \- Nằm trong danh sách tùy chọn hợp lệ. | “Theo đánh giá cao nhất” |
| 6 | ID Bác sĩ (chi tiết) | Hidden field (auto từ danh sách/tìm kiếm) | Có (nội bộ) | \- Hệ thống sinh khi user click chọn bác sĩ từ danh sách. \- Phải tồn tại trong DB. | BS20250903 |

        13. #### Viết cảm nhận cho Bác sĩ

| Mã Use case | UC013 | Tên Use case | Viết cảm nhận cho Bác sĩ |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | User chọn một bác sĩ từ danh sách hoặc lịch sử khám, sau đó nhập nội dung cảm nhận và gửi. Hệ thống lưu trữ và hiển thị cảm nhận trong hồ sơ bác sĩ. |  |  |
| **Sự kiện kích hoạt** | User chọn chức năng “Viết cảm nhận” trong hồ sơ bác sĩ hoặc lịch sử khám bệnh. |  |  |
| **Tiền điều kiện** | User đã có trải nghiệm khám bệnh với bác sĩ (hoặc hệ thống cho phép bất kỳ User  nào viết cảm nhận).Hệ thống cho phép lưu và hiển thị cảm nhận trong hồ sơ bác sĩ. |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Truy cập hồ sơ bác sĩ hoặc mục “Lịch sử khám bệnh”. |
|  | 2 | User | Chọn chức năng “Viết cảm nhận”. |
|  | 3 | Hệ thống | Hiển thị form nhập cảm nhận (bao gồm: nội dung cảm nhận, thang điểm đánh giá sao (1–5), tùy chọn ẩn danh). |
|  | 4 | User | Nhập nội dung cảm nhận, chọn số sao đánh giá và (nếu muốn) chọn “Gửi ẩn danh”. |
|  | 5 | User | Nhấn nút “Gửi”. |
|  | 6 | Hệ thống | Kiểm tra dữ liệu hợp lệ (không để trống, không vượt quá số ký tự cho phép). |
|  | 7 | Hệ thống | Lưu cảm nhận vào cơ sở dữ liệu. |
|  | 8 | Hệ thống | Thông báo cảm nhận của User đã được gửi đi thành công. |
|  | 9 | User | Thấy cảm nhận của mình hiển thị (ngay hoặc sau khi được duyệt bởi Admin, tùy cấu hình). |
| **Luồng sự kiện thay thế** | 5a | Hệ thống | Nếu User thoát hoặc chọn “Hủy” trước khi gửi thì hệ thống không lưu dữ liệu. |
|  | 6a | Hệ thống | Nếu Hệ thống phát hiện nội dung trống hoặc chứa ký tự không cho phép thì hiển thị thông báo lỗi và yêu cầu User nhập lại. |
| **Hậu điều kiện** | Cảm nhận của người dùng được lưu vào cơ sở dữ liệu. Cảm nhận có thể hiển thị công khai trong hồ sơ bác sĩ (sau khi duyệt nếu hệ thống có bước kiểm duyệt). |  |  |

            0. Dữ liệu đầu vào cho chức năng Viết cảm nhận cho Bác sĩ

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | ID Bác sĩ | Hidden field (auto from context) | Có | \- Hệ thống lấy tự động khi người dùng chọn bác sĩ để viết cảm nhận. \- Phải tồn tại trong DB. | BS20250901 |
| 2 | Nội dung cảm nhận | Textarea | Có | \- Không rỗng. \- Độ dài ≤ 1000 ký tự. \- Không chứa ký tự đặc biệt nguy hiểm. | “Bác sĩ rất nhiệt tình, tư vấn kỹ càng.” |
| 3 | Đánh giá sao | Interactive star rating (UI component): hiển thị 5 ngôi sao, người dùng kéo/chạm để chọn số sao sáng từ 1 đến 5\. | Có | \- Chỉ nhận giá trị số nguyên 1–5. \- Mặc định chưa chọn sao nào. | 4 ⭐⭐⭐⭐☆ |
| 4 | Ẩn danh | Checkbox | Không | \- Nếu chọn: hệ thống ẩn thông tin người dùng khi hiển thị cảm nhận. | ✔ |
| 5 | Họ tên người viết | Input text field | Không | \- Chỉ chứa ký tự chữ và dấu cách. \- Độ dài ≤ 50 ký tự. \- Bỏ qua nếu chọn Ẩn danh. | Lê Viết Vĩnh Phú |
| 6 | Email liên hệ | Input text field (email format) | Không | \- Đúng định dạng email. \- Độ dài ≤ 50 ký tự. \- Bỏ qua nếu chọn Ẩn danh. | phule@gmail.com |
| 7 | Đính kèm ảnh | File upload (image) | Không | \- Định dạng: .jpg, .png. \- Kích thước ≤ 3MB. | file: “kham\_suc\_khoe.jpg” |

        14. #### Đặt câu hỏi cho Bác sĩ

| Mã Use case | UC014 | Tên Use case | Đặt câu hỏi cho Bác sĩ |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | User vào mục “Hỏi – Đáp”, nhập nội dung câu hỏi và gửi cho hệ thống. Hệ thống ghi nhận và chuyển câu hỏi đến mục quản lý để bác sĩ có thể trả lời. |  |  |
| **Sự kiện kích hoạt** | Người dùng chọn chức năng “Đặt câu hỏi cho Bác sĩ” trong mục Hỏi – Đáp. |  |  |
| **Tiền điều kiện** | User đang truy cập hệ thống (không bắt buộc đăng nhập). Hệ thống có chức năng lưu trữ và chuyển tiếp câu hỏi đến bác sĩ. |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Chọn mục “Hỏi – Đáp” , sau đó chọn “Đặt câu hỏi cho Bác sĩ”. |
|  | 2 | Hệ thống | Hiển thị giao diện nhập câu hỏi. |
|  | 3 | User | Nhập nội dung câu hỏi và (tùy chọn) điền thông tin cá nhân liên quan. |
|  | 4 | User | Nhấn nút “Gửi câu hỏi”. |
|  | 5 | Hệ thống | Kiểm tra hợp lệ (không rỗng, độ dài, ngôn ngữ phù hợp). |
|  | 6 | Hệ thống | Lưu câu hỏi vào cơ sở dữ liệu và gán trạng thái ban đầu là “Chưa trả lời”. |
|  | 7 | Hệ thống | Thông báo thành công rằng là câu hỏi đã được gửi đi, và sẽ được bác sĩ phản hồi. |
| **Luồng sự kiện thay thế** | 4a | Hệ thống | Nếu User thoát hoặc chọn “Hủy” trước khi gửi thì hệ thống không lưu lại câu hỏi. |
|  | 5a | Hệ thống | Nếu hệ thống phát hiện nội dung rỗng hoặc vượt quá giới hạn ký tự thì hiển thị thông báo lỗi và yêu cầu User nhập lại. |
| **Hậu điều kiện** | Câu hỏi của User được lưu trong hệ thống và sẵn sàng cho bác sĩ tiếp nhận/trả lời.User có thể theo dõi trạng thái câu hỏi (đã trả lời/chưa trả lời). |  |  |

            0. Dữ liệu đầu vào cho chức năng Đặt câu hỏi cho Bác sĩ

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Tiêu đề câu hỏi | Input text field | Có | \- Không rỗng. \- Độ dài ≤ 100 ký tự. | “Đau đầu kéo dài có phải dấu hiệu nguy hiểm?” |
| 2 | Nội dung câu hỏi | Textarea | Có | \- Không rỗng. \- Độ dài ≤ 1000 ký tự. \- Không chứa ký tự đặc biệt nguy hiểm. | “Tôi bị đau đầu liên tục 3 ngày, uống thuốc giảm đau không đỡ…” |
| 3 | Chuyên khoa liên quan | Dropdown list  | Có | \- Nằm trong danh sách chuyên khoa hợp lệ do hệ thống cung cấp. | “Thần kinh” |
| 4 | Ẩn danh | Checkbox | Không | \- Nếu chọn: hệ thống sẽ không hiển thị thông tin cá nhân khi bác sĩ xem câu hỏi. | ✔ |
| 5 | Họ tên người hỏi | Input text field | Không | \- Chỉ chứa ký tự chữ và dấu cách. \- Độ dài ≤ 50 ký tự. \- Bỏ qua nếu chọn Ẩn danh. | Lê Viết Vĩnh Phú |
| 6 | Email liên hệ | Input text field (email format) | Không | \- Đúng định dạng email. \- Độ dài ≤ 50 ký tự. \- Bỏ qua nếu chọn Ẩn danh. | phule@gmail.com |
| 7 | Đính kèm ảnh/tài liệu | File upload (image/pdf) | Không | \- Định dạng cho phép: .jpg, .png, .pdf. \- Kích thước ≤ 5MB. | file: “MRI\_scan.pdf” |

        15. #### Tra cứu lịch sử khám bệnh

| Mã Use case | UC015 | Tên Use case | Tra cứu lịch sử khám bệnh |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | User vào mục “Tra cứu lịch sử khám bệnh”, nhập mã ID. Hệ thống tìm kiếm trong cơ sở dữ liệu và hiển thị thông tin chi tiết về các lần khám bệnh liên quan đến ID đó. |  |  |
| **Sự kiện kích hoạt** | User chọn chức năng “Đặt câu hỏi cho Bác sĩ” trong mục Hỏi – Đáp. |  |  |
| **Tiền điều kiện** | User đã từng đặt lịch khám bệnh và được cấp ID. Hệ thống có lưu trữ dữ liệu lịch sử khám bệnh. |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Chọn mục “Tra cứu lịch sử khám bệnh”. |
|  | 2 | Hệ thống | Hiển thị giao diện nhập mã ID cuộc hẹn. |
|  | 3 | User | Nhập mã ID và nhấn nút “Tra cứu”. |
|  | 4 | Hệ thống | Kiểm tra tính hợp lệ của mã ID. |
|  | 5 | Hệ thống | Tìm kiếm trong cơ sở dữ liệu và lấy thông tin lịch sử khám bệnh tương ứng. |
|  | 6 | Hệ thống | Hiển thị cho User: Ngày khám, giờ khám. Bác sĩ phụ trách. Chuyên khoa. Trạng thái (đã khám/chưa khám/hủy). (Nếu có) kết quả hoặc ghi chú khám bệnh. |
|  | 7 | User | Xem thông tin lịch sử khám bệnh. |
| **Luồng sự kiện thay thế** | 4a | Hệ thống | Nếu phát hiện mã ID sai định dạng thì hiển thị thông báo lỗi và yêu cầu User nhập lại. |
|  | 5a | Hệ thống | Nếu không có dữ liệu với ID nhập vào thì hiển thị thông báo không tìm thấy lịch sử khám bệnh với ID trên. |
| **Hậu điều kiện** | Người dùng xem được danh sách hoặc chi tiết lịch sử khám bệnh (ngày khám, bác sĩ, chuyên khoa, kết quả/ghi chú nếu có). |  |  |

        #### 

            0. Dữ liệu đầu vào chức năng Tra cứu lịch sử khám bệnh

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | ID Khách hàng | Input text field \+ nút \[Tra cứu\] | Có | \- Nếu nhập: phải tồn tại trong hệ thống. \- Đúng định dạng ID gồm 12 ký tự chữ và số. | K12345M789M23 |
| 2 | Bộ lọc thời gian | Date range picker (Từ ngày – Đến ngày) | Không | “Từ ngày” ≤ “Đến ngày”. \- Giá trị không vượt quá ngày hiện tại. | 01/01/2025 – 01/09/2025 |
| 3 | Lựa chọn hiển thị | Dropdown list (tùy chọn: tất cả, đã khám, chưa khám, đã hủy) | Không | \- Nằm trong danh sách tùy chọn hợp lệ. | “Đã khám” |

        16. #### Đặt lịch khám

| Mã Use case | UC016 | Tên Use case | Đặt lịch khám |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | User |  |  |
| **Mô tả** | Người dùng chọn quy trình đặt lịch (theo bác sĩ hoặc theo ngày), nhập thông tin cá nhân. Nếu có ID khách hàng hợp lệ, hệ thống sẽ điền sẵn thông tin cũ (ẩn một phần để bảo mật) và cho phép cập nhật nếu cần, sau đó xác nhận để đặt lịch khám. |  |  |
| **Sự kiện kích hoạt** | User chọn chức năng “Đặt lịch khám” trong hệ thống. |  |  |
| **Tiền điều kiện** | Người dùng đang truy cập hệ thống (web hoặc mobile app). Hệ thống có dữ liệu bác sĩ, chuyên khoa, lịch trống. (Nếu có) Người dùng đã từng đặt lịch khám trước đó và có ID khách hàng trong hệ thống. |  |  |
| **Luồng sự kiện chính** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | User | Chọn mục “Đặt lịch khám”. |
|  | 2 | Hệ thống | Hiển thị hai quy trình lựa chọn: Đặt lịch **theo bác sĩ**. Đặt lịch **theo ngày**. |
|  | 3A | User | Chọn “Theo Bác sĩ”. |
|  | 4A | User | Chọn bác sĩ mong muốn. |
|  | 5A | Hệ thống | Hiển thị lịch trống (ngày, khung giờ) của bác sĩ đó. |
|  | 6A | User |    Chọn ngày và khung giờ. |
|  | 3B | User | Chọn “Theo Ngày”. |
|  | 4B | User | Chọn ngày và khung giờ mong muốn. |
|  | 5B | Hệ thống | Đề xuất danh sách bác sĩ phù hợp (dựa trên chuyên khoa và lịch rảnh). |
|  | 6B | User | Chọn một bác sĩ (hoặc để hệ thống tự gán). |
|  | 7 | Hệ thống | Hiển thị form nhập thông tin cá nhân. |
|  | 8 | User | Nhập ID Khách hàng (nếu có) và nhấn nút “Kiểm tra thông tin”. |
|  | 9 | Hệ thống | Kiểm tra ID khách hàng hợp lệ: Tự động điền thông tin cá nhân từ hồ sơ cũ. Thông tin liên hệ (số điện thoại, email) sẽ được che một phần để đảm bảo bảo mật. Hiển thị thêm 2 trường không bắt buộc: “Số điện thoại mới” và “Email mới”. |
|  | 10 | User | Nhập thông tin và nhấn “Xác nhận đặt lịch”. |
|  | 11 | Hệ thống | Kiểm tra dữ liệu hợp lệ (trường bắt buộc, định dạng email/điện thoại). |
|  | 12 | Hệ thống | Tạo lịch hẹn, lưu vào cơ sở dữ liệu, gán trạng thái “Đã đặt”. |
|  | 13 | Hệ thống | Hiển thị thông báo đặt lịch thành công và cung cấp mã ID Khách hàng. |
|  | 14 | User | Ghi nhận mã ID khách hàng để sử dụng tra cứu sau này. |
| **Luồng sự kiện thay thế** | 5a | Hệ thống | Hệ thống thông báo khung giờ đã đầy, và yêu cầu người dùng chọn giờ khác. |
|  | 9a | Hệ thống | Hiển thị thông báo lỗi và yêu cầu nhập lại. |
|  | 10a | Hệ thống | Hệ thống không lưu lịch hẹn. |
| **Hậu điều kiện** | Lịch khám được lưu thành công trong hệ thống với trạng thái “Đã đặt”. Người dùng nhận được mã **ID người dùng** để tra cứu sau này. |  |  |

            0. Dữ liệu đầu vào chức năng Đặt lịch khám

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | ID Khách hàng | Input text field \+ nút \[Kiểm tra thông tin\] | Không | \- Nếu nhập: phải tồn tại trong hệ thống. \- Đúng định dạng ID gồm 12 ký tự chữ và số. | K12345M789M23 |
| 2 | Họ tên | Input text field | Có | \- Không rỗng. \- Chỉ chứa ký tự chữ và dấu cách. \- Độ dài ≤ 50 ký tự. | Lê Viết Vĩnh Phú |
| 3 | Số điện thoại | Input text field (numeric) | Có | \- 10–11 chữ số. \- Bắt đầu bằng đầu số hợp lệ (03, 05, 07, 08, 09). | 0912345678 |
| 4 | Email | Input text field (email format) | Có | \- Đúng định dạng email  \- Độ dài ≤ 50 ký tự. | phule@example.com |
| 5 | Ngày khám | Date picker | Có | \- Lớn hơn hoặc bằng ngày hiện tại. \- Theo định dạng chuẩn (dd/MM/yyyy). | 05/09/2025 |
| 6 | Khung giờ | Time picker | Có | \- Nằm trong danh sách khung giờ còn trống do hệ thống hiển thị. \- Đúng định dạng (HH:mm). | 09:00 |
| 7 | Bác sĩ | Dropdown list (nếu chọn quy trình “Theo bác sĩ”) | Có | \- Bác sĩ phải tồn tại trong hệ thống. \- Có khung giờ trống tại thời điểm đặt lịch. | BS. Lê Đức Bảo |
| 8 | Chuyên khoa | Dropdown list | Có | \- Chuyên khoa tồn tại trong hệ thống. \- Phù hợp với bác sĩ hoặc ngày đặt. | Nội tổng quát |
| 9 | Địa điểm khám | Dropdown list | Có | \- Địa điểm tồn tại trong hệ thống. \- Có lịch hoạt động cho bác sĩ/chuyên khoa đã chọn. | Bệnh viện A – Cơ sở 1 |
| 10 | Mô tả triệu chứng | Textarea | Không | \- Văn bản ≤ 500 ký tự. \- Không chứa ký tự đặc biệt nguy hiểm (script, code). | “Đau đầu, chóng mặt 2 ngày” |

        17. Quản lý lịch khám:

| Mã Use case | UC0017 | Tên Use case | Quản lý lịch khám |
| ----- | :---- | :---- | :---- |
| **Tác nhân** | Doctor, Admin, Super Admin |  |  |
| **Mô tả** | Thực hiện các tác vụ quản lý lịch khám: xem, tìm kiếm, thêm mới, chỉnh sửa, từ chối. |  |  |
| **Sự kiện kích hoạt** | Click vào “Quản lý lịch khám” ở thanh điều hướng để vào trang Quản lý lịch khám, sau đó click vào các nút tương ứng với các tác vụ  |  |  |
| **Tiền điều kiện** | Tác nhân đăng nhập thành công |  |  |
| **Xem (V \- View)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào “Quản lý lịch khám” ở thanh điều hướng hoặc vào theo đường dẫn cố định dành cho trang này. 2 Hệ thống Lấy và hiển thị lịch khám khám của tuần/ tháng hiện tại. **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách lịch khám trống  **Tìm kiếm (S \- Search)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Nhập từ khóa vào ô tìm kiếm 2 Hệ thống Lấy và hiển thị danh sách các lịch khám có mã bệnh nhân/ tên/ email/ số điện thoại trùng khớp với từ khóa tìm kiếm **Luồng sự kiện thay thế** 2a Hệ thống Hiển thị thông báo nếu danh sách lịch khám phù hợp điều kiện là trống **Thêm lịch hẹn mới (C \- Create)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Thêm mới”. 2 Hệ thống Hiển thị giao diện thêm lịch hẹn mới với form điển thông tin. 3 Tác nhân Nhập các thông tin cần thiết để tạo mới 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Tạo bản ghi mới và lưu trữ vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện thêm lịch hẹn 7 Hệ thống Gửi thông báo đến bệnh nhân qua email **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ tạo mới không thành công **Cập nhật lịch hẹn (U \- Update)** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Chỉnh sửa” trên hàng của một lịch hẹn. 2 Hệ thống Hiển thị giao diện chỉnh sửa lịch hẹn. 3 Tác nhân Nhập các thông tin cần chỉnh sửa 4 Hệ thống Kiểm tra các trường nhập liệu 5 Hệ thống Lưu trữ cập nhật vào hệ thống.  6 Hệ thống Hiển thị thông báo thành công và đóng giao diện cập nhật lịch hẹn 7 Hệ thống Gửi thông báo đến bệnh nhân qua email **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi ở các trường không hợp lệ nếu kiểm tra được có lỗi  6a Hệ thống Thông báo lỗi nếu tác vụ cập nhật không thành công **Hủy lịch hẹn** **Luồng sự kiện chính (Thành công)  STT Thực hiện bởi Hành động**  1 Tác nhân Click vào nút “Hủy cuộc hẹn” trên hàng của một lịch hẹn 2 Hệ thống  Hiển thị giao diện và form nhập lý do hủy 3 Tác nhân Nhập lý do hủy cuộc hẹn và submit. 2 Hệ thống Hiển thị giao diện xác nhận hủy lịch hẹn 3 Tác nhân Nhập mật khẩu tài khoản cá nhân và nhấn nút xác nhận hủy 4 Hệ thống Kiểm tra mật khẩu tài khoản 5 Hệ thống Cập nhật trạng thái cuộc hẹn là Đã hủy 6 Hệ thống Hiển thị thông báo thành công và đóng giao diện xác nhận 7 Hệ thống Gửi thông báo đến bệnh nhân qua email **Luồng sự kiện thay thế** 5a Hệ thống Thông báo lỗi nếu xác nhận mật khẩu không chính xác  6a Hệ thống Thông báo lỗi nếu tác vụ không thành công  |  |  |  |
| **Hậu điều kiện** | Hiển thị danh sách đầy đủ hoặc tương ứng với thông tin cần tìm kiếm; Cập nhật thành công, thông tin mới sẽ được lưu trữ vào hệ thống |  |  |

              
 2.5.17.0. Dữ liệu đầu vào chức năng Tìm kiếm lịch khám

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mã bệnh nhân | Input text field | Không | Ít nhất 5 ký tự | BN001 |

**Bảng 2-8: Dữ liệu chức năng “Tìm kiếm lịch khám”**

0. Dữ liệu đầu vào chức năng Tạo lịch khám:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Có | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Họ tên | Input text field | Có | Chỉ chứa chữ cái và khoảng trắng, ít nhất 3 ký tự, nhiều nhất 50 ký tự | Nguyễn Văn A |
| 3 | Ngày sinh | Date picker | Không | Ngày hợp lệ, trước ngày hôm nay. | 01/01/2000 |
| 4 | Ngày hẹn | Date picker | Có | Sau hoặc bằng ngày hiện tại | 10/09/2025 |
| 5 | Giờ hẹn | Time picker | Có | Trong khung giờ làm việc được thiết lập | 09:30 |
| 6 | Lý do khám | Input text field | Có | Tình trạng sức khỏe của bệnh nhân | “Chấn thương ở chân” |
| 7 | Ghi chú | Input text field | Không | Tối đa 255 ký tự | “Tái khám sau 2 tuần” |

**Bảng 2-8: Dữ liệu chức năng “Tạo mới lịch khám”**

1. Dữ liệu đầu vào chức năng Cập nhật lịch khám:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Địa chỉ email | Input text field | Không | Địa chỉ email hợp lệ, chưa tồn tại trong hệ thống | admin001@email.com |
| 2 | Họ tên | Input text field | Không | Chỉ chứa chữ cái và khoảng trắng, ít nhất 3 ký tự, nhiều nhất 50 ký tự | Nguyễn Văn A |
| 3 | Ngày sinh | Date picker | Không | Ngày hợp lệ, trước ngày hôm nay. | 01/01/2000 |
| 4 | Ngày hẹn | Date picker | Không | Sau hoặc bằng ngày hiện tại | 10/09/2025 |
| 5 | Giờ hẹn | Time picker | Không | Trong khung giờ làm việc được thiết lập | 09:30 |
| 6 | Lý do khám | Input text field | Không | Tình trạng sức khỏe của bệnh nhân | “Chấn thương ở chân” |
| 7 | Ghi chú | Input text field | Không | Tối đa 255 ký tự | “Tái khám sau 2 tuần” |

**Bảng 2-8: Dữ liệu chức năng “Cập nhật lịch khám”**

2. Dữ liệu đầu vào chức năng Hủy lịch khám:

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mật khẩu | Input text field \- Mật khẩu tài khoản Doctor | Có | Ít nhất 6 ký tự | Password123 |
| 2 | Lý do hủy | Input text field | Có | Tối đa 255 ký tự | “Bận đột xuất” |

**Bảng 2-8: Dữ liệu chức năng “Hủy lịch khám”**

18. Xem hồ sơ bệnh nhân & lịch sử khám

| Mã Use case | UC019 | Tên usecase | Xem hồ sơ bệnh nhân & lịch sử khám |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | Doctor, Admin, Super Admin |  |  |
| **Mô tả** | Thực hiện xem hồ sơ bệnh nhân: thông tin cá nhân, tiền sử, lịch sử khám, tài liệu/ghi chú đã lưu. |  |  |
| **Sự kiện kích hoạt** | Click vào hồ sơ bệnh nhân từ cuộc hẹn hoặc tìm kiếm. |  |  |
| **Tiền điều kiện** | Đăng nhập; có quyền truy cập hồ sơ. |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | Tác nhân | Chọn “Hồ sơ bệnh nhân” từ menu hoặc từ cuộc hẹn. |
|  | 2 | Hệ thống | Hiển thị màn hình tìm kiếm và danh sách bệnh nhân. |
|  | 3a | Tác nhân |    Chọn một bệnh nhân cụ thể. |
|  | 4a | Hệ thống | Tải và hiển thị thông tin bệnh nhân |
|  | 3b | Tác nhân | Lọc hồ sơ theo khoảng thời gian. |
|  | 4b | Hệ thống | Hiển thị kết quả tất cả hồ sơ bệnh nhân thuộc khoảng thời gian đã thiết lập. |
| **Luồng sự kiện thay thế** | 3b, 4b | Hệ thống | Hiển thị thông báo lỗi nếu chưa có hồ sơ về bệnh nhân. |
| **Hậu điều kiện** | Hồ sơ hiển thị để tham khảo; không thay đổi dữ liệu gốc; thao tác truy cập được ghi log. |  |  |

	  
	  
2.5.19.0. Dữ liệu vào  
	

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Mã bệnh nhân | Input text field | Có | Ít nhất 5 ký tự | BN001 |
| 2 | Khoảng thời gian | Date range picker | Không | Đúng định dạng ngày | 01/01/2025 \- 31/12/2025 |

19. Trả lời Hỏi và Đáp (Q\&A)

| Mã Use case | UC020 | Tên usecase | Trả lời Hỏi và Đáp (Q\&A) |
| :---- | ----- | ----- | ----- |
| **Tác nhân** | Doctor |  |  |
| **Mô tả** | Thực hiện xem các câu hỏi được gán, trả lời bằng văn bản/đính kèm, hệ thống lưu và gửi thông báo cho bệnh nhân. |  |  |
| **Sự kiện kích hoạt** | Có câu hỏi mới hoặc bác sĩ mở mục Q\&A. |  |  |
| **Tiền điều kiện** | Đăng nhập; có quyền trả lời. |  |  |
| **Luồng sự kiện chính (Thành công)** | **STT** | **Thực hiện bởi** | **Hành động** |
|  | 1 | Doctor | Mở mục **Inbox / Q\&A** ở thanh điều hướng. |
|  | 2 | Hệ thống | Hệ thống hiển thị danh sách câu hỏi được gán. |
|  | 3 | Doctor | Chọn một câu hỏi |
|  | 4 | Hệ thống | Hiển thị chi tiết (nội dung, thông tin bệnh nhân,..) |
|  | 5 | Doctor | Bác sĩ chọn **“Trả lời”**. |
|  | 6 | Doctor | Nhập nội dung, (tùy chọn) đính kèm và xác nhận |
|  | 7 | Hệ thống | Lưu câu trả lời; cập nhật trạng thái; gửi **thông báo** cho bệnh nhân. |
| **Luồng sự kiện thay thế** | 4a | Hệ thống | Hiển thị thông báo lỗi nếu File quá dung lượng/định dạng |
| **Hậu điều kiện** | Câu hỏi được trả lời; trạng thái cập nhật; bệnh nhân được thông báo; lưu lịch sử & audit. |  |  |

	  
	

	2.5.19.0. Dữ liệu vào  
	

| STT | Trường dữ liệu | Mô tả | Bắt buộc? | Điều kiện hợp lệ | Ví dụ |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Nội dung trả lời | Input text field | Có | Tối đa 2000 ký tự, không rỗng | “Bạn nên uống nước nhiều hơn…” |
| 2 | File đính kèm | File upload (image/pdf) | Không | JPG/PNG/PDF,... có dung lượng nhỏ hơn hoặc bằng 5MB.  | hinhanh1.png |

3. ## **Các yêu cầu phi chức năng** {#các-yêu-cầu-phi-chức-năng}

   1. ### ***Giao diện người dùng*** {#giao-diện-người-dùng}

* Hệ thống phải có giao diện thân thiện, dễ sử dụng và nhất quán trên cả hai nền tảng website và ứng dụng di động.  
* Thiết kế phải đáp ứng (responsive), đảm bảo hiển thị tốt trên nhiều loại thiết bị và kích thước màn h7ình khác nhau (desktop, tablet, mobile).  
* Màu sắc, phông chữ và các yếu tố đồ họa phải tuân theo bộ nhận diện thương hiệu của bệnh viện.

  2. ### ***Tính bảo mật*** {#tính-bảo-mật}

* Hệ thống phải có cơ chế xác thực (đăng nhập) cho các tác nhân Bác sĩ, Admin và Super Admin.  
* Mật khẩu của người dùng phải được mã hóa trước khi lưu trữ trong cơ sở dữ liệu.  
* Hệ thống phải có cơ chế phân quyền rõ ràng, đảm bảo các tác nhân chỉ có thể truy cập vào những chức năng được phép.  
* Thông tin cá nhân của người dùng và bệnh án phải được bảo mật, tuân thủ các quy định về bảo vệ dữ liệu.

  3. ### ***Ràng buộc*** {#ràng-buộc}

* Hệ thống phải được phát triển trên hai nền tảng: Website (tương thích với các trình duyệt phổ biến như Chrome, Firefox, Safari) và Ứng dụng di động (cho hệ điều hành Android).  
* Ngôn ngữ sử dụng trên hệ thống là tiếng Việt.  
* Hệ thống cần đảm bảo hiệu năng, thời gian phản hồi nhanh chóng, đặc biệt là các chức năng tra cứu và đặt lịch.