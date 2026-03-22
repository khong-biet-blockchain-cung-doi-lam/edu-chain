# 🧪 EduChain - Hướng Dẫn Test

## 1. Khởi Động Services

```bash
# Terminal 1 - Backend (PHẢI chạy trước)
cd backend
python run.py
# ✅ Chạy tại: http://127.0.0.1:5001

# Terminal 2 - Login Form
cd frontend/login-form
npm start
# ✅ Chạy tại: http://localhost:3000

# Terminal 3 - Student Portal
cd frontend/student
npm run dev
# ✅ Chạy tại: http://localhost:5005

# Terminal 4 - Admin Portal
cd frontend/admin
npm run dev
# ✅ Chạy tại: http://localhost:5004

# Terminal 5 - Lecturer Portal
cd frontend/lecturer
npm run dev
# ✅ Chạy tại: http://localhost:5006

# Terminal 6 - Organizations Portal
cd frontend/organizations
npm run dev
# ✅ Chạy tại: http://localhost:5003
```

---

## 2. Tài Khoản Test

| Username | Password | Vai Trò | Portal Sau Login |
|----------|----------|---------|-----------------|
| `admin01` | `Admin@123` | Quản trị hệ thống | http://localhost:5004 |
| `qldt01` | `Qldt@123` | Phòng Quản lý Đào tạo | http://localhost:5004 |
| `khaothi01` | `Khaothi@123` | Phòng Khảo thí | http://localhost:5004 |
| `khoa01` | `Khoa@123` | Văn phòng Khoa | http://localhost:5004 |
| `lecturer01` | `Lecturer@123` | Giảng viên | http://localhost:5006 |
| `student01` | `Student@123` | Sinh viên | http://localhost:5005 |
| `partner01` | `Partner@123` | Đối tác / Doanh nghiệp | http://localhost:5003 |

---

## 3. Hướng Dẫn Test Theo Từng Portal

### 🔐 Bước 1: Đăng Nhập
1. Mở http://localhost:3000
2. Nhập username/password từ bảng trên
3. Nhấn **Đăng nhập**
4. Hệ thống sẽ **tự động chuyển hướng** đến portal phù hợp

---

### 🎓 Portal Sinh Viên (student01 → Port 5005)

| Chức năng | Cách test |
|-----------|-----------|
| Xem hồ sơ cá nhân | Vào mục "Hồ sơ" hoặc "Profile" |
| Xem điểm học phần | Vào mục "Điểm số" / "Grades" |
| Xem lớp học phần có thể đăng ký | Vào mục "Đăng ký học phần" |
| Đăng xuất | Bấm nút Logout → về trang đăng nhập |

---

### 👨‍🏫 Portal Giảng Viên (lecturer01 → Port 5006)

| Chức năng | Cách test |
|-----------|-----------|
| Xem danh sách lớp được phân công | Vào mục "Lớp của tôi" |
| Nhập điểm sinh viên | Chọn lớp → Nhập điểm |
| Upload file điểm Excel | Chọn lớp → Upload Excel |
| Xem chứng chỉ sinh viên | Danh sách sinh viên → Chi tiết |

---

### 🏛️ Portal Admin & Các Phòng Ban (Port 5004)

**LƯU Ý:** Tất cả các tài khoản Admin, QL_DAO_TAO, KHAO_THI, KHOA đều dùng chung Portal tại port 5004 nhưng giao diện và chức năng sẽ tự thay đổi theo quyền:

#### 1. Tài khoản `admin01` (Quản trị):
- **Quản lý tài khoản**: Thêm/Sửa/Xóa mọi user.
- **System Encryption**: Khởi tạo RSA keys (`Init Keys`).

#### 2. Tài khoản `qldt01` (Quản lý Đào tạo):
- **Hành chính**: Quản lý Môn học, Lớp học phần, Chương trình.
- **Hồ sơ**: Upload Excel sinh viên, mã hóa hồ sơ sinh viên (`Student Profile`).

#### 3. Tài khoản `khaothi01` (Khảo thí):
- **Điểm số**: Xem danh sách điểm, sửa điểm sau phúc khảo.
- **Mã hóa**: Mã hóa điểm số (`Student Grades`), Giải mã (`Decryption`).

#### 4. Tài khoản `khoa01` (Văn phòng Khoa):
- **Hồ sơ**: Xem hồ sơ sinh viên trong khoa.
- **Duyệt**: Duyệt loại học phần (tùy theo chức năng khoa).

---

### 🤝 Portal Tổ Chức/Doanh Nghiệp (partner01 → Port 5003)

