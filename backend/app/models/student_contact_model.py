from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import EmailStr, field_validator

from app.models.base import CustomBaseModel

class StudentContact(CustomBaseModel):
    id: UUID
    country: str = 'Việt Nam'
    province: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    permanent_address: Optional[str] = None
    contact_address: Optional[str] = None
    phone: str
    personal_email: EmailStr
    edu_email: Optional[EmailStr] = None
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