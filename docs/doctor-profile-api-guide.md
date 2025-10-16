# Doctor Profile API Documentation

Hướng dẫn từng bước để tạo và cập nhật doctor profile với hình ảnh thông qua API Gateway.

## Tổng quan

API này cho phép client tạo và cập nhật doctor profile với khả năng upload hình ảnh (avatar và portrait). Quá trình bao gồm:

1. **Tạo doctor account** (nếu chưa có)
2. **Upload hình ảnh** lên Cloudinary
3. **Tạo/cập nhật doctor profile** với URL hình ảnh

## Base URL

```
http://localhost:3000
```

## Authentication

Tất cả API endpoints yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Tạo Doctor Profile với Hình ảnh

### Bước 1: Tạo Doctor Account (nếu chưa có)

**Endpoint:** `POST /doctors`

**Request Body:**
```json
{
  "fullName": "Dr. Nguyễn Văn A",
  "email": "doctor@example.com",
  "password": "securePassword123",
  "phone": "+84901234567",
  "isMale": true,
  "dateOfBirth": "1980-05-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "cm4abc123def456ghi",
  "fullName": "Dr. Nguyễn Văn A",
  "email": "doctor@example.com",
  "phone": "+84901234567",
  "isMale": true,
  "dateOfBirth": "1980-05-15T00:00:00.000Z",
  "role": "DOCTOR",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Bước 2: Tạo Upload Signature cho Hình ảnh

**Endpoint:** `POST /utilities/upload-signature`

**Response:**
```json
{
  "signature": "abc123def456...",
  "timestamp": 1705312200,
  "apiKey": "your_cloudinary_api_key",
  "cloudName": "your_cloud_name",
  "folder": "medicalink"
}
```

### Bước 3: Upload Hình ảnh lên Cloudinary

**Endpoint:** `POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`

**Form Data:**
```
file: <image_file>
api_key: <api_key_from_signature>
timestamp: <timestamp_from_signature>
signature: <signature_from_response>
folder: <folder_from_signature> || 'medicalink'
```

**Response:**
```json
{
  "public_id": "medicalink/cm4abc123def456ghi_avatar",
  "version": 1705312250,
  "signature": "xyz789...",
  "width": 300,
  "height": 300,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-01-15T10:30:50Z",
  "tags": ["doctor", "avatar"],
  "bytes": 45678,
  "type": "upload",
  "url": "http://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/medicalink/cm4abc123def456ghi_avatar.jpg",
  "secure_url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/medicalink/cm4abc123def456ghi_avatar.jpg"
}
```

### Bước 4: Tạo Doctor Profile

**Endpoint:** `POST /doctor-profile`

**Request Body:**
```json
{
  "staffAccountId": "cm4abc123def456ghi",
  "isActive": true,
  "degree": "Bác sĩ Chuyên khoa I",
  "position": ["Trưởng khoa Tim mạch", "Bác sĩ điều trị"],
  "introduction": "Bác sĩ có 15 năm kinh nghiệm trong lĩnh vực tim mạch...",
  "memberships": ["Hội Tim mạch Việt Nam", "Hiệp hội Y khoa TP.HCM"],
  "awards": ["Bác sĩ xuất sắc năm 2023", "Giải thưởng nghiên cứu khoa học"],
  "research": "Nghiên cứu về điều trị bệnh mạch vành ít xâm lấn",
  "trainingProcess": [
    "Tốt nghiệp Đại học Y Hà Nội (2005)",
    "Chuyên khoa I Tim mạch - Bệnh viện Bạch Mai (2010)",
    "Thực tập tại Singapore General Hospital (2015)"
  ],
  "experience": [
    "Bác sĩ điều trị - Bệnh viện Tim Hà Nội (2010-2018)",
    "Trưởng khoa Tim mạch - Bệnh viện Đa khoa Medlatec (2018-nay)"
  ],
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/medicalink/cm4abc123def456ghi_avatar.jpg",
  "portrait": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312300/doctors/portraits/cm4abc123def456ghi_portrait.jpg",
  "specialtyIds": ["cm4specialty1", "cm4specialty2"],
  "locationIds": ["cm4location1", "cm4location2"]
}
```

**Response:**
```json
{
  "id": "cm4profile123abc",
  "staffAccountId": "cm4abc123def456ghi",
  "isActive": true,
  "degree": "Bác sĩ Chuyên khoa I",
  "position": ["Trưởng khoa Tim mạch", "Bác sĩ điều trị"],
  "introduction": "Bác sĩ có 15 năm kinh nghiệm trong lĩnh vực tim mạch...",
  "memberships": ["Hội Tim mạch Việt Nam", "Hiệp hội Y khoa TP.HCM"],
  "awards": ["Bác sĩ xuất sắc năm 2023", "Giải thưởng nghiên cứu khoa học"],
  "research": "Nghiên cứu về điều trị bệnh mạch vành ít xâm lấn",
  "trainingProcess": [
    "Tốt nghiệp Đại học Y Hà Nội (2005)",
    "Chuyên khoa I Tim mạch - Bệnh viện Bạch Mai (2010)",
    "Thực tập tại Singapore General Hospital (2015)"
  ],
  "experience": [
    "Bác sĩ điều trị - Bệnh viện Tim Hà Nội (2010-2018)",
    "Trưởng khoa Tim mạch - Bệnh viện Đa khoa Medlatec (2018-nay)"
  ],
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/medicalink/cm4abc123def456ghi_avatar.jpg",
  "portrait": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312300/doctors/portraits/cm4abc123def456ghi_portrait.jpg",
  "createdAt": "2024-01-15T10:35:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  "specialties": [
    {
      "id": "cm4specialty1",
      "name": "Tim mạch",
      "slug": "tim-mach"
    },
    {
      "id": "cm4specialty2", 
      "name": "Nội khoa",
      "slug": "noi-khoa"
    }
  ],
  "workLocations": [
    {
      "id": "cm4location1",
      "name": "Bệnh viện Đa khoa Medlatec",
      "address": "42-44 Nghĩa Dũng, Ba Đình, Hà Nội"
    },
    {
      "id": "cm4location2",
      "name": "Phòng khám Tim mạch Medlatec",
      "address": "25 Nguyễn Thị Thập, Cầu Giấy, Hà Nội"
    }
  ]
}
```

---

## 2. Cập nhật Doctor Profile với Hình ảnh

### Bước 1: Tạo Upload Signature cho Hình ảnh mới (nếu cần)

Thực hiện tương tự như **Bước 2** trong phần tạo profile.

### Bước 2: Upload Hình ảnh mới lên Cloudinary (nếu cần)

Thực hiện tương tự như **Bước 3** trong phần tạo profile.

### Bước 3: Cập nhật Doctor Profile

**Endpoint:** `PUT /doctor-profile/{profileId}`

---

## 3. Best Practices

### 1. Image Upload Guidelines

- **Avatar**: Khuyến nghị kích thước 300x300px, định dạng JPG/PNG
- **Portrait**: Khuyến nghị kích thước 800x600px, định dạng JPG/PNG
- **File size**: Tối đa 10MB
- **Transformation**: Sử dụng Cloudinary transformation để tối ưu hóa hình ảnh

### 2. Security

- Luôn validate JWT token trước khi gọi API
- Kiểm tra permissions của user trước khi cho phép tạo/cập nhật profile
- Validate file type và size trước khi upload

### 3. Performance

- Sử dụng Cloudinary transformation để tối ưu hóa hình ảnh
- Cache response data khi có thể
- Sử dụng pagination cho danh sách doctor profiles

### 4. Error Handling

- Luôn kiểm tra response status code
- Implement retry logic cho network errors
- Log errors để debug

---