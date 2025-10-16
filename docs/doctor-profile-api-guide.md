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

**Request Body cho Avatar:**
```json
{
  "folder": "doctors/avatars",
  "resourceType": "image",
  "transformation": "c_fill,w_300,h_300,q_auto,f_auto",
  "format": "jpg",
  "tags": ["doctor", "avatar"]
}
```

**Request Body cho Portrait:**
```json
{
  "folder": "doctors/portraits", 
  "resourceType": "image",
  "transformation": "c_fill,w_800,h_600,q_auto,f_auto",
  "format": "jpg",
  "tags": ["doctor", "portrait"]
}
```

**Response:**
```json
{
  "signature": "abc123def456...",
  "timestamp": 1705312200,
  "apiKey": "your_cloudinary_api_key",
  "cloudName": "your_cloud_name",
  "folder": "doctors/avatars",
  "transformation": "c_fill,w_300,h_300,q_auto,f_auto",
  "resourceType": "image",
  "format": "jpg",
  "tags": "doctor,avatar"
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
folder: <folder_from_signature>
transformation: <transformation_from_signature>
format: <format_from_signature>
tags: <tags_from_signature>
```

**Response:**
```json
{
  "public_id": "doctors/avatars/cm4abc123def456ghi_avatar",
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
  "url": "http://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/doctors/avatars/cm4abc123def456ghi_avatar.jpg",
  "secure_url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/doctors/avatars/cm4abc123def456ghi_avatar.jpg"
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
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/doctors/avatars/cm4abc123def456ghi_avatar.jpg",
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
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/doctors/avatars/cm4abc123def456ghi_avatar.jpg",
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

**Request Body:** (chỉ cần gửi các field muốn cập nhật)
```json
{
  "degree": "Bác sĩ Chuyên khoa II",
  "position": ["Phó Giám đốc Bệnh viện", "Trưởng khoa Tim mạch"],
  "introduction": "Bác sĩ có 20 năm kinh nghiệm trong lĩnh vực tim mạch và phẫu thuật tim...",
  "awards": [
    "Bác sĩ xuất sắc năm 2023", 
    "Giải thưởng nghiên cứu khoa học",
    "Huân chương Lao động hạng Ba"
  ],
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312400/doctors/avatars/cm4abc123def456ghi_avatar_new.jpg",
  "specialtyIds": ["cm4specialty1", "cm4specialty2", "cm4specialty3"]
}
```

**Response:**
```json
{
  "id": "cm4profile123abc",
  "staffAccountId": "cm4abc123def456ghi",
  "isActive": true,
  "degree": "Bác sĩ Chuyên khoa II",
  "position": ["Phó Giám đốc Bệnh viện", "Trưởng khoa Tim mạch"],
  "introduction": "Bác sĩ có 20 năm kinh nghiệm trong lĩnh vực tim mạch và phẫu thuật tim...",
  "memberships": ["Hội Tim mạch Việt Nam", "Hiệp hội Y khoa TP.HCM"],
  "awards": [
    "Bác sĩ xuất sắc năm 2023", 
    "Giải thưởng nghiên cứu khoa học",
    "Huân chương Lao động hạng Ba"
  ],
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
  "avatarUrl": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312400/doctors/avatars/cm4abc123def456ghi_avatar_new.jpg",
  "portrait": "https://res.cloudinary.com/your_cloud_name/image/upload/v1705312300/doctors/portraits/cm4abc123def456ghi_portrait.jpg",
  "createdAt": "2024-01-15T10:35:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z",
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
    },
    {
      "id": "cm4specialty3",
      "name": "Phẫu thuật tim",
      "slug": "phau-thuat-tim"
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

## 3. Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "staffAccountId must be a valid CUID",
    "avatarUrl must be a string"
  ],
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Doctor profile with id cm4profile123abc not found",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Doctor profile already exists for staff account",
  "error": "Conflict"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

### Cloudinary Upload Errors

#### Invalid Signature
```json
{
  "error": {
    "message": "Invalid signature"
  }
}
```

#### File Too Large
```json
{
  "error": {
    "message": "File size too large. Maximum allowed size is 10MB"
  }
}
```

#### Invalid File Type
```json
{
  "error": {
    "message": "Invalid file type. Only image files are allowed"
  }
}
```

---

## 4. Best Practices

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

## 5. Code Examples

### JavaScript/TypeScript Example

