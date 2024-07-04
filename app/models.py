from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base

class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    employer_name = Column(String)
    salary_from = Column(Float)
    salary_to = Column(Float)
    currency = Column(String)
    region = Column(String)
    specialization = Column(String)
    published_at = Column(DateTime, index=True)
