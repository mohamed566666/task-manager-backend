from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.task_service import TaskService
from app.models.user import User
from app.api.auth import get_current_user, get_current_admin_user

router = APIRouter()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TaskService(db)
        return service.create_task(current_user.id, task_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/all", response_model=List[TaskResponse])
def get_all_tasks_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin-only: returns tasks from ALL users."""
    from app.models.task import Task
    return db.query(Task).order_by(Task.created_at.desc()).all()


@router.get("/", response_model=List[TaskResponse])
def get_my_tasks(
    sort_by: Optional[str] = Query("priority", regex="^(priority|deadline|created)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TaskService(db)
    return service.get_user_tasks_sorted(current_user.id, sort_by)


@router.get("/upcoming", response_model=List[TaskResponse])
def get_upcoming_tasks(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TaskService(db)
    return service.get_upcoming_tasks(current_user.id, days)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.task import Task
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    # Only owner or admin can edit
    if current_user.role != "admin" and task.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this task")
    # Apply updates
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    from app.services.task_service import TaskService
    service = TaskService(db)
    return service._task_to_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TaskService(db)
        from app.models.task import Task
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        # Admin can delete any task; user can only delete their own
        if current_user.role != "admin" and task.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        db.delete(task)
        db.commit()
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service = TaskService(db)
        task = service.complete_task(task_id, current_user.id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


# ── Comments ────────────────────────────────────────────────────────────────

@router.get("/{task_id}/comments", response_model=List[CommentResponse])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all comments for a task."""
    from app.models.task import Task
    from app.models.comment import Comment
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    comments = db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.created_at).all()
    result = []
    for c in comments:
        result.append(CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            task_id=c.task_id,
            author_id=c.author_id,
            author_username=c.author.username if c.author else "Unknown",
        ))
    return result


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    task_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a comment to a task."""
    from app.models.task import Task
    from app.models.comment import Comment
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if not comment_data.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment cannot be empty")
    comment = Comment(
        content=comment_data.content.strip(),
        task_id=task_id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        task_id=comment.task_id,
        author_id=comment.author_id,
        author_username=current_user.username,
    )
