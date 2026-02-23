"""Async PostgreSQL database setup via SQLAlchemy + asyncpg (Neon)."""
import os
import re

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "")

if _raw_url.startswith("postgresql://") or _raw_url.startswith("postgres://"):
    # Convert to asyncpg scheme
    DATABASE_URL = re.sub(r"^postgres(ql)?://", "postgresql+asyncpg://", _raw_url)
    # Strip params asyncpg doesn't support in URL (handled via connect_args)
    DATABASE_URL = re.sub(r"[?&]sslmode=[^&]*", "", DATABASE_URL)
    DATABASE_URL = re.sub(r"[?&]channel_binding=[^&]*", "", DATABASE_URL)
    DATABASE_URL = re.sub(r"[?&]$", "", DATABASE_URL)
    _connect_args = {"ssl": "require"}
else:
    DATABASE_URL = _raw_url
    _connect_args = {}

engine = create_async_engine(DATABASE_URL, connect_args=_connect_args, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables on startup."""
    from db.models import User, TranslationCache  # noqa: F401 — register models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """FastAPI dependency for DB sessions."""
    async with SessionLocal() as session:
        yield session
