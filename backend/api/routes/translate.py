"""
/api/translate — stub endpoint (kept for API compatibility).

Urdu mode is now a client-side RTL layout toggle — no server-side
translation is performed. This route simply echoes the original texts back
so any legacy callers receive a valid response without errors.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class TranslateRequest(BaseModel):
    texts: list[str] = Field(default_factory=list)
    target_lang: str = Field(default="ur")


class TranslateResponse(BaseModel):
    translations: list[str]
    cache_hits: int


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest) -> TranslateResponse:
    """Echo originals — translation is now handled client-side (RTL CSS only)."""
    return TranslateResponse(translations=req.texts, cache_hits=0)
