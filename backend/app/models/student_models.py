import uuid
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from app.models.supabase_models import StudentPersonalInfo, StudentContact, StudentEnrollment


class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    account_id = db.Column(UUID(as_uuid=True), db.ForeignKey('accounts.id'), unique=True, nullable=False)

    account = db.relationship('Account', back_populates='student')

    # New Relationships matching Supabase logic
    # Giả định: bảng students.id sẽ match với student_personal_info.id (1-1) HOẶC có cột student_id ở bản info.
    # Tuy nhiên, theo kết quả scan, bảng 'student_personal_info' KHÔNG CÓ cột student_id. 
    # => KHẢ NĂNG CAO: id của student_personal_info CHÍNH LÀ id của student (Shared PK)
    # Hoặc logic app cũ là tạo record info có ID trùng record student.
    
    # Cách map 1-1 qua shared FK/PK thường thấy:
    personal_info = db.relationship('StudentPersonalInfo', foreign_keys=[id], primaryjoin="Student.id==StudentPersonalInfo.id", uselist=False, viewonly=True)
    contact = db.relationship('StudentContact', foreign_keys=[id], primaryjoin="Student.id==StudentContact.id", uselist=False, viewonly=True)
    
    # Enrollment có cột student_id nên map bình thường
    enrollment = db.relationship('StudentEnrollment', backref='student', uselist=False)


    def __repr__(self):
        return f'<Student {self.student_id}>'