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

    children = db.relationship('Organization', 
                               backref=db.backref('parent', remote_side=[id]),
                               uselist=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "created_at": str(self.created_at) if self.created_at else None
        }
