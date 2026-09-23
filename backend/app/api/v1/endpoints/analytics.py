from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud import analytics as crud
from app.db.session import get_db
from app.models.analytics import EventKind

router = APIRouter(prefix="/analytics", tags=["analytics"])


class TrackRequest(BaseModel):
    kind: EventKind
    path: str | None = Field(default=None, max_length=255)
    device_id: str | None = Field(default=None, max_length=64)
    reason: str | None = Field(default=None, max_length=255)


@router.post("/track", status_code=204)
def track(payload: TrackRequest, db: Session = Depends(get_db)):
    """Public, fire-and-forget beacon from the frontend."""
    crud.record_event(db, kind=payload.kind, path=payload.path, device_id=payload.device_id, reason=payload.reason)
    return Response(status_code=204)


@router.get("/summary")
def summary(user=Depends(require_admin), db: Session = Depends(get_db)):
    return crud.summary(db)
