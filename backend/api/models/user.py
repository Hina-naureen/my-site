"""User data models."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    background_level: str = Field(
        ..., pattern="^(beginner|intermediate|expert)$",
        description="User's current skill level"
    )
    field_of_interest: str = Field(
        ...,
        description="robotics | ai_ml | software | other"
    )
    learning_goals: list[str] = Field(
        default_factory=list,
        description="Selected learning objectives"
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    background_level: str
    field_of_interest: str
    learning_goals: list[str]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class UpdateProfile(BaseModel):
    background_level: Optional[str] = None
    field_of_interest: Optional[str] = None
    learning_goals: Optional[list[str]] = None
