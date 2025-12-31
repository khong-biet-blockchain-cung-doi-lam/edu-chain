import uuid
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID

student = db.relationship("Student", back_populates="account", uselist=False)

class Account(db.Model):
    __tablename__ = "accounts"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    # CCCD đã mã hóa (AES / RSA) - có thể null nếu không phải user có cccd
    cccd_encrypted = db.Column(db.Text, nullable=True)

    role = db.Column(db.String(20), default="student")
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # relationship
    student = db.relationship("Student", back_populates="account", uselist=False)

    def __repr__(self):
        return f"<Account {self.username}>"
