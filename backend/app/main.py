"""
ResQZone Main Application Entry Point
FastAPI Application, CORS, WebSockets, Lifespan Handlers, and Health Probes.
"""
from contextlib import asynccontextmanager
from typing import List
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

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
