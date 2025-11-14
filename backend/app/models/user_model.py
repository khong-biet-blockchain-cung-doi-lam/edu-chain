# app/models/user_model.py
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(128), unique=True, nullable=False)  # mã sinh viên
    password_hash = db.Column(db.String(256), nullable=False)          # bcrypt hash
    role = db.Column(db.String(32), nullable=False, default="student") # 'student' hoặc 'staff'
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }
