import os
import sys
import uuid
import bcrypt

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Lecturer
from app.models.partner_model import Partner
from app.models.enterprise_model import Enterprise

app = create_app()

def seed_users():
    with app.app_context():
        users = [
            {"username": "sysadmin",   "password": "SysAdmin@123",  "role": "ADMIN",      "email": "sysadmin@admin.neu.edu.vn"},
            {"username": "admin01",    "password": "Admin@123",     "role": "ADMIN",      "email": "admin01@admin.neu.edu.vn"},
            {"username": "khaothi01",  "password": "Khaothi@123",   "role": "KHAO_THI",   "email": "khaothi01@kt.neu.edu.vn"},
            {"username": "khoa01",     "password": "Khoa@123",      "role": "KHOA",       "email": "khoa01@khoa.neu.edu.vn"},
            {"username": "qldt01",     "password": "Qldt@123",      "role": "QL_DAO_TAO", "email": "qldt01@qldt.neu.edu.vn"},
            {"username": "lecturer01", "password": "Lecturer@123",  "role": "GIANG_VIEN", "email": "lecturer01@lt.neu.edu.vn"},
            {"username": "student01",  "password": "Student@123",   "role": "SINH_VIEN",  "email": "student01@st.neu.edu.vn"},
            {"username": "partner01",  "password": "Partner@123",   "role": "PARTNER",    "email": "partner01@tp.neu.edu.vn"},
        ]

        account_map = {}
        for u in users:
            existing = Account.query.filter_by(username=u["username"]).first()
            if existing:
                print(f"User {u['username']} already exists. Updating password...")
                existing.password_hash = bcrypt.hashpw(u["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                account_map[u["username"]] = existing
            else:
                print(f"Creating user {u['username']}...")
                pw_hash = bcrypt.hashpw(u["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                account = Account(
                    username=u["username"],
                    email=u["email"],
                    password_hash=pw_hash,
                    role=u["role"]
                )
                db.session.add(account)
                db.session.flush()
                account_map[u["username"]] = account

        # === Lecturer Profile ===
        lec_acct = account_map.get("lecturer01")
        if lec_acct:
            existing_lec = Lecturer.query.filter_by(id=lec_acct.id).first()
            if not existing_lec:
                # Also check by code to avoid unique constraint
                code_check = Lecturer.query.filter_by(lecturer_code="GV001").first()
                if not code_check:
                    print("Creating Lecturer profile for lecturer01...")
                    lec = Lecturer(
                        id=lec_acct.id,
                        lecturer_code="GV001",
                        full_name="Giảng viên Test 01"
                    )
                    db.session.add(lec)
                else:
                    print("Lecturer code GV001 already taken by another account. Skipping.")
            else:
                print("Lecturer profile already exists.")

        # === Enterprise + Partner Profile ===
        partner_acct = account_map.get("partner01")
        if partner_acct:
            existing_partner = Partner.query.filter_by(account_id=partner_acct.id).first()
            if not existing_partner:
                print("Creating Enterprise and Partner profile for partner01...")
                # Create enterprise first
                enterprise = Enterprise.query.filter_by(name="Test Enterprise Co.").first()
                if not enterprise:
                    enterprise = Enterprise(
                        id=uuid.uuid4(),
                        name="Test Enterprise Co.",
                        tax_id="0123456789",
                        address="123 Test Street, Hanoi",
                        status="ACTIVE"
                    )
                    db.session.add(enterprise)
                    db.session.flush()

                partner = Partner(
                    account_id=partner_acct.id,
                    enterprise_id=enterprise.id,
                    full_name="Partner Test 01"
                )
                db.session.add(partner)
            else:
                print("Partner profile already exists.")

        # === Student Profile ===
        stu_acct = account_map.get("student01")
        if stu_acct:
            existing_stu = Student.query.filter_by(id=stu_acct.id).first()
            if not existing_stu:
                print("Creating Student profile for student01...")
                stu = Student(
                    id=stu_acct.id,
                    student_id="SV210001",
                    gpa=3.5
                )
                db.session.add(stu)
            else:
                print("Student profile already exists.")

        try:
            db.session.commit()
            print("\nSuccessfully seeded all test accounts and profiles!")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding accounts: {e}")

if __name__ == "__main__":
    seed_users()
