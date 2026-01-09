import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
import json
from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Lecturer, Staff
from app.models.course_models import Subject, Semester, CourseClass, Grade
from sqlalchemy import text
import bcrypt
import uuid

class TestEduChainFlow(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.cleanup_test_data() # Clean first
        self.setup_data() # Then create fresh

    def tearDown(self):
        db.session.remove()
        self.app_context.pop()

    def cleanup_test_data(self):
        print("\n[0] PHASE 0: CLEANUP - Removing old test data (Raw SQL)...")
        try:
            usernames = ["student_test", "lecturer_test", "staff_test"]
            
            # Get Account IDs first
            for u in usernames:
                # We need to find the ID. 
                # Since we want to be sure, we can do subqueries or fetch first.
                # Let's use SQL for safety.
                
                # 1. Get ID
                res = db.session.execute(text("SELECT id FROM account WHERE username = :u"), {"u": u}).fetchone()
                if res:
                    acc_id = res[0]
                    print(f"    - Cleaning up user: {u} (ID: {acc_id})")
                    
                    # 2. Delete dependents based on role assumption or just try deleting from all profile tables
                    # Student dependents
                    # Need student_id from student table to delete enrollment/grades?
                    stu_res = db.session.execute(text("SELECT id FROM student WHERE account_id = :aid"), {"aid": acc_id}).fetchone()
                    if stu_res:
                        stu_id = stu_res[0]
                        db.session.execute(text("DELETE FROM grades WHERE student_id = :sid"), {"sid": stu_id})
                        db.session.execute(text("DELETE FROM student_enrollment WHERE student_id = :sid"), {"sid": stu_id})
                        db.session.execute(text("DELETE FROM student_contact WHERE id = :sid"), {"sid": stu_id})
                        db.session.execute(text("DELETE FROM student_personal_info WHERE id = :sid"), {"sid": stu_id})
                        db.session.execute(text("DELETE FROM student WHERE id = :sid"), {"sid": stu_id})

                    # Lecturer/Staff dependents
                    # Need to clear course classes first
                    lect_res = db.session.execute(text("SELECT id FROM lecturer WHERE account_id = :aid"), {"aid": acc_id}).fetchone()
                    if lect_res:
                         lect_id = lect_res[0]
                         db.session.execute(text("DELETE FROM grades WHERE course_class_id IN (SELECT id FROM course_classes WHERE lecturer_id = :lid)"), {"lid": lect_id})
                         db.session.execute(text("DELETE FROM course_classes WHERE lecturer_id = :lid"), {"lid": lect_id})
                         db.session.execute(text("DELETE FROM lecturer WHERE id = :lid"), {"lid": lect_id})

                    db.session.execute(text("DELETE FROM staffs WHERE account_id = :aid"), {"aid": acc_id})
                    
                    # 3. Delete Account
                    db.session.execute(text("DELETE FROM account WHERE id = :aid"), {"aid": acc_id})
            
            db.session.commit()
            print("    - Cleaned up old accounts/profiles.")
            
        except Exception as e:
            db.session.rollback()
            print(f"    - Cleanup Warning: {e}")

    def setup_data(self):
        print("\n[0.5] PHASE 0.5: ADMIN PROVISIONING - Creating fresh accounts...")
        # 1. Create Accounts
        password = "password123"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Staff Account
        self.staff_user = "staff_test"
        staff = Account(username=self.staff_user, password_hash=hashed, role="staff")
        db.session.add(staff)
        db.session.commit()
            
        staff_profile = Staff(account_id=staff.id, full_name="Test Staff")
        db.session.add(staff_profile)
        db.session.commit()
        self.staff_id = staff.id
        print(f"    - Created Staff Account: {self.staff_user}")

        # Lecturer Account
        self.lecturer_user = "lecturer_test"
        lect = Account(username=self.lecturer_user, password_hash=hashed, role="lecturer")
        db.session.add(lect)
        db.session.commit()
                 
        lect_profile = Lecturer(account_id=lect.id, lecturer_code="GV001")
        db.session.add(lect_profile)
        db.session.commit()
        self.lecturer_id = lect.id
        self.lecturer_profile_id = lect_profile.id
        print(f"    - Created Lecturer Account: {self.lecturer_user}")

        # Student Account
        self.student_user = "student_test"
        stu = Account(username=self.student_user, password_hash=hashed, role="student")
        db.session.add(stu)
        db.session.commit()
            
        stu_profile = Student(account_id=stu.id, student_id="SV001")
        db.session.add(stu_profile)
        db.session.commit()
        self.student_id = stu.id
        self.student_profile_id = stu_profile.id
        print(f"    - Created Student Account: {self.student_user}")

    def get_token(self, username, password="password123"):
        res = self.client.post("/api/auth/login", json={"username": username, "password": password})
        return res.json.get("access_token")

    def test_full_flow(self):
        print("\n>>> STARTING FULL FLOW TEST (Verification) <<<")
        
        # --- PHASE 1: ACADEMIC (Staff) ---
        print("\n[1] PHASE 1: ACADEMIC (Staff Role) - Setting up Academic Data")
        staff_token = self.get_token(self.staff_user)
        headers = {"Authorization": f"Bearer {staff_token}"}

        # 1. Add Subject
        code_sub = f"SUB_{uuid.uuid4().hex[:6]}"
        res = self.client.post("/api/academic/subjects", json={
            "subject_code": code_sub, "name": "Blockchains 101", "credits": 3
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        subject_id = res.json['id']
        print(f"    - [API] Subject created: {code_sub}")

        # 2. Add Semester
        code_sem = f"SEM_{uuid.uuid4().hex[:6]}"
        res = self.client.post("/api/academic/semesters", json={
            "code": code_sem, "name": "Spring 2026"
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        semester_id = res.json['id']
        print(f"    - [API] Semester created: {code_sem}")

        # 3. Add Class
        class_code = f"CLS_{uuid.uuid4().hex[:6]}"
        res = self.client.post("/api/academic/classes", json={
            "class_code": class_code, "name": "Blockchain Class 01",
            "subject_id": subject_id, "semester_id": semester_id
        }, headers=headers)
        self.assertEqual(res.status_code, 201)
        class_id = res.json['id']
        print(f"    - [API] Class created: {class_code}")

        # 4. Assign Lecturer
        res = self.client.post(f"/api/academic/classes/{class_id}/assign", json={
            "lecturer_id": str(self.lecturer_profile_id)
        }, headers=headers)
        self.assertEqual(res.status_code, 200)
        print(f"    - [API] Lecturer assigned to class {class_code}")

        # --- INTERMEDIATE: ENROLL STUDENT (Manually) ---
        print("\n[1.5] PHASE 1.5: SYSTEM - Enrolling Student to Class") 
        # Since we don't have an enroll API yet, we manually add a Grade record
        grade_entry = Grade(student_id=self.student_profile_id, course_class_id=uuid.UUID(class_id))
        db.session.add(grade_entry)
        db.session.commit()
        grade_id = grade_entry.id
        print(f"    - [DB] Student {self.student_user} enrolled manually (Grade record created)")

        # --- PHASE 2: LECTURER ---
        print("\n[2] PHASE 2: LECTURER - Grading Students")
        lect_token = self.get_token(self.lecturer_user)
        headers_lect = {"Authorization": f"Bearer {lect_token}"}

        # 1. View Classes
        res = self.client.get("/api/lecturer/classes", headers=headers_lect)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(any(c['id'] == class_id for c in res.json))
        print("    - [API] Lecturer views assigned class list")

        # 2. View Class Details & Students
        res = self.client.get(f"/api/lecturer/classes/{class_id}", headers=headers_lect)
        self.assertEqual(res.status_code, 200)
        students = res.json['students']
        self.assertTrue(len(students) > 0)
        target_grade_id = students[0]['grade_id']
        print(f"    - [API] Lecturer views students in class (Found {len(students)} students)")

        # 3. Update Grades
        # Formula: 10% - 40% - 50%
        scores = {"regular": 9.0, "midterm": 8.0, "final": 7.0}
        # Expected Total: 0.9 + 3.2 + 3.5 = 7.6
        res = self.client.post("/api/lecturer/grades", json={
            "grade_id": target_grade_id,
            "scores": scores
        }, headers=headers_lect)
        self.assertEqual(res.status_code, 200)
        self.assertAlmostEqual(res.json['total'], 7.6)
        print(f"    - [API] Lecturer inputs grades: {scores} -> Total: {res.json['total']}")

        # --- PHASE 3: STUDENT ---
        print("\n[3] PHASE 3: STUDENT - Viewing Grades & Requesting Review")
        stu_token = self.get_token(self.student_user)
        headers_stu = {"Authorization": f"Bearer {stu_token}"}

        # 1. View Grades
        res = self.client.get("/api/student/grades", headers=headers_stu)
        self.assertEqual(res.status_code, 200)
        my_grade = next((g for g in res.json if g['class_id'] == class_id), None)
        self.assertIsNotNone(my_grade)
        self.assertEqual(my_grade['status'], 'PASSED')
        # Fix: total_score is inside 'scores' dict under key 'total'
        print(f"    - [API] Student views grade: Total {my_grade['scores']['total']} - Status: {my_grade['status']}")

        # 2. Request Review
        res = self.client.post(f"/api/student/grades/{target_grade_id}/review", json={
            "reason": "Em tinh thu thay sai a"
        }, headers=headers_stu)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['status'], 'REVIEW_REQUESTED')
        print("    - [API] Student requests review: 'Em tinh thu thay sai a'")

        # --- PHASE 4: LECTURER RE-CHECK ---
        print("\n[4] PHASE 4: LECTURER - Handling Review")
        res = self.client.get(f"/api/lecturer/classes/{class_id}", headers=headers_lect)
        stu_record = next(s for s in res.json['students'] if s['grade_id'] == target_grade_id)
        self.assertEqual(stu_record['status'], 'REVIEW_REQUESTED')
        print(f"    - [API] Lecturer sees student status update: {stu_record['status']}")

        print("\n>>> FULL FLOW TEST COMPLETED SUCCESSFULLY <<<")

if __name__ == "__main__":
    unittest.main()
