from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.base import CustomBaseModel

class Account(CustomBaseModel):
    id: Optional[UUID] = None #tự động gen, nếu có xảy ra lỗi tự điền None
    login_id: str
    password_hash: str
    role_type: str #sau phải sửa
    created_at: Optional[datetime] = None