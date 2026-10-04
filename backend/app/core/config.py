from functools import lru_cache
from pathlib import Path
from urllib.parse import quote

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — uploads default to a folder next to this file, never inside a web root.
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "ib_app"
    DB_PASSWORD: str = ""
    DB_NAME: str = "illuminati_brotherhood"

    # Optional full SQLAlchemy URL that overrides the DB_* fields above, e.g.
    # DATABASE_URL=sqlite:///./dev.db for a machine without MySQL. Leave empty in production.
    DATABASE_URL: str = ""
    # Dev convenience: create any missing tables on startup (no Alembic run needed).
    # Alembic remains the source of truth for MySQL/production.
    AUTO_CREATE_TABLES: bool = False

    JWT_SECRET_KEY: str = "insecure-dev-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    ADMIN_EMAIL: str = "admin@illuminati-brotherhood.org"
    ADMIN_PASSWORD: str = "GrandKeeper#2026"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Admin-uploaded e-book volumes (PDF/EPUB). Stored on local disk OUTSIDE any
    # static/web root and only ever served through the entitlement-checked
    # /api/v1/library/files/{key} endpoint in app/api/v1/endpoints/library.py.
    UPLOAD_DIR: str = "uploads"
    MAX_EBOOK_SIZE_MB: int = 100

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def uploads_root(self) -> Path:
        """Absolute path of the upload root (relative values resolve against backend/)."""
        configured = Path(self.UPLOAD_DIR).expanduser()
        return configured if configured.is_absolute() else (BACKEND_ROOT / configured)

    @property
    def ebooks_dir(self) -> Path:
        return self.uploads_root / "ebooks"

    @property
    def max_ebook_bytes(self) -> int:
        return max(1, int(self.MAX_EBOOK_SIZE_MB)) * 1024 * 1024

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.DATABASE_URL.strip():
            return self.DATABASE_URL.strip()
        # Credentials are percent-encoded so characters like "@" or "#" in a password don't break the URL.
        user = quote(self.DB_USER, safe="")
        password = quote(self.DB_PASSWORD, safe="")
        return f"mysql+pymysql://{user}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
