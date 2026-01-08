import uuid
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Account(db.Model):
    __tablename__ = 'accounts' # Plural (Original)

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="student")
    
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    cccd_encrypted = db.Column(db.Text, nullable=True)
    
    student = db.relationship('Student', back_populates='account', uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Account {self.username}>"