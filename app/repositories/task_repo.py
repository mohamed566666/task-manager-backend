from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.repositories.base_repo import BaseRepository
from app.models.task import Task, PriorityEnum


class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(db, Task)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.owner_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_category(self, user_id: int, category_id: int) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.owner_id == user_id, Task.category_id == category_id)
            .all()
        )

    def get_by_priority(self, user_id: int, priority: PriorityEnum) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.owner_id == user_id, Task.priority == priority)
            .all()
        )

    def get_upcoming_deadlines(self, user_id: int, days: int = 7) -> List[Task]:
        now = datetime.utcnow()
        future = now + timedelta(days=days)
        return (
            self.db.query(Task)
            .filter(
                Task.owner_id == user_id,
                Task.deadline.between(now, future),
                Task.is_completed == False,
            )
            .order_by(Task.deadline)
            .all()
        )

    def get_completed_tasks(self, user_id: int) -> List[Task]:
        return (
            self.db.query(Task)
            .filter(Task.owner_id == user_id, Task.is_completed == True)
            .all()
        )
