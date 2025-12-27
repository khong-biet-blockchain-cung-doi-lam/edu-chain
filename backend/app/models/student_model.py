from uuid import UUID
from typing import Optional
from datetime import datetime

from app.models.base import CustomBaseModel

class Student(CustomBaseModel):
    id: Optional[UUID] = None
    student_code: str
    account_id: UUID #FK đến account.id
    created_at: Optional[datetime] = None