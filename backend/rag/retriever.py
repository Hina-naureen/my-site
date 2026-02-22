"""
RAG Retriever — TF-IDF based (no PyTorch / ONNX required).
Uses scikit-learn cosine similarity for vector search.
Uses OpenAI GPT-4o-mini for answer generation ONLY if OPENAI_API_KEY is set.
Falls back to returning formatted retrieved context when no key is present.

Singleton pattern: index is loaded once per process.

Retrieval priority rules
------------------------
1. Query is normalised to lowercase before search.
2. If the query contains ROS2 / Nav2 keywords, documents whose path or title
   contains ros2 / navigation hints are boosted (+2.0 per hint match).
3. Glossary documents are suppressed (-1.5) unless the query explicitly asks
   for a definition/term/meaning.
4. Re-ranking is applied after a wider initial fetch (k × 3 for routed
   queries) so the final top-k reflects intent, not just TF-IDF similarity.
"""
from __future__ import annotations

import os
import pickle
from functools import lru_cache
from pathlib import Path

from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

INDEX_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
INDEX_FILE = "tfidf_index.pkl"
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")


SYSTEM_PROMPT = PromptTemplate(
    input_variables=["context", "question", "level"],
    template="""You are an expert AI tutor for the "Physical AI & Humanoid Robotics" textbook.
Use the context below to answer the question. Adjust your explanation depth for a {level} student.

Context:
{context}

Question: {question}

Answer concisely with clear structure. If relevant, mention which chapter/module the topic is from.
If you cannot answer from the context, say so honestly.
""",
)


# ── Keyword routing tables ──────────────────────────────────────────────────

_MODULE2_QUERY_KW = {
    "nav2", "ros2", "ros 2", "navigation", "planner", "controller",
    "node", "topic", "service", "action server", "lifecycle",
}

_MODULE2_DOC_HINTS = {"ros2", "ros-2", "ros_2", "navigation", "nav2", "nav-2"}

_GLOSSARY_QUERY_KW = {"define", "definition", "term", "meaning", "glossary", "what does", "what is a"}

_GLOSSARY_DOC_HINTS = {"glossary", "terms", "definitions"}


# ── Re-ranking helpers ──────────────────────────────────────────────────────

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


# ── Free-mode answer formatter ──────────────────────────────────────────────

def _format_context_answer(context: str, query: str, level: str) -> str:
    chunks = [c.strip() for c in context.split("---") if c.strip()]
    parts = ["**From the Physical AI & Humanoid Robotics textbook:**\n"]

    for chunk in chunks[:2]:
        if chunk:
            parts.append(chunk[:600])

    if not chunks:
        parts.append("No relevant content found for your query. Try rephrasing.")

    parts.append(
        "\n_Tip: Add `OPENAI_API_KEY` to `backend/.env` for AI-synthesized answers._"
    )
    return "\n\n".join(parts)


# ── TF-IDF index singleton ──────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_index() -> dict:
    index_path = os.path.join(INDEX_DIR, INDEX_FILE)
    if not Path(index_path).exists():
        raise RuntimeError(
            "TF-IDF index not found. Run `python -m rag.indexer` first."
        )
    with open(index_path, "rb") as f:
        return pickle.load(f)


def _search(query: str, fetch_k: int) -> list[Document]:
    idx = _load_index()
    vectorizer = idx["vectorizer"]
    tfidf_matrix = idx["tfidf_matrix"]
    texts = idx["texts"]
    metadatas = idx["metadatas"]

    q_vec = vectorizer.transform([query])
    scores = cosine_similarity(q_vec, tfidf_matrix).flatten()

    top_indices = scores.argsort()[::-1][:fetch_k]
    docs = []
    for i in top_indices:
        if scores[i] > 0:
            docs.append(Document(page_content=texts[i], metadata=metadatas[i]))
    return docs


# ── Public interface ────────────────────────────────────────────────────────

def retrieve_answer(
    query: str,
    history: list[dict] | None = None,
    user_level: str = "intermediate",
    language: str = "en",
    k: int = 4,
) -> dict:
    """
    Retrieve relevant chunks and generate an answer.

    Returns:
        {"answer": str, "sources": list[dict], "mode": "rag"}
    """
    query_lower = query.lower()

    needs_routing = any(kw in query_lower for kw in _MODULE2_QUERY_KW)
    fetch_k = k * 3 if needs_routing else k

    raw_docs = _search(query, fetch_k)
    docs     = _rerank(raw_docs, query_lower, k)

    context = "\n\n---\n\n".join(
        [f"[{d.metadata.get('title', 'Doc')}]\n{d.page_content}" for d in docs]
    )

    # ── Answer generation ───────────────────────────────────────────────────
    if OPENAI_KEY:
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, streaming=False)

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT.format(
                    context=context,
                    question=query,
                    level=user_level,
                ),
            }
        ]

        if history:
            messages.extend(history[-6:])

        messages.append({"role": "user", "content": query})

        if language and language != "en":
            messages.append(
                {
                    "role": "user",
                    "content": f"Please translate your final answer to {language}.",
                }
            )

        response = llm.invoke(messages)
        answer   = response.content
    else:
        answer = _format_context_answer(context, query, user_level)

    sources = [
        {
            "title":   d.metadata.get("title", "Unknown"),
            "path":    d.metadata.get("path", ""),
            "excerpt": d.page_content[:200].replace("\n", " ") + "…",
        }
        for d in docs
    ]

    return {"answer": answer, "sources": sources, "mode": "rag"}
