from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.crud import community as community_crud
from app.db.session import get_db
from app.models.community import ThreadStatus
from app.models.user import User
from app.schemas.community import MessageCreate, ThreadCreate, ThreadPublic, ThreadStatusUpdate

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/threads", response_model=list[ThreadPublic])
def list_threads(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Own threads for an initiate, every thread for a Keeper."""
    return community_crud.list_threads(db, user=user)


@router.post("/threads", response_model=ThreadPublic, status_code=status.HTTP_201_CREATED)
def create_thread(
    payload: ThreadCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return community_crud.create_thread(db, user=user, subject=payload.subject, body=payload.body)


@router.get("/threads/{thread_id}", response_model=ThreadPublic)
def get_thread(thread_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    thread = community_crud.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Thread not found.")
    # A member who is not the author gets 404, not 403: the thread's very
    # existence must not leak to a third party.
    if not community_crud.can_read(thread, user):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Thread not found.")
    return community_crud.serialize_thread(thread)


@router.post("/threads/{thread_id}/messages", response_model=ThreadPublic)
def add_message(
    thread_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = community_crud.get_thread(db, thread_id)
    if not thread or not community_crud.can_read(thread, user):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Thread not found.")
    return community_crud.add_message(db, thread=thread, author=user, body=payload.body)


@router.patch("/threads/{thread_id}/status", response_model=ThreadPublic)
def set_status(
    thread_id: int,
    payload: ThreadStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    thread = community_crud.get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Thread not found.")
    return community_crud.set_status(db, thread=thread, status=ThreadStatus(payload.status))
