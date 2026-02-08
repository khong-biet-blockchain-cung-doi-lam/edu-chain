from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Student(db.Model):
    __tablename__ = 'student'

<<<<<<< HEAD
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Map 'student_id' python attribute to 'student_code' database column
    student_id = db.Column('student_code', db.String(20), unique=True, nullable=False)
    account_id = db.Column(db.String(36), db.ForeignKey('account.id'), unique=True, nullable=False)
=======
    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
    # Map 'student_id' python attribute to 'student_code' database column
    student_id = db.Column('student_code', db.String(20), unique=True, nullable=False)
    # account_id removed
>>>>>>> c7b9cefa4000f931bebcce45bd264766c0265360

    account = db.relationship('Account', back_populates='student')

    # Relationships to Modular Models
    # Giả định mapping 1-1 qua ID
    personal_info = db.relationship('StudentPersonalInfo', foreign_keys=[id], primaryjoin="Student.id==StudentPersonalInfo.id", uselist=False, viewonly=True)
    contact = db.relationship('StudentContact', foreign_keys=[id], primaryjoin="Student.id==StudentContact.id", uselist=False, viewonly=True)
    enrollment = db.relationship('StudentEnrollment', backref='student', uselist=False)

    def __repr__(self):
        return f'<Student {self.student_id}>'
