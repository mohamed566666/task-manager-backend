from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import User, Task, Category, Team
from app.api import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="Software Engineering Project - Task Management System",
    version="1.0.0",
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])


@app.get("/")
def root():
    return {"message": "Task Manager API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
