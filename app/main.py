from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import and_, asc, desc
import requests
from datetime import datetime
from typing import Optional, List
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.post("/fetch_vacancies")
def fetch_vacancies(specialization: str, db: Session = Depends(get_db)):
    url = "https://api.hh.ru/vacancies"
    params = {"text": specialization, "per_page": 100, "page": 0}

    while True:
        response = requests.get(url, params=params)
        data = response.json()
        if "items" not in data:
            break

        for item in data["items"]:
            if not crud.get_vacancy_by_id(db, item["id"]):
                vacancy_data = {
                    "id": item["id"],
                    "name": item["name"],
                    "employer_name": item["employer"]["name"],
                    "salary_from": item["salary"]["from"] if item["salary"] else None,
                    "salary_to": item["salary"]["to"] if item["salary"] else None,
                    "currency": item["salary"]["currency"] if item["salary"] else None,
                    "specialization": specialization,
                    "published_at": datetime.strptime(item["published_at"], "%Y-%m-%dT%H:%M:%S%z")
                }
                crud.create_vacancy(db=db, vacancy=vacancy_data)

        if params["page"] >= data["pages"] - 1:
            break
        params["page"] += 1

    return {"status": "Vacancies fetched successfully"}

@app.get("/vacancies", response_model=schemas.VacanciesResponse)
def get_vacancies(
    specialization: Optional[str] = None,
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
    min_salary: Optional[int] = Query(None),
    max_salary: Optional[int] = Query(None),
    currency: Optional[str] = Query(None),
    sort_by_salary: Optional[str] = Query(None),
    search_name: Optional[str] = Query(None),
):
    query = db.query(models.Vacancy)

    if specialization:
        query = query.filter(models.Vacancy.specialization == specialization)
    if min_salary is not None:
        query = query.filter(models.Vacancy.salary_from >= min_salary)
    if max_salary is not None:
        query = query.filter(models.Vacancy.salary_to <= max_salary)
    if currency:
        query = query.filter(models.Vacancy.currency == currency)
    if search_name:
        query = query.filter(models.Vacancy.name.ilike(f"%{search_name}%"))
    if sort_by_salary:
        if sort_by_salary.lower() == "asc":
            query = query.order_by(asc(models.Vacancy.salary_from))
        elif sort_by_salary.lower() == "desc":
            query = query.order_by(desc(models.Vacancy.salary_from))

    total_vacancies = query.count()
    vacancies = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total_vacancies,
        "page": page,
        "page_size": page_size,
        "vacancies": vacancies,
    }

@app.get("/specializations")
def get_specializations(query: str):
    url = "https://api.hh.ru/specializations"
    response = requests.get(url)
    data = response.json()

    specializations = []
    for item in data:
        for sub_item in item["specializations"]:
            if query.lower() in sub_item["name"].lower():
                specializations.append(sub_item["name"])

    return specializations

@app.post("/clear_database")
def clear_database(db: Session = Depends(get_db)):
    db.query(models.Vacancy).delete()
    db.commit()
    return {"status": "Database cleared successfully"}
