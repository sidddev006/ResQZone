"""
ResQZone FastAPI v1 API Routes
Implements comprehensive REST endpoints for Auth, Dashboard, Hazards, Habitations,
Carrying Capacity, Relocation Optimization, ResQ Twin Simulation, Alerts, Copilot, and Reports.
"""
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import (
    verify_password, create_access_token, get_current_user, require_role, Role
)
from backend.app.models.entities import (
    User, Habitation, Shelter, HazardZone, RoadSegment,
    RelocationPlan, RelocationAssignment, Scenario, Alert,
    DataSourceHealth, IncidentReport, AuditLog
)
from backend.app.schemas.all_schemas import (
    LoginRequest, TokenResponse, RelocationOptimizeRequest,
    ResQTwinSimulateRequest, RouteQueryRequest, CopilotQueryRequest,
    CopilotQueryResponse, AlertCreateRequest
)
from backend.app.services.hazard.hazard_engine import hazard_engine
from backend.app.services.vulnerability.vulnerability_engine import vulnerability_engine
from backend.app.services.capacity.capacity_engine import capacity_engine
from backend.app.services.routing.routing_engine import routing_engine
from backend.app.services.relocation.relocation_engine import relocation_optimizer
from backend.app.services.scenarios.resq_twin import resq_twin
from backend.app.services.alerts.alert_engine import alert_engine
from backend.app.services.reports.report_engine import report_engine
from backend.app.services.copilot.copilot_engine import copilot_engine
from backend.app.services.data_sources.imd import imd_adapter
from backend.app.services.data_sources.sentinel import sentinel_adapter
from backend.app.ml.explain import generate_evidence_panel

api_router = APIRouter()


# ==========================================
# 1. AUTHENTICATION
# ==========================================
@api_router.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "district": user.organization}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "organization": user.organization
        }
    }


@api_router.get("/auth/me", tags=["Authentication"])
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


# ==========================================
# 2. REGIONS & MULTI-DISTRICT CATALOG
# ==========================================
from backend.app.db.seed_multi_region import REGIONS

@api_router.get("/regions", tags=["Regions"])
def list_supported_regions():
    """Returns list of all monitored disaster-prone regions across India."""
    return REGIONS


