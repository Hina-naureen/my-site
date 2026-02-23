"""
RAG Retriever — TF-IDF + SVD pipeline + Qdrant Cloud vector search.
Pure scikit-learn (no PyTorch / ONNX required).

Singleton pattern: pipeline and Qdrant client loaded once per process.
"""
from __future__ import annotations

import os
import re
import pickle
from functools import lru_cache

from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")
PIPELINE_FILE   = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db") + "/lsa_pipeline.pkl"
COLLECTION_NAME = "physai_textbook"
OPENAI_KEY      = os.getenv("OPENAI_API_KEY", "")

_STOP_WORDS: frozenset[str] = frozenset({
    "what", "is", "are", "how", "does", "do", "the", "a", "an", "in",
    "of", "to", "for", "and", "or", "can", "you", "me", "tell", "explain",
    "describe", "about", "it", "its", "this", "that", "these", "those",
    "with", "on", "at", "by", "from", "as", "be", "was", "were", "will",
    "would", "could", "should", "have", "has", "had", "not", "but", "also",
    "i", "my", "we", "our", "your", "which", "when", "where", "who",
    "give", "get", "let", "please", "want", "need", "know", "like",
})


# ── Singletons ────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_pipeline():
    if not os.path.exists(PIPELINE_FILE):
        raise RuntimeError("LSA pipeline not found. Run `python -m rag.indexer` first.")
    with open(PIPELINE_FILE, "rb") as f:
        return pickle.load(f)


@lru_cache(maxsize=1)
def _get_client() -> QdrantClient:
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in .env")
    return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=8)


# ── Search ────────────────────────────────────────────────────────────────────

def _search(query: str, k: int) -> list[dict]:
    pipeline     = _get_pipeline()
    client       = _get_client()
    query_vector = pipeline.transform([query])[0].tolist()

    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=k,
        with_payload=True,
    )

    return [
        {
            "text":  r.payload.get("text", ""),
            "title": r.payload.get("title", ""),
            "path":  r.payload.get("path", ""),
            "score": r.score,
        }
        for r in response.points
    ]


# ── Extractive synthesiser ────────────────────────────────────────────────────

def _content_words(text: str) -> set[str]:
    return {
        w for w in re.sub(r"[^\w\s]", "", text.lower()).split()
        if w not in _STOP_WORDS and len(w) > 2
    }


def _local_synthesize(docs: list[dict], query: str, level: str) -> str:
    q_words   = _content_words(query)
    sections: list[str] = []
    seen_keys: set[str] = set()

    for doc in docs[:4]:
        text  = doc["text"]
        title = doc.get("title", "Reference")

        raw_parts = re.split(r"\n{2,}|(?<=[.!?])\s+(?=[A-Z\d])", text)
        parts = [p.strip() for p in raw_parts if len(p.strip()) > 30]

        scored = [(len(q_words & _content_words(p)), p) for p in parts]
        scored.sort(key=lambda x: -x[0])

        top: list[str] = []
        for _, part in scored:
            if len(top) >= 2:
                break
            key = part[:60].lower()
            if key not in seen_keys:
                seen_keys.add(key)
                top.append(part)

        if top:
            sections.append(f"**{title}**\n\n" + "\n\n".join(top))

    if not sections:
        if docs:
            d = docs[0]
            return f"**{d.get('title', 'Reference')}**\n\n{d['text'][:450].rstrip()}"
        return "No relevant content found in the textbook for this query."

    level_intro = {
        "beginner":     "Here is a clear explanation",
        "intermediate": "Here is what the textbook covers",
        "expert":       "Technical reference from the textbook",
    }.get(level, "Here is what the textbook covers")

    return f"{level_intro} on **{query.strip()}**:\n\n" + "\n\n---\n\n".join(sections)


# ── Public interface ──────────────────────────────────────────────────────────

def retrieve_answer(
    query: str,
    history: list[dict] | None = None,
    user_level: str = "intermediate",
    language: str = "en",
    k: int = 4,
) -> dict:
    """
    Retrieve relevant chunks from Qdrant Cloud and synthesise an answer.
    Returns: {"answer": str, "sources": list[dict], "mode": "rag"}
    """
    docs = _search(query, k)

    if OPENAI_KEY:
        try:
            from langchain_openai import ChatOpenAI
            context = "\n\n---\n\n".join(
                f"[{d.get('title', 'Doc')}]\n{d['text']}" for d in docs
            )
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert AI tutor for the 'Physical AI & Humanoid Robotics' textbook.\n"
                        f"Use the context below to answer. Adjust depth for a {user_level} student.\n\n"
                        f"Context:\n{context}\n\nAnswer concisely with clear structure."
                    ),
                }
            ]
            if history:
                messages.extend(history[-6:])
            messages.append({"role": "user", "content": query})

            llm    = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
            answer = llm.invoke(messages).content
        except Exception:
            answer = _local_synthesize(docs, query, user_level)
    else:
        answer = _local_synthesize(docs, query, user_level)

    sources = [
        {
            "title":   d.get("title", "Unknown"),
            "path":    d.get("path", ""),
            "excerpt": d["text"][:200].replace("\n", " ") + "…",
        }
        for d in docs
    ]

    return {"answer": answer, "sources": sources, "mode": "rag"}
