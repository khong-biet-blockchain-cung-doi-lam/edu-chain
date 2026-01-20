from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Organization(db.Model):
    __tablename__ = 'organizations'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.Text, nullable=False)
    type = db.Column(db.Text)
    parent_id = db.Column(UUID(as_uuid=True), db.ForeignKey('organizations.id'))
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    tax_id = db.Column(db.Text)
    contact_email = db.Column(db.Text)
    website = db.Column(db.Text)
    address = db.Column(db.Text)
    status = db.Column(db.Text, default='PENDING')

    children = db.relationship('Organization', 
                               backref=db.backref('parent', remote_side=[id]),
                               uselist=True)

    partners = db.relationship('Partner', backref='organization', lazy=True)

    def __repr__(self):
        return f"<Organization {self.name}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "tax_id": self.tax_id,
            "contact_email": self.contact_email,
            "website": self.website,
            "address": self.address,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