| Chức năng | Cách test |
|-----------|-----------|
| Xem hồ sơ doanh nghiệp | Mục "Profile" → thấy "Partner Test 01" |
| Xem thống kê | Mục "Statistics" |
| Xem học bổng | Mục "Học bổng" |
| Xem đơn ứng tuyển | Mục "Đơn ứng tuyển" |

---

## 4. Test Encryption & Blockchain (On-Chain)

Dữ liệu mã hóa sẽ được đẩy lên **Blockchain** và **IPFS** thông qua các bước:

1. **Deploy Local Blockchain**:
   ```bash
   cd blockchain
   npx hardhat node
   # Mở terminal mới:
   npx hardhat run scripts/deploy.js --network localhost
   ```
2. **Cập nhật .env**: Lấy các địa chỉ Contract từ terminal sau khi deploy dán vào `backend/.env`.
3. **Thực hiện**: Trong Admin Portal, khi nhấn "Mã hóa", hệ thống sẽ tự động Encrypt -> Upload IPFS -> Ghi Hash lên Smart Contract.

---

## 5. Blockchain (Cần Cài Đặt Thêm)

Blockchain đã được code hoàn chỉnh nhưng cần chạy local Hardhat:

```bash
# Terminal - Blockchain
cd blockchain
npm install
npx hardhat node           # Chạy local blockchain (port 8545)
npx hardhat run scripts/deploy.js --network localhost  # Deploy contracts
```

Sau khi deploy, copy địa chỉ contract vào `backend/.env`:
```
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PROFILE_CONTRACT_ADDRESS=0x...
ACADEMIC_CONTRACT_ADDRESS=0x...
ACCESS_CONTROL_ADDRESS=0x...
LOGS_MANAGER_ADDRESS=0x...
SYSTEM_WALLET_PRIVATE_KEY=0x...
```

---

## 6. Test API Trực Tiếp (Nâng Cao)

```powershell
# Lấy token
$token = (Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin01","password":"Admin@123"}').access_token

# Test endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/management/accounts" `
  -Headers @{Authorization="Bearer $token"}
```

### Danh Sách Endpoints Chính

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/auth/login` | All |
| GET | `/api/student/profile` | SINH_VIEN |
| GET | `/api/student/grades` | SINH_VIEN |
| GET | `/api/lecturer/classes` | GIANG_VIEN |
| GET | `/api/management/accounts` | ADMIN/QL_DAO_TAO/KHAO_THI |
| GET | `/api/academic/subjects` | ADMIN/QL_DAO_TAO |
| GET | `/api/academic/classes` | ADMIN/QL_DAO_TAO |
| GET | `/api/encrypt/clusters` | ADMIN/QL_DAO_TAO/KHAO_THI |
| POST | `/api/encrypt/student-profile/<id>` | ADMIN/QL_DAO_TAO |
| POST | `/api/encrypt/student-grades/<id>` | ADMIN/KHAO_THI |
| GET | `/api/khao-thi/students` | KHAO_THI/ADMIN |
| GET | `/api/organization/profile` | PARTNER |

---

## 7. Hướng Dẫn Test Chống Rò Rỉ Dữ Liệu Nội Bộ (DLP)

Hệ thống đã được bổ sung giải pháp Bảo Mật Chống rò rỉ dữ liệu (Insider Threats):

1. **Lưới Bản Quyền (Watermark Động)**
   - Đăng nhập `gv_an` (Pass: `Gv@123`) -> Vào **Lớp của tôi** -> Chọn một lớp.
   - Bạn sẽ thấy lưới chữ "BẢO MẬT: GIẢNG VIÊN - EDU-CHAIN" được nhúng đè lên các trang nhạy cảm nhằm ngăn chặn việc chụp lén màn hình tuồn thông tin ra ngoài. (Cơ chế tương tự tại màn Tổ chức/Danh sách ứng viên).

2. **Khóa Copy và In (Global Restrictions)**
   - Hệ thống trên toàn bộ các Portal hiện đã **Khóa Bôi đen** copy dữ liệu.
   - Thử nhấn **Ctrl + P** để in thử màn hình danh sách, trình duyệt sẽ tự che giấu tất cả thành trang giấy trắng.

3. **Chế Độ Che Giấu Dữ Liệu (Data Masking) & Ghi Log (Audit Log)** 
   - Tên Sinh viên, Mã sinh viên bị che mờ một phần (VD: `Nguyễn *** A`, `CQ59****`).
   - Click vào biểu tượng con mắt (👁️) cạnh tên sinh viên để mở khóa xem dữ liệu đầy đủ.
   - Mỗi lần click hiển thị, hệ thống tự động gọi API `POST /api/audit/log` vào Backend để lưu vết "Ai đã xem dữ liệu của ai vào lúc nào", sẵn sàng truy cứu trách nhiệm định kỳ.

---

*Cập nhật: 2026-03-*
