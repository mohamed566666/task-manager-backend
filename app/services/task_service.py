from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.repositories.task_repo import TaskRepository
from app.factories.task_factory import TaskFactory
from app.services.sorting_strategy import (
    TaskSorter,
    SortByPriorityStrategy,
    SortByDeadlineStrategy,
)
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, PriorityEnum


class TaskService:
    def __init__(self, db: Session):
        self.task_repo = TaskRepository(db)
        self.sorter = TaskSorter()

    def _task_to_response(self, task) -> TaskResponse:
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            deadline=task.deadline,
            priority=task.priority,
            is_completed=task.is_completed,
            status=getattr(task, 'status', None) or ('done' if task.is_completed else 'todo'),
            category_label=getattr(task, 'category_label', 'Work') or 'Work',
            created_at=task.created_at,
            updated_at=task.updated_at,
            owner_id=task.owner_id,
            comments_count=len(task.comments) if getattr(task, 'comments', None) is not None else 0,
        )

    def create_task(self, user_id: int, task_data: TaskCreate) -> TaskResponse:
        task = TaskFactory.create_personal_task(
            title=task_data.title,
            description=task_data.description,
            deadline=task_data.deadline,
            priority=task_data.priority,
            owner_id=user_id,
            category_id=task_data.category_id,
            status=task_data.status.value if task_data.status else 'todo',
            category_label=task_data.category_label or 'Work',
        )

        # Remove SQLAlchemy internal keys before passing to repo
        task_dict = {k: v for k, v in task.__dict__.items() if not k.startswith('_')}
        created = self.task_repo.create(**task_dict)

        return self._task_to_response(created)

    def get_user_tasks_sorted(
        self, user_id: int, sort_by: str = "priority"
    ) -> List[TaskResponse]:
        tasks = self.task_repo.get_by_user(user_id)

        if sort_by == "priority":
            self.sorter.set_strategy(SortByPriorityStrategy())
        elif sort_by == "deadline":
            self.sorter.set_strategy(SortByDeadlineStrategy())

        task_dicts = [self._task_to_dict(t) for t in tasks]
        sorted_tasks = self.sorter.sort_tasks(task_dicts)
        return [self._dict_to_task_response(t) for t in sorted_tasks]

    def get_upcoming_tasks(self, user_id: int, days: int = 7) -> List[TaskResponse]:
        tasks = self.task_repo.get_upcoming_deadlines(user_id, days)
        return [self._task_to_response(t) for t in tasks]

    def update_task(
        self, task_id: int, task_data: TaskUpdate, user_id: int
    ) -> Optional[TaskResponse]:
        task = self.task_repo.get_by_id(task_id)
        if not task or task.owner_id != user_id:
            raise ValueError("Task not found or unauthorized")

        updated = self.task_repo.update(task_id, **task_data.dict(exclude_unset=True))
        return self._task_to_response(updated) if updated else None

    def delete_task(self, task_id: int, user_id: int) -> bool:
        task = self.task_repo.get_by_id(task_id)
        if not task or task.owner_id != user_id:
            raise ValueError("Task not found or unauthorized")
        return self.task_repo.delete(task_id)

    def complete_task(self, task_id: int, user_id: int) -> Optional[TaskResponse]:
        task = self.task_repo.get_by_id(task_id)
        if not task or task.owner_id != user_id:
            raise ValueError("Task not found or unauthorized")
        updated = self.task_repo.update(task_id, is_completed=True, status='done')
        return self._task_to_response(updated) if updated else None

    def _task_to_dict(self, task) -> Dict[str, Any]:
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "deadline": task.deadline,
            "priority": task.priority.value if task.priority else "Medium",
            "is_completed": task.is_completed,
            "status": getattr(task, 'status', None) or ('done' if task.is_completed else 'todo'),
            "category_label": getattr(task, 'category_label', 'Work') or 'Work',
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "owner_id": task.owner_id,
            "comments_count": len(task.comments) if getattr(task, 'comments', None) is not None else 0,
        }

    def _dict_to_task_response(self, task_dict: Dict[str, Any]) -> TaskResponse:
        return TaskResponse(**task_dict)