# ==========================================
# 3. DASHBOARD / COMMAND CENTER OVERVIEW
# ==========================================
@api_router.get("/dashboard/kpis", tags=["Dashboard"])
def get_dashboard_kpis(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query_habs = db.query(Habitation)
    query_shelters = db.query(Shelter)

    if district and district.upper() != "ALL":
        query_habs = query_habs.filter(Habitation.district.ilike(f"%{district}%"))
        query_shelters = query_shelters.filter(Shelter.district.ilike(f"%{district}%"))

    habs = query_habs.all()
    critical_habs = [h for h in habs if h.risk_category == "CRITICAL"]
    warning_habs = [h for h in habs if h.risk_category == "WARNING"]
    immediate_reloc = [h for h in habs if h.immediate_relocation_needed]
    
    total_people_risk = sum(h.total_population for h in critical_habs)
    total_vuln_risk = sum(h.vulnerable_population for h in critical_habs)
    
    shelters = query_shelters.all()
    total_safe_capacity = sum(s.effective_safe_capacity for s in shelters)
    current_occupancy = sum(s.current_occupancy for s in shelters)
    available_capacity = max(0, total_safe_capacity - current_occupancy)
    
    unresolved_alerts = db.query(Alert).filter(Alert.is_read == False).count()
    data_sources_count = db.query(DataSourceHealth).count()
    fresh_sources = db.query(DataSourceHealth).filter(DataSourceHealth.status == "FRESH").count()

    selected_reg = next((r for r in REGIONS if district and (r["district"].lower() in district.lower() or r["id"].lower() == district.lower())), None)
    dist_label = selected_reg["name"] if selected_reg else ("National Overview" if not district or district.upper() == "ALL" else district)

    return {
        "critical_zones_count": len(critical_habs),
        "warning_zones_count": len(warning_habs),
        "immediate_relocation_candidates_count": len(immediate_reloc),
        "total_habitations_count": len(habs),
        "total_shelters_count": len(shelters),
        "people_at_risk": total_people_risk,
        "vulnerable_people_at_risk": total_vuln_risk,
        "total_safe_capacity": total_safe_capacity,
        "current_shelter_occupancy": current_occupancy,
        "available_safe_capacity": available_capacity,
        "capacity_utilization_pct": round((current_occupancy / total_safe_capacity) * 100, 1) if total_safe_capacity > 0 else 0,
        "unresolved_alerts_count": unresolved_alerts,
        "data_sources_healthy": f"{fresh_sources}/{data_sources_count}",
        "district": dist_label,
        "state": selected_reg["state"] if selected_reg else "India",
        "operational_mode": settings.DATA_MODE,
        "is_synthetic_demo": True
    }


# ==========================================
# 4. HAZARDS & RISK INTELLIGENCE
# ==========================================
@api_router.get("/hazards/zones", tags=["Hazards"])
def get_hazard_zones(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    zones = db.query(HazardZone).all()
    features = []
    for z in zones:
        drivers = json.loads(z.drivers_json) if z.drivers_json else {}
        z_district = drivers.get("district", "")
        if district and district.upper() != "ALL":
            if z_district and district.lower() not in z_district.lower() and district.lower() not in z.name.lower():
                continue

        features.append({
            "type": "Feature",
            "geometry": json.loads(z.geometry_geojson),
            "properties": {
                "id": z.id,
                "name": z.name,
                "district": z_district,
                "hazard_type": z.hazard_type,
                "severity": z.severity,
                "risk_score": z.risk_score,
                "confidence_score": z.confidence_score,
                "area_sqkm": z.area_sqkm,
                "color": z.color_hex,
                "drivers": drivers,
                "warning_message": z.warning_message
            }
        })
    return {
        "type": "FeatureCollection",
        "metadata": {"title": "Active Multi-Hazard Zones", "crs": "CRS84"},
        "features": features
    }


# ==========================================
# 5. HABITATIONS & EVIDENCE
# ==========================================
@api_router.get("/habitations", tags=["Habitations"])
def list_habitations(
    district: Optional[str] = None,
    risk_category: Optional[str] = None,
    limit: int = 200,
    db: Session = Depends(get_db)
):
    query = db.query(Habitation)
    if district and district.upper() != "ALL":
        query = query.filter(Habitation.district.ilike(f"%{district}%"))
    if risk_category and risk_category.upper() != "ALL":
        query = query.filter(Habitation.risk_category == risk_category.upper())
    habs = query.limit(limit).all()

    weather = imd_adapter.fetch()
    satellite = sentinel_adapter.fetch()

    result = []
    for h in habs:
        # Generate full Evidence & Confidence panel for each
        ml_eval = hazard_engine.evaluate_landslide_risk(
            slope_degrees=h.slope_degrees,
            rainfall_24h_mm=weather.get("rainfall_24h_mm", 118.4),
            rainfall_anomaly_pct=weather.get("rainfall_anomaly_pct", 142.5),
            soil_saturation_pct=weather.get("soil_moisture_pct", 89.2),
            insar_rate_cm_month=satellite.get("rate_cm_month", 7.4),
            fragility=h.housing_fragility_score
        )
        
        evidence = generate_evidence_panel(
            habitation_name=h.name,
            hazard_score=h.hazard_score,
            vulnerability_score=h.housing_fragility_score,
            ml_details=ml_eval["ml_details"],
            weather_info=weather,
            satellite_info=satellite,
            slope=h.slope_degrees,
            fragility=h.housing_fragility_score
        )
        
        item = {
            "id": h.id,
            "name": h.name,
            "district": h.district,
            "sub_district": h.sub_district,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "total_population": h.total_population,
            "households_count": h.households_count,
            "vulnerable_population": h.vulnerable_population,
            "elderly_count": h.elderly_count,
            "children_count": h.children_count,
            "disabled_count": h.disabled_count,
            "medically_vulnerable_count": h.medically_vulnerable_count,
            "housing_fragility_score": h.housing_fragility_score,
            "slope_degrees": h.slope_degrees,
            "elevation_meters": h.elevation_meters,
            "road_access_distance_m": h.road_access_distance_m,
            "primary_hazard_type": h.primary_hazard_type,
            "hazard_score": h.hazard_score,
            "risk_category": h.risk_category,
            "immediate_relocation_needed": h.immediate_relocation_needed,
            "evidence_panel": evidence
        }
        result.append(item)
    return result


@api_router.get("/habitations/{habitation_id}", tags=["Habitations"])
def get_habitation_detail(habitation_id: str, db: Session = Depends(get_db)):
    h = db.query(Habitation).filter(Habitation.id == habitation_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Habitation not found")

    weather = imd_adapter.fetch()
    satellite = sentinel_adapter.fetch()

    ml_eval = hazard_engine.evaluate_landslide_risk(
        slope_degrees=h.slope_degrees,
        rainfall_24h_mm=weather.get("rainfall_24h_mm", 118.4),
        rainfall_anomaly_pct=weather.get("rainfall_anomaly_pct", 142.5),
        soil_saturation_pct=weather.get("soil_moisture_pct", 89.2),
        insar_rate_cm_month=satellite.get("rate_cm_month", 7.4),
        fragility=h.housing_fragility_score
    )

    vuln_profile = vulnerability_engine.compute_vulnerability_profile(
        total_population=h.total_population,
        elderly_count=h.elderly_count,
        children_count=h.children_count,
        disabled_count=h.disabled_count,
        medical_needs_count=h.medically_vulnerable_count,
        housing_fragility_score=h.housing_fragility_score,
        road_access_distance_m=h.road_access_distance_m,
        slope_degrees=h.slope_degrees
    )

    evidence = generate_evidence_panel(
        habitation_name=h.name,
        hazard_score=h.hazard_score,
        vulnerability_score=vuln_profile["vulnerability_score"],
        ml_details=ml_eval["ml_details"],
        weather_info=weather,
        satellite_info=satellite,
        slope=h.slope_degrees,
        fragility=h.housing_fragility_score
    )

    return {
        "habitation": {
            "id": h.id,
            "name": h.name,
            "district": h.district,
            "sub_district": h.sub_district,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "total_population": h.total_population,
            "households_count": h.households_count,
            "vulnerable_population": h.vulnerable_population,
            "slope_degrees": h.slope_degrees,
            "elevation_meters": h.elevation_meters,
            "primary_hazard_type": h.primary_hazard_type,
            "hazard_score": h.hazard_score,
            "risk_category": h.risk_category,
            "immediate_relocation_needed": h.immediate_relocation_needed
        },
        "vulnerability_profile": vuln_profile,
        "hazard_evaluation": ml_eval,
        "evidence_panel": evidence
    }


# ==========================================
# 6. CARRYING CAPACITY
# ==========================================
@api_router.get("/capacity/shelters", tags=["Carrying Capacity"])
def get_all_shelters_capacity(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Shelter)
    if district and district.upper() != "ALL":
        query = query.filter(Shelter.district.ilike(f"%{district}%"))
    shelters = query.all()
    results = []
    for s in shelters:
        cap = capacity_engine.evaluate_shelter_capacity(
            shelter_id=s.id,
            name=s.name,
            rated_capacity=s.rated_capacity,
            safe_occupancy=s.safe_occupancy,
            current_occupancy=s.current_occupancy,
            water_capacity_lpd=s.water_capacity_lpd,
            sanitation_units=s.sanitation_units,
            food_meals_daily=s.food_capacity_meals_per_day,
            medical_isolation_beds=s.medical_isolation_beds,
            power_backup=s.power_backup,
            is_open=s.is_open
        )
        cap["shelter_type"] = s.shelter_type
        cap["district"] = s.district
        cap["latitude"] = s.latitude
        cap["longitude"] = s.longitude
        results.append(cap)
    return results


# ==========================================
# 7. ROUTING & CANDIDATE ROUTES
# ==========================================
@api_router.post("/routes/calculate", tags=["Routing"])
def calculate_route_options(req: RouteQueryRequest, db: Session = Depends(get_db)):
    roads = db.query(RoadSegment).all()
    roads_list = [
        {
            "id": r.id,
            "from_node": r.from_node,
            "to_node": r.to_node,
            "name": r.name,
            "distance_km": r.distance_km,
            "speed_limit_kmh": r.speed_limit_kmh,
            "base_travel_time_min": r.base_travel_time_min,
            "hazard_exposure_score": r.hazard_exposure_score,
            "is_blocked": r.is_blocked
        }
        for r in roads
    ]
    return routing_engine.calculate_candidate_routes(
        origin_node=req.origin_node,
        destination_node=req.destination_node,
        road_segments=roads_list,
        blocked_road_ids=req.blocked_road_ids
    )


@api_router.get("/routes/network", tags=["Routing"])
def get_road_network(
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RoadSegment)
    if district and district.upper() != "ALL":
        # Check roads matching district
        query = query.filter(RoadSegment.name.ilike(f"%{district}%"))
    roads = db.query(RoadSegment).all()
    features = []
    for r in roads:
        features.append({
            "type": "Feature",
            "geometry": json.loads(r.geometry_geojson),
            "properties": {
                "id": r.id,
                "name": r.name,
                "from_node": r.from_node,
                "to_node": r.to_node,
                "from_name": r.from_name,
                "to_name": r.to_name,
                "distance_km": r.distance_km,
                "base_travel_time_min": r.base_travel_time_min,
                "road_class": r.road_class,
                "pavement_condition": r.pavement_condition,
                "hazard_exposure_score": r.hazard_exposure_score,
                "is_blocked": r.is_blocked,
                "blocked_reason": r.blocked_reason
            }
        })
    return {
        "type": "FeatureCollection",
        "metadata": {"title": "Evacuation Road Corridors", "crs": "CRS84"},
        "features": features
    }


# ==========================================
# 7. RELOCATION OPTIMIZER
# ==========================================
@api_router.post("/relocation/optimize", tags=["Relocation"])
def optimize_relocation(req: RelocationOptimizeRequest, db: Session = Depends(get_db)):
    habs = [
        {
            "id": h.id,
            "name": h.name,
            "total_population": h.total_population,
            "vulnerable_population": h.vulnerable_population,
            "housing_fragility_score": h.housing_fragility_score,
            "slope_degrees": h.slope_degrees,
            "road_access_distance_m": h.road_access_distance_m,
            "primary_hazard_type": h.primary_hazard_type,
            "hazard_score": h.hazard_score,
            "risk_category": h.risk_category,
            "immediate_relocation_needed": h.immediate_relocation_needed
        }
        for h in db.query(Habitation).all()
    ]

    shelters = [
        {
            "id": s.id,
            "name": s.name,
            "rated_capacity": s.rated_capacity,
            "safe_occupancy": s.safe_occupancy,
            "current_occupancy": s.current_occupancy,
            "water_capacity_lpd": s.water_capacity_lpd,
            "sanitation_units": s.sanitation_units,
            "food_capacity_meals_per_day": s.food_capacity_meals_per_day,
            "medical_isolation_beds": s.medical_isolation_beds,
            "power_backup": s.power_backup,
            "is_open": s.is_open
        }
        for s in db.query(Shelter).all()
    ]

    roads = [
        {
            "id": r.id,
            "from_node": r.from_node,
            "to_node": r.to_node,
            "name": r.name,
            "distance_km": r.distance_km,
            "speed_limit_kmh": r.speed_limit_kmh,
            "base_travel_time_min": r.base_travel_time_min,
            "hazard_exposure_score": r.hazard_exposure_score,
            "is_blocked": r.is_blocked
        }
        for r in db.query(RoadSegment).all()
    ]

    weather = imd_adapter.fetch()

    plan = relocation_optimizer.solve_relocation_plan(
        habitations=habs,
        shelters=shelters,
        road_segments=roads,
        blocked_road_ids=req.blocked_road_ids,
        disabled_shelter_ids=req.disabled_shelter_ids,
        strategy=req.strategy,
        weather_data=weather
    )
    return plan


# ==========================================
# 8. MAJOR INNOVATION: RESQ TWIN SIMULATOR
# ==========================================
@api_router.post("/scenarios/resq-twin/simulate", tags=["ResQ Twin Simulator"])
def simulate_resq_twin(req: ResQTwinSimulateRequest, db: Session = Depends(get_db)):
    habs = [
        {
            "id": h.id,
            "name": h.name,
            "total_population": h.total_population,
            "vulnerable_population": h.vulnerable_population,
            "housing_fragility_score": h.housing_fragility_score,
            "slope_degrees": h.slope_degrees,
            "road_access_distance_m": h.road_access_distance_m,
            "primary_hazard_type": h.primary_hazard_type,
            "hazard_score": h.hazard_score,
            "risk_category": h.risk_category,
            "immediate_relocation_needed": h.immediate_relocation_needed
        }
        for h in db.query(Habitation).all()
    ]

    shelters = [
        {
            "id": s.id,
            "name": s.name,
            "rated_capacity": s.rated_capacity,
            "safe_occupancy": s.safe_occupancy,
            "current_occupancy": s.current_occupancy,
            "water_capacity_lpd": s.water_capacity_lpd,
            "sanitation_units": s.sanitation_units,
            "food_capacity_meals_per_day": s.food_capacity_meals_per_day,
            "medical_isolation_beds": s.medical_isolation_beds,
            "power_backup": s.power_backup,
            "is_open": s.is_open
        }
        for s in db.query(Shelter).all()
    ]

    roads = [
        {
            "id": r.id,
            "from_node": r.from_node,
            "to_node": r.to_node,
            "name": r.name,
            "distance_km": r.distance_km,
            "speed_limit_kmh": r.speed_limit_kmh,
            "base_travel_time_min": r.base_travel_time_min,
            "hazard_exposure_score": r.hazard_exposure_score,
            "is_blocked": r.is_blocked
        }
        for r in db.query(RoadSegment).all()
    ]

    simulation_result = resq_twin.run_simulation(
        habitations=habs,
        shelters=shelters,
        road_segments=roads,
        blocked_road_ids=req.blocked_road_ids,
        disabled_shelter_ids=req.disabled_shelter_ids,
        capacity_reduction_factors=req.capacity_reduction_factors,
        rainfall_spike_pct=req.rainfall_spike_pct,
        strategy=req.strategy
    )

    # Log to audit trail
    audit = AuditLog(
        action="RESQ_TWIN_SIMULATION_RUN",
        resource_type="scenario",
        resource_id=simulation_result["simulation_id"],
        details=json.dumps(simulation_result["scenario_parameters"]),
        ip_address="127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return simulation_result


# ==========================================
# 9. ALERTS
# ==========================================
@api_router.get("/alerts", tags=["Alerts"])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()


@api_router.post("/alerts", tags=["Alerts"])
def create_new_alert(
    req: AlertCreateRequest,
    current_user: dict = Depends(require_role(Role.DISTRICT_AUTHORITY)),
    db: Session = Depends(get_db)
):
    alert_dict = alert_engine.create_alert(
        title=req.title,
        severity=req.severity,
        category=req.category,
        target_area=req.target_area,
        affected_population=req.affected_population,
        message=req.message,
        recommended_action=req.recommended_action
    )

    if not alert_dict:
        raise HTTPException(
            status_code=409,
            detail="Duplicate active alert already exists for this sector and severity. Suppressed by deduplication filter."
        )

    db_alert = Alert(
        id=alert_dict["id"],
        title=alert_dict["title"],
        severity=alert_dict["severity"],
        category=alert_dict["category"],
        target_area=alert_dict["target_area"],
        affected_population=alert_dict["affected_population"],
        message=alert_dict["message"],
        recommended_action=alert_dict["recommended_action"],
        source=alert_dict["source"],
        is_read=False,
        is_dispatched=True,
        fcm_status=alert_dict["fcm_status"],
        sms_status=alert_dict["sms_status"],
        expires_at=datetime.fromisoformat(alert_dict["expires_at"])
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@api_router.patch("/alerts/{alert_id}/acknowledge", tags=["Alerts"])
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "acknowledged", "alert_id": alert_id}


# ==========================================
# 10. AI COPILOT
# ==========================================
@api_router.post("/copilot/query", response_model=CopilotQueryResponse, tags=["AI Copilot"])
def ask_copilot(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    return copilot_engine.process_query(req.query, db)


# ==========================================
# 11. REPORTS
# ==========================================
@api_router.get("/reports/district-brief", tags=["Reports"])
def generate_district_report(db: Session = Depends(get_db)):
    return report_engine.generate_district_brief(db)


@api_router.get("/reports", tags=["Reports"])
def list_reports(db: Session = Depends(get_db)):
    return db.query(IncidentReport).order_by(IncidentReport.created_at.desc()).all()


# ==========================================
# 12. DATA SOURCES & HEALTH
# ==========================================
@api_router.get("/data-sources", tags=["Data Sources"])
def list_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSourceHealth).all()


# ==========================================
# 13. AUDIT LOGS
# ==========================================
@api_router.get("/audit-logs", tags=["Audit Log"])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": json.loads(l.details) if l.details else {},
            "timestamp": l.timestamp.isoformat(),
            "ip_address": l.ip_address
        }
        for l in logs
    ]
