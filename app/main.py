from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import User, Task, Category, Team
from app.api import auth, categories, tasks, teams

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    description="Task Management System",
    version="1.0.0",
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(teams.router, prefix="/api/teams", tags=["Teams"])


@app.get("/")
def root():
    return {"message": "Task Manager API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
