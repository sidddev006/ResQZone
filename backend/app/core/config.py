"""
ResQZone Central Configuration
Handles system settings, database URLs, weights, risk thresholds, and API configurations.
"""
from typing import List, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import Field
import os
import json


class Settings(BaseSettings):
    PROJECT_NAME: str = "ResQZone — Intelligent Hazard Red Zone & Relocation System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    SECRET_KEY: str = "resqzone-hackathon-2026-super-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./resqzone.db"
    
    # Operational Mode: DEMO | LIVE | OFFLINE
    DATA_MODE: str = "DEMO"
    
    # Target Demo Region
    DEMO_DISTRICT: str = "Chamoli-Joshimath"
    DEMO_STATE: str = "Uttarakhand"
    
    # Hazard Engine Weights (Configurable in config, never hard-coded scientific claims)
    LANDSLIDE_WEIGHTS: Dict[str, float] = {
        "slope": 0.25,
        "rainfall_24h": 0.20,
        "rainfall_anomaly": 0.15,
        "recent_deformation": 0.15,
        "geology_fragility": 0.15,
        "historical_proximity": 0.10
    }
    
    FLOOD_WEIGHTS: Dict[str, float] = {
        "channel_proximity": 0.35,
        "rainfall_72h": 0.30,
        "elevation_anomaly": 0.20,
        "drainage_impedance": 0.15
    }
    
    # Risk Classification Thresholds
    RISK_THRESHOLD_CRITICAL: float = 0.75
    RISK_THRESHOLD_WARNING: float = 0.50
    RISK_THRESHOLD_WATCH: float = 0.30
    
    # Carrying Capacity Humanitarian Standards (Sphere Project / WHO)
    MIN_WATER_LPD: float = 15.0 # Liters per person per day
    PEOPLE_PER_TOILET: int = 20 # Persons per sanitation unit
    DAILY_MEALS_PER_PERSON: int = 3
    PEOPLE_PER_ISOLATION_BED: int = 50 # Emergency medical bed ratio
    SAFE_SHELTER_MARGIN_PCT: float = 0.80 # 80% of rated capacity
    
    # Relocation Optimizer Weights
    OPTIMIZER_WEIGHT_TRAVEL_TIME: float = 0.40
    OPTIMIZER_WEIGHT_ROUTE_HAZARD: float = 0.35
    OPTIMIZER_WEIGHT_CAPACITY_PRESSURE: float = 0.15
    OPTIMIZER_WEIGHT_VULNERABILITY_URGENCY: float = 0.10
    
    # External API Keys & Endpoints (with graceful fallback)
    IMD_API_KEY: str = ""
    BHUVAN_API_KEY: str = ""
    COPERNICUS_CLIENT_ID: str = ""
    COPERNICUS_CLIENT_SECRET: str = ""
    OPENSTREETMAP_API_URL: str = "https://overpass-api.de/api/interpreter"
    FIREBASE_SERVER_KEY: str = ""
    SMS_GATEWAY_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
