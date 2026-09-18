"""
Digital Elevation Model (DEM) Adapter
Provides elevation, slope, aspect, and hydrological drainage basin properties.
"""
from typing import Dict, Any
from datetime import datetime, timezone
from backend.app.services.data_sources.base import BaseDataSourceAdapter


class DEMAdapter(BaseDataSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="DEM_TERRAIN",
            provider="Survey of India / Cartosat-3 DEM",
            data_type="DEM"
        )

    def fetch(self, live: bool = False) -> Dict[str, Any]:
        self.mode = "DEMO"
        self.freshness_state = "FRESH"
        self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
        return self.normalize({
            "dataset": "Cartosat-3 10m Pixel DEM",
            "region": "Alaknanda-Dhauliganga Basin, Chamoli",
            "elevation_min_m": 1200,
            "elevation_max_m": 2400,
            "mean_slope_degrees": 34.2
        })

    def validate(self, raw_data: Dict[str, Any]) -> bool:
        return "elevation_min_m" in raw_data

    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "source": self.provider,
            "resolution": "10m Ground Sample Distance",
            "mean_slope": validated_data.get("mean_slope_degrees", 34.2),
            "freshness": self.freshness_state,
            "operational_mode": self.mode,
            "retrieved_at": self.last_retrieved_at
        }


dem_adapter = DEMAdapter()
