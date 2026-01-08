from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class Semester(db.Model):
    __tablename__ = 'semesters'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)

class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_code = db.Column(db.Text, nullable=False, unique=True)
    name = db.Column(db.Text, nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    organization_id = db.Column(UUID(as_uuid=True)) # Optional based on usage

class CourseClass(db.Model):
    __tablename__ = 'course_classes'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_code = db.Column(db.Text, nullable=False, unique=True)
    name = db.Column(db.Text, nullable=False)
    
    subject_id = db.Column(UUID(as_uuid=True), db.ForeignKey('subjects.id'))
    lecturer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('lecturer.id'))
    semester_id = db.Column(UUID(as_uuid=True), db.ForeignKey('semesters.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    subject = db.relationship('Subject', backref='classes')
    semester = db.relationship('Semester', backref='classes')
    # lecturer relationship will be defined in staff_models or via backref there to avoid circular imports if possible, 
    # but here is safer if we just use string reference or import carefully. 
    # For now leaving lecturer relation definition for later or using string 'Lecturer' if needed.

class Grade(db.Model):
    __tablename__ = 'grades'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    regular_score = db.Column(db.Float)
    midterm_score = db.Column(db.Float)
    final_score = db.Column(db.Float)
    total_score = db.Column(db.Float)
    status = db.Column(db.Text) # e.g. 'PASSED', 'FAILED'
    onchain_hash = db.Column(db.Text)
    
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('students.id'))
    course_class_id = db.Column(UUID(as_uuid=True), db.ForeignKey('course_classes.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship('Student', backref='grades')
    course_class = db.relationship('CourseClass', backref='grades')
