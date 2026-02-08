from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentContact(db.Model):
    __tablename__ = 'student_contact'
    
<<<<<<< HEAD
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
=======
    # 1-1 with Student
    id = db.Column(UUID(as_uuid=True), db.ForeignKey('student.id'), primary_key=True)
>>>>>>> c7b9cefa4000f931bebcce45bd264766c0265360
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
