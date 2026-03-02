import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.course_models import Semester, Subject, CourseClass, Grade
from app.models.enums import Role, AcademicStatus
import bcrypt
import uuid
from datetime import date

app = create_app()

with app.app_context():
    # 1. Accounts setup
    roles = [
        (Role.ADMIN, "admin@admin.neu.edu.vn"),
        (Role.QL_DAO_TAO, "qldt@qldt.neu.edu.vn"),
        (Role.KHAO_THI, "khaothi@kt.neu.edu.vn"),
        (Role.KHOA, "khoa@khoa.neu.edu.vn"),
        (Role.GIANG_VIEN, "gv@lt.neu.edu.vn"),
        (Role.SINH_VIEN, "sv@st.neu.edu.vn"),
        (Role.PARTNER, "partner@tp.neu.edu.vn")
    ]
    
    pw = "Test@123456"
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    
    account_map = {}
    
    for role, email in roles:
        username = email.split('@')[0]
        acc = Account.query.filter((Account.email == email) | (Account.username == username)).first()
        
        if not acc:
            acc = Account(
                id=uuid.uuid4(),
                username=username,
                email=email,
                password_hash=hashed,
                role=role,
                is_active=True
            )
            db.session.add(acc)
            print(f"Added Account {role}: {email}")
        else:
            acc.password_hash = hashed
            acc.role = role # Ensure role is correct
            print(f"Updated Account {role}: {email}")
        
        db.session.flush() # Get ID if just added
        account_map[role] = acc

    # 2. Profiles setup
    # Lecturer Profile
    gv_acc = account_map[Role.GIANG_VIEN]
    lec = db.session.get(Lecturer, gv_acc.id)
    if not lec:
        lec = Lecturer(
            id=gv_acc.id,
            lecturer_code="GV001",
            full_name="Nguyễn Văn Giảng Viên"
        )
        db.session.add(lec)
        print("Created Lecturer Profile for gv@lt.neu.edu.vn")
    else:
        lec.full_name = "Nguyễn Văn Giảng Viên"
        print("Updated Lecturer Profile for gv@lt.neu.edu.vn")

    # Student Profile
    sv_acc = account_map[Role.SINH_VIEN]
    stu = db.session.get(Student, sv_acc.id)
    if not stu:
        stu = Student(
            id=sv_acc.id,
            student_id="SV2024001"
        )
        db.session.add(stu)
        print("Created Student Profile for sv@st.neu.edu.vn")
    
    from app.models.student_personal_info_model import StudentPersonalInfo
    from app.models.student_contact_model import StudentContact
    
    p_info = db.session.get(StudentPersonalInfo, sv_acc.id)
    if not p_info:
        p_info = StudentPersonalInfo(
            id=sv_acc.id,
            first_name="Sinh Viên",
            last_name="Nguyễn",
            gender="Nam",
            date_of_birth=date(2002, 1, 1),
            academic_status=AcademicStatus.STUDYING
        )
        db.session.add(p_info)
    
    contact = db.session.get(StudentContact, sv_acc.id)
    if not contact:
        contact = StudentContact(
            id=sv_acc.id,
            phone="0987654321",
            personal_email="sv_personal@gmail.com",
            edu_email=sv_acc.email,
            contact_address="Hà Nội, Việt Nam"
        )
        db.session.add(contact)

    # 3. Academic Data (Scaffolding for Grade Entry)
    sem = Semester.query.filter_by(code="2023.2").first()
    if not sem:
        sem = Semester(
            id=uuid.uuid4(),
            code="2023.2",
            name="Học kỳ 2 năm học 2023-2024",
            is_active=True
        )
        db.session.add(sem)
        print("Created Semester 2023.2")
    
    sub = Subject.query.filter_by(subject_code="IT101").first()
    if not sub:
        sub = Subject(
            id=uuid.uuid4(),
            subject_code="IT101",
            name="Lập trình Blockchain căn bản",
            credits=3
        )
        db.session.add(sub)
        print("Created Subject IT101")
    
    db.session.flush()

    cls = CourseClass.query.filter_by(class_code="CLASS001").first()
    if not cls:
        cls = CourseClass(
            id=uuid.uuid4(),
            class_code="CLASS001",
            name="Lớp Blockchain Sáng Thứ 2",
            subject_id=sub.id,
            lecturer_id=lec.id,
            semester_id=sem.id
        )
        db.session.add(cls)
        print("Created CourseClass CLASS001 and assigned to Lecturer")
    else:
        cls.lecturer_id = lec.id
        print("Assigned existing Class CLASS001 to Lecturer")

    db.session.flush()

    # 4. Enroll Student in Class
    grd = Grade.query.filter_by(student_id=stu.id, course_class_id=cls.id).first()
    if not grd:
        grd = Grade(
            id=uuid.uuid4(),
            student_id=stu.id,
            course_class_id=cls.id,
            status="ENROLLED",
            regular_score=None,
            midterm_score=None,
            final_score=None
        )
        db.session.add(grd)
        print("Enrolled Student in CLASS001")

    db.session.commit()
    print("DEMO DATA SEEDING COMPLETE!")
