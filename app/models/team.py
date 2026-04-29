from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base
from app.models.task import PriorityEnum 


class TeamRoleEnum(str, enum.Enum):
    LEADER = "Leader"
    MEMBER = "Member"


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    team_leader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    team_leader = relationship("User", back_populates="owned_teams")
    members = relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan"
    )
    tasks = relationship(
        "TeamTask", back_populates="team", cascade="all, delete-orphan"
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(Enum(TeamRoleEnum), default=TeamRoleEnum.MEMBER)
    joined_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")


class TeamTask(Base):
    __tablename__ = "team_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    deadline = Column(DateTime, nullable=False)
    priority = Column(
        Enum(PriorityEnum), default=PriorityEnum.MEDIUM
    )
    is_completed = Column(Boolean, default=False)
    is_shared = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    team = relationship("Team", back_populates="tasks")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    shared_assignments = relationship(
        "SharedTask", back_populates="team_task", cascade="all, delete-orphan"
    )


class SharedTask(Base):
    __tablename__ = "shared_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)
    team_task_id = Column(
        Integer, ForeignKey("team_tasks.id", ondelete="CASCADE"), nullable=True
    )
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    shared_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="shared_with")
    team_task = relationship("TeamTask", back_populates="shared_assignments")
    user = relationship("User")
