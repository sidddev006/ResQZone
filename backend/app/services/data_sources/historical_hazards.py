"""
Historical Hazard Inventory Adapter
Provides historical event recurrences, past slip planes, and debris flows.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.services.data_sources.base import BaseDataSourceAdapter


class HistoricalHazardsAdapter(BaseDataSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="HISTORICAL_HAZARDS",
            provider="Geological Survey of India (GSI) Landslide Inventory",
            data_type="HISTORICAL_EVENTS"
        )

    def fetch(self, live: bool = False) -> Dict[str, Any]:
        self.mode = "DEMO"
        self.freshness_state = "FRESH"
        self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
        return self.normalize({
            "recorded_events": [
                {"year": 2021, "type": "Rishiganga Glacial Rock Avalanche & Flash Flood", "fatalities": 204},
                {"year": 2023, "type": "Joshimath Urban Land Subsidence Crisis", "cracked_buildings": 868},
                {"year": 2013, "type": "Kedarnath/Chamoli Extreme Cloudburst Flooding", "fatalities": 5700}
            ]
        })

    def validate(self, raw_data: Dict[str, Any]) -> bool:
        return "recorded_events" in raw_data

    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "source": self.provider,
            "events_count": len(validated_data.get("recorded_events", [])),
            "events": validated_data.get("recorded_events", []),
            "freshness": self.freshness_state,
            "operational_mode": self.mode,
            "retrieved_at": self.last_retrieved_at
        }


historical_hazards_adapter = HistoricalHazardsAdapter()
