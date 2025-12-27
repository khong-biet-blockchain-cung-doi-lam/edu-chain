from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import field_validator

from app.models.base import CustomBaseModel

class StudentEmergencyContact(CustomBaseModel):
    id: UUID
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None

    @field_validator('phone')
    @classmethod
    def clean_phone_number(cls, v: str):
        clean_number = v.replace(" ", ""). replace("-", "")
        if not clean_number.isdigit():
            raise ValueError('Số điện thoại không hợp lệ')
        
        if len(clean_number) != 10:
            raise ValueError('Số điện thoại không hợp lệ')
        
        return clean_number