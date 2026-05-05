from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class StatusEnum(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    DONE = "done"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    priority: PriorityEnum
    category_id: Optional[int] = None
    status: Optional[StatusEnum] = StatusEnum.TODO
    category_label: Optional[str] = "Work"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    is_completed: Optional[bool] = None
    category_id: Optional[int] = None
    status: Optional[StatusEnum] = None
    category_label: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    deadline: datetime
    priority: PriorityEnum
    is_completed: bool
    status: Optional[str] = "todo"
    category_label: Optional[str] = "Work"
    created_at: datetime
    updated_at: datetime
    owner_id: int
    comments_count: Optional[int] = 0

    class Config:
        from_attributes = True
