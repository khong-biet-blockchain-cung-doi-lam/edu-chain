from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class Scholarship(db.Model):
    __tablename__ = 'scholarships'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = db.Column(UUID(as_uuid=True), db.ForeignKey('partners.id'), nullable=False)
    
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    criteria = db.Column(db.JSON)                                                                
    status = db.Column(db.String(50), default='OPEN')               
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    partner = db.relationship('Partner', backref=db.backref('scholarships', lazy=True))

    def to_dict(self):
        return {
            "id": str(self.id),
            "partner_id": str(self.partner_id),
            "title": self.title,
            "description": self.description,
            "criteria": self.criteria,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ScholarshipApplication(db.Model):
    __tablename__ = 'scholarship_applications'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scholarship_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scholarships.id'), nullable=False)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student.id'), nullable=False)
    
    status = db.Column(db.String(50), default='ELIGIBLE_PENDING_CONSENT') 
                                                                   
    applied_at = db.Column(db.DateTime, nullable=True)                                  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)                      

    scholarship = db.relationship('Scholarship', backref=db.backref('applications', lazy=True))
    student = db.relationship('Student', backref=db.backref('scholarship_applications', lazy=True))

    def to_dict(self):
        return {
            "id": str(self.id),
            "scholarship_id": str(self.scholarship_id),
            "student_id": str(self.student_id),
            "status": self.status,
            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
