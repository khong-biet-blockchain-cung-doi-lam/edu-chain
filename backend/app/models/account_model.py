import uuid
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Account(db.Model):
    __tablename__ = 'accounts'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)
    role_type = db.Column(db.String(50), nullable=False)

    student = db.relationship('Student', back_populates='account', uselist=False, cascade="all, delete-orphan")
