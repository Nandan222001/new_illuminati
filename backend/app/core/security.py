from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None


STREAM_TOKEN_HOURS = 6


def create_stream_token(video_id: int) -> str:
    """Short-lived token a <video> tag can carry in its URL (it cannot send a bearer header)."""
    expire = datetime.now(timezone.utc) + timedelta(hours=STREAM_TOKEN_HOURS)
    return jwt.encode({"vid": video_id, "scope": "video", "exp": expire}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def stream_token_matches(token: str, video_id: int) -> bool:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("scope") == "video" and int(payload.get("vid", -1)) == video_id
    except (JWTError, ValueError, TypeError):
        return False


STORE_TOKEN_HOURS = 24


def create_store_download_token(payment_id: str, book_id: int) -> str:
    """Short-lived link a buyer can use to download the volume they just paid for.

    The /book page sells to visitors with no account, so there is no bearer
    token to check: the signed payment id in the URL is the entitlement, and the
    endpoint re-checks that the payment is still captured on every request.
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=STORE_TOKEN_HOURS)
    return jwt.encode(
        {"scope": "store", "pid": str(payment_id), "bid": int(book_id), "exp": expire},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def store_download_token_claims(token: str) -> tuple[str, int] | None:
    """(`payment_id`, `book_id`) for a valid download token, else None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("scope") != "store":
            return None
        return str(payload["pid"]), int(payload["bid"])
    except (JWTError, KeyError, ValueError, TypeError):
        return None
