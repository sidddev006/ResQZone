"""
ResQZone GIS & Spatial Analysis Utilities
Provides point-in-polygon tests, geodesic distances, buffer generation,
and GeoJSON conversion using pure math and Shapely.
"""
from typing import List, Dict, Any, Tuple, Optional
import math
import json
from shapely.geometry import shape, Point, Polygon, LineString, mapping


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two coordinates in kilometers."""
    r = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 3)


def point_in_geojson_polygon(lon: float, lat: float, geojson_geom: dict) -> bool:
    """Returns True if the point [lon, lat] is strictly inside the GeoJSON geometry."""
    try:
        geom = shape(geojson_geom)
        pt = Point(lon, lat)
        return geom.contains(pt) or geom.touches(pt)
    except Exception:
        return False


def distance_point_to_polygon_km(lon: float, lat: float, geojson_geom: dict) -> float:
    """Calculates approximate minimum distance from point to polygon in km."""
    try:
        geom = shape(geojson_geom)
        pt = Point(lon, lat)
        if geom.contains(pt):
            return 0.0
        # Degree distance to km conversion factor at ~30° latitude
        deg_dist = geom.distance(pt)
        km_dist = deg_dist * 111.0 # 1 degree ~ 111 km
        return round(km_dist, 3)
    except Exception:
        return 999.0


def calculate_line_length_km(coordinates: List[List[float]]) -> float:
    """Calculates cumulative route distance in km from list of [lon, lat] pairs."""
    total_km = 0.0
    for i in range(len(coordinates) - 1):
        lon1, lat1 = coordinates[i]
        lon2, lat2 = coordinates[i + 1]
        total_km += haversine_distance_km(lat1, lon1, lat2, lon2)
    return round(total_km, 3)


def buffer_point_geojson(lon: float, lat: float, radius_km: float, num_points: int = 32) -> dict:
    """Generates a circular polygon GeoJSON buffer around a point."""
    coords = []
    lat_deg_per_km = 1.0 / 111.0
    lon_deg_per_km = 1.0 / (111.0 * math.cos(math.radians(lat)))
    
    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        d_lat = (radius_km * math.sin(angle)) * lat_deg_per_km
        d_lon = (radius_km * math.cos(angle)) * lon_deg_per_km
        coords.append([round(lon + d_lon, 6), round(lat + d_lat, 6)])
    coords.append(coords[0]) # Close loop
    
    return {
        "type": "Polygon",
        "coordinates": [coords]
    }
