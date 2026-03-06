import os
import sys
import uuid
import bcrypt
import random
from datetime import date, datetime, timedelta

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app import create_app
from app.extensions import db

# Import all models to ensure they are available
from app.models.account_model import Account
from app.models.organization_model import Organization
from app.models.academic_models import Major, Cohort, Curriculum
from app.models.course_models import Semester, Subject, CourseClass, Grade
from app.models.staff_models import Lecturer
from app.models.student_model import Student
from app.models.student_personal_info_model import StudentPersonalInfo
from app.models.student_contact_model import StudentContact
from app.models.student_enrollment_model import StudentEnrollment
from app.models.encrypted_cluster_model import EncryptedCluster
from app.models.enums import Role, AcademicStatus

app = create_app()

def clear_db():
    print("Clearing database...")
    # Truncate all tables defined in models except alembic_version
    tables = [table.name for table in db.metadata.sorted_tables]
    for table_name in reversed(tables):
        if table_name != "alembic_version":
            db.session.execute(text(f'TRUNCATE TABLE "{table_name}" CASCADE'))
    db.session.commit()
    print("Database cleared.")

def get_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_db():
    print("Seeding database...")
    
    # 1. Accounts: Staff
    staff_accounts = [
        {"username": "sysadmin", "password": "SysAdmin@123", "role": Role.ADMIN, "email": "sysadmin@admin.neu.edu.vn", "full_name": "Quản trị Hệ thống"},
        {"username": "admin01", "password": "Admin@123", "role": Role.ADMIN, "email": "admin01@admin.neu.edu.vn", "full_name": "Admin Test"},
        {"username": "khaothi01", "password": "Khaothi@123", "role": Role.KHAO_THI, "email": "khaothi01@kt.neu.edu.vn", "full_name": "Phòng Khảo Thí"},
        {"username": "khoa01", "password": "Khoa@123", "role": Role.KHOA, "email": "khoacntt@khoa.neu.edu.vn", "full_name": "VP Khoa CNTT"},
        {"username": "qldt01", "password": "Qldt@123", "role": Role.QL_DAO_TAO, "email": "qldt01@qldt.neu.edu.vn", "full_name": "Phòng QL Đào Tạo"},
    ]
    
    for u in staff_accounts:
        acc = Account(username=u["username"], email=u["email"], password_hash=get_hash(u["password"]), role=u["role"])
        db.session.add(acc)
    db.session.commit()
    
    # 2. Academic Definitions
    khoa_cntt = Organization(name="Khoa Công nghệ Thông tin", type="KHOA")
    db.session.add(khoa_cntt)
    db.session.flush()
    
    major_se = Major(code="SE", name="Kỹ thuật phần mềm", organization_id=khoa_cntt.id)
    major_cs = Major(code="CS", name="Khoa học máy tính", organization_id=khoa_cntt.id)
    major_is = Major(code="IS", name="Hệ thống thông tin", organization_id=khoa_cntt.id)
    db.session.add_all([major_se, major_cs, major_is])
    db.session.flush()
    
    cohort_64 = Cohort(name="Khóa 64 (2022-2026)", start_year=2022, end_year=2026)
    cohort_65 = Cohort(name="Khóa 65 (2023-2027)", start_year=2023, end_year=2027)
    db.session.add_all([cohort_64, cohort_65])
    db.session.flush()
    
    curr_se = Curriculum(code="CT_SE_2022", name="Chương trình đào tạo KTPM 2022", major_id=major_se.id, academic_year="2022-2026", total_credits=130, is_active=True)
    db.session.add(curr_se)
    db.session.flush()
    
    hk1_2025 = Semester(code="HK1_2025", name="Học kỳ 1 Năm học 2025-2026", start_date=date(2025, 9, 1), end_date=date(2026, 1, 15), is_active=True)
    db.session.add(hk1_2025)
    db.session.flush()
    
    subjects = [
        Subject(subject_code="IT1110", name="Tin học đại cương", credits=3),
        Subject(subject_code="IT2120", name="Kiến trúc máy tính", credits=3),
        Subject(subject_code="IT3040", name="Kỹ thuật Lập trình", credits=3),
        Subject(subject_code="IT3100", name="Cơ sở dữ liệu", credits=3),
        Subject(subject_code="IT4010", name="An toàn thông tin", credits=4),
        Subject(subject_code="MA1001", name="Toán cao cấp 1", credits=3),
        Subject(subject_code="PH1001", name="Vật lý 1", credits=3),
    ]
    db.session.add_all(subjects)
    db.session.commit()
    
    # 3. Lecturers
    lecturers_data = [
        ("gv_an", "GV001", "Nguyễn Văn An"),
        ("gv_binh", "GV002", "Trần Thị Bình"),
        ("gv_cuong", "GV003", "Lê Hùng Cường"),
        ("gv_dung", "GV004", "Phạm Văn Dũng"),
        ("gv_en", "GV005", "Vũ Hải Én"),
    ]
    lecturers = []
    default_pw = get_hash("Gv@123")
    for un, code, name in lecturers_data:
        acc = Account(username=un, email=f"{un}@lt.neu.edu.vn", password_hash=default_pw, role=Role.GIANG_VIEN)
        db.session.add(acc)
        db.session.flush()
        lec = Lecturer(id=acc.id, lecturer_code=code, full_name=name)
        db.session.add(lec)
        lecturers.append(lec)
    db.session.commit()
    
    # 4. Classes
    classes_data = [
        (subjects[0], lecturers[0], "IT1110-145", "Tin học đại cương Lớp 145"),
        (subjects[0], lecturers[1], "IT1110-146", "Tin học đại cương Lớp 146"),
        (subjects[1], lecturers[0], "IT2120-101", "Kiến trúc máy tính 101"),
        (subjects[2], lecturers[2], "IT3040-102", "Kỹ thuật Lập trình 102"),
        (subjects[3], lecturers[3], "IT3100-201", "Cơ sở dữ liệu 201"),
        (subjects[4], lecturers[4], "IT4010-301", "ATTT 301"),
        (subjects[5], None, "MA1001-01", "Toán cao cấp 1 (Chưa phân công)"),
    ]
    course_classes = []
    for sub, lec, code, name in classes_data:
        c = CourseClass(class_code=code, name=name, subject_id=sub.id, semester_id=hk1_2025.id, lecturer_id=lec.id if lec else None)
        db.session.add(c)
        course_classes.append(c)
    db.session.commit()
    
    # 5. Students
    print("Seeding students...")
    student_pw = get_hash("Sv@123")
    ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"]
    ten_list = ["Hùng", "Nhi", "Anh", "Minh", "Trang", "Linh", "Quân", "Đạt", "Phúc", "Thảo"]
    
    for i in range(1, 31):
        sv_code = f"SV210{i:03d}"
        ho = random.choice(ho_list)
        ten = random.choice(ten_list)
        fullname = f"{ho} {random.choice(['Văn', 'Thị', 'Hoàng', 'Đức', 'Gia'])} {ten}"
        dob = date(2003, random.randint(1, 12), random.randint(1, 28))
        
        acc = Account(username=sv_code, email=f"{sv_code}@st.neu.edu.vn", password_hash=student_pw, role=Role.SINH_VIEN)
        db.session.add(acc)
        db.session.flush()
        
        # Student Model
        stu = Student(id=acc.id, student_id=sv_code, gpa=random.uniform(2.5, 4.0))
        db.session.add(stu)
        db.session.flush()  # Must flush Student before inserting FK-dependent records
        
        # Personal Info
        p_info = StudentPersonalInfo(
            id=acc.id, 
            first_name=f"{ho} {fullname.split(' ')[1]}",
            last_name=ten,
            date_of_birth=dob,
            gender=random.choice(["Nam", "Nữ"]),
            national_id_number=f"0010{200300 + i}",
            academic_status=AcademicStatus.STUDYING,
            class_name="KTPM K64"
        )
        db.session.add(p_info)
        
        # Contact
        c_info = StudentContact(
            id=acc.id,
            edu_email=f"{sv_code}@st.neu.edu.vn",
            personal_email=f"sinhvien_{i}@gmail.com",
            phone=f"0987654{i:03d}"
        )
        db.session.add(c_info)
        
        # Enrollment
        e_info = StudentEnrollment(
            student_id=acc.id,
            major_id=major_se.id,
            cohort_id=cohort_64.id,
            curriculum_id=curr_se.id
        )
        db.session.add(e_info)
        
        # 6. Enroll and Grade
        # Every student takes 3-4 random classes
        num_classes = random.randint(3, 5)
        my_classes = random.sample(course_classes, min(num_classes, len(course_classes)))
        
        for cls in my_classes:
            regular = round(random.uniform(5, 10), 1)
            midterm = round(random.uniform(4, 10), 1)
            final = round(random.uniform(4, 10), 1)
            total = round(regular * 0.1 + midterm * 0.4 + final * 0.5, 1)
            
            # Mix statuses
            rand = random.random()
            status = "Đạt" if total >= 4.0 else "Không đạt"
            if rand < 0.2:
                status = "Chưa chốt"
            if rand > 0.8:
                status = "Đã chốt"
                
            grade = Grade(
                student_id=acc.id,
                course_class_id=cls.id,
                status=status,
                regular_score=regular,
                midterm_score=midterm,
                final_score=final,
                total_score=total,
                is_finalized=(status == "Đã chốt")
            )
            db.session.add(grade)
            
    db.session.commit()
    print("Database seeded completely!")

if __name__ == "__main__":
    with app.app_context():
        clear_db()
        seed_db()
