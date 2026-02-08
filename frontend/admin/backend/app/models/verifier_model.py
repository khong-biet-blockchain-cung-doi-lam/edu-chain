from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Verifier(db.Model):
    __tablename__ = 'verifiers'

    # 1-1 relationship with Account (similar to Staff/Student)
    id = db.Column(UUID(as_uuid=True), db.ForeignKey('account.id'), primary_key=True)
    
    org_name = db.Column(db.Text)
    org_type = db.Column(db.String) # VARCHAR in schema
    email = db.Column(db.Text)
    website = db.Column(db.Text)
    public_key = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    tax_code = db.Column(db.Text)

    # Relationship
    account = db.relationship('Account', backref=db.backref('verifier_profile', uselist=False))

    def __repr__(self):
        return f"<Verifier {self.org_name}>"
