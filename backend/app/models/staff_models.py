from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class Lecturer(db.Model):
    __tablename__ = 'lecturer'

    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
    lecturer_code = db.Column(db.Text, unique=True)
    # account_id removed
    organization_id = db.Column(UUID(as_uuid=True))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to Account
    account = db.relationship('Account', backref=db.backref('lecturer_profile', uselist=False))

class Staff(db.Model):
    __tablename__ = 'staffs'

    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
    # account_id removed
    full_name = db.Column(db.Text)
    organization_id = db.Column(UUID(as_uuid=True))
    # role_id removed
    staff_code = db.Column(db.Text) # added based on inspection
    can_sign_documents = db.Column(db.Boolean) # added based on inspection
    position = db.Column(db.Text) # added based on inspection

    # Relationship to Account
    account = db.relationship('Account', backref=db.backref('staff_profile', uselist=False))

class LecturerSubject(db.Model):
    __tablename__ = 'lecturer_subjects'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lecturer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('lecturer.id'))
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subjects.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lecturer = db.relationship('Lecturer', backref='assigned_subjects')
    subject = db.relationship('Subject', backref='assigned_lecturers')
