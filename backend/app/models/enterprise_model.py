from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Enterprise(db.Model):
    __tablename__ = 'enterprises'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.Text, nullable=False)
    tax_id = db.Column(db.Text)
    contact_email = db.Column(db.Text)
    website = db.Column(db.Text)
    address = db.Column(db.Text)
    status = db.Column(db.Text, default='PENDING')
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    partners = db.relationship('Partner', backref='enterprise', lazy=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "tax_id": self.tax_id,
            "contact_email": self.contact_email,
            "website": self.website,
            "address": self.address,
            "status": self.status,
            "created_at": str(self.created_at) if self.created_at else None
        }
