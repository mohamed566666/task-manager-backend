from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.core.security import decode_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )
    from app.repositories.user_repo import UserRepository

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


def get_current_admin_user(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges"
        )
    return current_user


@router.get("/check-email")
def check_email(email: str = Query(...), db: Session = Depends(get_db)):
    """Check if an email address is registered in the system."""
    from app.repositories.user_repo import UserRepository

    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email)
    return {"exists": user is not None}


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        user = auth_service.register(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        result = auth_service.login(user_credentials.email, user_credentials.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.request_password_reset(request.email)
    return {
        "message": "If an account with that email exists, a password reset OTP has been sent."
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        auth_service.verify_otp_and_reset_password(
            email=request.email, otp=request.otp, new_password=request.new_password
        )
        return {"message": "Password has been successfully reset."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db), current_user=Depends(get_current_admin_user)
):
    from app.models.user import User

    users = db.query(User).all()
    return users


@router.patch("/users/{user_id}/promote", response_model=UserResponse)
def promote_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    from app.models.user import User

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is already an admin"
        )
    user.role = "admin"
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/demote", response_model=UserResponse)
def demote_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    from app.models.user import User

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot demote yourself"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is not an admin"
        )
    user.role = "user"
    db.commit()
    db.refresh(user)
    return user
