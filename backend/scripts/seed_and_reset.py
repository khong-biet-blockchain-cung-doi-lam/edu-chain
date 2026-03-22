"""
Script tổng hợp: Tạo bảng DB + Seed data + Reset password cho các tài khoản test
"""
import os, sys, uuid, random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from datetime import date
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print("Step 1: Tạo tất cả bảng DB nếu chưa có...")
    db.create_all()
    print("OK")

    print("\nStep 2: Xóa dữ liệu cũ...")
    tables = [t.name for t in db.metadata.sorted_tables]
    for t in reversed(tables):
        if t != "alembic_version":
            try:
                db.session.execute(text(f'TRUNCATE TABLE "{t}" CASCADE'))
            except Exception as ex:
                db.session.rollback()
                print(f"  Skip {t}: {ex}")
    db.session.commit()
    print("OK")

    print("\nStep 3: Seed dữ liệu...")

    import bcrypt
    from app.models.account_model import Account
    from app.models.organization_model import Organization
    from app.models.academic_models import Major, Cohort, Curriculum
    from app.models.course_models import Semester, Subject, CourseClass, Grade
    from app.models.staff_models import Lecturer
    from app.models.student_model import Student
    from app.models.student_personal_info_model import StudentPersonalInfo
    from app.models.student_contact_model import StudentContact
    from app.models.student_enrollment_model import StudentEnrollment
    from app.models.enums import Role, AcademicStatus

    def h(pwd): return bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()

    # === Nhân viên ===
    staff_data = [
        ("sysadmin", "SysAdmin@123", Role.ADMIN, "sysadmin@admin.neu.edu.vn"),
        ("admin01", "Admin@123", Role.ADMIN, "admin01@admin.neu.edu.vn"),
        ("khaothi01", "Khaothi@123", Role.KHAO_THI, "khaothi01@kt.neu.edu.vn"),
        ("khoa01", "Khoa@123", Role.KHOA, "khoacntt@khoa.neu.edu.vn"),
        ("qldt01", "Qldt@123", Role.QL_DAO_TAO, "qldt01@qldt.neu.edu.vn"),
    ]
    for uname, pwd, role, email in staff_data:
        db.session.add(Account(username=uname, email=email, password_hash=h(pwd), role=role))
    db.session.commit()
    print(f"  Đã tạo {len(staff_data)} tài khoản nhân viên")

    # === Cấu trúc học thuật ===
    khoa = Organization(name="Khoa Công nghệ Thông tin", type="KHOA")
    db.session.add(khoa); db.session.flush()

    major_se = Major(code="SE", name="Kỹ thuật phần mềm", organization_id=khoa.id)
    db.session.add(major_se); db.session.flush()

    cohort_64 = Cohort(name="Khóa 64 (2022-2026)", start_year=2022, end_year=2026)
    db.session.add(cohort_64); db.session.flush()

    curr_se = Curriculum(code="CT_SE_2022", name="CTĐT KTPM 2022", major_id=major_se.id,
                         academic_year="2022-2026", total_credits=130, is_active=True)
    db.session.add(curr_se); db.session.flush()

    hk1 = Semester(code="HK1_2025", name="Học kỳ 1 (2025-2026)",
                   start_date=date(2025, 9, 1), end_date=date(2026, 1, 15), is_active=True)
    db.session.add(hk1); db.session.flush()

    subjects = [
        Subject(subject_code="IT1110", name="Tin học đại cương", credits=3),
        Subject(subject_code="IT2120", name="Kiến trúc máy tính", credits=3),
        Subject(subject_code="IT3040", name="Kỹ thuật Lập trình", credits=3),
        Subject(subject_code="IT3100", name="Cơ sở dữ liệu", credits=3),
        Subject(subject_code="IT4010", name="An toàn thông tin", credits=4),
    ]
    db.session.add_all(subjects); db.session.commit()
    print("  Đã tạo học thuật cơ bản")

    # === Giảng viên ===
    lecturers_raw = [
        ("gv_an", "GV001", "Nguyễn Văn An"),
        ("gv_binh", "GV002", "Trần Thị Bình"),
        ("gv_cuong", "GV003", "Lê Hùng Cường"),
        ("gv_dung", "GV004", "Phạm Văn Dũng"),
        ("gv_en", "GV005", "Vũ Hải Én"),
    ]
    lecturers = []
    gv_hash = h("Gv@123")
    for un, code, name in lecturers_raw:
        acc = Account(username=un, email=f"{un}@lt.neu.edu.vn", password_hash=gv_hash, role=Role.GIANG_VIEN)
        db.session.add(acc); db.session.flush()
        lec = Lecturer(id=acc.id, lecturer_code=code, full_name=name)
        db.session.add(lec); lecturers.append(lec)
    db.session.commit()
    print(f"  Đã tạo {len(lecturers)} giảng viên")

    # === Lớp học phần ===
    classes_raw = [
        (subjects[0], lecturers[0], "IT1110-145", "Tin học đại cương - Lớp 145"),
        (subjects[0], lecturers[1], "IT1110-146", "Tin học đại cương - Lớp 146"),
        (subjects[1], lecturers[0], "IT2120-101", "Kiến trúc máy tính 101"),
        (subjects[2], lecturers[2], "IT3040-102", "Kỹ thuật Lập trình 102"),
        (subjects[3], lecturers[3], "IT3100-201", "Cơ sở dữ liệu 201"),
        (subjects[4], lecturers[4], "IT4010-301", "ATTT 301"),
    ]
    course_classes = []
    for sub, lec, code, name in classes_raw:
        c = CourseClass(class_code=code, name=name, subject_id=sub.id,
                        semester_id=hk1.id, lecturer_id=lec.id)
        db.session.add(c); course_classes.append(c)
    db.session.commit()
    print(f"  Đã tạo {len(course_classes)} lớp học phần")

    # === Sinh viên ===
    sv_hash = h("Sv@123")
    ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"]
    ten_list = ["Hùng", "Nhi", "Anh", "Minh", "Trang", "Linh", "Quân", "Đạt", "Phúc", "Thảo"]
    dem_list = ["Văn", "Thị", "Hoàng", "Đức", "Gia"]

    for i in range(1, 31):
        sv_code = f"SV210{i:03d}"
        ho = random.choice(ho_list)
        dem = random.choice(dem_list)
        ten = random.choice(ten_list)
        fullname = f"{ho} {dem} {ten}"
        dob = date(2003, random.randint(1,12), random.randint(1,28))

        acc = Account(username=sv_code, email=f"{sv_code}@st.neu.edu.vn",
                      password_hash=sv_hash, role=Role.SINH_VIEN)
        db.session.add(acc); db.session.flush()

        stu = Student(id=acc.id, student_id=sv_code, gpa=round(random.uniform(2.5, 4.0), 2))
        db.session.add(stu); db.session.flush()

        db.session.add(StudentPersonalInfo(
            id=acc.id, first_name=f"{ho} {dem}", last_name=ten,
            date_of_birth=dob, gender=random.choice(["Nam", "Nữ"]),
            national_id_number=f"0010{200300+i}",
            academic_status=AcademicStatus.STUDYING, class_name="KTPM K64"
        ))
        db.session.add(StudentContact(
            id=acc.id, edu_email=f"{sv_code}@st.neu.edu.vn",
            personal_email=f"sv{i}@gmail.com", phone=f"0987654{i:03d}"
        ))
        db.session.add(StudentEnrollment(
            student_id=acc.id, major_id=major_se.id,
            cohort_id=cohort_64.id, curriculum_id=curr_se.id
        ))

        # Ghi điểm
        my_cls = random.sample(course_classes, random.randint(3, 5))
        for cls in my_cls:
            reg = round(random.uniform(5, 10), 1)
            mid = round(random.uniform(4, 10), 1)
            fin = round(random.uniform(4, 10), 1)
            total = round(reg*0.1 + mid*0.4 + fin*0.5, 1)
            db.session.add(Grade(
                student_id=acc.id, course_class_id=cls.id,
                regular_score=reg, midterm_score=mid, final_score=fin,
                total_score=total, status="Đạt" if total >= 4.0 else "Không đạt",
                is_finalized=False, is_pending_review=False
            ))

    db.session.commit()
    print("  Đã tạo 30 sinh viên và điểm số")
    print("\n✅ Seed hoàn tất!")
    print("\nTài khoản test:")
    print("  admin01 / Admin@123")
    print("  khaothi01 / Khaothi@123")
    print("  qldt01 / Qldt@123")
    print("  khoa01 / Khoa@123")
    print("  gv_an / Gv@123  (đến gv_en)")
    print("  SV210001 / Sv@123  (đến SV210030)")
