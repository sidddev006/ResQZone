"""
ResQZone ResQ Twin — Adaptive Relocation Digital Twin Engine
Implements deterministic counterfactual simulation:
BASELINE -> WHAT-IF SIMULATION -> DIFFERENCE ANALYSIS.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.app.services.relocation.relocation_engine import relocation_optimizer


class ResQTwinEngine:
    @staticmethod
    def run_simulation(
        habitations: List[Dict[str, Any]],
        shelters: List[Dict[str, Any]],
        road_segments: List[Dict[str, Any]],
        blocked_road_ids: Optional[List[str]] = None,
        disabled_shelter_ids: Optional[List[str]] = None,
        capacity_reduction_factors: Optional[Dict[str, float]] = None, # shelter_id -> multiplier e.g. 0.5
        rainfall_spike_pct: float = 0.0,
        strategy: str = "BALANCED"
    ) -> Dict[str, Any]:
        """
        Runs counterfactual simulation:
        Computes Baseline, applies What-If perturbations, and calculates the exact delta.
        """
        blocked_roads = list(blocked_road_ids or [])
        disabled_shelters = list(disabled_shelter_ids or [])
        cap_factors = capacity_reduction_factors or {}

        # 1. Compute unperturbed BASELINE
        baseline_result = relocation_optimizer.solve_relocation_plan(
            habitations=habitations,
            shelters=shelters,
            road_segments=road_segments,
            blocked_road_ids=[],
            disabled_shelter_ids=[],
            strategy=strategy
        )

        # 2. Apply What-If perturbations to inputs
        perturbed_shelters = []
        for s in shelters:
            s_copy = dict(s)
            s_id = s["id"]
            if s_id in disabled_shelters:
                s_copy["is_open"] = False
            elif s_id in cap_factors:
                # E.g. water shortage cuts water capacity in half
                factor = cap_factors[s_id]
                s_copy["water_capacity_lpd"] = s.get("water_capacity_lpd", 6000) * factor
                s_copy["safe_occupancy"] = int(s.get("safe_occupancy", 400) * factor)
            perturbed_shelters.append(s_copy)

        perturbed_habitations = []
        for h in habitations:
            h_copy = dict(h)
            if rainfall_spike_pct > 0.0:
                # Rainfall spike increases hazard score and triggers lower slope thresholds
                base_hz = h.get("hazard_score", 0.5)
                h_copy["hazard_score"] = min(1.0, round(base_hz * (1.0 + rainfall_spike_pct / 100.0), 3))
                if h_copy["hazard_score"] >= 0.70:
                    h_copy["immediate_relocation_needed"] = True
            perturbed_habitations.append(h_copy)

        # 3. Compute WHAT-IF solution
        what_if_result = relocation_optimizer.solve_relocation_plan(
            habitations=perturbed_habitations,
            shelters=perturbed_shelters,
            road_segments=road_segments,
            blocked_road_ids=blocked_roads,
            disabled_shelter_ids=disabled_shelters,
            strategy=strategy
        )

        # 4. Compute DIFFERENCE / DELTA Analysis
        # Track assignment diffs (which habitations shifted to different shelters)
        baseline_assign_map = {
            f"{a['habitation_id']}": a["shelter_id"]
            for a in baseline_result["assignments"]
        }
        whatif_assign_map = {
            f"{a['habitation_id']}": a["shelter_id"]
            for a in what_if_result["assignments"]
        }

        reassigned_people_count = 0
        reassignment_shifts = []

        for hab_id, new_shelter_id in whatif_assign_map.items():
            old_shelter_id = baseline_assign_map.get(hab_id)
            if old_shelter_id and old_shelter_id != new_shelter_id:
                # Find allocated count
                alloc = next((a["allocated_population"] for a in what_if_result["assignments"] if a["habitation_id"] == hab_id), 0)
                reassigned_people_count += alloc
                reassignment_shifts.append({
                    "habitation_id": hab_id,
                    "previous_shelter": old_shelter_id,
                    "new_shelter": new_shelter_id,
                    "population_shifted": alloc
                })

        time_delta = round(what_if_result["average_travel_time_min"] - baseline_result["average_travel_time_min"], 1)
        risk_delta = round(what_if_result["average_route_risk"] - baseline_result["average_route_risk"], 3)
        unmet_delta = what_if_result["total_unassigned"] - baseline_result["total_unassigned"]

        # Track shelter load changes
        shelter_load_deltas = []
        base_shelter_loads = {s["shelter_id"]: s["total_occupancy"] for s in baseline_result["shelter_utilizations"]}
        
        for ws in what_if_result["shelter_utilizations"]:
            s_id = ws["shelter_id"]
            base_load = base_shelter_loads.get(s_id, 0)
            diff = ws["total_occupancy"] - base_load
            pct_change = round((diff / ws["effective_safe_capacity"]) * 100, 1) if ws["effective_safe_capacity"] > 0 else 0.0
            shelter_load_deltas.append({
                "shelter_id": s_id,
                "name": ws["name"],
                "baseline_occupancy": base_load,
                "what_if_occupancy": ws["total_occupancy"],
                "delta_people": diff,
                "percentage_point_load_change": pct_change,
                "new_bottleneck": ws["bottleneck_resource"],
                "status": ws["status"]
            })

        # Generate explanatory operational narrative
        narrative = []
        if blocked_roads:
            narrative.append(f"{len(blocked_roads)} road segment(s) blocked ({', '.join(blocked_roads)}).")
        if disabled_shelters:
            narrative.append(f"{len(disabled_shelters)} shelter(s) rendered unavailable ({', '.join(disabled_shelters)}).")
        if rainfall_spike_pct > 0:
            narrative.append(f"Rainfall spiked by +{rainfall_spike_pct}%, expanding critical red zone boundaries.")
        if reassigned_people_count > 0:
            narrative.append(f"{reassigned_people_count:,} evacuees redirected to alternative safe centers.")
        if time_delta > 0:
            narrative.append(f"Average evacuation transit time increased by +{time_delta} minutes.")
        if unmet_delta > 0:
            narrative.append(f"CRITICAL DEFICIT: {unmet_delta:,} vulnerable citizens unable to find safe shelter under current constraints.")

        story_text = " ".join(narrative) if narrative else "No operational variance detected under specified parameters."

        return {
            "simulation_id": f"SIM-{int(datetime.now(timezone.utc).timestamp())}",
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "scenario_parameters": {
                "blocked_roads": blocked_roads,
                "disabled_shelters": disabled_shelters,
                "capacity_reductions": cap_factors,
                "rainfall_spike_pct": rainfall_spike_pct,
                "strategy": strategy
            },
            "baseline": {
                "total_targeted": baseline_result["total_targeted_evacuees"],
                "total_assigned": baseline_result["total_assigned"],
                "total_unassigned": baseline_result["total_unassigned"],
                "average_travel_time_min": baseline_result["average_travel_time_min"],
                "average_route_risk": baseline_result["average_route_risk"],
                "shelters": baseline_result["shelter_utilizations"],
                "assignments_count": len(baseline_result["assignments"])
            },
            "what_if": {
                "total_targeted": what_if_result["total_targeted_evacuees"],
                "total_assigned": what_if_result["total_assigned"],
                "total_unassigned": what_if_result["total_unassigned"],
                "average_travel_time_min": what_if_result["average_travel_time_min"],
                "average_route_risk": what_if_result["average_route_risk"],
                "shelters": what_if_result["shelter_utilizations"],
                "assignments_count": len(what_if_result["assignments"]),
                "assignments": what_if_result["assignments"],
                "unassigned_habitations": what_if_result["unassigned_habitations"]
            },
            "delta": {
                "reassigned_people_count": reassigned_people_count,
                "reassignment_shifts": reassignment_shifts,
                "travel_time_delta_min": time_delta,
                "route_risk_delta": risk_delta,
                "unmet_demand_delta": unmet_delta,
                "shelter_load_deltas": shelter_load_deltas,
                "operational_narrative": story_text
            }
        }


resq_twin = ResQTwinEngine()
