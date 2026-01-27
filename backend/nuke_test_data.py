from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    print(">>> NUKING TEST DATA <<<")
    usernames = ["student_test", "lecturer_test", "staff_test"]
    
    for u in usernames:
        try:
            print(f"Processing user: {u}")
            # 1. Get ID
            res = db.session.execute(text("SELECT id FROM account WHERE username = :u"), {"u": u}).fetchone()
            if not res:
                print(f"  - User {u} not found.")
                continue
            
            acc_id = res[0]
            print(f"  - Found ID: {acc_id}")
            
            # 2. Delete Student dependents
            stu_res = db.session.execute(text("SELECT id FROM student WHERE id = :aid"), {"aid": acc_id}).fetchone()
            if stu_res:
                stu_id = stu_res[0]
                print(f"  - Found Linked Student ID: {stu_id}")
                
                print("    - Deleting Grades...")
                db.session.execute(text("DELETE FROM grades WHERE student_id = :sid"), {"sid": stu_id})
                
                print("    - Deleting Enrollment...")
                db.session.execute(text("DELETE FROM student_enrollment WHERE student_id = :sid"), {"sid": stu_id})
                
                print("    - Deleting Emergency Contact...")
                db.session.execute(text("DELETE FROM student_emergency_contact WHERE id = :sid"), {"sid": stu_id})
                
                print("    - Deleting Contact...")
                db.session.execute(text("DELETE FROM student_contact WHERE id = :sid"), {"sid": stu_id})
                
                print("    - Deleting Personal Info...")
                db.session.execute(text("DELETE FROM student_personal_info WHERE id = :sid"), {"sid": stu_id})
                
                print("    - Deleting Student...")
                db.session.execute(text("DELETE FROM student WHERE id = :sid"), {"sid": stu_id})
            
            # 3. Delete Lecturer/Staff dependents
            print("  - Deleting Lecturer...")
            # Lecturer ID is same as Account ID
            lect_id = acc_id 
            
            print("    - clearing grades for classes (if any)...")
            db.session.execute(text("DELETE FROM grades WHERE course_class_id IN (SELECT id FROM course_classes WHERE lecturer_id = :lid)"), {"lid": lect_id})
            
            print("    - clearing course classes...")
            db.session.execute(text("DELETE FROM course_classes WHERE lecturer_id = :lid"), {"lid": lect_id})
            
            print("    - deleting lecturer record...")
            db.session.execute(text("DELETE FROM lecturer WHERE id = :lid"), {"lid": lect_id})
            
            print("  - Deleting Staffs...")
            db.session.execute(text("DELETE FROM staffs WHERE id = :aid"), {"aid": acc_id})
            
            print("  - Deleting Verifiers...")
            try:
                with db.session.begin_nested():
                    db.session.execute(text("DELETE FROM verifiers WHERE id = :aid"), {"aid": acc_id})
            except Exception:
                print("    ! Table 'verifiers' not found or error, skipping.")

            # 4. Delete Account
            print("  - Deleting Account...")
            db.session.execute(text("DELETE FROM account WHERE id = :aid"), {"aid": acc_id})
            
            db.session.commit()
            print(f"  > Successfully nuked {u}!")
            
        except Exception as e:
            print(f"!!! Error nuking {u}: {e}")
            db.session.rollback()
