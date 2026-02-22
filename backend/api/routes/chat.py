"""
/api/chat — RAG-powered chat endpoint.

Falls back gracefully to keyword search if the vector store is not yet built
or if the OpenAI key is missing.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from api.models.chat import ChatRequest, ChatResponse, SourceDoc

router = APIRouter()

# ── fallback keyword knowledge base ─────────────────────────────────────────
FALLBACK_KB: list[dict] = [
    {
        "keywords": ["what is physical ai", "physical ai", "embodied intelligence"],
        "answer": "Physical AI refers to AI systems that perceive and act in the physical world — humanoid robots, autonomous vehicles, and manipulation arms. The course covers the full stack from sensors to LLM-based planning.",
        "title": "Course Overview",
        "path": "docs/01-course-overview.md",
    },
    {
        "keywords": ["ros", "ros2", "robot operating system"],
        "answer": "ROS 2 (Robot Operating System 2) is the middleware layer used to connect sensors, actuators, and compute. Module 2 covers nodes, topics, services, and the Nav2 navigation stack.",
        "title": "Module 2 — ROS 2",
        "path": "docs/10-ros2-intro.md",
    },
    {
        "keywords": ["vla", "vision language action", "vision-language"],
        "answer": "VLA (Vision-Language-Action) models combine computer vision with natural language to produce robot actions. Module 5 covers VLA architectures, Whisper voice control, and LLM-to-ROS planning.",
        "title": "Module 5 — VLA & AI",
        "path": "docs/40-vla-overview.md",
    },
    {
        "keywords": ["isaac", "nvidia isaac", "synthetic data"],
        "answer": "NVIDIA Isaac Sim is a photorealistic robot simulator used to generate synthetic training data at scale. Module 4 covers Isaac Sim setup, synthetic data pipelines, and Isaac ROS VSLAM.",
        "title": "Module 4 — NVIDIA Isaac",
        "path": "docs/30-isaac-sim-synthetic-data.md",
    },
    {
        "keywords": ["gazebo", "simulation", "digital twin"],
        "answer": "Gazebo is an open-source robot simulator used to create digital twins. Module 3 covers Gazebo world building, sensor simulation, and Unity visualization alternatives.",
        "title": "Module 3 — Simulation",
        "path": "docs/20-gazebo-digital-twin.md",
    },
    {
        "keywords": ["sensor", "perception", "lidar", "camera", "imu"],
        "answer": "Module 1 covers the sensor stack: LiDAR, depth cameras, IMUs, and GPS. It explains how robots perceive the world and the data pipelines from raw sensor data to processed perception outputs.",
        "title": "Module 1 — Sensors & Perception",
        "path": "docs/03-sensors-perception.md",
    },
    {
        "keywords": ["capstone", "project", "humanoid", "autonomous"],
        "answer": "The capstone project integrates all modules: build an autonomous humanoid robot that uses ROS 2, VLA models, and NVIDIA Isaac. See Module 6 — Capstone for full specifications.",
        "title": "Module 6 — Capstone",
        "path": "docs/50-capstone-autonomous-humanoid.md",
    },
    {
        "keywords": ["glossary", "terms", "definition"],
        "answer": "The Glossary page defines key terms from robotics, AI, and simulation. It's a great reference when you encounter unfamiliar terminology.",
        "title": "Glossary",
        "path": "docs/90-glossary.md",
    },
]


def _fallback_answer(query: str) -> dict:
    """Simple keyword-match fallback when RAG is unavailable."""
    q = query.lower()
    best_score, best_entry = 0, None
    for entry in FALLBACK_KB:
        score = sum(1 for kw in entry["keywords"] if kw in q)
        if score > best_score:
            best_score, best_entry = score, entry

    if best_entry:
        return {
            "answer": best_entry["answer"],
            "sources": [
                {
                    "title": best_entry["title"],
                    "path": best_entry["path"],
                    "excerpt": best_entry["answer"][:120] + "…",
                }
            ],
            "mode": "fallback",
        }

    return {
        "answer": "I'm your Physical AI textbook assistant! I can answer questions about ROS 2, NVIDIA Isaac, VLA models, simulation, sensors, and the capstone project. What would you like to know?",
        "sources": [],
        "mode": "fallback",
    }


# ── route ────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """RAG chat endpoint with graceful fallback."""
    try:
        from rag.retriever import retrieve_answer

        history = [{"role": m.role, "content": m.content} for m in body.history]
        result = retrieve_answer(
            query=body.message,
            history=history,
            user_level=body.user_level or "intermediate",
            language=body.language or "en",
        )
    except Exception:
        result = _fallback_answer(body.message)

    sources = [SourceDoc(**s) for s in result["sources"]]
    return ChatResponse(answer=result["answer"], sources=sources, mode=result["mode"])
