from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Major(db.Model):
    __tablename__ = 'majors'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.Text)
    name = db.Column(db.Text)
    organization_id = db.Column(db.String(36))

class Cohort(db.Model):
    __tablename__ = 'cohorts'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.Text)
    start_year = db.Column(db.SmallInteger)
    end_year = db.Column(db.SmallInteger)

class Curriculum(db.Model):
    __tablename__ = 'curriculums'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.Text)
    code = db.Column(db.Text)
    major_id = db.Column(db.String(36), db.ForeignKey('majors.id'))
    academic_year = db.Column(db.Text)
    total_credits = db.Column(db.Integer)
    is_active = db.Column(db.Boolean)
