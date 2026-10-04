from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.crud import user as user_crud
from app.db.base_class import Base
from app.db.session import SessionLocal, engine
from app.seeds import seed_content
from app.services import storage

app = FastAPI(title="Illuminati Brotherhood API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def seed_admin():
    from app import models  # noqa: F401  (register tables for AUTO_CREATE_TABLES)

    # Uploaded e-book volumes live here, outside any statically served folder.
    storage.ensure_ebook_dirs()
    if settings.AUTO_CREATE_TABLES:
        # Dev-only shortcut for SQLite runs; MySQL/production uses Alembic.
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_crud.ensure_admin_seeded(db, email=settings.ADMIN_EMAIL, password=settings.ADMIN_PASSWORD)
        seed_content.run(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
