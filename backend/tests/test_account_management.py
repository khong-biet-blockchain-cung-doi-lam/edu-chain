import unittest
from app import create_app, db
from app.models.account_model import Account
from app.models.staff_models import Staff
from app.models.enums import Role
import json

class TestConfig:
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = True
    JWT_SECRET_KEY = "test-secret"

class TestAccountManagement(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Create QL_DAO_TAO User (Admin for accounts)
        self.qldt_acc = Account(username="qldt", password_hash="hashed", role='staff') # Account role must be staff
        db.session.add(self.qldt_acc)
        db.session.flush()
        self.qldt_staff = Staff(id=self.qldt_acc.id, position=Role.QL_DAO_TAO, full_name="Manager")
        db.session.add(self.qldt_staff)
        db.session.commit()
        
        # Token
        from flask_jwt_extended import create_access_token
        self.token = create_access_token(identity=str(self.qldt_acc.id))
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_create_account_valid_domains(self):
        # 1. Student
        res = self.client.post("/api/management/accounts", json={
            "username": "student1",
            "email": "student1@st.neu.edu.vn",
            "password": "password",
            "role": Role.SINH_VIEN
        }, headers=self.headers)
        self.assertEqual(res.status_code, 201)
        
        # 2. Lecturer
        res = self.client.post("/api/management/accounts", json={
            "username": "lecturer1",
            "email": "lecturer1@lt.neu.edu.vn",
            "password": "password",
            "role": Role.GIANG_VIEN,
            "full_name": "Dr. Doom"
        }, headers=self.headers)
        self.assertEqual(res.status_code, 201)

    def test_create_account_invalid_domain(self):
        # Student with wrong domain
        res = self.client.post("/api/management/accounts", json={
            "username": "student_fail",
            "email": "student1@gmail.com",
            "password": "password",
            "role": Role.SINH_VIEN
        }, headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("must end with", res.json['msg'])

    def test_email_login(self):
        # Create user via management first
        self.client.post("/api/management/accounts", json={
            "username": "login_user",
            "email": "user@st.neu.edu.vn",
            "password": "password123",
            "role": Role.SINH_VIEN
        }, headers=self.headers)
        
        # Try login with EMAIL
        res = self.client.post("/api/auth/login", json={
            "username": "user@st.neu.edu.vn", # sending email as username field
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
