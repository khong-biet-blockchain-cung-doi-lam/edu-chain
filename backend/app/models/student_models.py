import uuid
from ..extensions import db
from sqlalchemy.dialects.postgresql import UUID

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    account_id = db.Column(UUID(as_uuid=True), db.ForeignKey('accounts.id'), unique=True, nullable=False)

    account = db.relationship('Account', back_populates='student')

    def __repr__(self):
        return f'<Student {self.student_id}>'