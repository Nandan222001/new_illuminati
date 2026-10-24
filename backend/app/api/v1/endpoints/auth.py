from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
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
    user = user_crud.claim_pending_payment(db, user)
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
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_crud.claim_pending_payment(db, user)


@router.patch("/me", response_model=UserPublic)
def update_me(payload: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return user_crud.update_profile(db, user=user, name=payload.name)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/initiate", response_model=UserPublic)
def initiate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Simulated payment — disabled unless ALLOW_SIMULATED_PAYMENT is set; real payments arrive via the Razorpay webhook."""
    if not settings.ALLOW_SIMULATED_PAYMENT:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Payment is completed through the checkout; it cannot be marked paid here.")
    return user_crud.seal_initiation(db, user)
