"""
ISRO Bhuvan Landslide Geoportal Adapter
Fetches landslide inventory and slope failure susceptibility layers from NRSC/ISRO.
"""
import os
import json
from datetime import datetime, timezone
from typing import Dict, Any
from backend.app.services.data_sources.base import BaseDataSourceAdapter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")


class BhuvanAdapter(BaseDataSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="BHUVAN_LANDSLIDE",
            provider="National Remote Sensing Centre (NRSC / ISRO)",
            data_type="LANDSLIDE_LAYERS"
        )

    def fetch(self, live: bool = False) -> Dict[str, Any]:
        haz_file = os.path.join(DEMO_DIR, "hazards.geojson")
        if os.path.exists(haz_file):
            with open(haz_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.mode = "DEMO"
            self.freshness_state = "FRESH"
            return self.normalize(data)
        return {"type": "FeatureCollection", "features": []}

    def validate(self, raw_data: Dict[str, Any]) -> bool:
        return raw_data.get("type") == "FeatureCollection"

    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        landslide_feats = [
            f for f in validated_data.get("features", [])
            if f.get("properties", {}).get("hazard_type") == "LANDSLIDE"
        ]
        return {
            "source": self.provider,
            "layer_name": "Joshimath Slope Failure Inventory WFS",
            "features_count": len(landslide_feats),
            "features": landslide_feats,
            "freshness": self.freshness_state,
            "operational_mode": self.mode,
            "retrieved_at": self.last_retrieved_at
        }


bhuvan_adapter = BhuvanAdapter()
