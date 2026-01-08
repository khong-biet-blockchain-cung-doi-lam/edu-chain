# Các Enums nếu có (Ví dụ: Trạng thái học tập)
# Hiện tại DB lưu text/varchar trực tiếp, nhưng ta có thể define constant ở đây

class AcademicStatus:
    STUDYING = "Còn học"
    RESERVED = "Bảo lưu"
    DROPPED = "Bỏ học"
    GRADUATED = "Đã tốt nghiệp"
