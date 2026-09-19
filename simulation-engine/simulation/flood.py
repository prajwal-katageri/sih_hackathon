"""
Hydrologic Accumulation & Screening-Level Flood Risk Model
Calculates relative flood risk score (0-100), risk level, and spatial depth polygon grid.
"""

def calculate_flood_risk(rainfall_mm_hr, base_elevation, footprint_area, floors, material_id, change_type):
    # Material runoff factors
    runoff_factors = {
        'concrete': 0.92,
        'asphalt': 0.95,
        'permeable': 0.35,
        'green_roof': 0.45
    }
    runoff_coeff = runoff_factors.get(material_id, 0.90)

    # 1. Rainfall factor (0-30 points)
    rainfall_factor = min(30.0, (rainfall_mm_hr / 150.0) * 30.0)

    # 2. Elevation factor (0-25 points - lower elevation = higher risk)
    elevation_factor = max(0.0, min(25.0, (900.0 - base_elevation) * 0.8))

    # 3. Terrain / Infrastructure Change factor (0-25 points)
    change_multipliers = {
        'NEW_CONSTRUCTION': 1.25,
        'ROAD_WIDENING': 1.10,
        'DRAINAGE_IMPROVEMENT': 0.50
    }
    change_mult = change_multipliers.get(change_type, 1.0)
    
    construction_displacement = (footprint_area * (floors * 0.35)) * runoff_coeff
    infrastructure_factor = min(25.0, (construction_displacement / 2000.0) * 20.0 * change_mult)

    # 4. Drainage capacity factor (0-20 points)
    drainage_factor = 20.0 * (1.0 - (0.5 if change_type == 'DRAINAGE_IMPROVEMENT' else 0.1))

    # Total screening-level risk score (0 - 100)
    raw_score = rainfall_factor + elevation_factor + infrastructure_factor + drainage_factor
    risk_score = int(min(100, max(5, round(raw_score))))

    # Categorize Risk Level
    if risk_score >= 81:
        risk_level = "VERY HIGH"
    elif risk_score >= 61:
        risk_level = "HIGH"
    elif risk_score >= 31:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Estimate physical metrics
    est_max_water_depth = round(0.2 + (risk_score / 100.0) * 2.2, 2)
    affected_area_km2 = round(0.05 + (risk_score / 100.0) * 0.45, 2)
    buildings_at_risk = int(affected_area_km2 * 140)
    waterlogging_points = max(1, int(est_max_water_depth * 2.5))

    return {
        'riskScore': risk_score,
        'riskLevel': risk_level,
        'estMaxWaterDepthM': est_max_water_depth,
        'affectedAreaKm2': affected_area_km2,
        'buildingsAtRiskCount': buildings_at_risk,
        'majorWaterloggingPointsCount': waterlogging_points,
        'contributingFactors': [
            f"Historical rainfall intensity ({rainfall_mm_hr} mm/h)",
            f"Base terrain elevation ({base_elevation}m MSL)",
            f"Surface runoff coefficient ({(runoff_coeff * 100):.0f}% impervious)",
            f"Intervention change type ({change_type})"
        ]
    }
