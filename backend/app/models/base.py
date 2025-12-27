from pydantic import BaseModel

class CustomBaseModel(BaseModel):
    class Config:
        from_attributes = True
        extra = "ignore"