# app/main.py
from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="Audio Screening & Validation Microservice",
    description="Quality Gate microservice evaluating incoming streams for ERR-01 to ERR-04.",
    version="1.0.0"
)

app.include_router(router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy"}