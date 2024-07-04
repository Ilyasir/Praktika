from sqlalchemy.orm import Session
from . import models, schemas

def get_vacancy_by_id(db: Session, vacancy_id: int):
    return db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()

def create_vacancy(db: Session, vacancy: schemas.VacancyCreate):
    db_vacancy = models.Vacancy(**vacancy)
    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy
