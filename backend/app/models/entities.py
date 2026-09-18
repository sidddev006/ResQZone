"""
ResQZone SQLAlchemy Database Models
Includes Habitations, Shelters, Hazard Zones, Road Network, Relocation Plans,
ResQ Twin Scenarios, Alerts, Data Sources, Audit Logs, and Incident Reports.
"""
from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


def utcnow():
    return datetime.now(timezone.utc)


# ==========================================
# 1. USER, ROLE & AUDIT
# ==========================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="DISTRICT_AUTHORITY", nullable=False)
    organization = Column(String(128), default="Chamoli District Disaster Management Authority")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    audit_logs = relationship("AuditLog", back_populates="user")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(64), nullable=False) # e.g. "RELOCATION_PLAN_EXECUTED", "ROAD_BLOCKED_SIMULATION"
    resource_type = Column(String(64), nullable=False) # e.g. "scenario", "relocation_plan", "shelter"
    resource_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True) # JSON payload string
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")


# ==========================================
# 2. HABITATIONS & VULNERABILITY
# ==========================================
class Habitation(Base):
    __tablename__ = "habitations"

    id = Column(String(32), primary_key=True, index=True) # e.g. "HAB-01"
    name = Column(String(128), nullable=False, index=True)
    district = Column(String(64), default="Chamoli", index=True)
    sub_district = Column(String(64), default="Joshimath")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    total_population = Column(Integer, default=0)
    households_count = Column(Integer, default=0)
    vulnerable_population = Column(Integer, default=0)
    elderly_count = Column(Integer, default=0)
    children_count = Column(Integer, default=0)
    disabled_count = Column(Integer, default=0)
    medically_vulnerable_count = Column(Integer, default=0)
    
    housing_fragility_score = Column(Float, default=0.5)
    slope_degrees = Column(Float, default=25.0)
    elevation_meters = Column(Float, default=1800.0)
    road_access_distance_m = Column(Integer, default=200)
    
    primary_hazard_type = Column(String(32), default="LANDSLIDE")
    hazard_score = Column(Float, default=0.5)
    risk_category = Column(String(16), default="WATCH", index=True) # CRITICAL, WARNING, WATCH, SAFE
    immediate_relocation_needed = Column(Boolean, default=False, index=True)
    
    geometry_geojson = Column(Text, nullable=True) # JSON Point or Polygon
    meta_attributes = Column(Text, nullable=True) # JSON extra features
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


# ==========================================
# 3. SHELTERS & CARRYING CAPACITY
# ==========================================
class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(String(32), primary_key=True, index=True) # e.g. "SHELTER-01"
    name = Column(String(128), nullable=False, index=True)
    shelter_type = Column(String(64), default="COMMUNITY_HALL")
    district = Column(String(64), default="Chamoli")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    rated_capacity = Column(Integer, default=500)
    safe_occupancy = Column(Integer, default=400) # 80% safety margin
    current_occupancy = Column(Integer, default=0)
    
    # Resource metrics
    water_capacity_lpd = Column(Float, default=6000.0)
    sanitation_units = Column(Integer, default=20)
    food_capacity_meals_per_day = Column(Float, default=1200.0)
    medical_isolation_beds = Column(Integer, default=10)
    power_backup = Column(Boolean, default=True)
    
    # Calculated carrying capacity
    effective_safe_capacity = Column(Integer, default=400)
    bottleneck_resource = Column(String(32), default="water")
    capacity_status = Column(String(32), default="AVAILABLE", index=True) # AVAILABLE, NORMAL, HIGH_LOAD, OVER_CAPACITY, INACCESSIBLE
    capacity_utilization_pct = Column(Float, default=0.0)
    
    operating_status = Column(String(32), default="ACTIVE") # ACTIVE, STANDBY, HIGH_LOAD, MAINTENANCE, CLOSED
    accessibility_score = Column(Float, default=0.85)
    is_open = Column(Boolean, default=True)
    
    geometry_geojson = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


# ==========================================
# 4. HAZARD ZONES & OBSERVATIONS
# ==========================================
class HazardZone(Base):
    __tablename__ = "hazard_zones"

    id = Column(String(32), primary_key=True, index=True) # e.g. "HAZ-01"
    name = Column(String(128), nullable=False)
    hazard_type = Column(String(32), default="LANDSLIDE", index=True) # LANDSLIDE, FLOOD, EARTHQUAKE_EXPOSURE
    severity = Column(String(16), default="CRITICAL", index=True) # CRITICAL, HIGH, MODERATE, LOW
    risk_score = Column(Float, default=0.8)
    confidence_score = Column(Float, default=0.85)
    area_sqkm = Column(Float, default=1.0)
    
    drivers_json = Column(Text, nullable=True) # Key contributing factors
    geometry_geojson = Column(Text, nullable=False) # Polygon GeoJSON
    color_hex = Column(String(16), default="#EF4444")
    warning_message = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


