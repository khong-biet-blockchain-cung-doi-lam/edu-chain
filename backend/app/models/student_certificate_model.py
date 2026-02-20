from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class StudentCertificate(db.Model):
    __tablename__ = 'student_certificates'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = db.Column(UUID(as_uuid=True), db.ForeignKey('student.id'), nullable=False)
    
    name = db.Column(db.String(255), nullable=False) # e.g., "IELTS"
    code = db.Column(db.String(100)) # Certificate Number
    score = db.Column(db.String(50)) # e.g., "7.5"
    issued_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date, nullable=True)
    image_url = db.Column(db.String(500)) # URL to proof image
    
    status = db.Column(db.String(50), default='PENDING') # PENDING, VERIFIED, REJECTED
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship('Student', backref=db.backref('certificates', lazy=True))

    def to_dict(self):
        return {
            "id": str(self.id),
            "student_id": str(self.student_id),
            "name": self.name,
            "code": self.code,
            "score": self.score,
            "issued_date": self.issued_date.isoformat() if self.issued_date else None,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "image_url": self.image_url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
