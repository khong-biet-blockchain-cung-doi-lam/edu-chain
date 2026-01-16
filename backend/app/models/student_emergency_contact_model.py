from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentEmergencyContact(db.Model):
    __tablename__ = 'student_emergency_contact'
    
    # Assuming 1-1 with Student, similar to StudentContact
    # Even if DB missing explicit FK, logic suggests this should be bound to Student
    id = db.Column(UUID(as_uuid=True), db.ForeignKey('student.id'), primary_key=True)
    
    full_name = db.Column(db.Text)
    phone_number = db.Column(db.Text)
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationship validation logic (optional) if needed can go here as methods