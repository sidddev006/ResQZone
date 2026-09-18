"""
ResQZone Multi-Hazard Intelligence Engine
Implements common hazard abstraction across Landslide, Flood, and Seismic Exposure layers.
Combines deterministic GIS modeling with calibrated ML risk estimators.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.core.config import settings
from backend.app.ml.xgb_hazard import hazard_ml
from backend.app.ml.explain import generate_evidence_panel


class HazardIntelligenceEngine:
    """
    Unified multi-hazard evaluation service.
    """
    def __init__(self):
        self.ml_model = hazard_ml

    def evaluate_landslide_risk(
        self,
        slope_degrees: float,
        rainfall_24h_mm: float,
        rainfall_anomaly_pct: float,
        soil_saturation_pct: float,
        insar_rate_cm_month: float,
        fragility: float
    ) -> Dict[str, Any]:
        """
        Deterministic GIS scoring combined with ML inference for landslide susceptibility.
        """
        weights = settings.LANDSLIDE_WEIGHTS
        
        # 1. Deterministic physical score
        slope_norm = min(1.0, max(0.0, (slope_degrees - 15.0) / 30.0))
        rf_norm = min(1.0, max(0.0, rainfall_24h_mm / 150.0))
        rf_anom_norm = min(1.0, max(0.0, (rainfall_anomaly_pct + 20.0) / 160.0))
        insar_norm = min(1.0, max(0.0, insar_rate_cm_month / 8.0))
        soil_norm = min(1.0, max(0.0, soil_saturation_pct / 100.0))
        
        deterministic_score = (
            weights["slope"] * slope_norm +
            weights["rainfall_24h"] * rf_norm +
            weights["rainfall_anomaly"] * rf_anom_norm +
            weights["recent_deformation"] * insar_norm +
            weights["geology_fragility"] * fragility +
            weights["historical_proximity"] * 0.8
        )
        
        # 2. ML model prediction
        ml_input = {
            "slope_degrees": slope_degrees,
            "rainfall_24h_mm": rainfall_24h_mm,
            "rainfall_anomaly_pct": rainfall_anomaly_pct,
            "soil_moisture_saturation_pct": soil_saturation_pct,
            "insar_subsidence_velocity_cm_month": insar_rate_cm_month,
            "housing_fragility_index": fragility,
            "fault_line_proximity_km": 4.5
        }
        ml_result = self.ml_model.predict_hazard_score(ml_input)
        ml_score = ml_result["hazard_score"]
        
        # 3. Hybrid fusion (70% deterministic geotechnical + 30% ML estimator)
        fused_score = round(0.70 * deterministic_score + 0.30 * ml_score, 3)
        
        return {
            "hazard_type": "LANDSLIDE",
            "fused_risk_score": fused_score,
            "deterministic_score": round(deterministic_score, 3),
            "ml_score": ml_score,
            "ml_details": ml_result
        }

    def evaluate_flood_risk(
        self,
        elevation_m: float,
        river_distance_km: float,
        rainfall_72h_mm: float,
        flow_accumulation: float = 0.75
    ) -> Dict[str, Any]:
        """
        Deterministic flood & flash surge scoring.
        """
        weights = settings.FLOOD_WEIGHTS
        
        dist_norm = max(0.0, 1.0 - (river_distance_km / 2.0))
        rf_norm = min(1.0, rainfall_72h_mm / 250.0)
        elev_factor = 0.9 if elevation_m < 1600.0 else 0.4
        
        score = (
            weights["channel_proximity"] * dist_norm +
            weights["rainfall_72h"] * rf_norm +
            weights["elevation_anomaly"] * elev_factor +
            weights["drainage_impedance"] * flow_accumulation
        )
        
        return {
            "hazard_type": "FLOOD",
            "fused_risk_score": round(min(1.0, max(0.0, score)), 3)
        }

    def evaluate_earthquake_exposure(
        self,
        fault_distance_km: float = 3.5,
        housing_fragility: float = 0.8
    ) -> Dict[str, Any]:
        """
        Evaluates structural seismic vulnerability & tectonic fault exposure.
        NOTE: Clearly specified as structural exposure, NOT earthquake prediction.
        """
        fault_proximity_factor = max(0.0, 1.0 - (fault_distance_km / 10.0))
        score = round(0.60 * fault_proximity_factor + 0.40 * housing_fragility, 3)
        
        return {
            "hazard_type": "EARTHQUAKE_EXPOSURE",
            "fused_risk_score": min(1.0, max(0.0, score)),
            "seismic_zone": "Zone V (Highest Severity Index in Indian Building Code IS 1893)",
            "scientific_disclaimer": "This is a deterministic tectonic exposure layer; ResQZone does not predict earthquake occurrence."
        }


hazard_engine = HazardIntelligenceEngine()
