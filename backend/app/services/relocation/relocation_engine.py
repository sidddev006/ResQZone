"""
ResQZone Relocation Priority & Optimization Engine
Calculates explainable habitation priority scoring and solves the constrained
multi-shelter evacuation assignment optimization problem.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
from backend.app.services.routing.routing_engine import routing_engine
from backend.app.services.capacity.capacity_engine import capacity_engine


class RelocationOptimizationEngine:
    @staticmethod
    def calculate_habitation_priority(
        habitation: Dict[str, Any],
        weather_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Computes priority score and operational reason codes for relocation.
        """
        hazard_score = float(habitation.get("hazard_score", 0.5))
        fragility = float(habitation.get("housing_fragility_score", 0.5))
        slope = float(habitation.get("slope_degrees", 25.0))
        pop = int(habitation.get("total_population", 100))
        vuln_pop = int(habitation.get("vulnerable_population", 30))
        road_dist = int(habitation.get("road_access_distance_m", 200))
        hazard_type = habitation.get("primary_hazard_type", "LANDSLIDE")
        
        # Priority formula
        vuln_ratio = min(1.0, vuln_pop / pop) if pop > 0 else 0.3
        
        priority_score = round(
            0.40 * hazard_score +
            0.30 * vuln_ratio +
            0.15 * fragility +
            0.15 * min(1.0, slope / 45.0),
            3
        )
        
        reason_codes = []
        supporting_factors = []
        
        if hazard_score >= 0.75:
            reason_codes.append("HIGH_HAZARD")
            supporting_factors.append(f"Primary hazard risk score is {hazard_score:.2f} ({hazard_type})")
        if vuln_ratio >= 0.40:
            reason_codes.append("HIGH_VULNERABILITY")
            supporting_factors.append(f"{int(vuln_ratio*100)}% of residents belong to elderly, pediatric, or disabled cohorts")
        if slope >= 35.0:
            reason_codes.append("STEEP_SLOPE_INSTABILITY")
            supporting_factors.append(f"Ground slope is {slope}° exceeding safety gradient threshold")
        if road_dist >= 500:
            reason_codes.append("MEDICAL_ACCESS_LOW")
            supporting_factors.append(f"Access to motorable highway is {road_dist}m over rugged hillside terrain")
        if weather_data and weather_data.get("rainfall_anomaly_pct", 0) > 100:
            reason_codes.append("RAINFALL_SPIKE")
            supporting_factors.append("24h monsoon rainfall anomaly exceeds 100% cloudburst benchmark")
        if fragility >= 0.80:
            reason_codes.append("STRUCTURAL_FAILURE_RISK")
            supporting_factors.append("Non-ductile stone masonry structures exhibit high crack progression")

        if priority_score >= 0.75:
            category = "CRITICAL"
            recommended_action = "Immediate compulsory evacuation. Reassign all residents to fortified safe shelters."
        elif priority_score >= 0.50:
            category = "HIGH_PRIORITY"
            recommended_action = "Standby evacuation notice. Mobilize state transport buses and prepare shelter manifests."
        elif priority_score >= 0.30:
            category = "MONITORING"
            recommended_action = "Maintain continuous geotechnical watch; shelter assignments on standby."
        else:
            category = "LOW_PRIORITY"
            recommended_action = "Habitation is currently secure. Routine community awareness."

        return {
            "habitation_id": habitation["id"],
            "habitation_name": habitation["name"],
            "priority_score": priority_score,
            "priority_category": category,
            "reason_codes": reason_codes,
            "supporting_factors": supporting_factors,
            "recommended_action": recommended_action
        }

    def solve_relocation_plan(
        self,
        habitations: List[Dict[str, Any]],
        shelters: List[Dict[str, Any]],
        road_segments: List[Dict[str, Any]],
        blocked_road_ids: Optional[List[str]] = None,
        disabled_shelter_ids: Optional[List[str]] = None,
        strategy: str = "BALANCED", # FASTEST, SAFEST, BALANCED
        weather_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Solves the constrained relocation assignment matching habitations needing evacuation
        to shelters with available safe capacity.
        
        Constraints strictly enforced:
        1. No shelter exceeds its effective safe capacity
        2. Closed or inaccessible shelters are excluded
        3. Blocked road segments are not traversed
        4. Prioritizes highest risk/vulnerability habitations first
        """
        disabled_shelters = set(disabled_shelter_ids or [])
        blocked_roads = set(blocked_road_ids or [])

        # 1. Prioritize habitations needing relocation
        candidate_habitations = []
        for h in habitations:
            # Habitations marked CRITICAL or immediate_relocation_needed
            p_info = self.calculate_habitation_priority(h, weather_data)
            h_copy = dict(h)
            h_copy.update(p_info)
            if p_info["priority_score"] >= 0.45 or h.get("immediate_relocation_needed", False):
                candidate_habitations.append(h_copy)

        # Sort candidate habitations descending by priority score (most critical first)
        candidate_habitations.sort(key=lambda x: x["priority_score"], reverse=True)

        # 2. Prepare shelter capacities tracking
        shelter_state = {}
        for s in shelters:
            s_id = s["id"]
            is_active = s.get("is_open", True) and (s_id not in disabled_shelters)
            
            cap_eval = capacity_engine.evaluate_shelter_capacity(
                shelter_id=s_id,
                name=s["name"],
                rated_capacity=s.get("rated_capacity", 500),
                safe_occupancy=s.get("safe_occupancy", 400),
                current_occupancy=s.get("current_occupancy", 0),
                water_capacity_lpd=s.get("water_capacity_lpd", 6000.0),
                sanitation_units=s.get("sanitation_units", 20),
                food_meals_daily=s.get("food_capacity_meals_per_day", 1200.0),
                medical_isolation_beds=s.get("medical_isolation_beds", 10),
                power_backup=s.get("power_backup", True),
                is_open=is_active
            )
            shelter_state[s_id] = {
                "info": s,
                "cap_eval": cap_eval,
                "current_occupancy": s.get("current_occupancy", 0),
                "safe_limit": cap_eval["effective_safe_capacity"],
                "remaining_capacity": cap_eval["available_safe_capacity"],
                "assigned_population": 0,
                "assigned_habitations": []
            }

        # 3. Perform constrained matching
        assignments = []
        unassigned_summary = []
        total_targeted = 0
        total_assigned = 0
        total_time_accum = 0.0
        total_risk_accum = 0.0

        for hab in candidate_habitations:
            hab_id = hab["id"]
            pop_to_evacuate = hab.get("total_population", 0)
            total_targeted += pop_to_evacuate

            # Find reachable candidate shelters with capacity
            candidate_options = []
            for s_id, s_data in shelter_state.items():
                if s_data["remaining_capacity"] <= 0 or s_data["cap_eval"].get("capacity_status") == "INACCESSIBLE":
                    continue

                route_calc = routing_engine.calculate_candidate_routes(
                    origin_node=hab_id,
                    destination_node=s_id,
                    road_segments=road_segments,
                    blocked_road_ids=list(blocked_roads)
                )

                if route_calc["feasible"]:
                    route_opt = route_calc["options"].get(strategy, route_calc["options"]["BALANCED"])
                    # Cost function combines travel time + hazard exposure
                    cost = route_opt["travel_time_min"] + (route_opt["hazard_exposure_score"] * 30.0)
                    candidate_options.append({
                        "shelter_id": s_id,
                        "cost": cost,
                        "route": route_opt
                    })

            # Sort shelters by minimum cost
            candidate_options.sort(key=lambda x: x["cost"])

            # Allocate population across available shelters
            remaining_people = pop_to_evacuate

            if not candidate_options:
                unassigned_summary.append({
                    "habitation_id": hab_id,
                    "habitation_name": hab["name"],
                    "unassigned_population": remaining_people,
                    "reason": "All connecting routes are blocked or no reachable shelter has remaining capacity."
                })
                continue

            for opt in candidate_options:
                if remaining_people <= 0:
                    break
                s_id = opt["shelter_id"]
                avail = shelter_state[s_id]["remaining_capacity"]
                if avail <= 0:
                    continue

                assign_count = min(remaining_people, avail)
                shelter_state[s_id]["remaining_capacity"] -= assign_count
                shelter_state[s_id]["assigned_population"] += assign_count
                shelter_state[s_id]["assigned_habitations"].append(hab["name"])
                
                remaining_people -= assign_count
                total_assigned += assign_count
                
                r = opt["route"]
                total_time_accum += r["travel_time_min"] * assign_count
                total_risk_accum += r["hazard_exposure_score"] * assign_count

                assignments.append({
                    "habitation_id": hab_id,
                    "habitation_name": hab["name"],
                    "shelter_id": s_id,
                    "shelter_name": shelter_state[s_id]["info"]["name"],
                    "allocated_population": assign_count,
                    "travel_time_min": r["travel_time_min"],
                    "distance_km": r["distance_km"],
                    "route_risk_score": r["hazard_exposure_score"],
                    "hazard_exposure_label": r["hazard_exposure_label"],
                    "strategy": strategy,
                    "path_nodes": r["path_nodes"],
                    "road_segment_ids": r["road_segment_ids"]
                })

            if remaining_people > 0:
                unassigned_summary.append({
                    "habitation_id": hab_id,
                    "habitation_name": hab["name"],
                    "unassigned_population": remaining_people,
                    "reason": "Regional shelters reached 100% effective safe capacity."
                })

        avg_time = round(total_time_accum / total_assigned, 1) if total_assigned > 0 else 0.0
        avg_risk = round(total_risk_accum / total_assigned, 3) if total_assigned > 0 else 0.0

        # Compile shelter post-relocation state
        shelter_utilizations = []
        for s_id, s_data in shelter_state.items():
            tot_occupancy = s_data["current_occupancy"] + s_data["assigned_population"]
            eff_cap = s_data["safe_limit"]
            util_pct = round((tot_occupancy / eff_cap) * 100, 1) if eff_cap > 0 else 100.0
            
            shelter_utilizations.append({
                "shelter_id": s_id,
                "name": s_data["info"]["name"],
                "effective_safe_capacity": eff_cap,
                "baseline_occupancy": s_data["current_occupancy"],
                "newly_assigned_evacuees": s_data["assigned_population"],
                "total_occupancy": tot_occupancy,
                "capacity_utilization_pct": util_pct,
                "bottleneck_resource": s_data["cap_eval"]["bottleneck_resource"],
                "status": "OVER_CAPACITY" if util_pct > 100 else ("HIGH_LOAD" if util_pct >= 80 else "NORMAL")
            })

        return {
            "total_targeted_evacuees": total_targeted,
            "total_assigned": total_assigned,
            "total_unassigned": total_targeted - total_assigned,
            "average_travel_time_min": avg_time,
            "average_route_risk": avg_risk,
            "strategy_used": strategy,
            "assignments": assignments,
            "unassigned_habitations": unassigned_summary,
            "shelter_utilizations": shelter_utilizations,
            "blocked_roads_count": len(blocked_roads),
            "disabled_shelters_count": len(disabled_shelters)
        }


relocation_optimizer = RelocationOptimizationEngine()
