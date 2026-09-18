"""
ResQZone External Data Adapter Base Specification
Ensures clean isolation between external APIs, fallback demo caches, and normalization.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime, timezone


class BaseDataSourceAdapter(ABC):
    def __init__(self, source_id: str, provider: str, data_type: str):
        self.source_id = source_id
        self.provider = provider
        self.data_type = data_type
        self.freshness_state = "FRESH" # FRESH, AGING, STALE, DEGRADED, UNAVAILABLE
        self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
        self.mode = "DEMO" # DEMO, LIVE, OFFLINE

    @abstractmethod
    def fetch(self, live: bool = False) -> Dict[str, Any]:
        """Fetches raw observations from API or fallback store."""
        pass

    @abstractmethod
    def validate(self, raw_data: Dict[str, Any]) -> bool:
        """Validates payload schema and bounds."""
        pass

    @abstractmethod
    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes external formats to ResQZone standard schema."""
        pass

    def provenance(self) -> Dict[str, Any]:
        """Returns metadata regarding source, timestamp, and freshness state."""
        return {
            "source_id": self.source_id,
            "provider": self.provider,
            "data_type": self.data_type,
            "operational_mode": self.mode,
            "freshness": self.freshness_state,
            "retrieved_at": self.last_retrieved_at,
            "is_authoritative_official": self.mode == "LIVE",
            "is_synthetic_demo": self.mode == "DEMO"
        }
