from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud import admin as admin_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import AdminSettingsPayload, RevenuePoint, TransactionPublic

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/settings", response_model=AdminSettingsPayload)
def get_settings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    row = admin_crud.get_settings(db)
    return AdminSettingsPayload(razorpay=row.razorpay, smtp=row.smtp, twilio=row.twilio)


@router.put("/settings", response_model=AdminSettingsPayload)
def put_settings(
    payload: AdminSettingsPayload,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    row = admin_crud.save_settings(
        db,
        razorpay=payload.razorpay.model_dump(),
        smtp=payload.smtp.model_dump(),
        twilio=payload.twilio.model_dump(),
    )
    return AdminSettingsPayload(razorpay=row.razorpay, smtp=row.smtp, twilio=row.twilio)


@router.get("/revenue", response_model=list[RevenuePoint])
def revenue(
    months: int = Query(default=6, ge=1, le=24),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_crud.revenue_series(db, months)


@router.get("/transactions", response_model=list[TransactionPublic])
def transactions(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_crud.list_transactions(db, limit)
