from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.community import CommunityMessage, CommunityThread, ThreadStatus
from app.models.user import Role, User


def serialize_thread(thread: CommunityThread) -> dict:
    messages = sorted(thread.messages, key=lambda m: m.created_at)
    return {
        "id": thread.id,
        "subject": thread.subject,
        "userId": thread.user_id,
        "userEmail": thread.user.email if thread.user else None,
        "userName": thread.user.name if thread.user else "Initiate",
        "status": thread.status.value if hasattr(thread.status, "value") else str(thread.status),
        "createdAt": thread.created_at,
        "updatedAt": messages[-1].created_at if messages else thread.created_at,
        "messages": [
            {
                "id": message.id,
                "author": (message.author.name if message.author else "Deleted initiate"),
                "role": "admin" if message.author and message.author.role == Role.ADMIN else "member",
                "body": message.body,
                "at": message.created_at,
            }
            for message in messages
        ],
    }


def list_threads(db: Session, *, user: User) -> list[dict]:
    """
    A Keeper sees every thread; an initiate only ever sees the threads they
    opened. Filtering happens here (server side), so a modified client cannot
    request someone else's thread list.
    """
    stmt = select(CommunityThread).order_by(CommunityThread.updated_at.desc())
    if user.role != Role.ADMIN:
        stmt = stmt.where(CommunityThread.user_id == user.id)
    return [serialize_thread(thread) for thread in db.scalars(stmt).unique()]


def get_thread(db: Session, thread_id: int) -> CommunityThread | None:
    return db.get(CommunityThread, thread_id)


def can_read(thread: CommunityThread, user: User) -> bool:
    """Only the author and Keepers may read a thread — never a third member."""
    return user.role == Role.ADMIN or thread.user_id == user.id


def create_thread(db: Session, *, user: User, subject: str | None, body: str) -> dict:
    thread = CommunityThread(user_id=user.id, subject=(subject or None), status=ThreadStatus.OPEN)
    db.add(thread)
    db.flush()
    db.add(CommunityMessage(thread_id=thread.id, author_id=user.id, body=body))
    db.commit()
    db.refresh(thread)
    return serialize_thread(thread)


def add_message(db: Session, *, thread: CommunityThread, author: User, body: str) -> dict:
    db.add(CommunityMessage(thread_id=thread.id, author_id=author.id, body=body))
    if author.role == Role.ADMIN:
        thread.status = ThreadStatus.ANSWERED
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return serialize_thread(thread)


def set_status(db: Session, *, thread: CommunityThread, status: ThreadStatus) -> dict:
    thread.status = status
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return serialize_thread(thread)
