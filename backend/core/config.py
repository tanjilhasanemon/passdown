import os
import re
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent


def _default_sqlite_url() -> str:
    if os.environ.get("VERCEL") or not os.access(BACKEND_DIR, os.W_OK):
        return "sqlite:////tmp/passdown.db"
    return f"sqlite:///{BACKEND_DIR / 'passdown.db'}"


class Settings(BaseSettings):
    app_name: str = "PassDown API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    database_url: str = _default_sqlite_url()
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), str(ROOT_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def normalized_database_url(self) -> str:
        raw = self.database_url.strip()

        # If a multi-line .env snippet was pasted into Vercel, extract the URL line
        for line in raw.splitlines():
            cleaned = line.strip()
            if not cleaned or cleaned.startswith("#"):
                continue
            cleaned = re.sub(r"^[A-Z0-9_]+\s*=\s*", "", cleaned)
            cleaned = cleaned.strip("\"' ")
            if "postgres" in cleaned or "sqlite" in cleaned:
                raw = cleaned
                break

        raw = raw.strip("\"' ")
        if not raw or "[YOUR-PASSWORD]" in raw:
            return _default_sqlite_url()

        if raw.startswith("postgres://"):
            raw = raw.replace("postgres://", "postgresql+psycopg://", 1)
        elif raw.startswith("postgresql://") and "+psycopg" not in raw:
            raw = raw.replace("postgresql://", "postgresql+psycopg://", 1)

        # Strip Prisma-only query parameters like ?pgbouncer=true that break psycopg
        if raw.startswith("postgresql"):
            parts = urlsplit(raw)
            filtered_query = [
                (k, v)
                for k, v in parse_qsl(parts.query)
                if k.lower() not in {"pgbouncer", "connection_limit"}
            ]
            raw = urlunsplit(
                (
                    parts.scheme,
                    parts.netloc,
                    parts.path,
                    urlencode(filtered_query),
                    parts.fragment,
                )
            )

        return raw

    @property
    def is_sqlite(self) -> bool:
        return self.normalized_database_url.startswith("sqlite")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
