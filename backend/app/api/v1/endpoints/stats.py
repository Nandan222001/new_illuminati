from fastapi import APIRouter, Depends, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.crud import admin as admin_crud
from app.db.session import get_db
from app.models.user import Role, User
from app.schemas.admin import PublicSettingsPayload
from app.schemas.stats import PublicStats

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/settings", response_model=PublicSettingsPayload)
def public_settings(response: Response, db: Session = Depends(get_db)) -> PublicSettingsPayload:
    """The Keeper's social links, so public pages can render correct profiles."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    row = admin_crud.get_settings(db)
    return PublicSettingsPayload(social=row.social or {})


@router.get("/stats", response_model=PublicStats)
def public_stats(response: Response, db: Session = Depends(get_db)) -> PublicStats:
    """Return an anonymous aggregate only; no member-level data is exposed."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    total = db.scalar(select(func.count(User.id)).where(User.role == Role.MEMBER)) or 0
    return PublicStats(members_joined=total)
