import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User
from app.schemas import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from app.security import hash_password, verify_password, create_access_token
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check duplicate email
    normalized_email = payload.email.lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    # Register as student only
    new_user = User(
        full_name=payload.full_name,
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role="student",
        created_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = datetime.timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "email": user.email},
        expires_delta=expires_delta,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
