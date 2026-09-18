"""
Demographics & Census Adapter
Aggregates household vulnerable cohort counts (elderly, children, persons with disabilities).
"""
import os
import csv
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.services.data_sources.base import BaseDataSourceAdapter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")


class DemographicsAdapter(BaseDataSourceAdapter):
    def __init__(self):
        super().__init__(
            source_id="CENSUS_DEMO",
            provider="Census Register & SDMA Social Vulnerability Survey",
            data_type="CENSUS"
        )

    def fetch(self, live: bool = False) -> Dict[str, Any]:
        csv_file = os.path.join(DEMO_DIR, "population.csv")
        records = []
        if os.path.exists(csv_file):
            with open(csv_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                records = list(reader)
        
        self.mode = "DEMO"
        self.freshness_state = "FRESH"
        self.last_retrieved_at = datetime.now(timezone.utc).isoformat()
        return self.normalize({"records": records})

    def validate(self, raw_data: Dict[str, Any]) -> bool:
        return "records" in raw_data

    def normalize(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        records = validated_data.get("records", [])
        total_pop = sum(int(r.get("total_population", 0)) for r in records)
        return {
            "source": self.provider,
            "district": "Chamoli",
            "habitations_count": len(records),
            "total_surveyed_population": total_pop,
            "freshness": self.freshness_state,
            "operational_mode": self.mode,
            "retrieved_at": self.last_retrieved_at
        }


demographics_adapter = DemographicsAdapter()
