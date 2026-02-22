"""
RAG Retriever — TF-IDF + local extractive synthesis (no paid API required).

Uses scikit-learn cosine similarity for retrieval.
Uses extractive sentence scoring for answer synthesis — no OpenAI needed.
If OPENAI_API_KEY is set it is used as an optional enhancement; the system
works fully offline without it.

Singleton pattern: index loaded once per process via lru_cache.

Retrieval priority rules
------------------------
1. Query is normalised to lowercase before search.
2. ROS 2 / Nav2 queries boost documents whose path or title contains
   matching hints (+2.0 per hint).
3. Glossary documents are suppressed (-1.5) unless the query explicitly
   asks for a definition.
4. Re-ranking is applied after a wider initial fetch (k × 3 for routed
   queries) so the final top-k reflects intent, not just TF-IDF score.
"""
from __future__ import annotations

import os
import re
import pickle
from functools import lru_cache
from pathlib import Path

from langchain_core.documents import Document
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

INDEX_DIR  = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
INDEX_FILE = "tfidf_index.pkl"
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")

# ── Stop-word filter for keyword scoring ─────────────────────────────────────

_STOP_WORDS: frozenset[str] = frozenset({
    "what", "is", "are", "how", "does", "do", "the", "a", "an", "in",
    "of", "to", "for", "and", "or", "can", "you", "me", "tell", "explain",
    "describe", "about", "it", "its", "this", "that", "these", "those",
    "with", "on", "at", "by", "from", "as", "be", "was", "were", "will",
    "would", "could", "should", "have", "has", "had", "not", "but", "also",
    "i", "my", "we", "our", "your", "which", "when", "where", "who",
    "give", "get", "let", "please", "want", "need", "know", "like",
})

# ── Keyword routing tables ────────────────────────────────────────────────────

_MODULE2_QUERY_KW = {
    "nav2", "ros2", "ros 2", "navigation", "planner", "controller",
    "node", "topic", "service", "action server", "lifecycle",
}
_MODULE2_DOC_HINTS  = {"ros2", "ros-2", "ros_2", "navigation", "nav2", "nav-2"}
_GLOSSARY_QUERY_KW  = {"define", "definition", "term", "meaning", "glossary", "what does", "what is a"}
_GLOSSARY_DOC_HINTS = {"glossary", "terms", "definitions"}


# ── Re-ranking ────────────────────────────────────────────────────────────────

def _doc_hint_match(doc: Document, hints: set[str]) -> bool:
    path  = doc.metadata.get("path",  "").lower()
    title = doc.metadata.get("title", "").lower()
    return any(h in path or h in title for h in hints)