# ==========================================
# 5. ROAD NETWORK & ROUTING
# ==========================================
class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(String(32), primary_key=True, index=True) # e.g. "ROAD-01"
    name = Column(String(128), nullable=False)
    from_node = Column(String(32), nullable=False, index=True)
    to_node = Column(String(32), nullable=False, index=True)
    from_name = Column(String(128), nullable=True)
    to_name = Column(String(128), nullable=True)
    
    distance_km = Column(Float, default=1.0)
    speed_limit_kmh = Column(Float, default=30.0)
    base_travel_time_min = Column(Float, default=2.0)
    road_class = Column(String(32), default="DISTRICT_ROAD")
    pavement_condition = Column(String(32), default="GOOD")
    
    slope_risk_score = Column(Float, default=0.2)
    hazard_exposure_score = Column(Float, default=0.2)
    is_blocked = Column(Boolean, default=False, index=True)
    blocked_reason = Column(String(256), nullable=True)
    
    geometry_geojson = Column(Text, nullable=False) # LineString GeoJSON
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


# ==========================================
# 6. RELOCATION PLANS & ASSIGNMENTS
# ==========================================
class RelocationPlan(Base):
    __tablename__ = "relocation_plans"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    is_baseline = Column(Boolean, default=True)
    scenario_id = Column(String(64), nullable=True, index=True)
    
    total_evacuees_targeted = Column(Integer, default=0)
    total_assigned = Column(Integer, default=0)
    total_unmet = Column(Integer, default=0)
    average_travel_time_min = Column(Float, default=0.0)
    average_route_risk = Column(Float, default=0.0)
    optimization_strategy = Column(String(32), default="BALANCED") # FASTEST, SAFEST, BALANCED
    
    status = Column(String(32), default="ACTIVE") # DRAFT, ACTIVE, COMPLETED, SUPERSEDED
    plan_summary_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)


class RelocationAssignment(Base):
    __tablename__ = "relocation_assignments"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(String(64), ForeignKey("relocation_plans.id"), nullable=False, index=True)
    habitation_id = Column(String(32), ForeignKey("habitations.id"), nullable=False, index=True)
    shelter_id = Column(String(32), ForeignKey("shelters.id"), nullable=False, index=True)
    
    allocated_population = Column(Integer, default=0)
    vulnerable_groups_count = Column(Integer, default=0)
    travel_time_min = Column(Float, default=0.0)
    distance_km = Column(Float, default=0.0)
    route_risk_score = Column(Float, default=0.0)
    route_strategy = Column(String(32), default="BALANCED")
    route_path_nodes = Column(Text, nullable=True) # JSON list of node IDs
    route_geojson = Column(Text, nullable=True)


# ==========================================
# 7. RESQ TWIN — SCENARIOS & WHAT-IF SIMULATIONS
# ==========================================
class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    base_plan_id = Column(String(64), nullable=True)
    
    parameters_json = Column(Text, nullable=False) # Parameters e.g. blocked_roads, closed_shelters, rainfall_spike
    impact_summary_json = Column(Text, nullable=True) # Baseline vs Scenario delta
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)


# ==========================================
# 8. ALERTS & DISPATCH
# ==========================================
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    severity = Column(String(16), default="WARNING", index=True) # INFO, WATCH, WARNING, CRITICAL
    category = Column(String(32), default="LANDSLIDE_ALERT")
    target_area = Column(String(128), default="Joshimath Central Sector")
    affected_population = Column(Integer, default=0)
    
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    source = Column(String(64), default="ResQZone AI Hazard Pipeline")
    is_read = Column(Boolean, default=False)
    is_dispatched = Column(Boolean, default=False)
    fcm_status = Column(String(32), default="DEMO_DISPATCHED")
    sms_status = Column(String(32), default="DEMO_DELIVERED")
    
    created_at = Column(DateTime, default=utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)


# ==========================================
# 9. DATA SOURCES & HEALTH
# ==========================================
class DataSourceHealth(Base):
    __tablename__ = "data_sources"

    id = Column(String(32), primary_key=True, index=True) # e.g. "IMD_WEATHER", "BHUVAN_LANDSLIDE"
    name = Column(String(128), nullable=False)
    provider = Column(String(128), nullable=False)
    data_type = Column(String(64), nullable=False) # WEATHER, SATELLITE_INSAR, DEM, CENSUS, OSM
    
    status = Column(String(16), default="FRESH", index=True) # FRESH, AGING, STALE, DEGRADED, UNAVAILABLE
    operational_mode = Column(String(16), default="DEMO") # DEMO, LIVE, OFFLINE_CACHE
    latency_ms = Column(Integer, default=45)
    last_sync_time = Column(DateTime, default=utcnow)
    confidence_rating = Column(Float, default=0.92)
    endpoint_url = Column(String(256), nullable=True)
    notes = Column(Text, nullable=True)


# ==========================================
# 10. INCIDENT REPORTS
# ==========================================
class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(String(64), primary_key=True, index=True) # e.g. "REP-2026-09-001"
    title = Column(String(256), nullable=False)
    district = Column(String(64), default="Chamoli")
    author = Column(String(128), default="DEOC Duty Officer")
    summary = Column(Text, nullable=False)
    content_json = Column(Text, nullable=False) # Complete structured report payload
    created_at = Column(DateTime, default=utcnow, index=True)
