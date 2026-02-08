from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy import String
from sqlalchemy.types import TypeDecorator
import uuid

# Compatible UUID type for both PostgreSQL and SQLite
class GUID(TypeDecorator):
    """Platform-independent GUID type that uses UUID for PostgreSQL and String for SQLite"""
    impl = PostgresUUID(as_uuid=True)
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID(as_uuid=True))
        return dialect.type_descriptor(String(36))
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            if dialect.name == 'postgresql':
                return value
            else:
                return str(value)
        elif isinstance(value, str):
            if dialect.name == 'postgresql':
                return uuid.UUID(value)
            else:
                return value
        return str(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(value) if not isinstance(value, uuid.UUID) else value

class BaseModel(db.Model):
    __abstract__ = True