def _rerank(docs: list[Document], query_lower: str, k: int) -> list[Document]:
    boost_module2     = any(kw in query_lower for kw in _MODULE2_QUERY_KW)
    suppress_glossary = not any(kw in query_lower for kw in _GLOSSARY_QUERY_KW)

    if not boost_module2 and not suppress_glossary:
        return docs[:k]

    scored: list[tuple[float, Document]] = []
    for i, doc in enumerate(docs):
        score = float(len(docs) - i)
        if boost_module2 and _doc_hint_match(doc, _MODULE2_DOC_HINTS):
            score += 2.0
        if suppress_glossary and _doc_hint_match(doc, _GLOSSARY_DOC_HINTS):
            score -= 1.5
        scored.append((score, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in scored[:k]]


# ── Local extractive synthesiser (no API required) ────────────────────────────

def _content_words(text: str) -> set[str]:
    """Tokenise text and remove stop words."""
    return {
        w for w in re.sub(r"[^\w\s]", "", text.lower()).split()
        if w not in _STOP_WORDS and len(w) > 2
    }


def _local_synthesize(docs: list[Document], query: str, level: str) -> str:
    """
    Extractive answer synthesis from retrieved documents.
    Scores each paragraph/sentence by content-word overlap with the query,
    then assembles the top results into a structured response.
    Pure Python — no external API required.
    """
    q_words = _content_words(query)

    sections: list[str] = []
    seen_keys: set[str] = set()

    for doc in docs[:4]:
        text  = doc.page_content
        title = doc.metadata.get("title", "Reference")

        # Split into paragraphs, then sentences as fallback
        raw_parts = re.split(r"\n{2,}|(?<=[.!?])\s+(?=[A-Z\d])", text)
        parts = [p.strip() for p in raw_parts if len(p.strip()) > 30]

        # Score each part by query keyword overlap
        scored: list[tuple[int, str]] = [
            (len(q_words & _content_words(part)), part)
            for part in parts
        ]
        scored.sort(key=lambda x: -x[0])

        # Collect up to 2 unique parts per document
        top: list[str] = []
        for score, part in scored:
            if len(top) >= 2:
                break
            key = part[:60].lower()
            if key not in seen_keys:
                seen_keys.add(key)
                top.append(part)

        if top:
            sections.append(f"**{title}**\n\n" + "\n\n".join(top))

    # Fallback: return raw excerpt from first doc
    if not sections:
        if docs:
            d = docs[0]
            excerpt = d.page_content[:450].rstrip()
            return f"**{d.metadata.get('title', 'Reference')}**\n\n{excerpt}"
        return "No relevant content found in the textbook for this query."

    level_intro = {
        "beginner":     "Here is a clear explanation",
        "intermediate": "Here is what the textbook covers",
        "expert":       "Technical reference from the textbook",
    }.get(level, "Here is what the textbook covers")

    header = f"{level_intro} on **{query.strip()}**:\n\n"
    return header + "\n\n---\n\n".join(sections)


# ── TF-IDF index singleton ────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_index() -> dict:
    index_path = Path(INDEX_DIR) / INDEX_FILE
    if not index_path.exists():
        raise RuntimeError(
            "TF-IDF index not found. Run `python -m rag.indexer` first."
        )
    with open(index_path, "rb") as f:
        return pickle.load(f)


def _search(query: str, fetch_k: int) -> list[Document]:
    idx          = _load_index()
    vectorizer   = idx["vectorizer"]
    tfidf_matrix = idx["tfidf_matrix"]
    texts        = idx["texts"]
    metadatas    = idx["metadatas"]

    q_vec  = vectorizer.transform([query])
    scores = cosine_similarity(q_vec, tfidf_matrix).flatten()

    top_indices = scores.argsort()[::-1][:fetch_k]
    return [
        Document(page_content=texts[i], metadata=metadatas[i])
        for i in top_indices
        if scores[i] > 0
    ]


# ── Public interface ──────────────────────────────────────────────────────────

def retrieve_answer(
    query: str,
    history: list[dict] | None = None,
    user_level: str = "intermediate",
    language: str = "en",
    k: int = 4,
) -> dict:
    """
    Retrieve relevant chunks from the local TF-IDF index and synthesise
    an answer using extractive QA (no paid API required).

    If OPENAI_API_KEY is present in the environment it is used for
    higher-quality answer synthesis; otherwise the local synthesiser runs.

    Returns:
        {"answer": str, "sources": list[dict], "mode": "rag"}
    """
    query_lower = query.lower()

    needs_routing = any(kw in query_lower for kw in _MODULE2_QUERY_KW)
    fetch_k = k * 3 if needs_routing else k

    raw_docs = _search(query, fetch_k)
    docs     = _rerank(raw_docs, query_lower, k)

    # ── Answer synthesis ─────────────────────────────────────────────────────
    if OPENAI_KEY:
        # Optional: use OpenAI for higher-quality synthesis
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import PromptTemplate

            context = "\n\n---\n\n".join(
                f"[{d.metadata.get('title', 'Doc')}]\n{d.page_content}"
                for d in docs
            )

            system_prompt = (
                "You are an expert AI tutor for the 'Physical AI & Humanoid Robotics' textbook.\n"
                "Use the context below to answer the question. "
                f"Adjust depth for a {user_level} student.\n\n"
                f"Context:\n{context}\n\n"
                "Answer concisely with clear structure. "
                "If you cannot answer from the context, say so honestly."
            )

            messages = [{"role": "system", "content": system_prompt}]
            if history:
                messages.extend(history[-6:])
            messages.append({"role": "user", "content": query})

            llm    = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, streaming=False)
            answer = llm.invoke(messages).content
        except Exception:
            # Graceful fallback if OpenAI call fails
            answer = _local_synthesize(docs, query, user_level)
    else:
        answer = _local_synthesize(docs, query, user_level)

    sources = [
        {
            "title":   d.metadata.get("title", "Unknown"),
            "path":    d.metadata.get("path", ""),
            "excerpt": d.page_content[:200].replace("\n", " ") + "…",
        }
        for d in docs
    ]

    return {"answer": answer, "sources": sources, "mode": "rag"}
