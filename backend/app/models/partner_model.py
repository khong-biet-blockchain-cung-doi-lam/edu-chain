from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Partner(db.Model):
    __tablename__ = 'partners'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), nullable=False, unique=True)
    enterprise_id = db.Column(UUID(as_uuid=True), db.ForeignKey('enterprises.id'), nullable=False)
    
    full_name = db.Column(db.Text)
    position = db.Column(db.Text)
    phone_number = db.Column(db.Text)
    
    account = db.relationship('Account', backref=db.backref('partner_profile', uselist=False))

    def to_dict(self):
        return {
            "id": str(self.id),
            "full_name": self.full_name,
            "position": self.position,
            "phone_number": self.phone_number,
            "enterprise_id": str(self.enterprise_id),
            "enterprise_name": self.enterprise.name if self.enterprise else None,
            "account_id": str(self.account_id)
        }
