"""
ResQZone Carrying Capacity Engine
Calculates multi-resource humanitarian carrying capacities (Water, Sanitation, Food, Beds, Medical)
and identifies limiting resource bottlenecks for relief shelters.
"""
from typing import Dict, Any, List
from backend.app.core.config import settings


class CarryingCapacityEngine:
    @staticmethod
    def evaluate_shelter_capacity(
        shelter_id: str,
        name: str,
        rated_capacity: int,
        safe_occupancy: int,
        current_occupancy: int,
        water_capacity_lpd: float,
        sanitation_units: int,
        food_meals_daily: float,
        medical_isolation_beds: int,
        power_backup: bool = True,
        is_open: bool = True,
        additional_assigned_population: int = 0
    ) -> Dict[str, Any]:
        """
        Calculates normalized resource limits and bottleneck constraint.
        """
        if not is_open:
            return {
                "shelter_id": shelter_id,
                "name": name,
                "effective_safe_capacity": 0,
                "available_safe_capacity": 0,
                "current_occupancy": current_occupancy,
                "expected_total_load": current_occupancy + additional_assigned_population,
                "capacity_utilization_pct": 100.0,
                "capacity_status": "INACCESSIBLE",
                "bottleneck_resource": "facility_closure",
                "bottleneck_explanation": f"{name} is currently closed or structurally inaccessible.",
                "resource_limits": {}
            }

        # Resource-normalized capacities according to humanitarian standards
        water_limit = int(water_capacity_lpd / settings.MIN_WATER_LPD)
        sanitation_limit = int(sanitation_units * settings.PEOPLE_PER_TOILET)
        food_limit = int(food_meals_daily / settings.DAILY_MEALS_PER_PERSON)
        bed_limit = int(safe_occupancy)
        medical_limit = int(medical_isolation_beds * settings.PEOPLE_PER_ISOLATION_BED)

        limits = {
            "water": water_limit,
            "sanitation": sanitation_limit,
            "food": food_limit,
            "beds": bed_limit,
            "medical": medical_limit
        }

        # Bottleneck is the minimum resource support capacity
        bottleneck_resource = min(limits, key=limits.get)
        effective_safe_capacity = limits[bottleneck_resource]

        expected_load = current_occupancy + additional_assigned_population
        available_capacity = max(0, effective_safe_capacity - expected_load)
        
        utilization_pct = round((expected_load / effective_safe_capacity) * 100, 1) if effective_safe_capacity > 0 else 100.0

        # Status classification
        if utilization_pct > 100.0:
            status = "OVER_CAPACITY"
        elif utilization_pct >= 80.0:
            status = "HIGH_LOAD"
        elif utilization_pct >= 40.0:
            status = "NORMAL"
        else:
            status = "AVAILABLE"

        bottleneck_text = {
            "water": f"Water supply ({water_capacity_lpd:,.0f} L/day) supports at most {water_limit:,} persons at 15L/day WHO standard.",
            "sanitation": f"Sanitation units ({sanitation_units} toilets) support at most {sanitation_limit:,} persons at 1:20 Sphere standard.",
            "food": f"Food rations ({food_meals_daily:,.0f} meals/day) limit capacity to {food_limit:,} persons.",
            "beds": f"Physical floor space and emergency cots cap safe occupancy at {bed_limit:,} persons.",
            "medical": f"Medical isolation facilities ({medical_isolation_beds} beds) support up to {medical_limit:,} persons."
        }.get(bottleneck_resource, "Resource constraints apply.")

        return {
            "shelter_id": shelter_id,
            "name": name,
            "rated_capacity": rated_capacity,
            "safe_occupancy": safe_occupancy,
            "effective_safe_capacity": effective_safe_capacity,
            "current_occupancy": current_occupancy,
            "expected_total_load": expected_load,
            "available_safe_capacity": available_capacity,
            "capacity_utilization_pct": utilization_pct,
            "capacity_status": status,
            "bottleneck_resource": bottleneck_resource,
            "bottleneck_explanation": bottleneck_text,
            "power_backup": power_backup,
            "resource_limits": {
                "water_supported_people": water_limit,
                "sanitation_supported_people": sanitation_limit,
                "food_supported_people": food_limit,
                "bed_supported_people": bed_limit,
                "medical_supported_people": medical_limit
            }
        }


capacity_engine = CarryingCapacityEngine()
