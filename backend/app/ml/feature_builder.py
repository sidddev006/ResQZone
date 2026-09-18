"""
ResQZone ML Feature Builder
Standardizes GIS, meteorological, and satellite inputs into validated numeric feature arrays.
"""
from typing import Dict, Any, List
import numpy as np


FEATURE_NAMES = [
    "slope_degrees",
    "elevation_meters",
    "rainfall_24h_mm",
    "rainfall_72h_mm",
    "rainfall_anomaly_pct",
    "soil_moisture_saturation_pct",
    "insar_subsidence_velocity_cm_month",
    "housing_fragility_index",
    "river_channel_proximity_km",
    "fault_line_proximity_km"
]


def extract_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Extracts standardized feature vector for hazard scoring.
    Fills missing values with conservative physical defaults.
    """
    vector = [
        float(data.get("slope_degrees", 25.0)),
        float(data.get("elevation_meters", 1800.0)),
        float(data.get("rainfall_24h_mm", 45.0)),
        float(data.get("rainfall_72h_mm", 110.0)),
        float(data.get("rainfall_anomaly_pct", 20.0)),
        float(data.get("soil_moisture_saturation_pct", 65.0)),
        float(data.get("insar_subsidence_velocity_cm_month", 1.2)),
        float(data.get("housing_fragility_index", 0.6)),
        float(data.get("river_channel_proximity_km", 2.5)),
        float(data.get("fault_line_proximity_km", 8.0))
    ]
    return np.array(vector, dtype=np.float32)


def batch_extract_features(items: List[Dict[str, Any]]) -> np.ndarray:
    return np.array([extract_features(item) for item in items], dtype=np.float32)
