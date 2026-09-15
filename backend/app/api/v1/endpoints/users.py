from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import ChangeRoleRequest, UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserPublic])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return user_crud.list_users(db)


@router.patch("/{user_id}/role", response_model=UserPublic)
def change_role(
    user_id: int,
    payload: ChangeRoleRequest,
    db: Session = Depends(get_db),
    actor: User = Depends(require_admin),
):
    target = user_crud.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Initiate not found.")
    try:
        return user_crud.change_role(db, target=target, role=payload.role, actor=actor)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), actor: User = Depends(require_admin)):
    target = user_crud.get_by_id(db, user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Initiate not found.")
    try:
        user_crud.delete_user(db, target=target, actor=actor)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
