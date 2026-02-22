"""Chat request / response models."""
from pydantic import BaseModel, Field
from typing import Optional


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    user_level: Optional[str] = Field(
        default=None,
        description="User skill level: beginner | intermediate | expert",
    )
    language: Optional[str] = Field(default="en", description="Response language code")


class SourceDoc(BaseModel):
    title: str
    path: str
    excerpt: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceDoc] = Field(default_factory=list)
    mode: str = Field(default="rag", description="rag | fallback")
