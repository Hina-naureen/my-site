"""Async SQLite database setup via SQLAlchemy."""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./textbook_auth.db"

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables on startup."""
    from db.models import User  # noqa: F401 — register model
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(
            __import__('sqlalchemy', fromlist=['text']).text("""
                CREATE TABLE IF NOT EXISTS translation_cache (
                    cache_key   TEXT PRIMARY KEY,
                    source_text TEXT NOT NULL,
                    translation TEXT NOT NULL,
                    target_lang TEXT NOT NULL DEFAULT 'ur',
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        )


async def get_db():
    """FastAPI dependency for DB sessions."""
    async with SessionLocal() as session:
        yield session
