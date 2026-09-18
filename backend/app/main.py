"""
ResQZone Main Application Entry Point
FastAPI Application, CORS, WebSockets, Lifespan Handlers, and Health Probes.
"""
from contextlib import asynccontextmanager
from typing import List
import json
import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings
from backend.app.db.session import engine, Base
from backend.app.db.seed import seed_database
from backend.app.api.v1.api_routes import api_router


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables & demo seed data are initialized
    print("=== ResQZone Backend Bootstrapping ===")
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    print("=== ResQZone Backend Shutting Down ===")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "ResQZone — Intelligent Hazard-Based Red Zones, Carrying Capacity Assessment, "
        "and Immediate Relocation Needs for Vulnerable Habitations (SIH 2026 - SIH26191).\n\n"
        "Features: Multi-Hazard Fusion, Habitation Vulnerability, Carrying Capacity Bottleneck Analysis, "
        "Constrained Relocation Optimization, ResQ Twin Digital Twin Simulation, and AI Copilot."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all local frontend ports for hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)


# Health & Probes
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "ResQZone Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "data_mode": settings.DATA_MODE
    }


@app.get("/ready", tags=["System"])
def readiness_check():
    return {
        "ready": True,
        "database": "connected",
        "district": settings.DEMO_DISTRICT
    }


@app.get("/version", tags=["System"])
def version_check():
    return {
        "version": settings.VERSION,
        "problem_statement": "SIH26191",
        "team": "ResQZone Autonomous Disaster Architecture"
    }


# Live WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial connection handshake
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to ResQZone Real-Time Hazard & Alert Feed",
            "district": settings.DEMO_DISTRICT
        }))
        while True:
            data = await websocket.receive_text()
            # Echo or process client ping
            await websocket.send_text(json.dumps({"type": "PONG", "received": data}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# ==========================================
# PRODUCTION SPA STATIC FILE SERVING
# ==========================================
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend_spa(full_path: str):
        target = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "ResQZone API Online. Frontend dist is building..."}

