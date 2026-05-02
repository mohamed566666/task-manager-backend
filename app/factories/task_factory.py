from datetime import datetime
from typing import Optional
from app.models.task import Task, PriorityEnum
from app.models.team import TeamTask


class TaskFactory:
    @staticmethod
    def create_personal_task(
        title: str,
        description: str,
        deadline: datetime,
        priority: PriorityEnum,
        owner_id: int,
        category_id: Optional[int] = None,
    ) -> Task:
        return Task(
            title=title,
            description=description,
            deadline=deadline,
            priority=priority,
            owner_id=owner_id,
            category_id=category_id,
        )

    @staticmethod
    def create_team_task(
        title: str,
        description: str,
        deadline: datetime,
        priority: PriorityEnum,
        team_id: int,
        created_by_id: int,
        assigned_to_id: Optional[int] = None,
        is_shared: bool = False,
    ) -> TeamTask:
        return TeamTask(
            title=title,
            description=description,
            deadline=deadline,
            priority=priority,
            team_id=team_id,
            created_by_id=created_by_id,
            assigned_to_id=assigned_to_id,
            is_shared=is_shared,
        )
