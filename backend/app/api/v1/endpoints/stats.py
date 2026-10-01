from fastapi import APIRouter, Depends, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import Role, User
from app.schemas.stats import PublicStats

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/stats", response_model=PublicStats)
def public_stats(response: Response, db: Session = Depends(get_db)) -> PublicStats:
    """Return an anonymous aggregate only; no member-level data is exposed."""
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    total = db.scalar(select(func.count(User.id)).where(User.role == Role.MEMBER)) or 0
    return PublicStats(members_joined=total)
