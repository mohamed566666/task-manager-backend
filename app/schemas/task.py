from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    priority: PriorityEnum
    category_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    is_completed: Optional[bool] = None
    category_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
