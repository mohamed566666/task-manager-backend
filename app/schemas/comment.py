from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    task_id: int
    author_id: int
    author_username: Optional[str] = None

    class Config:
        from_attributes = True
