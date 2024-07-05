from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from typing import List

class VacancyBase(BaseModel):
    id: str
    name: str
    employer_name: str
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    currency: Optional[str] = None
    specialization: str
    published_at: datetime

class VacancyCreate(VacancyBase):
    pass

class Vacancy(VacancyBase):
    class Config:
        orm_mode = True

class VacanciesResponse(BaseModel):
    total: int
    page: int
    page_size: int
    vacancies: List[Vacancy]
