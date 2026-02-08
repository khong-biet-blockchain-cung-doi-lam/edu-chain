from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentEnrollment(db.Model):
    __tablename__ = 'student_enrollment'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey('student.id'))
    cohort_id = db.Column(db.String(36), db.ForeignKey('cohorts.id'))
    major_id = db.Column(db.String(36), db.ForeignKey('majors.id'))
    curriculum_id = db.Column(db.String(36), db.ForeignKey('curriculums.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    major = db.relationship('Major')
    cohort = db.relationship('Cohort')
    curriculum = db.relationship('Curriculum')
