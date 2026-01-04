from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentPersonalInfo(db.Model):
    __tablename__ = 'student_personal_info'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(3)) 
    national_id_number = db.Column(db.Text)
    ethnicity = db.Column(db.Text)
    religion = db.Column(db.Text)
    class_name = db.Column(db.Text)
    academic_status = db.Column(db.String(13))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
