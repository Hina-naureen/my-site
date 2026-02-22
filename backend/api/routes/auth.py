"""Better-Auth — signup, login, profile endpoints."""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt as _bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models.user import UserSignup, UserLogin, UserProfile, TokenResponse, UpdateProfile
from db.database import get_db
from db.models import User

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/form")


# ── helpers ──────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def user_to_profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        background_level=user.background_level,
        field_of_interest=user.field_of_interest,
        learning_goals=user.learning_goals,
    )


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exc
    return user


# ── routes ───────────────────────────────────────────────────────────────────

@router.post("/auth/signup", response_model=TokenResponse, status_code=201)
async def signup(body: UserSignup, db: AsyncSession = Depends(get_db)):
    """Register a new user with background profile."""
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        background_level=body.background_level,
        field_of_interest=body.field_of_interest,
    )
    user.learning_goals = body.learning_goals
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token({"sub": user.email})
    return TokenResponse(access_token=token, user=user_to_profile(user))


@router.post("/auth/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email + password."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.email})
    return TokenResponse(access_token=token, user=user_to_profile(user))


@router.post("/auth/login/form", response_model=TokenResponse)
async def login_form(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
):
    """OAuth2 form login (used by Swagger UI)."""
    return await login(UserLogin(email=form.username, password=form.password), db)


@router.get("/auth/me", response_model=UserProfile)
async def me(current_user: User = Depends(get_current_user)):
    return user_to_profile(current_user)


@router.patch("/auth/profile", response_model=UserProfile)
async def update_profile(
    body: UpdateProfile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update personalization settings."""
    if body.background_level is not None:
        current_user.background_level = body.background_level
    if body.field_of_interest is not None:
        current_user.field_of_interest = body.field_of_interest
    if body.learning_goals is not None:
        current_user.learning_goals = body.learning_goals
    await db.commit()
    await db.refresh(current_user)
    return user_to_profile(current_user)
