# Physical AI Textbook — FastAPI Backend

## Quick Start

```bash
# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. (Optional) Build RAG index from docs
python -m rag.indexer

# 5. Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | RAG-powered chat (falls back to keyword search) |
| POST | `/api/auth/signup` | Register with background profile |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Current user profile |
| PATCH | `/api/auth/profile` | Update personalization settings |
| GET | `/health` | Health check |

Interactive docs: `http://localhost:8000/docs`

## Folder Structure

```
backend/
├── main.py              # FastAPI app entry point
├── requirements.txt
├── .env.example
├── api/
│   ├── models/
│   │   ├── chat.py      # Chat request/response schemas
│   │   └── user.py      # User schemas
│   └── routes/
│       ├── chat.py      # /api/chat — RAG endpoint
│       └── auth.py      # /api/auth/* — Better-Auth
├── rag/
│   ├── indexer.py       # Indexes docs/ into ChromaDB
│   └── retriever.py     # Retrieves answers via LangChain + OpenAI
└── db/
    ├── database.py      # SQLAlchemy async engine
    └── models.py        # User ORM model
```
