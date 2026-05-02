from sqlalchemy.orm import Session
from typing import List, Optional
from app.repositories.team_repo import (
    TeamRepository,
    TeamMemberRepository,
    TeamTaskRepository,
    SharedTaskRepository,
)
from app.factories.task_factory import TaskFactory
from app.schemas.team import (
    TeamCreate,
    TeamResponse,
    TeamMemberResponse,
    TeamTaskCreate,
    TeamTaskResponse,
    AddMemberRequest,
)
from app.models.team import TeamRoleEnum


class TeamService:
    def __init__(self, db: Session):
        self.team_repo = TeamRepository(db)
        self.member_repo = TeamMemberRepository(db)
        self.task_repo = TeamTaskRepository(db)
        self.shared_repo = SharedTaskRepository(db)

    def create_team(self, leader_id: int, team_data: TeamCreate) -> TeamResponse:
        team = self.team_repo.create(
            name=team_data.name,
            description=team_data.description,
            team_leader_id=leader_id,
        )

        self.member_repo.add_member(team.id, leader_id, TeamRoleEnum.LEADER)

        return TeamResponse(
            id=team.id,
            name=team.name,
            description=team.description,
            team_leader_id=team.team_leader_id,
            created_at=team.created_at,
        )

    def get_user_teams(self, user_id: int) -> List[TeamResponse]:
        teams = self.team_repo.get_user_teams(user_id)
        return [
            TeamResponse(
                id=t.id,
                name=t.name,
                description=t.description,
                team_leader_id=t.team_leader_id,
                created_at=t.created_at,
            )
            for t in teams
        ]

    def get_team_details(self, team_id: int, user_id: int) -> Optional[dict]:
        if not self.member_repo.is_member(team_id, user_id):
            raise ValueError("Not a member of this team")

        team = self.team_repo.get_by_id(team_id)
        if not team:
            raise ValueError("Team not found")

        members = self.member_repo.get_team_members(team_id)
        tasks = self.task_repo.get_team_tasks(team_id)

        return {
            "team": TeamResponse(
                id=team.id,
                name=team.name,
                description=team.description,
                team_leader_id=team.team_leader_id,
                created_at=team.created_at,
            ),
            "members": [
                TeamMemberResponse(
                    id=m.id,
                    team_id=m.team_id,
                    user_id=m.user_id,
                    role=m.role,
                    joined_at=m.joined_at,
                )
                for m in members
            ],
            "tasks": [
                TeamTaskResponse(
                    id=t.id,
                    title=t.title,
                    description=t.description,
                    deadline=t.deadline,
                    priority=t.priority.value if t.priority else "Medium",
                    assigned_to_id=t.assigned_to_id,
                    is_shared=t.is_shared,
                    team_id=t.team_id,
                    created_by_id=t.created_by_id,
                    is_completed=t.is_completed,
                    created_at=t.created_at,
                )
                for t in tasks
            ],
        }

    def add_member(
        self, team_id: int, leader_id: int, request: AddMemberRequest
    ) -> TeamMemberResponse:
        user_role = self.member_repo.get_user_role(team_id, leader_id)
        if user_role != TeamRoleEnum.LEADER:
            raise ValueError("Only team leader can add members")

        if self.member_repo.is_member(team_id, request.user_id):
            raise ValueError("User already in team")

        member = self.member_repo.add_member(team_id, request.user_id, request.role)

        return TeamMemberResponse(
            id=member.id,
            team_id=member.team_id,
            user_id=member.user_id,
            role=member.role,
            joined_at=member.joined_at,
        )

    def remove_member(self, team_id: int, leader_id: int, user_id: int) -> bool:
        user_role = self.member_repo.get_user_role(team_id, leader_id)
        if user_role != TeamRoleEnum.LEADER:
            raise ValueError("Only team leader can remove members")

        if leader_id == user_id:
            raise ValueError("Cannot remove team leader")

        return self.member_repo.remove_member(team_id, user_id)

    def get_team_members(self, team_id: int, user_id: int) -> List[TeamMemberResponse]:
        if not self.member_repo.is_member(team_id, user_id):
            raise ValueError("Not a member of this team")

        members = self.member_repo.get_team_members(team_id)
        return [
            TeamMemberResponse(
                id=m.id,
                team_id=m.team_id,
                user_id=m.user_id,
                role=m.role,
                joined_at=m.joined_at,
            )
            for m in members
        ]

    def create_team_task(
        self, team_id: int, created_by_id: int, task_data: TeamTaskCreate
    ) -> TeamTaskResponse:
        if not self.member_repo.is_member(team_id, created_by_id):
            raise ValueError("Not a member of this team")

        if task_data.assigned_to_id:
            if not self.member_repo.is_member(team_id, task_data.assigned_to_id):
                raise ValueError("Assigned user is not a team member")

        task = TaskFactory.create_team_task(
            title=task_data.title,
            description=task_data.description,
            deadline=task_data.deadline,
            priority=task_data.priority,
            team_id=team_id,
            created_by_id=created_by_id,
            assigned_to_id=task_data.assigned_to_id,
            is_shared=task_data.is_shared,
        )

        created = self.task_repo.create(**task.__dict__)

        if task_data.is_shared:
            members = self.member_repo.get_team_members(team_id)
            for member in members:
                self.shared_repo.share_task_with_user(
                    task_id=None,
                    team_task_id=created.id,
                    user_id=member.user_id,
                )

        return TeamTaskResponse(
            id=created.id,
            title=created.title,
            description=created.description,
            deadline=created.deadline,
            priority=created.priority.value if created.priority else "Medium",
            assigned_to_id=created.assigned_to_id,
            is_shared=created.is_shared,
            team_id=created.team_id,
            created_by_id=created.created_by_id,
            is_completed=created.is_completed,
            created_at=created.created_at,
        )

    def get_team_tasks(self, team_id: int, user_id: int) -> List[TeamTaskResponse]:
        if not self.member_repo.is_member(team_id, user_id):
            raise ValueError("Not a member of this team")

        tasks = self.task_repo.get_team_tasks(team_id)
        return [
            TeamTaskResponse(
                id=t.id,
                title=t.title,
                description=t.description,
                deadline=t.deadline,
                priority=t.priority.value if t.priority else "Medium",
                assigned_to_id=t.assigned_to_id,
                is_shared=t.is_shared,
                team_id=t.team_id,
                created_by_id=t.created_by_id,
                is_completed=t.is_completed,
                created_at=t.created_at,
            )
            for t in tasks
        ]

    def update_team_task(
        self, task_id: int, team_id: int, user_id: int, task_data: dict
    ) -> Optional[TeamTaskResponse]:
        if not self.member_repo.is_member(team_id, user_id):
            raise ValueError("Not a member of this team")

        task = self.task_repo.get_team_task_by_id(task_id, team_id)
        if not task:
            raise ValueError("Task not found")

        updated = self.task_repo.update(task_id, **task_data)

        if updated:
            return TeamTaskResponse(
                id=updated.id,
                title=updated.title,
                description=updated.description,
                deadline=updated.deadline,
                priority=updated.priority.value if updated.priority else "Medium",
                assigned_to_id=updated.assigned_to_id,
                is_shared=updated.is_shared,
                team_id=updated.team_id,
                created_by_id=updated.created_by_id,
                is_completed=updated.is_completed,
                created_at=updated.created_at,
            )
        return None

    def complete_team_task(
        self, task_id: int, team_id: int, user_id: int
    ) -> Optional[TeamTaskResponse]:
        task = self.task_repo.get_team_task_by_id(task_id, team_id)
        if not task:
            raise ValueError("Task not found")

        user_role = self.member_repo.get_user_role(team_id, user_id)
        if task.assigned_to_id != user_id and user_role != TeamRoleEnum.LEADER:
            raise ValueError("Not authorized to complete this task")

        updated = self.task_repo.update(task_id, is_completed=True)

        if updated:
            return TeamTaskResponse(
                id=updated.id,
                title=updated.title,
                description=updated.description,
                deadline=updated.deadline,
                priority=updated.priority.value if updated.priority else "Medium",
                assigned_to_id=updated.assigned_to_id,
                is_shared=updated.is_shared,
                team_id=updated.team_id,
                created_by_id=updated.created_by_id,
                is_completed=updated.is_completed,
                created_at=updated.created_at,
            )
        return None
