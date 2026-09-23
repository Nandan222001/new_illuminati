from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from app.models.analytics import AnalyticsEvent, EventKind


def record_event(db, *, kind: EventKind, path: str | None, device_id: str | None, reason: str | None) -> None:
    db.add(AnalyticsEvent(kind=kind, path=(path or None)[:255] if path else None, device_id=device_id, reason=(reason or None)[:255] if reason else None))
    db.commit()


def summary(db) -> dict:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    totals = {}
    for kind in EventKind:
        totals[kind.value] = db.scalar(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.kind == kind, AnalyticsEvent.created_at >= week_ago
            )
        ) or 0

    visits_total = db.scalar(select(func.count(AnalyticsEvent.id)).where(AnalyticsEvent.kind == EventKind.VISIT)) or 0
    unique_7d = db.scalar(
        select(func.count(func.distinct(AnalyticsEvent.device_id))).where(
            AnalyticsEvent.kind == EventKind.VISIT, AnalyticsEvent.created_at >= week_ago
        )
    ) or 0

    days = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        end = start + timedelta(days=1)
        n = db.scalar(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.kind == EventKind.VISIT,
                AnalyticsEvent.created_at >= start,
                AnalyticsEvent.created_at < end,
            )
        ) or 0
        days.append({"label": day.strftime("%a"), "visits": n})

    recent_failed = db.scalars(
        select(AnalyticsEvent)
        .where(AnalyticsEvent.kind == EventKind.PAYMENT_FAILED)
        .order_by(AnalyticsEvent.created_at.desc())
        .limit(5)
    ).all()

    return {
        "visits_total": visits_total,
        "visits_7d": totals[EventKind.VISIT.value],
        "unique_7d": unique_7d,
        "payment_success": totals[EventKind.PAYMENT_SUCCESS.value],
        "payment_failed": totals[EventKind.PAYMENT_FAILED.value],
        "days": days,
        "recent_failed": [
            {"at": e.created_at.strftime("%d %b, %H:%M"), "reason": e.reason or "unknown"}
            for e in recent_failed
        ],
    }
