"""
RAG Indexer — TF-IDF based (no PyTorch / ONNX required).
Loads markdown docs from /docs and builds a TF-IDF index using scikit-learn.
Run once (or on content change) to build / refresh the index.

Usage:
    python -m rag.indexer
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import re
import glob
import pickle
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from sklearn.feature_extraction.text import TfidfVectorizer
from dotenv import load_dotenv

load_dotenv()

DOCS_DIR = Path(os.getenv("DOCS_DIR", "../docs"))
INDEX_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
INDEX_FILE = "tfidf_index.pkl"

# ---------------------------------------------------------------------------


def _strip_front_matter(text: str) -> str:
    """Remove YAML front matter from markdown."""
    return re.sub(r"^---[\s\S]+?---\n", "", text).strip()


def _extract_title(text: str, filename: str) -> str:
    match = re.search(r"^#\s+(.+)", text, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return Path(filename).stem.replace("-", " ").title()


def load_docs(docs_dir: Path) -> list[Document]:
    """Walk docs/ directory and return LangChain Documents."""
    documents: list[Document] = []
    md_files = glob.glob(str(docs_dir / "**/*.md"), recursive=True)
    md_files += glob.glob(str(docs_dir / "**/*.mdx"), recursive=True)

    for filepath in sorted(md_files):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw = f.read()
        except Exception as e:
            print(f"  [warn] could not read {filepath}: {e}")
            continue

        content = _strip_front_matter(raw)
        if not content:
            continue

        rel_path = Path(filepath).relative_to(docs_dir.parent)
        title = _extract_title(content, filepath)

        documents.append(
            Document(
                page_content=content,
                metadata={
                    "title": title,
                    "path": str(rel_path).replace("\\", "/"),
                    "source": filepath,
                },
            )
        )
        print(f"  [load] {title} ({len(content)} chars)")

    return documents


def build_index(docs_dir: Path = DOCS_DIR, persist_dir: str = INDEX_DIR) -> None:
    """Build (or rebuild) the TF-IDF index from docs."""
    print(f"\n=== RAG Indexer (TF-IDF): {docs_dir} -> {persist_dir} ===\n")

    docs = load_docs(docs_dir)
    if not docs:
        raise RuntimeError(f"No markdown files found in {docs_dir}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )
    chunks = splitter.split_documents(docs)
    print(f"\nTotal chunks: {len(chunks)}")

    texts = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]

    print("Building TF-IDF index (no GPU/AVX2 required)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_features=30_000,
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(texts)

    os.makedirs(persist_dir, exist_ok=True)
    index_path = os.path.join(persist_dir, INDEX_FILE)
    with open(index_path, "wb") as f:
        pickle.dump(
            {
                "vectorizer": vectorizer,
                "tfidf_matrix": tfidf_matrix,
                "texts": texts,
                "metadatas": metadatas,
            },
            f,
        )
    print(f"\n=== Index built — {len(chunks)} chunks stored in {index_path} ===\n")


if __name__ == "__main__":
    build_index()
