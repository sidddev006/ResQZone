# ResQZone — Data Dictionary

This document defines the schema, field descriptions, and units for all core entities within ResQZone.

---

## 1. Habitations (`habitations`)
| Field | Type | Unit / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | `HAB-XX` | Unique habitation identifier. |
| `name` | String | UTF-8 | Official name of ward, village, or cluster. |
| `sub_district` | String | Text | Tehsil or block administration name. |
| `latitude` | Float | Decimal Degrees (WGS84) | Center point latitude coordinate. |
| `longitude` | Float | Decimal Degrees (WGS84) | Center point longitude coordinate. |
| `total_population` | Integer | Count | Total permanent surveyed population. |
| `vulnerable_population` | Integer | Count | Aggregated high-dependency cohort (elderly, disabled, pediatric, medical). |
| `housing_fragility_score` | Float | $[0.0, 1.0]$ | Fraction of non-ductile stone/mud unreinforced masonry structures. |
| `slope_degrees` | Float | Degrees ($^\circ$) | Average ground inclination from Cartosat DEM. |
| `elevation_meters` | Float | Meters (MSL) | Mean altitude above mean sea level. |
| `road_access_distance_m` | Integer | Meters | Distance from habitation center to nearest motorable road. |
| `hazard_score` | Float | $[0.0, 1.0]$ | Multi-hazard composite risk score. |
| `risk_category` | Enum | `CRITICAL`, `WARNING`, `WATCH`, `SAFE` | Authority risk priority classification. |

---

## 2. Relief Shelters (`shelters`)
| Field | Type | Unit / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | `SHELTER-XX` | Unique shelter identifier. |
| `name` | String | UTF-8 | Facility name (e.g. Pipalkoti Degree College). |
| `shelter_type` | String | Text | Facility category (College, Stadium, Prefab, Community Hall). |
| `rated_capacity` | Integer | Persons | Maximum architectural occupant rating. |
| `safe_occupancy` | Integer | Persons | 80% safe capacity floor after safety margins. |
| `current_occupancy` | Integer | Persons | Currently registered resident evacuees. |
| `effective_safe_capacity` | Integer | Persons | Minimum bottleneck-constrained capacity. |
| `bottleneck_resource` | Enum | `water`, `sanitation`, `food`, `beds`, `medical` | The limiting physical resource. |
| `water_capacity_lpd` | Float | Liters / Day | Dedicated potable drinking & hygiene water supply. |
| `sanitation_units` | Integer | Toilets | Operational sanitation latrines/toilets (Sphere: 1:20). |
| `food_capacity_meals_per_day` | Float | Meals / Day | Daily operational meal prep capacity (3 meals/day). |
| `medical_isolation_beds` | Integer | Beds | Emergency medical triage/quarantine cots. |
| `power_backup` | Boolean | `True` / `False` | Presence of diesel generators or solar battery backup. |

---

## 3. Road Segments (`road_segments`)
| Field | Type | Unit / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | `ROAD-XXX` | Unique road link identifier. |
| `from_node`, `to_node` | String | Node IDs | Graph topology endpoints. |
| `distance_km` | Float | Kilometers | Geodesic length accounting for mountain tortuosity. |
| `speed_limit_kmh` | Float | km/h | Safe transit speed limit. |
| `base_travel_time_min` | Float | Minutes | Normal travel duration $(d / v \times 60)$. |
| `hazard_exposure_score` | Float | $[0.0, 1.0]$ | Hazard zone overlap and slope failure susceptibility. |
| `is_blocked` | Boolean | `True` / `False` | Real-time transit availability state. |
| `blocked_reason` | String | Text | Cause of blockage (debris rockfall, flood surge). |
