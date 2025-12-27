from enum import Enum

class GenderEnum(str, Enum):
    MALE = 'Nam'
    FEMALE = 'Nữ'

class AcademicStatus(str, Enum):
    STUDYING = 'Còn học'
    RESERVED = 'Bảo lưu'
    DROPPED = 'Bỏ học'
    GRADUATED = 'Đã tốt nghiệp'