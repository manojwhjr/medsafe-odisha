
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import engine, Base, get_db
from backend import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedSafe Odisha API",
    description="Medication reconciliation and polypharmacy risk detection",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MedSafe Odisha API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/patients", response_model=schemas.PatientResponse)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = models.Patient(**patient.model_dump())

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@app.get("/api/patients", response_model=list[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()


@app.get("/api/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return patient
