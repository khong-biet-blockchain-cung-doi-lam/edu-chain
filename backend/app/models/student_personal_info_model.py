from typing import Optional
from uuid import UUID
from datetime import datetime, date

from app.models.base import CustomBaseModel
from app.models.enums import GenderEnum, AcademicStatus

class StudentPersonalInfo(CustomBaseModel):
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    national_id_number: str
    ethnicity: Optional[str] = None
    religion: Optional[str] = None
    class_name: Optional[str] = None
    academic_status: AcademicStatus
    gender: GenderEnum
    created_at: Optional[datetime] = None