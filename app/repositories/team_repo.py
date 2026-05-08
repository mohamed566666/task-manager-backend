from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.repositories.base_repo import BaseRepository
from app.models.team import Team, TeamMember, TeamTask, SharedTask, TeamRoleEnum


class TeamRepository(BaseRepository[Team]):
    def __init__(self, db: Session):
        super().__init__(db, Team)

    def get_by_leader(self, leader_id: int) -> List[Team]:
        return self.db.query(Team).filter(Team.team_leader_id == leader_id).all()

    def get_user_teams(self, user_id: int) -> List[Team]:
        return (
            self.db.query(Team)
            .join(TeamMember)
            .filter(TeamMember.user_id == user_id)
            .all()
        )

    def get_team_with_members(self, team_id: int) -> Optional[Team]:
        return self.db.query(Team).filter(Team.id == team_id).first()


class TeamMemberRepository(BaseRepository[TeamMember]):
    def __init__(self, db: Session):
        super().__init__(db, TeamMember)

    def get_team_members(self, team_id: int) -> List[TeamMember]:
        return self.db.query(TeamMember).filter(TeamMember.team_id == team_id).all()

    def get_user_role(self, team_id: int, user_id: int) -> Optional[TeamRoleEnum]:
        member = (
            self.db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
            .first()
        )
        return member.role if member else None

    def is_member(self, team_id: int, user_id: int) -> bool:
        return (
            self.db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
            .first()
            is not None
        )

    def add_member(
        self, team_id: int, user_id: int, role: TeamRoleEnum = TeamRoleEnum.MEMBER
    ) -> TeamMember:
        return self.create(team_id=team_id, user_id=user_id, role=role)

    def remove_member(self, team_id: int, user_id: int) -> bool:
        member = (
            self.db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
            .first()
        )
        if member:
            self.delete(member.id)
            return True
        return False


class TeamTaskRepository(BaseRepository[TeamTask]):
    def __init__(self, db: Session):
        super().__init__(db, TeamTask)

    def get_team_tasks(self, team_id: int) -> List[TeamTask]:
        return self.db.query(TeamTask).filter(TeamTask.team_id == team_id).all()

    def get_user_tasks(self, user_id: int) -> List[TeamTask]:
        return (
            self.db.query(TeamTask)
            .filter(
                or_(
                    TeamTask.assigned_to_id == user_id,
                    TeamTask.created_by_id == user_id,
                )
            )
            .all()
        )

    def get_team_task_by_id(self, task_id: int, team_id: int) -> Optional[TeamTask]:
        return (
            self.db.query(TeamTask)
            .filter(TeamTask.id == task_id, TeamTask.team_id == team_id)
            .first()
        )


class SharedTaskRepository(BaseRepository[SharedTask]):
    def __init__(self, db: Session):
        super().__init__(db, SharedTask)

    def share_task_with_user(
        self, task_id: int, user_id: int, team_task_id: int = None
    ) -> SharedTask:
        return self.create(task_id=task_id, team_task_id=team_task_id, user_id=user_id)

    def get_shared_tasks_for_user(self, user_id: int) -> List[SharedTask]:
        return self.db.query(SharedTask).filter(SharedTask.user_id == user_id).all()
