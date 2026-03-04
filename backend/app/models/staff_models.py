from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class Lecturer(db.Model):
    __tablename__ = 'lecturer'

    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
    lecturer_code = db.Column(db.Text, unique=True)
    full_name = db.Column(db.String(255))                        
    organization_id = db.Column(UUID(as_uuid=True))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    account = db.relationship('Account', backref=db.backref('lecturer_profile', uselist=False))

class Staff(db.Model):
    __tablename__ = 'staffs'

    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
                        
    full_name = db.Column(db.Text)
    organization_id = db.Column(UUID(as_uuid=True))
                     
    staff_code = db.Column(db.Text)                            
    can_sign_documents = db.Column(db.Boolean)                            
    position = db.Column(db.Text)                            

    account = db.relationship('Account', backref=db.backref('staff_profile', uselist=False))

class LecturerSubject(db.Model):
    __tablename__ = 'lecturer_subjects'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecturer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('lecturer.id'))
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subjects.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lecturer = db.relationship('Lecturer', backref='assigned_subjects')
    subject = db.relationship('Subject', backref='assigned_lecturers')
