from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentContact(db.Model):
    __tablename__ = 'student_contact'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country = db.Column(db.Text)
    province = db.Column(db.Text)
    district = db.Column(db.Text)
    ward = db.Column(db.Text)
    permanent_address = db.Column(db.Text)
    contact_address = db.Column(db.Text)
    phone = db.Column(db.Text)
    personal_email = db.Column(db.Text)
    edu_email = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
