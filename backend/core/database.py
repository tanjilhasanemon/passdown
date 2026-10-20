from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine, create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool

from core.config import _default_sqlite_url, settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


def _create_sqlite_engine(db_url: str) -> Engine:
    sqlite_engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
    )

    @event.listens_for(sqlite_engine, "connect")
    def _set_sqlite_pragma(dbapi_connection: Any, _connection_record: Any) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return sqlite_engine


def _build_engine() -> Engine:
    db_url = settings.normalized_database_url
    if settings.is_sqlite:
        return _create_sqlite_engine(db_url)

    try:
        pg_engine = create_engine(
            db_url,
            poolclass=NullPool,
            connect_args={"prepare_threshold": None, "connect_timeout": 5},
        )
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return pg_engine
    except Exception as exc:
        print(f"[PassDown] PostgreSQL connection failed ({exc}); falling back to SQLite.")
        return _create_sqlite_engine(_default_sqlite_url())


engine = _build_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

_db_initialized = False


def init_db() -> None:
    """Import all ORM models, create tables, and seed initial MVP data if empty."""
    global _db_initialized
    if _db_initialized:
        return

    import models  # noqa: F401
    from scripts.seed_mvp import seed_mvp_data

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_mvp_data(session)
    _db_initialized = True


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session per request."""
    if not _db_initialized:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
