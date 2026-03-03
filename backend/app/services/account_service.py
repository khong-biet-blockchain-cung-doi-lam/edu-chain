import uuid
import bcrypt
from app.extensions import db
from app.models.account_model import Account
from app.models.student_model import Student
from app.models.staff_models import Staff, Lecturer
from app.models.partner_model import Partner
from app.models.enums import Role, ROLE_EMAIL_DOMAIN

class AccountService:
    @staticmethod
    def create_account(username, email, password, role, full_name="", code=None, enterprise_id=None):
        """Creates a new account and associated profile."""
        if Account.query.filter((Account.username == username) | (Account.email == email)).first():
            return None, "Username hoặc email đã tồn tại"

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_account = Account(
            username=username,
            email=email,
            password_hash=hashed_pw,
            role=role
        )
        db.session.add(new_account)
        db.session.flush()

        # Create Profile
        if role == Role.SINH_VIEN:
            db.session.add(Student(id=new_account.id, student_id=code or username))
        elif role == Role.GIANG_VIEN:
            db.session.add(Lecturer(id=new_account.id, full_name=full_name or username))
        elif role in [Role.QL_DAO_TAO, Role.KHAO_THI, Role.KHOA, Role.ADMIN]:
            db.session.add(Staff(id=new_account.id, full_name=full_name or username, position=role))
        elif role == Role.PARTNER and enterprise_id:
            db.session.add(Partner(account_id=new_account.id, enterprise_id=uuid.UUID(enterprise_id), full_name=full_name))

        try:
            db.session.commit()
            return new_account, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def toggle_status(account_id):
        """Toggles account active status."""
        if isinstance(account_id, str): account_id = uuid.UUID(account_id)
        acc = db.session.get(Account, account_id)
        if not acc: return None, "Không tìm thấy tài khoản"
        acc.is_active = not acc.is_active
        db.session.commit()
        return acc.is_active, None
