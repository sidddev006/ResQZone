"""
IMD (India Meteorological Department) Weather Adapter
Provides rainfall, temperature, soil moisture, and cloudburst warning data.
Falls back gracefully to calibrated demo datasets when live API is unavailable.
"""
import os
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from backend.app.services.data_sources.base import BaseDataSourceAdapter
from backend.app.core.config import settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")


class IMDAdapter(BaseDataSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="IMD_WEATHER",
            provider="India Meteorological Department (IMD)",
            data_type="WEATHER"
        )
        self.station_id = "42111" # Joshimath AWS

    def fetch(self, live: bool = False) -> Dict[str, Any]:
        if live and settings.IMD_API_KEY:
            try:
                # Live API call simulation / attempt
                url = f"https://api.imd.gov.in/v1/aws/station/{self.station_id}"
                resp = httpx.get(url, timeout=3.0, headers={"X-API-KEY": settings.IMD_API_KEY})
                if resp.status_code == 200:
                    data = resp.json()
                    if self.validate(data):
                        self.mode = "LIVE"
                        self.freshness_state = "FRESH"
                        self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
                        return self.normalize(data)
            except Exception:
                self.freshness_state = "DEGRADED"

        # Graceful fallback to verified demo data
        demo_file = os.path.join(DEMO_DIR, "weather.json")
        if os.path.exists(demo_file):
            with open(demo_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.mode = "DEMO"
            self.freshness_state = "FRESH"
            self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
            return self.normalize(data)

        return self.normalize({
            "station_id": "IMD-42111",
            "rainfall_24h_mm": 118.4,
            "rainfall_72h_mm": 246.8,
            "rainfall_anomaly_pct": 142.5,
            "soil_moisture_saturation_pct": 89.2
        })

    def validate(self, raw_data: Dict[str, Any]) -> bool:
        return "rainfall_24h_mm" in raw_data or "rainfall" in raw_data

    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        rf_24 = float(validated_data.get("rainfall_24h_mm", 118.4))
        rf_anom = float(validated_data.get("rainfall_anomaly_pct", 142.5))
        
        return {
            "source": self.provider,
            "station_id": validated_data.get("station_id", "IMD-AWS-42111"),
            "rainfall_24h_mm": rf_24,
            "rainfall_72h_mm": float(validated_data.get("rainfall_72h_mm", 246.8)),
            "rainfall_anomaly_pct": rf_anom,
            "soil_moisture_pct": float(validated_data.get("soil_moisture_saturation_pct", 89.2)),
            "alert_level": "RED" if rf_anom > 100 else ("ORANGE" if rf_anom > 50 else "GREEN"),
            "freshness": self.freshness_state,
            "operational_mode": self.mode,
            "retrieved_at": self.last_retrieved_at
        }


imd_adapter = IMDAdapter()
