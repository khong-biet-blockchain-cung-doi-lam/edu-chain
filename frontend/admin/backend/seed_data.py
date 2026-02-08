from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_contact_model import StudentContact
from app.models.student_enrollment_model import StudentEnrollment
from app.models.academic_models import Major, Cohort
from datetime import date
from dotenv import load_dotenv

load_dotenv()
app = create_app()

with app.app_context():
    print("Seeding data...")
    # Ensure account exists with correct password
    import bcrypt
    CORRECT_PASS = "001099123456"
    hashed = bcrypt.hashpw(CORRECT_PASS.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    acc = Account.query.filter_by(username="SV001").first()
    if not acc:
        print("SV001 not found. Creating...")
        acc = Account(username="SV001", password_hash=hashed, role="student")
        db.session.add(acc)
        db.session.commit()
        print("Created SV001 Account")
    else:
        # Update password specifically for testing
        acc.password_hash = hashed
        db.session.commit()
        print("Updated SV001 Password")
        
    student = acc.student
    if not student:
        print("Student record not found. Creating...")
        student = Student(student_id="SV001", account_id=acc.id)
        db.session.add(student)
        db.session.commit()
        print("Created Student record")
        
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
            edu_email="sv001@fpt.edu.vn"
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

    db.session.commit()
    print("Data seeded.")
