from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Danh mục / Dictionary Tables
class Major(db.Model):
    __tablename__ = 'majors'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.Text)
    name = db.Column(db.Text)
    organization_id = db.Column(UUID(as_uuid=True))

class Cohort(db.Model):
    __tablename__ = 'cohorts'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.Text)
    start_year = db.Column(db.SmallInteger)
    end_year = db.Column(db.SmallInteger)

class Curriculum(db.Model):
    __tablename__ = 'curriculums'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.Text)
    code = db.Column(db.Text)
    major_id = db.Column(UUID(as_uuid=True), db.ForeignKey('majors.id'))
    academic_year = db.Column(db.Text)
    total_credits = db.Column(db.Integer)
    is_active = db.Column(db.Boolean)

# Thông tin chi tiết sinh viên
class StudentPersonalInfo(db.Model):
    __tablename__ = 'student_personal_info'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(3)) # Nam/Nu/Other
    national_id_number = db.Column(db.Text)
    ethnicity = db.Column(db.Text)
    religion = db.Column(db.Text)
    class_name = db.Column(db.Text) # Lưu tên lớp hành chính (ví dụ: CNTT-K15)
    academic_status = db.Column(db.String(13))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class StudentContact(db.Model):
    __tablename__ = 'student_contact'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country = db.Column(db.Text)
    province = db.Column(db.Text)
    district = db.Column(db.Text)
    ward = db.Column(db.Text)
    permanent_address = db.Column(db.Text)
    contact_address = db.Column(db.Text)
    phone = db.Column(db.Text)
    personal_email = db.Column(db.Text)
    edu_email = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class StudentEnrollment(db.Model):
    __tablename__ = 'student_enrollment'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('students.id'))
    cohort_id = db.Column(UUID(as_uuid=True), db.ForeignKey('cohorts.id'))
    major_id = db.Column(UUID(as_uuid=True), db.ForeignKey('majors.id'))
    curriculum_id = db.Column(UUID(as_uuid=True), db.ForeignKey('curriculums.id'))
    # advisor_id = ... (staff)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    major = db.relationship('Major')
    cohort = db.relationship('Cohort')
    curriculum = db.relationship('Curriculum')
