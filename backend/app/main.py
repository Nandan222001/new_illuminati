from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.crud import user as user_crud
from app.db.session import SessionLocal
from app.seeds import seed_content

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
    db = SessionLocal()
    try:
        user_crud.ensure_admin_seeded(db, email=settings.ADMIN_EMAIL, password=settings.ADMIN_PASSWORD)
        seed_content.run(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
