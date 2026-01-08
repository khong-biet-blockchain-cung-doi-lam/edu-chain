from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class StudentEnrollment(db.Model):
    __tablename__ = 'student_enrollment'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('students.id'))
    cohort_id = db.Column(UUID(as_uuid=True), db.ForeignKey('cohorts.id'))
    major_id = db.Column(UUID(as_uuid=True), db.ForeignKey('majors.id'))
    curriculum_id = db.Column(UUID(as_uuid=True), db.ForeignKey('curriculums.id'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    major = db.relationship('Major')
    cohort = db.relationship('Cohort')
    curriculum = db.relationship('Curriculum')
