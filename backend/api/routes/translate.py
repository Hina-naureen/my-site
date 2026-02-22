"""
/api/translate — dedicated translation endpoint.
Bypasses RAG entirely; calls the LLM directly with a clean translator prompt.
Results are cached in SQLite to avoid redundant LLM calls.
"""
import hashlib
import json
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db

load_dotenv()

router = APIRouter()


class TranslateRequest(BaseModel):
    texts: list[str] = Field(..., max_length=60)
    target_lang: str = Field(default='ur')


class TranslateResponse(BaseModel):
    translations: list[str]
    cache_hits: int


def _cache_key(text: str, target_lang: str) -> str:
    return hashlib.sha256(f"{target_lang}:{text}".encode()).hexdigest()


async def _lookup_cache(
    texts: list[str], target_lang: str, db: AsyncSession
) -> dict[str, Optional[str]]:
    keys = [_cache_key(t, target_lang) for t in texts]
    placeholders = ", ".join(f":k{i}" for i in range(len(keys)))
    params = {f"k{i}": k for i, k in enumerate(keys)}
    rows = await db.execute(
        text(f"SELECT cache_key, translation FROM translation_cache WHERE cache_key IN ({placeholders})"),
        params,
    )
    return {row.cache_key: row.translation for row in rows}


async def _store_cache(
    pairs: list[tuple[str, str, str]], target_lang: str, db: AsyncSession
) -> None:
    for source, translation, key in pairs:
        await db.execute(
            text("""
                INSERT OR REPLACE INTO translation_cache
                    (cache_key, source_text, translation, target_lang)
                VALUES (:key, :source, :translation, :lang)
            """),
            {"key": key, "source": source, "translation": translation, "lang": target_lang},
        )
    await db.commit()


async def _llm_translate(texts: list[str], target_lang: str) -> list[str]:
    """Call OpenAI directly with a clean translation prompt."""
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage, SystemMessage

        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY"),
        )
        numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts))
        messages = [
            SystemMessage(content=(
                f"You are a professional translator. Translate the following numbered items to {target_lang}. "
                "Preserve the numbering. Reply with ONLY a JSON array of translated strings, "
                "in the same order, with no extra commentary."
            )),
            HumanMessage(content=numbered),
        ]
        response = await llm.ainvoke(messages)
        raw = response.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        if isinstance(result, list) and len(result) == len(texts):
            return [str(r) for r in result]
    except Exception:
        pass
    return texts  # fallback: return originals


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest, db: AsyncSession = Depends(get_db)):
    cached_map = await _lookup_cache(req.texts, req.target_lang, db)
    keys = [_cache_key(t, req.target_lang) for t in req.texts]

    hits = 0
    miss_indices: list[int] = []
    miss_texts: list[str] = []

    for i, (text_val, key) in enumerate(zip(req.texts, keys)):
        if key in cached_map:
            hits += 1
        else:
            miss_indices.append(i)
            miss_texts.append(text_val)

    # Fetch translations for cache misses
    if miss_texts:
        new_translations = await _llm_translate(miss_texts, req.target_lang)
        to_store = []
        for idx, translation in zip(miss_indices, new_translations):
            to_store.append((req.texts[idx], translation, keys[idx]))
        await _store_cache(to_store, req.target_lang, db)
        for idx, translation in zip(miss_indices, new_translations):
            cached_map[keys[idx]] = translation

    translations = [cached_map.get(k, req.texts[i]) for i, k in enumerate(keys)]
    return TranslateResponse(translations=translations, cache_hits=hits)
