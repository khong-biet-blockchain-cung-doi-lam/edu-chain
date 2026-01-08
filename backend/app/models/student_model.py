from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Student(db.Model):
    __tablename__ = 'student'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    account_id = db.Column(UUID(as_uuid=True), db.ForeignKey('accounts.id'), unique=True, nullable=False)

    account = db.relationship('Account', back_populates='student')

    # Relationships to Modular Models
    # Giả định mapping 1-1 qua ID
    personal_info = db.relationship('StudentPersonalInfo', foreign_keys=[id], primaryjoin="Student.id==StudentPersonalInfo.id", uselist=False, viewonly=True)
    contact = db.relationship('StudentContact', foreign_keys=[id], primaryjoin="Student.id==StudentContact.id", uselist=False, viewonly=True)
    enrollment = db.relationship('StudentEnrollment', backref='student', uselist=False)

    def __repr__(self):
        return f'<Student {self.student_id}>'
