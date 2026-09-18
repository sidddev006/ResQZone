"""
ResQZone Multi-Objective Routing Engine
Computes Fastest, Safest, and Balanced evacuation routes using NetworkX,
incorporating dynamic road blockage detection and hazard zone exposure metrics.
"""
from typing import Dict, Any, List, Optional, Tuple
import networkx as nx
from backend.app.gis.spatial_utils import haversine_distance_km


class RoutingEngine:
    def __init__(self):
        pass

    def build_network_graph(self, road_segments: List[Dict[str, Any]], blocked_road_ids: Optional[List[str]] = None) -> nx.Graph:
        """
        Constructs an undirected NetworkX graph from road segments,
        filtering out actively blocked roads.
        """
        blocked_set = set(blocked_road_ids or [])
        G = nx.Graph()

        for road in road_segments:
            road_id = road.get("id")
            # If permanently blocked or dynamically blocked in simulation, skip edge
            if road.get("is_blocked", False) or road_id in blocked_set:
                continue

            u = road["from_node"]
            v = road["to_node"]
            dist_km = float(road.get("distance_km", 1.0))
            speed = float(road.get("speed_limit_kmh", 30.0))
            base_time_min = float(road.get("base_travel_time_min", (dist_km / speed) * 60.0))
            hazard_score = float(road.get("hazard_exposure_score", 0.2))

            # Edge cost calculations
            # 1. Fastest: strictly travel time
            cost_fastest = base_time_min
            
            # 2. Safest: heavy penalty on hazard exposure
            cost_safest = (hazard_score * 50.0) + (base_time_min * 0.5)
            
            # 3. Balanced: normalized harmonic blend
            cost_balanced = base_time_min + (hazard_score * 15.0)

            G.add_edge(
                u, v,
                road_id=road_id,
                name=road.get("name", "Road Link"),
                distance_km=dist_km,
                travel_time_min=base_time_min,
                hazard_score=hazard_score,
                weight_fastest=cost_fastest,
                weight_safest=cost_safest,
                weight_balanced=cost_balanced
            )
        return G

    def calculate_candidate_routes(
        self,
        origin_node: str,
        destination_node: str,
        road_segments: List[Dict[str, Any]],
        blocked_road_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculates FASTEST, SAFEST, and BALANCED route options between origin and destination.
        Returns detailed tradeoff metrics.
        """
        G = self.build_network_graph(road_segments, blocked_road_ids)

        if not G.has_node(origin_node) or not G.has_node(destination_node):
            return {
                "feasible": False,
                "reason": f"No network path found between {origin_node} and {destination_node} (disconnected or blocked)."
            }

        if not nx.has_path(G, origin_node, destination_node):
            return {
                "feasible": False,
                "reason": f"Network graph disconnected between {origin_node} and {destination_node} due to road closures."
            }

        strategies = ["FASTEST", "SAFEST", "BALANCED"]
        weight_keys = {
            "FASTEST": "weight_fastest",
            "SAFEST": "weight_safest",
            "BALANCED": "weight_balanced"
        }

        routes_result = {}

        for strat in strategies:
            weight_key = weight_keys[strat]
            path_nodes = nx.shortest_path(G, source=origin_node, target=destination_node, weight=weight_key)
            
            # Aggregate metrics along the selected path
            total_dist = 0.0
            total_time = 0.0
            total_hazard_weighted = 0.0
            segments_used = []

            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i + 1]
                edge_data = G[u][v]
                total_dist += edge_data["distance_km"]
                total_time += edge_data["travel_time_min"]
                total_hazard_weighted += edge_data["hazard_score"] * edge_data["distance_km"]
                segments_used.append(edge_data["road_id"])

            avg_hazard = round(total_hazard_weighted / total_dist, 3) if total_dist > 0 else 0.0
            
            # Hazard severity label
            if avg_hazard >= 0.70:
                hazard_label = "HIGH HAZARD EXPOSURE"
                hazard_color = "#EF4444"
            elif avg_hazard >= 0.40:
                hazard_label = "MODERATE HAZARD EXPOSURE"
                hazard_color = "#F59E0B"
            else:
                hazard_label = "LOW HAZARD EXPOSURE"
                hazard_color = "#10B981"

            routes_result[strat] = {
                "strategy": strat,
                "distance_km": round(total_dist, 2),
                "travel_time_min": round(total_time, 1),
                "hazard_exposure_score": avg_hazard,
                "hazard_exposure_label": hazard_label,
                "hazard_color": hazard_color,
                "path_nodes": path_nodes,
                "road_segment_ids": segments_used
            }

        return {
            "feasible": True,
            "origin": origin_node,
            "destination": destination_node,
            "options": routes_result,
            "tradeoff_summary": (
                f"Fastest: {routes_result['FASTEST']['travel_time_min']} min ({routes_result['FASTEST']['hazard_exposure_label']}) vs "
                f"Safest: {routes_result['SAFEST']['travel_time_min']} min ({routes_result['SAFEST']['hazard_exposure_label']})"
            )
        }


routing_engine = RoutingEngine()
