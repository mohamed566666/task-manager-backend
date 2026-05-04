from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class StatusEnum(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    DONE = "done"


class PriorityEnum(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    deadline = Column(DateTime, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.MEDIUM)
    is_completed = Column(Boolean, default=False)
    status = Column(String(20), default="todo")
    category_label = Column(String(50), default="Work")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))

    owner = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    shared_with = relationship(
        "SharedTask", back_populates="task", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="task", cascade="all, delete-orphan",
        order_by="Comment.created_at"
    )
