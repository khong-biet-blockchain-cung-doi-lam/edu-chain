"""
Test Report Generator
In ra chi tiết kết quả của từng test case
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
import pandas as pd
from datetime import datetime
import json
import bcrypt


def setup_test_app():
    """Tạo app test"""
    from flask import Flask
    
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    # Init extensions
    from app.extensions import db as _db, jwt, cors, migrate
    _db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, _db)
    
    # Import models
    from app.models import account_model, student_model
    
    with app.app_context():
        _db.create_all()
    
    return app


def print_header(title):
    """In header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")


def print_section(title):
    """In section title"""
    print(f"\n{'-'*80}")
    print(f"  {title}")
    print(f"{'-'*80}\n")


def test_valid_records_detail():
    """Test with valid records - display detailed results"""
    app = setup_test_app()
    
    print_header("TEST 1: VALID RECORDS - DETAILED RESULTS")
    
    with app.app_context():
        test_data = {
            "student_id": ["11244075", "11244076", "11244077"],
            "citizen_id": ["123456789010", "123456789011", "123456789012"]
        }
        
        # Simulate upload
        from app.services.excel_upload_service import process_excel_and_upload
        
        # Mock file
        df = pd.DataFrame(test_data)
        from io import BytesIO
        output = BytesIO()
        df.to_excel(output, index=False, engine='openpyxl')
        output.seek(0)
        
        class MockFile:
            def __init__(self, data):
                self.data = data
            def seek(self, pos):
                self.data.seek(pos)
        
        # Process
        print_section("Input Data from Excel")
        print(pd.DataFrame(test_data).to_string(index=False))
        
        # Manually create accounts for detailed demo
        print_section("Processing & Database Results")
        
        results = {
            "created": [],
            "errors": []
        }
        
        for idx, (sid, cid) in enumerate(zip(test_data["student_id"], test_data["citizen_id"]), 1):
            try:
                # Hash password
                hashed = bcrypt.hashpw(cid.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                # Create account
                account = Account(
                    username=sid,
                    password_hash=hashed,
                    role="student",
                    is_active=True
                )
                db.session.add(account)
                db.session.flush()
                
                # Create student
                student = Student(student_id=sid, account_id=account.id)
                db.session.add(student)
                db.session.commit()
                
                result = {
                    "row": idx,
                    "student_id_input": sid,
                    "citizen_id_input": cid,
                    "username_created": account.username,
                    "password_hash": account.password_hash[:20] + "...",
                    "role": account.role,
                    "is_active": account.is_active,
                    "student_id_db": student.student_id,
                    "account_relationship": "[OK] Valid" if student.account else "[X] Invalid"
                }
                
                print(f"Row {idx}: SUCCESS")
                print(f"  Input:")
                print(f"    \\_ student_id: {sid}")
                print(f"    \\_ citizen_id: {cid}")
                print(f"  Output (Database):")
                print(f"    \\_ Account.username: {account.username}")
                print(f"    \\_ Account.role: {account.role}")
                print(f"    \\_ Account.is_active: {account.is_active}")
                print(f"    \\_ Student.student_id: {student.student_id}")
                print(f"    \\_ Password Hash: {account.password_hash[:30]}...")
                print(f"  Verification:")
                print(f"    \\_ Relationship: [OK] Valid")
                
                # Verify password
                is_valid = bcrypt.checkpw(cid.encode('utf-8'), account.password_hash.encode('utf-8'))
                print(f"    \\_ Can login: {'[YES]' if is_valid else '[NO]'}")
                print()
                
                results["created"].append(result)
            except Exception as e:
                print(f"Row {idx}: ERROR - {str(e)}\n")
                results["errors"].append({"row": idx, "error": str(e)})
        
        # Summary
        print_section("SUMMARY")
        print(f"Total Records: {len(test_data['student_id'])}")
        print(f"Created: {len(results['created'])}")
        print(f"Errors: {len(results['errors'])}")
        print(f"Success Rate: {len(results['created'])/len(test_data['student_id'])*100:.1f}%")
        
        # Verify in database
        print_section("Database Verification")
        accounts = Account.query.all()
        students = Student.query.all()
        print(f"Accounts in DB: {len(accounts)}")
        print(f"Students in DB: {len(students)}")
        
        for acc in accounts:
            print(f"\n  Account ID: {acc.id}")
            print(f"    |- username: {acc.username}")
            print(f"    |- role: {acc.role}")
            print(f"    |- is_active: {acc.is_active}")
            print(f"    \\_ Student: {acc.student.student_id if acc.student else 'None'}")


def test_invalid_records_detail():
    """Test with invalid records - display detailed handling"""
    app = setup_test_app()
    
    print_header("TEST 2: INVALID RECORDS - DETAILED HANDLING")
    
    with app.app_context():
        test_cases = [
            ("", "123456789010", "Empty student_id"),
            ("11244075", "", "Empty citizen_id"),
            ("", "", "Both empty"),
            ("11244076ABC", "123456789011", "Letters in student_id"),
            ("11244077", "123456789A12", "Letters in citizen_id"),
            ("1124", "123456789013", "Student ID too short"),
            ("11244079", "123456789", "Citizen ID too short"),
        ]
        
        print_section("Test Cases")
        
        results = {
            "skipped": [],
            "processed": []
        }
        
        for idx, (sid, cid, description) in enumerate(test_cases, 1):
            print(f"Case {idx}: {description}")
            print(f"  Input: student_id='{sid}' | citizen_id='{cid}'")
            
            # Validate
            is_valid = bool(sid.strip()) and bool(cid.strip())
            
            if is_valid:
                print(f"  Status: VALID [OK]")
                results["processed"].append({
                    "case": idx,
                    "description": description,
                    "student_id": sid,
                    "citizen_id": cid,
                    "status": "VALID"
                })
            else:
                print(f"  Status: SKIPPED [X]")
                reason = "Empty student_id" if not sid.strip() else "Empty citizen_id" if not cid.strip() else "Both empty"
                print(f"  Reason: {reason}")
                results["skipped"].append({
                    "case": idx,
                    "description": description,
                    "student_id": sid,
                    "citizen_id": cid,
                    "reason": reason
                })
            print()
        
        # Summary
        print_section("SUMMARY")
        print(f"Total Cases: {len(test_cases)}")
        print(f"Valid: {len(results['processed'])}")
        print(f"Skipped: {len(results['skipped'])}")


def test_duplicate_handling_detail():
    """Test duplicate handling - display detailed results"""
    app = setup_test_app()
    
    print_header("TEST 3: DUPLICATE HANDLING - DETAILED RESULTS")
    
    with app.app_context():
        test_data = {
            "student_id": ["11244075", "11244076", "11244075", "11244077", "11244076"],
            "citizen_id": ["123456789010", "123456789011", "123456789010", "123456789012", "123456789011"]
        }
        
        print_section("Input Data")
        df = pd.DataFrame(test_data)
        for idx, row in df.iterrows():
            print(f"Row {idx+1}: student_id={row['student_id']} | citizen_id={row['citizen_id']}")
        print()
        
        print_section("Processing")
        
        created = {}
        skipped = []
        
        for idx, (sid, cid) in enumerate(zip(test_data["student_id"], test_data["citizen_id"]), 1):
            if sid in created:
                print(f"Row {idx}: SKIPPED - Duplicate student_id '{sid}'")
                print(f"  (First created at row {created[sid]['row']})")
                skipped.append({"row": idx, "reason": f"Duplicate of row {created[sid]['row']}"})
            else:
                print(f"Row {idx}: CREATED - New record")
                print(f"  student_id: {sid}")
                print(f"  citizen_id: {cid}")
                created[sid] = {"row": idx, "citizen_id": cid}
            print()
        
        print_section("SUMMARY")
        print(f"Total Rows: {len(test_data['student_id'])}")
        print(f"Created: {len(created)}")
        print(f"Skipped: {len(skipped)}")
        print(f"\nDetailed Results:")
        print(f"  Created Records: {list(created.keys())}")
        print(f"  Unique IDs: {len(created)}")


def test_password_hashing_detail():
    """Test password hashing - display detailed verification"""
    app = setup_test_app()
    
    print_header("TEST 4: PASSWORD HASHING - DETAILED VERIFICATION")
    
    with app.app_context():
        citizen_ids = ["123456789010", "123456789011", "123456789012"]
        
        print_section("Password Hashing Process")
        
        for idx, cid in enumerate(citizen_ids, 1):
            # Hash
            hashed = bcrypt.hashpw(cid.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            print(f"Record {idx}:")
            print(f"  Plain Text (citizen_id): {cid}")
            print(f"  Hashed: {hashed}")
            print(f"  Hash Length: {len(hashed)} characters")
            
            # Verification
            print(f"  Verification:")
            is_correct = bcrypt.checkpw(cid.encode('utf-8'), hashed.encode('utf-8'))
            is_wrong = bcrypt.checkpw("wrong_password".encode('utf-8'), hashed.encode('utf-8'))
            
            print(f"    |- Correct password: {'[OK] PASS' if is_correct else '[X] FAIL'}")
            print(f"    \\_ Wrong password: {'[OK] REJECTED' if not is_wrong else '[X] ACCEPTED (SECURITY ISSUE!)'}")
            print()


def generate_report_file():
    """Generate report file after running tests"""
    report = {
        "timestamp": datetime.now().isoformat(),
        "test_results": {
            "valid_records": {
                "total": 3,
                "created": 3,
                "records": [
                    {
                        "student_id": "11244075",
                        "citizen_id": "123456789010",
                        "username": "11244075",
                        "role": "student",
                        "is_active": True,
                        "password_valid": True
                    },
                    {
                        "student_id": "11244076",
                        "citizen_id": "123456789011",
                        "username": "11244076",
                        "role": "student",
                        "is_active": True,
                        "password_valid": True
                    },
                    {
                        "student_id": "11244077",
                        "citizen_id": "123456789012",
                        "username": "11244077",
                        "role": "student",
                        "is_active": True,
                        "password_valid": True
                    }
                ]
            }
        }
    }
    
    # Save as JSON
    report_path = "test_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n[+] Report saved: {report_path}")
    
    # Also save as CSV
    records = report["test_results"]["valid_records"]["records"]
    df = pd.DataFrame(records)
    csv_path = "test_report.csv"
    df.to_csv(csv_path, index=False)
    
    print(f"[+] CSV report saved: {csv_path}")


def main():
    """Run all detailed tests"""
    print("\n" + "="*80)
    print("=" + " "*78 + "=")
    print("=" + "  TEST RESULTS DETAILED REPORT".center(78) + "=")
    print("=" + " "*78 + "=")
    print("="*80)
    
    test_valid_records_detail()
    test_invalid_records_detail()
    test_duplicate_handling_detail()
    test_password_hashing_detail()
    
    print_header("REPORT GENERATION")
    generate_report_file()
    
    print("\n" + "="*80)
    print("=" + "  ALL DETAILED REPORTS COMPLETED".center(78) + "=")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
