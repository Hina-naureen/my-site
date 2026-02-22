"""
Physical AI Textbook — FastAPI Backend
RAG-powered chatbot + Better-Auth system
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import chat, auth, translate
from db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await init_db()
    yield


app = FastAPI(
    title="Physical AI Textbook API",
    description="RAG chatbot + auth backend for the Physical AI & Humanoid Robotics textbook.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(translate.router, prefix="/api", tags=["translate"])

@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "Physical AI Textbook API", "version": "1.0.0"}
