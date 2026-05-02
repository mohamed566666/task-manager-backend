from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.team import (
    TeamCreate,
    TeamResponse,
    TeamMemberResponse,
    TeamTaskCreate,
    TeamTaskResponse,
    AddMemberRequest,
)
from app.services.team_service import TeamService
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.create_team(current_user.id, team_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=List[TeamResponse])
def get_my_teams(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    service = TeamService(db)
    return service.get_user_teams(current_user.id)


@router.get("/{team_id}")
def get_team_details(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.get_team_details(team_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{team_id}/members", response_model=TeamMemberResponse)
def add_member(
    team_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.add_member(team_id, current_user.id, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        service.remove_member(team_id, current_user.id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
def get_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.get_team_members(team_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{team_id}/tasks", response_model=TeamTaskResponse)
def create_team_task(
    team_id: int,
    task_data: TeamTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.create_team_task(team_id, current_user.id, task_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{team_id}/tasks", response_model=List[TeamTaskResponse])
def get_team_tasks(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        return service.get_team_tasks(team_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{team_id}/tasks/{task_id}/complete", response_model=TeamTaskResponse)
def complete_team_task(
    team_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TeamService(db)
        task = service.complete_team_task(task_id, team_id, current_user.id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
            )
        return task
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
