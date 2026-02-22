import sys
import os
# Add the backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_contact_model import StudentContact
from app.models.student_enrollment_model import StudentEnrollment
from app.models.academic_models import Major, Cohort
from app.models.staff_models import Staff, Lecturer
from app.models.partner_model import Partner
from app.models.enums import Role
from datetime import date
from dotenv import load_dotenv

load_dotenv()
app = create_app()

with app.app_context():
    print("Seeding test data...")
    import bcrypt
    CORRECT_PASS = "001099123456"
    hashed = bcrypt.hashpw(CORRECT_PASS.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Helper function to create or update an account and its profile
    def create_or_update_account(username, email, role, full_name=None):
        acc = Account.query.filter_by(username=username).first()
        if not acc:
            acc = Account.query.filter_by(email=email).first()
            
        if not acc:
            acc = Account(username=username, email=email, password_hash=hashed, role=role, is_active=True)
            db.session.add(acc)
            db.session.commit()
            print(f"Created account: {username} ({role})")
        else:
            acc.password_hash = hashed
            acc.role = role
            acc.email = email
            db.session.commit()
            print(f"Updated password for existing account: {username}")
            
        return acc

    # 1. Student Account
    student_acc = create_or_update_account("SV001", "sv001@st.neu.edu.vn", Role.SINH_VIEN)
        
    student = Account.query.filter_by(username="SV001").first().student
    if not student:
        try:
            print("Student record not found. Creating...")
            student = Student(student_id="SV001", id=student_acc.id)
            db.session.add(student)
            db.session.commit()
            print("Created Student record")
        except Exception as e:
            db.session.rollback()
            print(f"Student record might already exist under a different ID or integrity error: {e}")
            student = Student.query.filter_by(student_id="SV001").first()
        
    # Major/Cohort
    major = Major.query.filter_by(code="SE").first()
    if not major:
        major = Major(code="SE", name="Software Engineering")
        db.session.add(major)
        
    cohort = Cohort.query.filter_by(name="K15").first()
    if not cohort:
        cohort = Cohort(name="K15", start_year=2019, end_year=2023)
        db.session.add(cohort)
        
    db.session.commit()
    
    # Personal Info
    if not StudentPersonalInfo.query.get(student.id):
        info = StudentPersonalInfo(
            id=student.id,
            first_name="Nguyen Van",
            last_name="A",
            date_of_birth=date(2003, 5, 20),
            class_name="SE1501",
            academic_status="Còn học" # Enum value
        )
        db.session.add(info)
        
    # Contact
    if not StudentContact.query.get(student.id):
        contact = StudentContact(
            id=student.id,
            phone="0909123456",
            edu_email="sv001@st.neu.edu.vn"
        )
        db.session.add(contact)
        
    # Enrollment
    if not StudentEnrollment.query.filter_by(student_id=student.id).first():
        enroll = StudentEnrollment(
             student_id=student.id,
             major_id=major.id,
             cohort_id=cohort.id
        )
        db.session.add(enroll)

    # 2. Quản lý đào tạo (Admin) Account
    admin_acc = create_or_update_account("admin01", "admin01@qldt.neu.edu.vn", Role.QL_DAO_TAO)
    admin_staff = Staff.query.get(admin_acc.id)
    if not admin_staff:
        staff = Staff(id=admin_acc.id, position=Role.QL_DAO_TAO, full_name="Trưởng Phòng Đào Tạo")
        db.session.add(staff)

    # 3. Giảng viên (Lecturer) Account
    lecturer_acc = create_or_update_account("GV001", "gv001@lt.neu.edu.vn", Role.GIANG_VIEN)
    lecturer_profile = Lecturer.query.get(lecturer_acc.id)
    if not lecturer_profile:
        try:
            lecturer = Lecturer(id=lecturer_acc.id, lecturer_code="GV001", full_name="TS. Giảng Viên A")
            db.session.add(lecturer)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Lecturer record might already exist: {e}")

    # 4. Đối tác (Partner) Account
    from app.models.enterprise_model import Enterprise
    partner_acc = create_or_update_account("partner_vin", "contact@vingroup.tp.neu.edu.vn", Role.PARTNER)
    
    enterprise = Enterprise.query.filter_by(tax_id="0101245486").first()
    if not enterprise:
        enterprise = Enterprise(name="Tập đoàn Vingroup", tax_id="0101245486", status="APPROVED")
        db.session.add(enterprise)
        db.session.commit()
        
    partner_profile = Partner.query.filter_by(account_id=partner_acc.id).first()
    if not partner_profile:
        try:
            partner = Partner(account_id=partner_acc.id, full_name="Tập đoàn Vingroup", enterprise_id=enterprise.id)
            db.session.add(partner)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Partner record might already exist: {e}")

    db.session.commit()
    print("Test data seeded successfully!")
    print("\n--- TEST ACCOUNTS (Password: 001099123456) ---")
    print("1. Sinh viên : sv001@st.neu.edu.vn")
    print("2. Quản lý   : admin01@qldt.neu.edu.vn")
    print("3. Giảng viên: gv001@lt.neu.edu.vn")
    print("4. Đối tác   : contact@vingroup.tp.neu.edu.vn")