```typescript
class DoctorProfileAPI {
  private baseURL = 'http://localhost:3000';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createDoctorAccount(data: CreateDoctorAccountDto) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateUploadSignature(data: GenerateSignatureDto) {
    return this.request('/utilities/upload-signature', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadToCloudinary(file: File, signature: CloudinarySignatureResponse) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    
    if (signature.folder) formData.append('folder', signature.folder);
    if (signature.transformation) formData.append('transformation', signature.transformation);
    if (signature.format) formData.append('format', signature.format);
    if (signature.tags) formData.append('tags', signature.tags);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createDoctorProfile(data: CreateDoctorProfileDto) {
    return this.request('/doctor-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorProfile(profileId: string, data: UpdateDoctorProfileDto) {
    return this.request(`/doctor-profile/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Complete workflow for creating doctor profile with images
  async createDoctorProfileWithImages(
    accountData: CreateDoctorAccountDto,
    profileData: Omit<CreateDoctorProfileDto, 'staffAccountId' | 'avatarUrl' | 'portrait'>,
    avatarFile?: File,
    portraitFile?: File
  ) {
    try {
      // Step 1: Create doctor account
      const account = await this.createDoctorAccount(accountData);
      
      let avatarUrl: string | undefined;
      let portraitUrl: string | undefined;

      // Step 2: Upload avatar if provided
      if (avatarFile) {
        const avatarSignature = await this.generateUploadSignature({
          folder: 'doctors/avatars',
          resourceType: 'image',
          transformation: 'c_fill,w_300,h_300,q_auto,f_auto',
          format: 'jpg',
          tags: ['doctor', 'avatar']
        });

        const avatarUpload = await this.uploadToCloudinary(avatarFile, avatarSignature);
        avatarUrl = avatarUpload.secure_url;
      }

      // Step 3: Upload portrait if provided
      if (portraitFile) {
        const portraitSignature = await this.generateUploadSignature({
          folder: 'doctors/portraits',
          resourceType: 'image', 
          transformation: 'c_fill,w_800,h_600,q_auto,f_auto',
          format: 'jpg',
          tags: ['doctor', 'portrait']
        });

        const portraitUpload = await this.uploadToCloudinary(portraitFile, portraitSignature);
        portraitUrl = portraitUpload.secure_url;
      }

      // Step 4: Create doctor profile
      const profile = await this.createDoctorProfile({
        ...profileData,
        staffAccountId: account.id,
        avatarUrl,
        portrait: portraitUrl,
      });

      return {
        account,
        profile,
      };
    } catch (error) {
      console.error('Error creating doctor profile with images:', error);
      throw error;
    }
  }
}

// Usage example
const api = new DoctorProfileAPI('your_jwt_token');

const accountData = {
  fullName: "Dr. Nguyễn Văn A",
  email: "doctor@example.com", 
  password: "securePassword123",
  phone: "+84901234567",
  isMale: true,
  dateOfBirth: "1980-05-15T00:00:00.000Z"
};

const profileData = {
  isActive: true,
  degree: "Bác sĩ Chuyên khoa I",
  position: ["Trưởng khoa Tim mạch"],
  introduction: "Bác sĩ có 15 năm kinh nghiệm...",
  specialtyIds: ["cm4specialty1"],
  locationIds: ["cm4location1"]
};

// Assuming you have file inputs
const avatarFile = document.getElementById('avatar').files[0];
const portraitFile = document.getElementById('portrait').files[0];

api.createDoctorProfileWithImages(accountData, profileData, avatarFile, portraitFile)
  .then(result => {
    console.log('Doctor profile created successfully:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

---

## 6. Testing

### Postman Collection

Bạn có thể import collection sau vào Postman để test API:

```json
{
  "info": {
    "name": "Doctor Profile API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "your_jwt_token_here"
    }
  ],
  "item": [
    {
      "name": "Create Doctor Account",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/doctors",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"Dr. Nguyễn Văn A\",\n  \"email\": \"doctor@example.com\",\n  \"password\": \"securePassword123\",\n  \"phone\": \"+84901234567\",\n  \"isMale\": true,\n  \"dateOfBirth\": \"1980-05-15T00:00:00.000Z\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "Generate Upload Signature",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization", 
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/utilities/upload-signature",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"folder\": \"doctors/avatars\",\n  \"resourceType\": \"image\",\n  \"transformation\": \"c_fill,w_300,h_300,q_auto,f_auto\",\n  \"format\": \"jpg\",\n  \"tags\": [\"doctor\", \"avatar\"]\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "Create Doctor Profile",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/doctor-profile",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"staffAccountId\": \"cm4abc123def456ghi\",\n  \"isActive\": true,\n  \"degree\": \"Bác sĩ Chuyên khoa I\",\n  \"position\": [\"Trưởng khoa Tim mạch\"],\n  \"introduction\": \"Bác sĩ có 15 năm kinh nghiệm...\",\n  \"avatarUrl\": \"https://res.cloudinary.com/your_cloud_name/image/upload/v1705312250/doctors/avatars/avatar.jpg\",\n  \"specialtyIds\": [\"cm4specialty1\"],\n  \"locationIds\": [\"cm4location1\"]\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ]
}
```

---

## Kết luận

Tài liệu này cung cấp hướng dẫn chi tiết để tạo và cập nhật doctor profile với hình ảnh. Quá trình bao gồm việc tạo account, upload hình ảnh lên Cloudinary, và tạo/cập nhật profile với URL hình ảnh.

Để có trải nghiệm tốt nhất, hãy tuân thủ các best practices và xử lý errors một cách thích hợp trong ứng dụng của bạn.