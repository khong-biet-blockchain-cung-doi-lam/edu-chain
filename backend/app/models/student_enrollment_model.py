from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.base import CustomBaseModel

class StudentEnrollment(CustomBaseModel):
    id: Optional[UUID] = None
    student_id: UUID
    cohort_id: Optional[str] = None
    curriculum_id: Optional[str] = None
    advisor_id: Optional[str] = None
    created_at: Optional[datetime] = None