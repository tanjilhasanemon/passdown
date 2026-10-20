from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool

from core.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


def _build_engine() -> Engine:
    db_url = settings.normalized_database_url
    if settings.is_sqlite:
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
        )

        @event.listens_for(engine, "connect")
        def _set_sqlite_pragma(dbapi_connection: Any, _connection_record: Any) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        return engine

    # Supabase PostgreSQL transaction pooler compatibility for Vercel serverless (TDD §9.2)
    return create_engine(
        db_url,
        poolclass=NullPool,
        connect_args={"prepare_threshold": None},
    )


engine = _build_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create database tables registered on Base.metadata."""
    Base.metadata.create_all(bind=engine)