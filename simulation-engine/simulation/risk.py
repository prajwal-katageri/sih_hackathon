"""
Combined Screening-Level Risk Calculator & Explanation Builder
"""
from simulation.flood import calculate_flood_risk
from simulation.traffic import calculate_traffic_impact
from simulation.routing import calculate_evacuation_route

import time

def run_combined_simulation(payload):
    zone_id = payload.get('zoneId', 'indiranagar')
    change_type = payload.get('changeType', 'NEW_CONSTRUCTION')
    intervention = payload.get('intervention', {})
    
    rainfall_mm_hr = float(payload.get('rainfallMmHr', 85))
    base_elevation = float(payload.get('baseElevation', 885.0))
    footprint_area = float(intervention.get('footprintArea', 1200))
    floors = int(intervention.get('floors', 10))
    material_id = intervention.get('materialId', 'concrete')
    center_lat = float(payload.get('centerLat', 12.9784))
    center_lng = float(payload.get('centerLng', 77.6408))

    # 1. Calculate Flood Risk
    flood_res = calculate_flood_risk(rainfall_mm_hr, base_elevation, footprint_area, floors, material_id, change_type)

    # 2. Calculate Traffic Impact & Cut-Off Roads
    traffic_res = calculate_traffic_impact(flood_res['riskScore'], change_type)

    # 3. Calculate Dijkstra Evacuation Path
    evacuation_res = calculate_evacuation_route(None, center_lat, center_lng)

    sim_timestamp = int(time.time() * 1000)
    return {
        'success': True,
        'simulationCode': f"SIM-{zone_id.upper()}-{sim_timestamp}",
        'zoneId': zone_id,
        'changeType': change_type,
        'floodRisk': flood_res,
        'trafficRisk': traffic_res,
        'evacuationRoute': evacuation_res,
        'disclaimer': "UrbanTwin provides screening-level relative-risk comparison based on available data. Results are intended for planning support and are not a certified engineering simulation."
    }
