class AcademicStatus:
    STUDYING = "Còn học"
    RESERVED = "Bảo lưu"
    DROPPED = "Bỏ học"
    GRADUATED = "Đã tốt nghiệp"

class Gender:
    MALE = "Nam"
    FEMALE = "Nữ"

class Role:
    ADMIN      = "ADMIN"
    QL_DAO_TAO = "QL_DAO_TAO"    # Phòng Quản lý Đào tạo → cluster: student_profile
    KHAO_THI   = "KHAO_THI"      # Phòng Khảo thí → cluster: student_grades
    KHOA       = "KHOA"           # Văn phòng khoa → quản lý giảng viên
    GIANG_VIEN = "GIANG_VIEN"
    SINH_VIEN  = "SINH_VIEN"
    PARTNER    = "PARTNER"

# Mapping: Role → cluster_type mà phòng đó quản lý
ROLE_CLUSTER_MAP = {
    Role.QL_DAO_TAO: "student_profile",
    Role.KHAO_THI:   "student_grades",
}

# Mapping: Role → email domain bắt buộc
ROLE_EMAIL_DOMAIN = {
    Role.ADMIN:      "@admin.neu.edu.vn",
    Role.QL_DAO_TAO: "@qldt.neu.edu.vn",
    Role.KHAO_THI:   "@kt.neu.edu.vn",
    Role.KHOA:       "@khoa.neu.edu.vn",
    Role.GIANG_VIEN: "@lt.neu.edu.vn",
    Role.SINH_VIEN:  "@st.neu.edu.vn",
    Role.PARTNER:    "@tp.neu.edu.vn",
}

# Mapping: Caller role → roles được phép tạo
ROLE_CAN_CREATE = {
    Role.ADMIN:      [Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA, Role.PARTNER],
    Role.QL_DAO_TAO: [Role.SINH_VIEN],
    Role.KHOA:       [Role.GIANG_VIEN],
}

