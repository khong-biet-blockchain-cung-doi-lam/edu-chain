import uuid
from datetime import datetime
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_contact_model import StudentContact
from app.models.student_enrollment_model import StudentEnrollment
from app.models.course_models import Grade, CourseClass
from app.models.enums import AcademicStatus

class StudentService:
    @staticmethod
    def get_profile(account_id):
        """Fetches and formats student profile data."""
        if isinstance(account_id, str):
            account_id = uuid.UUID(account_id)
        
        account = db.session.get(Account, account_id)
        if not account or not account.student:
            return None, "Không tìm thấy hồ sơ sinh viên"

        student = account.student
        p_info = student.personal_info
        contact = student.contact
        enrollment = student.enrollment
        
        data = {
            "student_id": student.student_id,
            "email": account.username, 
            "personal_info": {
                "first_name": p_info.first_name if p_info else "",
                "last_name": p_info.last_name if p_info else "",
                "date_of_birth": p_info.date_of_birth.strftime('%Y-%m-%d') if p_info and p_info.date_of_birth else None,
                "gender": p_info.gender if p_info else "",
                "national_id": p_info.national_id_number if p_info else "",
                "class_name": p_info.class_name if p_info else "",
                "academic_status": p_info.academic_status if p_info else "",
                "is_locked": p_info.is_locked if p_info else False,
            },
            "contact_info": {
                "phone": contact.phone if contact else "",
                "email_personal": contact.personal_email if contact else "",
                "email_edu": contact.edu_email if contact else "",
                "address": contact.contact_address if contact else ""
            },
            "enrollment_info": {
                "major": enrollment.major.name if (enrollment and enrollment.major) else "",
                "major_code": enrollment.major.code if (enrollment and enrollment.major) else "",
                "cohort": enrollment.cohort.name if (enrollment and enrollment.cohort) else "",
                "curriculum": enrollment.curriculum.name if (enrollment and enrollment.curriculum) else ""
            }
        }
        return data, None

    @staticmethod
    def update_profile(account_id, data):
        """Handles profile updates and locking logic."""
        if isinstance(account_id, str):
            account_id = uuid.UUID(account_id)
            
        account = db.session.get(Account, account_id)
        if not account or not account.student:
            return None, "Unauthorized"

        student = account.student
        
        contact = student.contact
        if not contact:
            contact = StudentContact(id=student.id)
            db.session.add(contact)
        
        if "phone" in data: contact.phone = data["phone"]
        if "email_personal" in data: contact.personal_email = data["email_personal"]
        if "address" in data: contact.contact_address = data["address"]
        if "permanent_address" in data: contact.permanent_address = data["permanent_address"]

        p_info = db.session.get(StudentPersonalInfo, student.id)
        if not p_info:
            p_info = StudentPersonalInfo(id=student.id, academic_status=AcademicStatus.STUDYING)
            db.session.add(p_info)

        if p_info.is_locked:
            return None, "Hồ sơ đã bị khóa, không thể chỉnh sửa"

        if "first_name" in data: p_info.first_name = data["first_name"]
        if "last_name" in data: p_info.last_name = data["last_name"]
        if "gender" in data: p_info.gender = data["gender"]
        if "national_id" in data: p_info.national_id_number = data["national_id"]
        if "ethnicity" in data: p_info.ethnicity = data["ethnicity"]
        if "religion" in data: p_info.religion = data["religion"]
        if "date_of_birth" in data and data["date_of_birth"]:
            try:
                p_info.date_of_birth = datetime.strptime(data["date_of_birth"], "%Y-%m-%d").date()
            except ValueError:
                return None, "Định dạng ngày sinh không hợp lệ"

        p_info.is_locked = True
        db.session.commit()
        return True, None

    @staticmethod
    def enroll_class(account_id, class_id):
        """Enroll student in a class."""
        if isinstance(account_id, str): account_id = uuid.UUID(account_id)
        if isinstance(class_id, str): class_id = uuid.UUID(class_id)
        
        account = db.session.get(Account, account_id)
        if not account or not account.student:
            return None, "Không tìm thấy hồ sơ sinh viên"
            
        course_class = db.session.get(CourseClass, class_id)
        if not course_class:
            return None, "Lớp học phần không tồn tại"

        existing = Grade.query.filter_by(student_id=account.student.id, course_class_id=class_id).first()
        if existing:
            return None, "Đã đăng ký lớp học phần này rồi"

        new_enrollment = Grade(student_id=account.student.id, course_class_id=class_id, status="ENROLLED")
        db.session.add(new_enrollment)
        db.session.commit()
        return True, None

    @staticmethod
    def drop_class(account_id, class_id):
        """Drop student from a class."""
        if isinstance(account_id, str): account_id = uuid.UUID(account_id)
        if isinstance(class_id, str): class_id = uuid.UUID(class_id)
        
        account = db.session.get(Account, account_id)
        if not account or not account.student:
            return None, "Không tìm thấy hồ sơ sinh viên"

        grade = Grade.query.filter_by(student_id=account.student.id, course_class_id=class_id).first()
        if not grade:
            return None, "Chưa đăng ký lớp học phần này"

        db.session.delete(grade)
        db.session.commit()
        return True, None
