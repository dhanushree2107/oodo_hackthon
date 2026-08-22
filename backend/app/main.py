from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed_data import seed_database
from app.routers import (
    auth_router,
    dashboard_router,
    employee_router,
    attendance_router,
    leave_router,
    payroll_router,
    insights_router,
    notifications_router
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dayflow Enterprise - AI-Powered Workforce Operations & Early-Warning Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "tagline": "Every workday, perfectly aligned."
    }

app.include_router(auth_router.router)
app.include_router(dashboard_router.router)
app.include_router(employee_router.router)
app.include_router(attendance_router.router)
app.include_router(leave_router.router)
app.include_router(payroll_router.router)
app.include_router(insights_router.router)
app.include_router(notifications_router.router)
