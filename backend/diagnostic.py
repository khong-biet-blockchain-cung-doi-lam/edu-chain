import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.course_models import CourseClass, Grade

app = create_app()

with app.app_context():
    print("--- DB DIAGNOSTIC ---")
    accounts = Account.query.all()
    print(f"Total Accounts: {len(accounts)}")
    for acc in accounts:
        print(f"Account: {acc.username}, Email: {acc.email}, Role: {acc.role}, ID: {acc.id}")
        if acc.role == 'SINH_VIEN':
            print(f"  - Student Linked: {acc.student is not None}")
            if acc.student:
                print(f"    - Student Code: {acc.student.student_id}")
                print(f"    - Personal Info: {acc.student.personal_info is not None}")
        if acc.role == 'GIANG_VIEN':
            print(f"  - Lecturer Linked: {acc.lecturer_profile is not None}")
            if acc.lecturer_profile:
                print(f"    - Lecturer Code: {acc.lecturer_profile.lecturer_code}")

    print("\n--- ACADEMIC DATA ---")
    classes = CourseClass.query.all()
    print(f"Total Classes: {len(classes)}")
    for c in classes:
        print(f"Class: {c.name}, Code: {c.class_code}, Lecturer ID: {c.lecturer_id}")
        
    grades = Grade.query.all()
    print(f"Total Grades (Enrollments): {len(grades)}")
    for g in grades:
        print(f"Grade ID: {g.id}, Student ID: {g.student_id}, Class ID: {g.course_class_id}")
