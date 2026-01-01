from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_models import Student
from app.models.supabase_models import StudentPersonalInfo, StudentContact, StudentEnrollment, Major, Cohort
import uuid
from datetime import date

app = create_app()

with app.app_context():
    print("Seeding data for SV001...")
    
    # 1. Find Student
    acc = Account.query.filter_by(username="SV001").first()
    if not acc or not acc.student:
        print("❌ Student SV001 not found. Please run 'test_full_flow.py' or upload students first.")
        exit()
    
    student = acc.student
    print(f"Found student: {student.id}")
    
    # 2. Create Major/Cohort if not exist
    major = Major.query.filter_by(code="SE").first()
    if not major:
        major = Major(code="SE", name="Software Engineering")
        db.session.add(major)
        print("Created Major: SE")
        
    cohort = Cohort.query.filter_by(name="K15").first()
    if not cohort:
        cohort = Cohort(name="K15", start_year=2019, end_year=2023)
        db.session.add(cohort)
        print("Created Cohort: K15")
        
    db.session.commit() # Commit to get IDs
    
    # 3. Personal Info (Constraint: Shared PK or new ID? We use student.id to match relationship logic)
    # Check if exists
    p_info = StudentPersonalInfo.query.get(student.id)
    if not p_info:
        p_info = StudentPersonalInfo(
            id=student.id,
            first_name="Nguyen Van",
            last_name="A",
            date_of_birth=date(2003, 5, 20),
            gender="Nam",
            national_id_number="001099123456",
            class_name="SE1501",
            academic_status="Studying"
        )
        db.session.add(p_info)
        print("Created Personal Info")
        
    # 4. Contact
    contact = StudentContact.query.get(student.id)
    if not contact:
        contact = StudentContact(
            id=student.id,
            phone="0909123456",
            personal_email="nguyenvana@gmail.com",
            edu_email="sv001@fpt.edu.vn",
            contact_address="HCMC, Vietnam"
        )
        db.session.add(contact)
        print("Created Contact Info")
        
    # 5. Enrollment
    enroll = StudentEnrollment.query.filter_by(student_id=student.id).first()
    if not enroll:
        enroll = StudentEnrollment(
            student_id=student.id,
            major_id=major.id,
            cohort_id=cohort.id
        )
        db.session.add(enroll)
        print("Created Enrollment")

    db.session.commit()
    print("✅ Data seeded successfully! Now you can test the profile endpoint.")
