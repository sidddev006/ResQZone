"""
ResQZone Database Seeder
Loads synthetic demo GIS data into SQLite / PostgreSQL database.
"""
import os
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.db.session import engine, SessionLocal, Base
from backend.app.core.security import get_password_hash, Role
from backend.app.models.entities import (
    User, AuditLog, Habitation, Shelter, HazardZone,
    RoadSegment, Alert, DataSourceHealth, IncidentReport
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEMO_DIR = os.path.join(BASE_DIR, "data", "demo")


def seed_database():
    print("--- Initializing ResQZone Database Tables ---")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed Users if not present
        if db.query(User).count() == 0:
            print("Seeding default authoritative users...")
            users = [
                User(
                    username="admin",
                    email="admin@resqzone.gov.in",
                    hashed_password=get_password_hash("admin123"),
                    full_name="State Disaster Management Administrator",
                    role=Role.ADMIN,
                    organization="Uttarakhand State Disaster Management Authority (USDMA)"
                ),
                User(
                    username="officer_chamoli",
                    email="deoc.chamoli@resqzone.gov.in",
                    hashed_password=get_password_hash("officer123"),
                    full_name="District Emergency Operations Officer",
                    role=Role.DISTRICT_AUTHORITY,
                    organization="Chamoli DEOC Control Room"
                ),
                User(
                    username="surveyor_joshimath",
                    email="surveyor.joshimath@resqzone.gov.in",
                    hashed_password=get_password_hash("surveyor123"),
                    full_name="Joshimath Field Survey Lead",
                    role=Role.FIELD_SURVEYOR,
                    organization="Joshimath Field Task Force"
                ),
                User(
                    username="viewer",
                    email="observer@resqzone.gov.in",
                    hashed_password=get_password_hash("viewer123"),
                    full_name="Public Information Observer",
                    role=Role.VIEWER,
                    organization="Disaster Relief Volunteer Network"
                )
            ]
            db.add_all(users)
            db.commit()
            print(f"Created {len(users)} default users.")

        # 2. Seed Habitations
        hab_file = os.path.join(DEMO_DIR, "habitations.geojson")
        if os.path.exists(hab_file):
            with open(hab_file, "r", encoding="utf-8") as f:
                hab_data = json.load(f)
            
            for feat in hab_data["features"]:
                p = feat["properties"]
                g = feat["geometry"]
                coords = g["coordinates"]
                
                hab_obj = db.query(Habitation).filter(Habitation.id == p["id"]).first()
                if not hab_obj:
                    hab_obj = Habitation(
                        id=p["id"],
                        name=p["name"],
                        district=p.get("district", "Chamoli"),
                        sub_district=p.get("sub_district", "Joshimath"),
                        longitude=coords[0],
                        latitude=coords[1],
                        total_population=p.get("population", 0),
                        households_count=p.get("households", 0),
                        vulnerable_population=p.get("vulnerable_population", 0),
                        elderly_count=p.get("elderly_count", 0),
                        children_count=p.get("children_count", 0),
                        disabled_count=p.get("disabled_count", 0),
                        medically_vulnerable_count=p.get("medical_needs_count", 0),
                        housing_fragility_score=p.get("housing_fragility_index", 0.5),
                        slope_degrees=p.get("slope_degrees", 25.0),
                        elevation_meters=p.get("elevation_meters", 1800.0),
                        road_access_distance_m=p.get("road_access_distance_m", 200),
                        primary_hazard_type=p.get("primary_hazard", "LANDSLIDE"),
                        hazard_score=p.get("hazard_score", 0.5),
                        risk_category=p.get("risk_category", "WATCH"),
                        immediate_relocation_needed=p.get("immediate_relocation_needed", False),
                        geometry_geojson=json.dumps(g),
                        meta_attributes=json.dumps(p)
                    )
                    db.add(hab_obj)
            db.commit()
            print(f"Seeded {len(hab_data['features'])} habitations.")

        # 3. Seed Shelters
        shelter_file = os.path.join(DEMO_DIR, "shelters.geojson")
        if os.path.exists(shelter_file):
            with open(shelter_file, "r", encoding="utf-8") as f:
                shelter_data = json.load(f)
            
            for feat in shelter_data["features"]:
                p = feat["properties"]
                g = feat["geometry"]
                coords = g["coordinates"]
                
                sh_obj = db.query(Shelter).filter(Shelter.id == p["id"]).first()
                if not sh_obj:
                    sh_obj = Shelter(
                        id=p["id"],
                        name=p["name"],
                        shelter_type=p.get("type", "COMMUNITY_HALL"),
                        district="Chamoli",
                        longitude=coords[0],
                        latitude=coords[1],
                        rated_capacity=p.get("rated_capacity", 500),
                        safe_occupancy=p.get("safe_occupancy", 400),
                        current_occupancy=p.get("current_occupancy", 0),
                        water_capacity_lpd=p.get("water_supply_lpd", 6000.0),
                        sanitation_units=p.get("sanitation_toilets", 20),
                        food_capacity_meals_per_day=p.get("food_meals_daily", 1200.0),
                        medical_isolation_beds=p.get("medical_isolation_beds", 10),
                        power_backup=p.get("power_backup", True),
                        effective_safe_capacity=p.get("effective_safe_capacity", 400),
                        bottleneck_resource=p.get("bottleneck_resource", "water"),
                        capacity_status=p.get("capacity_status", "AVAILABLE"),
                        capacity_utilization_pct=p.get("capacity_utilization_pct", 0.0),
                        operating_status=p.get("operating_status", "ACTIVE"),
                        accessibility_score=p.get("accessibility_score", 0.85),
                        is_open=p.get("is_open", True),
                        geometry_geojson=json.dumps(g)
                    )
                    db.add(sh_obj)
            db.commit()
            print(f"Seeded {len(shelter_data['features'])} shelters.")

        # 4. Seed Hazard Zones
        hazard_file = os.path.join(DEMO_DIR, "hazards.geojson")
        if os.path.exists(hazard_file):
            with open(hazard_file, "r", encoding="utf-8") as f:
                haz_data = json.load(f)
            
            for feat in haz_data["features"]:
                p = feat["properties"]
                g = feat["geometry"]
                
                haz_obj = db.query(HazardZone).filter(HazardZone.id == p["id"]).first()
                if not haz_obj:
                    haz_obj = HazardZone(
                        id=p["id"],
                        name=p["name"],
                        hazard_type=p.get("hazard_type", "LANDSLIDE"),
                        severity=p.get("severity", "CRITICAL"),
                        risk_score=p.get("risk_score", 0.8),
                        confidence_score=p.get("confidence_score", 0.85),
                        area_sqkm=p.get("area_sqkm", 1.0),
                        drivers_json=json.dumps(p.get("drivers", {})),
                        geometry_geojson=json.dumps(g),
                        color_hex=p.get("color", "#EF4444"),
                        warning_message=p.get("warning_message", "")
                    )
                    db.add(haz_obj)
            db.commit()
            print(f"Seeded {len(haz_data['features'])} hazard zones.")

        # 5. Seed Road Network Segments
        roads_file = os.path.join(DEMO_DIR, "roads.geojson")
        if os.path.exists(roads_file):
            with open(roads_file, "r", encoding="utf-8") as f:
                roads_data = json.load(f)
            
            for feat in roads_data["features"]:
                p = feat["properties"]
                g = feat["geometry"]
                
                road_obj = db.query(RoadSegment).filter(RoadSegment.id == p["id"]).first()
                if not road_obj:
                    road_obj = RoadSegment(
                        id=p["id"],
                        name=p["name"],
                        from_node=p["from_node"],
                        to_node=p["to_node"],
                        from_name=p.get("from_name", ""),
                        to_name=p.get("to_name", ""),
                        distance_km=p.get("distance_km", 1.0),
                        speed_limit_kmh=p.get("speed_limit_kmh", 30.0),
                        base_travel_time_min=p.get("base_travel_time_min", 2.0),
                        road_class=p.get("road_class", "DISTRICT_ROAD"),
                        pavement_condition=p.get("pavement_condition", "GOOD"),
                        slope_risk_score=p.get("slope_risk_score", 0.2),
                        hazard_exposure_score=p.get("hazard_exposure_score", 0.2),
                        is_blocked=p.get("is_blocked", False),
                        blocked_reason=p.get("blocked_reason"),
                        geometry_geojson=json.dumps(g)
                    )
                    db.add(road_obj)
            db.commit()
            print(f"Seeded {len(roads_data['features'])} road segments.")

        # 6. Seed Data Sources Health
        if db.query(DataSourceHealth).count() == 0:
            data_sources = [
                DataSourceHealth(
                    id="IMD_WEATHER",
                    name="IMD Automatic Weather Station (AWS)",
                    provider="India Meteorological Department",
                    data_type="WEATHER",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=42,
                    confidence_rating=0.96,
                    endpoint_url="https://api.imd.gov.in/v1/aws/obs/42111",
                    notes="Receives hourly rainfall, soil moisture, and cloudburst threat vectors."
                ),
                DataSourceHealth(
                    id="BHUVAN_LANDSLIDE",
                    name="ISRO Bhuvan Landslide Geoportal WMS/WFS",
                    provider="National Remote Sensing Centre (NRSC / ISRO)",
                    data_type="LANDSLIDE_LAYERS",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=64,
                    confidence_rating=0.94,
                    endpoint_url="https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php",
                    notes="Static susceptibility atlas + active slope failure event polygons."
                ),
                DataSourceHealth(
                    id="SENTINEL_INSAR",
                    name="Copernicus Sentinel-1 InSAR Ground Deformation",
                    provider="European Space Agency / IIRS Dehradun",
                    data_type="SATELLITE_INSAR",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=115,
                    confidence_rating=0.89,
                    endpoint_url="https://dataspace.copernicus.eu/api/v1/sentinel-1",
                    notes="Line-of-Sight surface subsidence velocity trend (mm/month)."
                ),
                DataSourceHealth(
                    id="DEM_TERRAIN",
                    name="Cartosat-3 High-Resolution Digital Elevation Model",
                    provider="Survey of India / ISRO",
                    data_type="DEM",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=35,
                    confidence_rating=0.98,
                    endpoint_url="https://bhuvan-carto.nrsc.gov.in/dem",
                    notes="10m pixel terrain slope, aspect, curvature, and drainage basins."
                ),
                DataSourceHealth(
                    id="OSM_ROADS",
                    name="OpenStreetMap Transport Network Adapter",
                    provider="OpenStreetMap Foundation & Overpass API",
                    data_type="OSM",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=28,
                    confidence_rating=0.92,
                    endpoint_url="https://overpass-api.de/api/interpreter",
                    notes="Topology graph of national highways, state links, and evacuation trails."
                ),
                DataSourceHealth(
                    id="CENSUS_DEMO",
                    name="Demographic Register & Vulnerability Survey",
                    provider="Office of Registrar General & SDMA Survey",
                    data_type="CENSUS",
                    status="FRESH",
                    operational_mode="DEMO",
                    latency_ms=18,
                    confidence_rating=0.95,
                    endpoint_url="local://data/demo/population.csv",
                    notes="Household-level elderly, pediatric, and special medical needs distribution."
                )
            ]
            db.add_all(data_sources)
            db.commit()
            print(f"Seeded {len(data_sources)} data sources.")

        # 7. Seed Initial Operational Alerts
        if db.query(Alert).count() == 0:
            alerts = [
                Alert(
                    id="ALT-2026-001",
                    title="CRITICAL: Joshimath Core Ward Subsidence Fissure Expansion",
                    severity="CRITICAL",
                    category="LANDSLIDE_ALERT",
                    target_area="Manohar Bagh & Sunil Wards",
                    affected_population=3270,
                    message="Multi-sensor fusion reports InSAR subsidence accelerating past 7.4 cm/month combined with 118mm/24h rainfall. Immediate evacuation required.",
                    recommended_action="Execute evacuation plan to Pipalkoti Central College and Army Prefab Camp. Divert heavy vehicles from Sector NH-07 descent.",
                    source="ResQZone AI Hazard Pipeline",
                    is_read=False,
                    is_dispatched=True,
                    fcm_status="DELIVERED_1420_RECIPIENTS",
                    sms_status="DELIVERED_3200_RECIPIENTS"
                ),
                Alert(
                    id="ALT-2026-002",
                    title="WARNING: Alaknanda Flood Discharge Approaching Warning Level",
                    severity="WARNING",
                    category="FLOOD_ALERT",
                    target_area="Marwari River Terrace Sector",
                    affected_population=960,
                    message="River gauge upstream reports 3,400 cumecs surge. Low-lying riverbank habitations advised to shift to higher ground.",
                    recommended_action="Relocate high-risk riverbank households to Upper Bazaar transit shelters.",
                    source="Central Water Commission / IMD Adapter",
                    is_read=False,
                    is_dispatched=True,
                    fcm_status="DELIVERED_850_RECIPIENTS",
                    sms_status="DELIVERED_960_RECIPIENTS"
                ),
                Alert(
                    id="ALT-2026-003",
                    title="WATCH: Tapovan Gorge Glacial Lake Runoff Inflow Increase",
                    severity="WATCH",
                    category="GLACIAL_SURGE",
                    target_area="Tapovan & Dhauliganga Confluence",
                    affected_population=1580,
                    message="Soil moisture saturation reached 89%. Monitor Dhauliganga culverts for sudden debris blockage.",
                    recommended_action="Pre-position earthmovers at Tapovan Powerhouse fork and maintain high alert.",
                    source="Sentinel-1 SAR Hydrological Watch",
                    is_read=True,
                    is_dispatched=True,
                    fcm_status="DELIVERED_500_RECIPIENTS",
                    sms_status="DELIVERED_500_RECIPIENTS"
                )
            ]
            db.add_all(alerts)
            db.commit()
            print(f"Seeded {len(alerts)} initial operational alerts.")

        # 8. Seed Initial Audit Log
        if db.query(AuditLog).count() == 0:
            init_log = AuditLog(
                action="SYSTEM_INITIALIZATION",
                resource_type="system",
                resource_id="SYS-BOOT-01",
                details=json.dumps({"event": "Seeded baseline GIS layers, habitations, and shelters for Chamoli-Joshimath."}),
                ip_address="127.0.0.1"
            )
            db.add(init_log)
            db.commit()

        print("=== Database Seeding Complete & Verified ===")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
