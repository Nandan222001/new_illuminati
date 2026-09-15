from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, RegisterRequest, TokenResponse, UpdateProfileRequest, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = user_crud.create_user(db, name=payload.name, email=payload.email, password=payload.password)
    except ValueError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = user_crud.authenticate(db, email=payload.email, password=payload.password)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserPublic)
def update_me(payload: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return user_crud.update_profile(db, user=user, name=payload.name)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/initiate", response_model=UserPublic)
def initiate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Seal the (simulated) ₹999 initiation fee for the current member."""
    return user_crud.seal_initiation(db, user)
