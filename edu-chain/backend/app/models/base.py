from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class BaseModel(db.Model):
    __abstract__ = True
    # Có thể thêm các field chung như created_at, updated_at ở đây nếu muốn
