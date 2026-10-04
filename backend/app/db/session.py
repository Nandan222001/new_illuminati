from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

_uri = settings.sqlalchemy_database_uri
if _uri.startswith("sqlite"):
    # Local/dev fallback (DATABASE_URL=sqlite:///./dev.db): a file-backed
    # SQLite DB is shared across FastAPI's worker threads.
    engine = create_engine(_uri, connect_args={"check_same_thread": False})
else:
    engine = create_engine(_uri, pool_pre_ping=True, pool_recycle=280)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
