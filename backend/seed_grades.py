import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.course_models import Semester, Subject, CourseClass, Grade
from app.models.enums import Role
import uuid
import random

app = create_app()

def create_grade(student_id, class_id, r, m, f, is_final=True):
    total = round(r * 0.1 + m * 0.4 + f * 0.5, 1)
    status = "Đã chốt" if is_final else "Chờ xét duyệt"
    g = Grade(
        id=uuid.uuid4(),
        student_id=student_id,
        course_class_id=class_id,
        regular_score=r,
        midterm_score=m,
        final_score=f,
        total_score=total,
        status=status,
        is_finalized=is_final,
        onchain_hash=str(uuid.uuid4().hex) if is_final else None
    )
    db.session.add(g)
    return g

with app.app_context():
    sv_acc = Account.query.filter_by(username="sv").first()
    if not sv_acc:
        print("Student 'sv' not found. Run setup_demo_data.py first.")
        sys.exit(1)
    
    student = sv_acc.student
    lec = Lecturer.query.first() # Use any lecturer

    semesters_data = [
        ("2023.1", "Học kỳ 1 năm học 2023-2024"),
        ("2023.2", "Học kỳ 2 năm học 2023-2024"),
        ("2024.1", "Học kỳ 1 năm học 2024-2025")
    ]

    subjects_data = [
        ("CS101", "Cấu trúc dữ liệu và Giải thuật", 4),
        ("CS102", "Cơ sở dữ liệu", 3),
        ("CS201", "Mạng máy tính", 3),
        ("MATH1", "Giải tích 1", 3),
        ("MATH2", "Đại số tuyến tính", 3),
        ("ENG1", "Tiếng Anh chuyên ngành", 2),
        ("ECO101", "Kinh tế học đại cương", 3),
        ("BLOCK1", "Blockchain và Hợp đồng thông minh", 3),
        ("SE101", "Công nghệ phần mềm", 4)
    ]

    # Clear existing grades for this student to have a clean test
    Grade.query.filter_by(student_id=student.id).delete()
    
    sem_objs = {}
    for code, name in semesters_data:
        s = Semester.query.filter_by(code=code).first()
        if not s:
            s = Semester(id=uuid.uuid4(), code=code, name=name, is_active=True)
            db.session.add(s)
        sem_objs[code] = s

    sub_objs = {}
    for code, name, creds in subjects_data:
        sb = Subject.query.filter_by(subject_code=code).first()
        if not sb:
            sb = Subject(id=uuid.uuid4(), subject_code=code, name=name, credits=creds)
            db.session.add(sb)
        sub_objs[code] = sb

    db.session.flush()

    # Seed Semester 2023.1 (all passed)
    s1 = sem_objs["2023.1"]
    for code in ["CS101", "MATH1", "ENG1"]:
        sb = sub_objs[code]
        cls = CourseClass(id=uuid.uuid4(), class_code=f"CL-{code}-S1", name=f"Lớp {sb.name}", subject_id=sb.id, lecturer_id=lec.id, semester_id=s1.id)
        db.session.add(cls)
        db.session.flush()
        create_grade(student.id, cls.id, random.randint(8, 10), random.randint(7, 9), random.randint(7, 10))

    # Seed Semester 2023.2 (mix)
    s2 = sem_objs["2023.2"]
    for code in ["CS102", "CS201", "MATH2", "ECO101"]:
        sb = sub_objs[code]
        cls = CourseClass(id=uuid.uuid4(), class_code=f"CL-{code}-S2", name=f"Lớp {sb.name}", subject_id=sb.id, lecturer_id=lec.id, semester_id=s2.id)
        db.session.add(cls)
        db.session.flush()
        if code == "MATH2":
            create_grade(student.id, cls.id, 5, 4, 3) # Fail
        else:
            create_grade(student.id, cls.id, random.randint(6, 9), random.randint(6, 8), random.randint(5, 9))

    # Seed Semester 2024.1 (pending)
    s3 = sem_objs["2024.1"]
    for code in ["BLOCK1", "SE101"]:
        sb = sub_objs[code]
        cls = CourseClass(id=uuid.uuid4(), class_code=f"CL-{code}-S3", name=f"Lớp {sb.name}", subject_id=sb.id, lecturer_id=lec.id, semester_id=s3.id)
        db.session.add(cls)
        db.session.flush()
        if code == "SE101":
            # Pending
            g = Grade(id=uuid.uuid4(), student_id=student.id, course_class_id=cls.id, regular_score=8, midterm_score=7, final_score=None, total_score=None, status="Chờ xét duyệt", is_finalized=False)
            db.session.add(g)
        else:
            create_grade(student.id, cls.id, 9, 9, 8)

    db.session.commit()
    print("RICH TEST DATA SEEDED SUCCESSFULLY for 'sv' student.")
