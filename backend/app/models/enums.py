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
    KHOA       = "KHOA"
    GIANG_VIEN = "GIANG_VIEN"
    SINH_VIEN  = "SINH_VIEN"
    PARTNER    = "PARTNER"

# Mapping: Role → cluster_type mà phòng đó quản lý
ROLE_CLUSTER_MAP = {
    Role.QL_DAO_TAO: "student_profile",
    Role.KHAO_THI:   "student_grades",
}
