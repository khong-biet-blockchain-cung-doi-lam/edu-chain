from app.extensions import db
from app.models.base import GUID
import uuid
from datetime import datetime, timezone

class Lecturer(db.Model):
    __tablename__ = 'lecturer'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lecturer_code = db.Column(db.Text, unique=True)
    account_id = db.Column(db.String(36), db.ForeignKey('account.id'))
    organization_id = db.Column(db.String(36))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationship to Account
    account = db.relationship('Account', backref=db.backref('lecturer_profile', uselist=False))

class Staff(db.Model):
    __tablename__ = 'staffs'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = db.Column(db.String(36), db.ForeignKey('account.id'))
    full_name = db.Column(db.Text)
    organization_id = db.Column(db.String(36))
    role_id = db.Column(db.String(36)) # If using a separate roles table or enum

    # Relationship to Account
    account = db.relationship('Account', backref=db.backref('staff_profile', uselist=False))

class LecturerSubject(db.Model):
    __tablename__ = 'lecturer_subjects'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lecturer_id = db.Column(db.String(36), db.ForeignKey('lecturer.id'))
    subject_id = db.Column(db.String(36), db.ForeignKey('subjects.id'))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    lecturer = db.relationship('Lecturer', backref='assigned_subjects')
    subject = db.relationship('Subject', backref='assigned_lecturers')
