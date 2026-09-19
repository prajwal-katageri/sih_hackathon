"""
Traffic Impact & Road Submersion Redistribution Model
Identifies cut-off roads, traffic congestion score, and alternative bypass corridors.
"""

def calculate_traffic_impact(risk_score, change_type, roads_list=None):
    # Determine submerged / cut-off road count based on flood risk severity
    cutoff_count = max(0, min(5, int(risk_score / 20) - 1))
    if change_type == 'ROAD_WIDENING':
        cutoff_count = max(0, cutoff_count - 1)
        
    traffic_score = min(100, int(risk_score * 0.85 + (cutoff_count * 8)))
    congestion_multiplier = round(1.0 + (traffic_score / 100.0) * 1.1, 2)

    sample_roads = roads_list or [
        {"id": "r1", "name": "100ft Road Main Arterial", "status": "SUBMERGED" if cutoff_count >= 1 else "PASSABLE"},
        {"id": "r2", "name": "12th Main Commerce Collector", "status": "SUBMERGED" if cutoff_count >= 2 else "PASSABLE"},
        {"id": "r3", "name": "CMH Road Evacuation Corridor", "status": "PASSABLE"},
        {"id": "r4", "name": "80ft Road Peripheral By-Pass", "status": "PASSABLE"}
    ]

    cutoff_roads = [r for r in sample_roads if r.get("status") == "SUBMERGED"]

    return {
        'trafficImpactScore': traffic_score,
        'cutoffRoadsCount': len(cutoff_roads),
        'congestionMultiplier': congestion_multiplier,
        'affectedRoads': sample_roads,
        'cutoffRoads': cutoff_roads,
        'alternativeRoutes': ["80ft Road Peripheral By-Pass", "CMH Elevated Corridor"]
    }
