from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class TeamRoleEnum(str, Enum):
    LEADER = "Leader"
    MEMBER = "Member"


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None


class TeamCreate(TeamBase):
    pass


class TeamResponse(TeamBase):
    id: int
    team_leader_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TeamMemberBase(BaseModel):
    user_id: int
    role: TeamRoleEnum


class TeamMemberResponse(TeamMemberBase):
    id: int
    team_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


class TeamTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    priority: str  # High, Medium, Low
    assigned_to_id: Optional[int] = None
    is_shared: bool = False


class TeamTaskCreate(TeamTaskBase):
    pass


class TeamTaskResponse(TeamTaskBase):
    id: int
    team_id: int
    created_by_id: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    user_id: int
    role: TeamRoleEnum = TeamRoleEnum.MEMBER
