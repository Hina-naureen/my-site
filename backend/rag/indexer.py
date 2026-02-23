"""
RAG Indexer — TF-IDF + SVD embeddings stored in Qdrant Cloud.
Pure scikit-learn (no PyTorch / ONNX required).

Run once (or on content change) to build / refresh the index.

Usage:
    python -m rag.indexer
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import re
import glob
import uuid
import pickle
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import Normalizer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from dotenv import load_dotenv

load_dotenv()

DOCS_DIR        = Path(os.getenv("DOCS_DIR", "../docs"))
QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")
PIPELINE_FILE   = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db") + "/lsa_pipeline.pkl"
COLLECTION_NAME = "physai_textbook"
VECTOR_SIZE     = 256   # SVD output dimensions
CHUNK_SIZE      = 800
CHUNK_OVERLAP   = 120


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_front_matter(text: str) -> str:
    return re.sub(r"^---[\s\S]+?---\n", "", text).strip()


def _extract_title(text: str, filename: str) -> str:
    match = re.search(r"^#\s+(.+)", text, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return Path(filename).stem.replace("-", " ").title()


def _chunk_text(text: str) -> list[str]:
    if len(text) <= CHUNK_SIZE:
        return [text] if text.strip() else []

    chunks: list[str] = []
    current = ""
    for sep in ["\n## ", "\n### ", "\n\n", "\n", " "]:
        if sep not in text:
            continue
        parts = text.split(sep)
        current = ""
        for part in parts:
            candidate = current + sep + part if current else part
            if len(candidate) <= CHUNK_SIZE:
                current = candidate
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = part[-CHUNK_OVERLAP:] + sep + part if len(part) > CHUNK_OVERLAP else part
        if current.strip():
            chunks.append(current.strip())
        return [c[:CHUNK_SIZE] for c in chunks if len(c) > 50]

    return [text[i:i+CHUNK_SIZE] for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP)]


def load_docs(docs_dir: Path) -> list[dict]:
    all_chunks: list[dict] = []
    md_files  = glob.glob(str(docs_dir / "**/*.md"),  recursive=True)
    md_files += glob.glob(str(docs_dir / "**/*.mdx"), recursive=True)

    for filepath in sorted(md_files):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw = f.read()
        except Exception as e:
            print(f"  [warn] {filepath}: {e}")
            continue

        content = _strip_front_matter(raw)
        if not content:
            continue

        rel_path = Path(filepath).relative_to(docs_dir.parent)
        title    = _extract_title(content, filepath)
        chunks   = _chunk_text(content)

        for chunk in chunks:
            all_chunks.append({
                "text":   chunk,
                "title":  title,
                "path":   str(rel_path).replace("\\", "/"),
            })
        print(f"  [load] {title} → {len(chunks)} chunks")

    return all_chunks


# ── Main ──────────────────────────────────────────────────────────────────────

def build_index(docs_dir: Path = DOCS_DIR) -> None:
    print(f"\n=== RAG Indexer (TF-IDF + SVD → Qdrant Cloud) ===\n")

    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in .env")

    # 1. Load & chunk
    chunks = load_docs(docs_dir)
    if not chunks:
        raise RuntimeError(f"No markdown files found in {docs_dir}")
    print(f"\nTotal chunks: {len(chunks)}")

    texts = [c["text"] for c in chunks]

    # 2. Build TF-IDF + SVD pipeline — auto-pick dims
    n_components = min(VECTOR_SIZE, len(texts) - 1)
    print(f"Building TF-IDF + SVD pipeline ({n_components} dims)...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=50_000, sublinear_tf=True)),
        ("svd",   TruncatedSVD(n_components=n_components, random_state=42)),
        ("norm",  Normalizer(copy=False)),
    ])
    vectors = pipeline.fit_transform(texts)
    actual_dim = vectors.shape[1]
    print(f"Embeddings shape: {vectors.shape}")

    # 3. Save pipeline locally (needed for query-time encoding)
    os.makedirs(os.path.dirname(PIPELINE_FILE), exist_ok=True)
    with open(PIPELINE_FILE, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"Pipeline saved: {PIPELINE_FILE}")

    # 4. Connect to Qdrant Cloud
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=60)

    # 5. Recreate collection with actual vector dimension
    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=actual_dim, distance=Distance.COSINE),
    )
    print(f"Collection '{COLLECTION_NAME}' created/reset.")

    # 6. Upload in batches
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch     = chunks[i : i + batch_size]
        batch_vec = vectors[i : i + batch_size]

        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=batch_vec[j].tolist(),
                payload=batch[j],
            )
            for j in range(len(batch))
        ]
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        print(f"  Uploaded batch {i // batch_size + 1} ({len(points)} vectors)")

    print(f"\n=== Done — {len(chunks)} chunks in Qdrant Cloud ===\n")


if __name__ == "__main__":
    build_index()
