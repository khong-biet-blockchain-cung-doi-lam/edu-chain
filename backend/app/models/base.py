from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class BaseModel(db.Model):
    __abstract__ = True