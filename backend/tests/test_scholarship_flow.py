import unittest
from app import create_app, db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.partner_model import Partner
from app.models.enterprise_model import Enterprise
from app.models.enums import Role
from app.models.scholarship_model import Scholarship, ScholarshipApplication
import json
from datetime import date

class TestConfig:
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = True
    JWT_SECRET_KEY = "test-secret"

class TestScholarshipFlow(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Create Partner User
        self.partner_acc = Account(username="partner1", password_hash="hashed_pw", role=Role.PARTNER)
        db.session.add(self.partner_acc)
        
        self.enterprise = Enterprise(name="Tech Corp", tax_id="123")
        db.session.add(self.enterprise)
        db.session.flush()
        
        self.partner_profile = Partner(account_id=self.partner_acc.id, enterprise_id=self.enterprise.id, full_name="Mr. Partner")
        db.session.add(self.partner_profile)

        # Create Student User
        self.student_acc = Account(username="student1", password_hash="hashed_pw", role=Role.SINH_VIEN)
        db.session.add(self.student_acc)
        db.session.flush()
        
        self.student_profile = Student(id=self.student_acc.id, student_id="SV001", gpa=3.5) # Eligible GPA
        db.session.add(self.student_profile)
        
        db.session.commit()
        
        # Tokens
        from flask_jwt_extended import create_access_token
        self.partner_token = create_access_token(identity=str(self.partner_acc.id))
        self.student_token = create_access_token(identity=str(self.student_acc.id))

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_scholarship_workflow(self):
        # 1. Partner creates Scholarship
        headers_partner = {"Authorization": f"Bearer {self.partner_token}"}
        res = self.client.post("/api/partners/scholarships", json={
            "title": "Future Tech Leaders",
            "description": "For IT students",
            "criteria": {"min_gpa": 3.2}
        }, headers=headers_partner)
        self.assertEqual(res.status_code, 201)
        scholarship_id = res.json['id']
        
        # 2. Verify "ZKP" Match (System should have created an Application Invite)
        # In our implementation, match_students_to_scholarship is called on creation.
        # Let's check DB directly or via Student API.
        
        headers_student = {"Authorization": f"Bearer {self.student_token}"}
        res = self.client.get("/api/student/scholarships", headers=headers_student)
        self.assertEqual(res.status_code, 200)
        eligibles = res.json
        self.assertEqual(len(eligibles), 1)
        self.assertEqual(eligibles[0]['scholarship']['title'], "Future Tech Leaders")
        self.assertEqual(eligibles[0]['status'], "ELIGIBLE_PENDING_CONSENT")
        
        # 3. Student Applies
        app_id = eligibles[0]['scholarship']['id']
        res = self.client.post(f"/api/student/scholarships/{app_id}/apply", headers=headers_student)
        self.assertEqual(res.status_code, 200)
        
        # 4. Partner views Candidates
        res = self.client.get(f"/api/partners/scholarships/{scholarship_id}/candidates", headers=headers_partner)
        self.assertEqual(res.status_code, 200)
        candidates = res.json
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]['student_id'], str(self.student_acc.id))
        self.assertEqual(float(candidates[0]['gpa']), 3.5)

    def test_student_upload_certificate(self):
        headers_student = {"Authorization": f"Bearer {self.student_token}"}
        res = self.client.post("/api/student/certificates", json={
            "name": "IELTS",
            "score": "7.5",
            "code": "TRF123",
            "issued_date": "2025-01-01"
        }, headers=headers_student)
        self.assertEqual(res.status_code, 201)
        
        res = self.client.get("/api/student/certificates", headers=headers_student)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json), 1)
        self.assertEqual(res.json[0]['name'], "IELTS")

if __name__ == '__main__':
    unittest.main()
