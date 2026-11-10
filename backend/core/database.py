from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine, create_engine, event, inspect, text
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


def _ensure_beta_columns() -> None:
    """Ensure author_id columns exist on contribution and request tables when upgrading from MVP."""
    inspector = inspect(engine)
    for table_name in ("contribution", "request"):
        if not inspector.has_table(table_name):
            continue
        existing_cols = {col["name"] for col in inspector.get_columns(table_name)}
        if "author_id" not in existing_cols:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        f"ALTER TABLE {table_name} ADD COLUMN author_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL"
                    )
                )


def init_db() -> None:
    """Import all ORM models, create tables, migrate Beta columns, and seed initial data."""
    global _db_initialized
    if _db_initialized:
        return

    import models  # noqa: F401
    from scripts.seed_admin import seed_admin_user, seed_demo_student
    from scripts.seed_mvp import seed_mvp_data

    Base.metadata.create_all(bind=engine)
    _ensure_beta_columns()
    with SessionLocal() as session:
        seed_admin_user(session)
        seed_demo_student(session)
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
