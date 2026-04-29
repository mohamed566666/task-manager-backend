from app.core.database import engine, Base
from app.models.user import User
from app.models.category import Category
from app.models.task import Task
from app.models.team import Team, TeamMember, TeamTask, SharedTask


def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_database()
