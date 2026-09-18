"""
ResQZone Pydantic Schemas
Provides strong request/response typing for all API endpoints and OpenAPI documentation.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class LoginRequest(BaseModel):
    username: str
    password: str


# Habitation Schemas
class HabitationResponse(BaseModel):
    id: str
    name: str
    district: str
    sub_district: str
    latitude: float
    longitude: float
    total_population: int
    households_count: int
    vulnerable_population: int
    elderly_count: int
    children_count: int
    disabled_count: int
    medically_vulnerable_count: int
    housing_fragility_score: float
    slope_degrees: float
    elevation_meters: float
    road_access_distance_m: int
    primary_hazard_type: str
    hazard_score: float
    risk_category: str
    immediate_relocation_needed: bool
    evidence_panel: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Shelter Schemas
class ShelterResponse(BaseModel):
    id: str
    name: str
    shelter_type: str
    district: str
    latitude: float
    longitude: float
    rated_capacity: int
    safe_occupancy: int
    current_occupancy: int
    effective_safe_capacity: int
    available_safe_capacity: int
    capacity_utilization_pct: float
    capacity_status: str
    bottleneck_resource: str
    bottleneck_explanation: Optional[str] = None
    water_capacity_lpd: float
    sanitation_units: int
    food_capacity_meals_per_day: float
    medical_isolation_beds: int
    power_backup: bool
    is_open: bool

    class Config:
        from_attributes = True


# Relocation Plan Request & Response
class RelocationOptimizeRequest(BaseModel):
    blocked_road_ids: Optional[List[str]] = None
    disabled_shelter_ids: Optional[List[str]] = None
    strategy: str = Field(default="BALANCED", description="FASTEST | SAFEST | BALANCED")


# ResQ Twin Simulation Request & Response
class ResQTwinSimulateRequest(BaseModel):
    blocked_road_ids: Optional[List[str]] = Field(default_factory=list)
    disabled_shelter_ids: Optional[List[str]] = Field(default_factory=list)
    capacity_reduction_factors: Optional[Dict[str, float]] = Field(default_factory=dict)
    rainfall_spike_pct: float = Field(default=0.0)
    strategy: str = Field(default="BALANCED")


# Route Request & Response
class RouteQueryRequest(BaseModel):
    origin_node: str
    destination_node: str
    blocked_road_ids: Optional[List[str]] = None


# Copilot Request & Response
class CopilotQueryRequest(BaseModel):
    query: str


class CopilotQueryResponse(BaseModel):
    intent: str
    response: str
    structured_data: Optional[Any] = None
    suggested_actions: Optional[List[str]] = None


# Alert Create Request
class AlertCreateRequest(BaseModel):
    title: str
    severity: str = "WARNING"
    category: str = "MANUAL_DISPATCH"
    target_area: str
    affected_population: int
    message: str
    recommended_action: str
