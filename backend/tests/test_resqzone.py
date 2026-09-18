"""
ResQZone Comprehensive Automated Test Suite
Covers GIS, ML Hazard Scoring, Carrying Capacity Bottlenecks, Routing Invariants,
Relocation Optimization Constraints, ResQ Twin What-If Delta Simulation, and API Endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.gis.spatial_utils import haversine_distance_km, point_in_geojson_polygon, buffer_point_geojson
from backend.app.ml.xgb_hazard import hazard_ml
from backend.app.services.capacity.capacity_engine import capacity_engine
from backend.app.services.routing.routing_engine import routing_engine
from backend.app.services.relocation.relocation_engine import relocation_optimizer
from backend.app.services.scenarios.resq_twin import resq_twin
from backend.app.services.copilot.copilot_engine import copilot_engine
from backend.app.db.session import SessionLocal

client = TestClient(app)


# 1. GIS Tests
def test_haversine_distance():
    # Distance between Joshimath center (~30.556, 79.566) and Helang (~30.518, 79.519)
    dist = haversine_distance_km(30.556, 79.566, 30.518, 79.519)
    assert 5.0 <= dist <= 8.5


def test_point_in_polygon():
    polygon_geom = {
        "type": "Polygon",
        "coordinates": [[
            [79.55, 30.55],
            [79.58, 30.55],
            [79.58, 30.57],
            [79.55, 30.57],
            [79.55, 30.55]
        ]]
    }
    # Point inside
    assert point_in_geojson_polygon(79.565, 30.560, polygon_geom) is True
    # Point outside
    assert point_in_geojson_polygon(79.500, 30.500, polygon_geom) is False


# 2. ML Hazard Pipeline Tests
def test_ml_hazard_scoring():
    sample_features = {
        "slope_degrees": 42.0,
        "elevation_meters": 1950.0,
        "rainfall_24h_mm": 130.0,
        "rainfall_72h_mm": 260.0,
        "rainfall_anomaly_pct": 150.0,
        "soil_moisture_saturation_pct": 92.0,
        "insar_subsidence_velocity_cm_month": 6.8,
        "housing_fragility_index": 0.90,
        "fault_line_proximity_km": 3.0
    }
    pred = hazard_ml.predict_hazard_score(sample_features)
    assert "hazard_score" in pred
    assert 0.0 <= pred["hazard_score"] <= 1.0
    # For extreme parameters, hazard score must be high
    assert pred["hazard_score"] >= 0.65
    assert pred["is_calibrated"] is True
    assert "feature_contributions" in pred


# 3. Carrying Capacity & Bottleneck Tests
def test_capacity_bottleneck_detection():
    # Scenario: Safe beds = 1000, but water supply only supports 300 persons
    result = capacity_engine.evaluate_shelter_capacity(
        shelter_id="SHELTER-TEST",
        name="Test Shelter",
        rated_capacity=1200,
        safe_occupancy=1000,
        current_occupancy=100,
        water_capacity_lpd=4500.0, # 4500 / 15 = 300 persons max!
        sanitation_units=50,      # 50 * 20 = 1000 persons
        food_meals_daily=3000.0,  # 3000 / 3 = 1000 persons
        medical_isolation_beds=20 # 20 * 50 = 1000 persons
    )
    assert result["effective_safe_capacity"] == 300
    assert result["bottleneck_resource"] == "water"
    assert result["available_safe_capacity"] == 200 # 300 - 100
    assert result["capacity_status"] == "AVAILABLE" # 100/300 = 33.3%


def test_capacity_overload_classification():
    result = capacity_engine.evaluate_shelter_capacity(
        shelter_id="SHELTER-OVERLOAD",
        name="Overloaded Shelter",
        rated_capacity=500,
        safe_occupancy=400,
        current_occupancy=450,
        water_capacity_lpd=6000.0,
        sanitation_units=20,
        food_meals_daily=1200.0,
        medical_isolation_beds=10
    )
    assert result["capacity_status"] == "OVER_CAPACITY"
    assert result["capacity_utilization_pct"] > 100.0


# 4. Routing Engine Invariant Tests
def test_routing_shortest_vs_safest():
    road_segments = [
        {
            "id": "R1", "from_node": "A", "to_node": "B",
            "distance_km": 2.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 3.0,
            "hazard_exposure_score": 0.85, "is_blocked": False
        },
        {
            "id": "R2", "from_node": "A", "to_node": "C",
            "distance_km": 4.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 6.0,
            "hazard_exposure_score": 0.10, "is_blocked": False
        },
        {
            "id": "R3", "from_node": "C", "to_node": "B",
            "distance_km": 2.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 3.0,
            "hazard_exposure_score": 0.10, "is_blocked": False
        }
    ]
    calc = routing_engine.calculate_candidate_routes("A", "B", road_segments)
    assert calc["feasible"] is True
    # Fastest takes direct high-hazard link R1
    assert calc["options"]["FASTEST"]["path_nodes"] == ["A", "B"]
    assert calc["options"]["FASTEST"]["travel_time_min"] == 3.0
    # Safest takes detour via C (hazard 0.10 vs 0.85)
    assert calc["options"]["SAFEST"]["path_nodes"] == ["A", "C", "B"]
    assert calc["options"]["SAFEST"]["hazard_exposure_score"] < 0.20


def test_routing_blocked_road_avoidance():
    road_segments = [
        {
            "id": "R1", "from_node": "A", "to_node": "B",
            "distance_km": 2.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 3.0,
            "hazard_exposure_score": 0.2, "is_blocked": True # Explicitly blocked
        },
        {
            "id": "R2", "from_node": "A", "to_node": "C",
            "distance_km": 3.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 4.5,
            "hazard_exposure_score": 0.2, "is_blocked": False
        },
        {
            "id": "R3", "from_node": "C", "to_node": "B",
            "distance_km": 3.0, "speed_limit_kmh": 40.0, "base_travel_time_min": 4.5,
            "hazard_exposure_score": 0.2, "is_blocked": False
        }
    ]
    calc = routing_engine.calculate_candidate_routes("A", "B", road_segments)
    assert calc["feasible"] is True
    # Invariant: Blocked road R1 is NEVER used in path
    assert calc["options"]["FASTEST"]["path_nodes"] == ["A", "C", "B"]
    assert "R1" not in calc["options"]["FASTEST"]["road_segment_ids"]


# 5. Relocation Optimizer Constraint Invariants
def test_relocation_optimizer_safe_capacity_never_exceeded():
    habitations = [
        {
            "id": "H1", "name": "Crit Hab 1", "total_population": 300,
            "vulnerable_population": 150, "housing_fragility_score": 0.9,
            "slope_degrees": 40.0, "road_access_distance_m": 200,
            "primary_hazard_type": "LANDSLIDE", "hazard_score": 0.9,
            "risk_category": "CRITICAL", "immediate_relocation_needed": True
        }
    ]
    shelters = [
        {
            "id": "S1", "name": "Small Shelter",
            "rated_capacity": 200, "safe_occupancy": 150, "current_occupancy": 50,
            "water_capacity_lpd": 3000.0, # 200 limit
            "sanitation_units": 10, "food_capacity_meals_per_day": 600.0,
            "medical_isolation_beds": 5, "power_backup": True, "is_open": True
        },
        {
            "id": "S2", "name": "Large Shelter",
            "rated_capacity": 500, "safe_occupancy": 400, "current_occupancy": 0,
            "water_capacity_lpd": 9000.0,
            "sanitation_units": 20, "food_capacity_meals_per_day": 1500.0,
            "medical_isolation_beds": 10, "power_backup": True, "is_open": True
        }
    ]
    roads = [
        {"id": "R1", "from_node": "H1", "to_node": "S1", "distance_km": 2.0, "speed_limit_kmh": 30.0, "base_travel_time_min": 4.0, "hazard_exposure_score": 0.2, "is_blocked": False},
        {"id": "R2", "from_node": "H1", "to_node": "S2", "distance_km": 5.0, "speed_limit_kmh": 30.0, "base_travel_time_min": 10.0, "hazard_exposure_score": 0.2, "is_blocked": False}
    ]

    plan = relocation_optimizer.solve_relocation_plan(habitations, shelters, roads)
    assert plan["total_targeted_evacuees"] == 300
    assert plan["total_assigned"] == 300
    
    # Invariant: S1 had only 100 safe remaining spots (150 safe - 50 current)
    s1_assign = next((a["allocated_population"] for a in plan["assignments"] if a["shelter_id"] == "S1"), 0)
    assert s1_assign <= 100
    # Spillover goes safely to S2
    s2_assign = next((a["allocated_population"] for a in plan["assignments"] if a["shelter_id"] == "S2"), 0)
    assert s2_assign >= 200


# 6. ResQ Twin Counterfactual Simulation Test
def test_resq_twin_simulation_delta():
    habitations = [
        {
            "id": "H1", "name": "Manohar Bagh", "total_population": 400,
            "vulnerable_population": 200, "housing_fragility_score": 0.95,
            "slope_degrees": 42.0, "road_access_distance_m": 200,
            "primary_hazard_type": "LANDSLIDE", "hazard_score": 0.95,
            "risk_category": "CRITICAL", "immediate_relocation_needed": True
        }
    ]
    shelters = [
        {
            "id": "S1", "name": "Primary Shelter", "rated_capacity": 600, "safe_occupancy": 500,
            "current_occupancy": 0, "water_capacity_lpd": 8000.0, "sanitation_units": 25,
            "food_capacity_meals_per_day": 1500.0, "medical_isolation_beds": 10,
            "power_backup": True, "is_open": True
        },
        {
            "id": "S2", "name": "Backup Shelter", "rated_capacity": 600, "safe_occupancy": 500,
            "current_occupancy": 0, "water_capacity_lpd": 8000.0, "sanitation_units": 25,
            "food_capacity_meals_per_day": 1500.0, "medical_isolation_beds": 10,
            "power_backup": True, "is_open": True
        }
    ]
    roads = [
        {"id": "R1", "from_node": "H1", "to_node": "S1", "distance_km": 2.0, "speed_limit_kmh": 30.0, "base_travel_time_min": 4.0, "hazard_exposure_score": 0.2, "is_blocked": False},
        {"id": "R2", "from_node": "H1", "to_node": "S2", "distance_km": 6.0, "speed_limit_kmh": 30.0, "base_travel_time_min": 12.0, "hazard_exposure_score": 0.2, "is_blocked": False}
    ]

    # Run ResQ Twin with Road R1 blocked
    sim = resq_twin.run_simulation(
        habitations=habitations,
        shelters=shelters,
        road_segments=roads,
        blocked_road_ids=["R1"]
    )

    assert "baseline" in sim
    assert "what_if" in sim
    assert "delta" in sim
    # In baseline, assigned to S1
    assert sim["baseline"]["assignments_count"] > 0
    # In what-if, redirected to S2 because R1 is blocked
    assert sim["delta"]["reassigned_people_count"] == 400
    assert sim["delta"]["travel_time_delta_min"] > 0
    assert "R1" in sim["delta"]["operational_narrative"]


# 7. FastAPI Endpoints Smoke & Integration Tests
def test_api_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/ready")
    assert r2.status_code == 200
    assert r2.json()["ready"] is True


def test_api_dashboard_kpis():
    r = client.get("/api/v1/dashboard/kpis")
    assert r.status_code == 200
    data = r.json()
    assert data["critical_zones_count"] >= 1
    assert data["people_at_risk"] > 0
    assert data["available_safe_capacity"] > 0


def test_api_habitations_evidence():
    r = client.get("/api/v1/habitations?limit=5")
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    first = data[0]
    assert "evidence_panel" in first
    assert "drivers" in first["evidence_panel"]
    assert "model_confidence_pct" in first["evidence_panel"]


def test_api_capacity_shelters():
    r = client.get("/api/v1/capacity/shelters")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 5
    for s in data:
        assert "bottleneck_resource" in s
        assert "effective_safe_capacity" in s


def test_api_copilot():
    r = client.post("/api/v1/copilot/query", json={"query": "Why is Manohar Bagh Ward marked critical?"})
    assert r.status_code == 200
    data = r.json()
    assert data["intent"] == "EXPLAIN_HABITATION_RISK"
    assert "Manohar" in data["response"]
