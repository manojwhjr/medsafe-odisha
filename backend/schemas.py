
from pydantic import BaseModel, Field, ConfigDict


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    age: int = Field(ge=0, le=120)
    medical_conditions: str = ""
    allergies: str = ""


class PatientResponse(PatientCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
