"""SQLAlchemy ORM models."""
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    background_level: Mapped[str] = mapped_column(String(20), nullable=False, default="beginner")
    field_of_interest: Mapped[str] = mapped_column(String(50), nullable=False, default="other")
    learning_goals: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class TranslationCache(Base):
    __tablename__ = "translation_cache"

    cache_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    translation: Mapped[str] = mapped_column(Text, nullable=False)
    target_lang: Mapped[str] = mapped_column(String(10), nullable=False, default="ur")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
