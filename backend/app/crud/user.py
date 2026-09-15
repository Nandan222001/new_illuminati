import secrets
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import Role, User

INITIATION_FEE_INR = 999


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.strip().lower()))


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at)))


def _next_initiate_number(db: Session) -> int:
    current_max = db.scalar(select(func.max(User.initiate_number))) or 0
    return current_max + 1


def create_user(db: Session, *, name: str, email: str, password: str, role: Role = Role.MEMBER) -> User:
    email = email.strip().lower()
    if get_by_email(db, email):
        raise ValueError("An initiate with this email already exists.")

    user = User(
        name=name.strip(),
        email=email,
        password_hash=hash_password(password),
        role=role,
        initiate_number=_next_initiate_number(db),
        paid=role == Role.ADMIN,
        paid_at=datetime.now(timezone.utc) if role == Role.ADMIN else None,
        seal_id="IB-000" if role == Role.ADMIN else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, *, email: str, password: str) -> User:
    user = get_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password.")
    return user


def ensure_admin_seeded(db: Session, *, email: str, password: str) -> None:
    has_admin = db.scalar(select(func.count()).select_from(User).where(User.role == Role.ADMIN))
    if has_admin:
        return
    create_user(db, name="Grand Keeper", email=email, password=password, role=Role.ADMIN)


def seal_initiation(db: Session, user: User) -> User:
    if user.paid:
        return user
    user.paid = True
    user.paid_at = datetime.now(timezone.utc)
    user.seal_id = f"IB-{secrets.token_hex(3).upper()}"
    db.add(user)
    db.add(
        Transaction(
            user_id=user.id,
            amount=INITIATION_FEE_INR,
            note="Sealed content unlock",
            status=TransactionStatus.CAPTURED,
        )
    )
    db.commit()
    db.refresh(user)
    return user


def update_profile(db: Session, *, user: User, name: str) -> User:
    clean_name = name.strip()
    if len(clean_name) < 2:
        raise ValueError("Your name must be at least 2 characters.")
    user.name = clean_name
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def change_role(db: Session, *, target: User, role: Role, actor: User) -> User:
    if target.id == actor.id and role != Role.ADMIN:
        raise ValueError("You cannot lower your own rank.")
    if target.role == Role.ADMIN and role != Role.ADMIN:
        admin_count = db.scalar(select(func.count()).select_from(User).where(User.role == Role.ADMIN))
        if admin_count <= 1:
            raise ValueError("The Brotherhood must keep at least one Keeper.")
    target.role = role
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


def delete_user(db: Session, *, target: User, actor: User) -> None:
    if target.id == actor.id:
        raise ValueError("You cannot banish yourself.")
    if target.role == Role.ADMIN:
        admin_count = db.scalar(select(func.count()).select_from(User).where(User.role == Role.ADMIN))
        if admin_count <= 1:
            raise ValueError("The Brotherhood must keep at least one Keeper.")
    db.delete(target)
    db.commit()
