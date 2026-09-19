import os
import math
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, Zone, RainfallRecord, SimulationResult

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

def seed_database():
    """Seed initial Bengaluru pilot zones and IMD rainfall records."""
    if Zone.query.first():
        return

    zones = [
        Zone(id='indiranagar', name='Indiranagar', city='Bengaluru', center_lat=12.9784, center_lng=77.6408, area_km2=0.42, base_elevation=885.0),
        Zone(id='hsr', name='HSR Layout', city='Bengaluru', center_lat=12.9116, center_lng=77.6389, area_km2=0.65, base_elevation=875.0),
        Zone(id='koramangala', name='Koramangala', city='Bengaluru', center_lat=12.9348, center_lng=77.6253, area_km2=0.58, base_elevation=870.0),
        Zone(id='whitefield', name='Whitefield', city='Bengaluru', center_lat=12.9698, center_lng=77.7499, area_km2=0.72, base_elevation=890.0),
        Zone(id='electronic_city', name='Electronic City', city='Bengaluru', center_lat=12.8452, center_lng=77.6602, area_km2=0.80, base_elevation=895.0),
        Zone(id='custom_draw', name='Custom Area (Draw)', city='Bengaluru', center_lat=12.9784, center_lng=77.6408, area_km2=0.42, base_elevation=885.0),
    ]
    db.session.bulk_save_objects(zones)
    db.session.commit()

    # Seed IMD historical rainfall data (2015 - 2024)
    imd_years = [
        (2015, 890), (2016, 920), (2017, 1680), (2018, 1340), (2019, 1980),
        (2020, 1490), (2021, 1120), (2022, 1620), (2023, 1080), (2024, 1310)
    ]
    for zone in zones:
        for year, mm in imd_years:
            record = RainfallRecord(zone_id=zone.id, year=year, rainfall_mm=mm)
            db.session.add(record)
    db.session.commit()

with app.app_context():
    db.create_all()
    seed_database()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'service': 'UrbanTwin Flask REST Backend',
        'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0],
        'version': '1.0.0-SIH2026'
    })

@app.route('/api/zones', methods=['GET'])
def get_zones():
    zones = Zone.query.all()
    return jsonify([z.to_dict() for z in zones])

@app.route('/api/weather/<zone_id>', methods=['GET'])
def get_weather(zone_id):
    records = RainfallRecord.query.filter_by(zone_id=zone_id).order_by(RainfallRecord.year).all()
    if not records:
        records = RainfallRecord.query.filter_by(zone_id='indiranagar').order_by(RainfallRecord.year).all()
    return jsonify([r.to_dict() for r in records])

@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.get_json() or {}
    zone_id = data.get('zoneId', 'indiranagar')
    intervention = data.get('intervention', {})
    
    material_id = intervention.get('materialId', 'concrete')
    floors = int(intervention.get('floors', 10))
    footprint_area = float(intervention.get('footprintArea', 1200))
    rainfall_rate = float(intervention.get('rainfallRateMmHr', 85))

    zone = Zone.query.get(zone_id) or Zone.query.get('indiranagar')
    
    # Run hydrologic accumulation heuristic physics
    runoff_factor = 0.92 if material_id == 'concrete' else (0.35 if material_id == 'permeable' else 0.95)
    area_m2 = zone.area_km2 * 1000000
    water_vol_m3 = area_m2 * (rainfall_rate / 1000) * runoff_factor
    structural_disp = footprint_area * (floors * 0.35) * runoff_factor
    
    total_water = water_vol_m3 + structural_disp
    est_max_water_depth = round((total_water / area_m2) * 14.5, 2)
    affected_area = round(zone.area_km2 * min(0.85, (est_max_water_depth / 2.8)), 2)
    buildings_at_risk = int(affected_area * 140)
    waterlogging_points = max(1, int(est_max_water_depth * 2.2))

    # Persist simulation run to database
    sim_run = SimulationResult(
        zone_id=zone.id,
        intervention_type=intervention.get('type', 'building'),
        material_id=material_id,
        floors=floors,
        footprint_area=footprint_area,
        rainfall_rate=rainfall_rate,
        max_water_depth=est_max_water_depth,
        affected_area_km2=affected_area,
        buildings_at_risk=buildings_at_risk,
        waterlogging_points=waterlogging_points
    )
    db.session.add(sim_run)
    db.session.commit()

    # Spatial heatmap grid generation
    center_lat, center_lng = zone.center_lat, zone.center_lng
    flood_points = []
    step = 0.002
    for r in range(-4, 5):
        for c in range(-4, 5):
            p_lat = center_lat + (r * step)
            p_lng = center_lng + (c * step)
            dist = math.sqrt(r*r + c*c)
            point_depth = round(max(0.02, est_max_water_depth * max(0.05, 1 - (dist / 6))), 2)
            
            color = '#3b82f6'
            risk = 'low'
            if point_depth >= 2.0:
                color, risk = '#ef4444', 'critical'
            elif point_depth >= 1.0:
                color, risk = '#f97316', 'high'
            elif point_depth >= 0.5:
                color, risk = '#eab308', 'moderate'

            flood_points.push = flood_points.append({
                'id': f"fp_{r}_{c}",
                'lat': p_lat,
                'lng': p_lng,
                'depth': point_depth,
                'riskCategory': risk,
                'color': color,
                'radius': max(15, point_depth * 25)
            })

    return jsonify({
        'success': True,
        'isRemote': True,
        'zoneId': zone.id,
        'metrics': {
            'estMaxWaterDepthM': est_max_water_depth,
            'affectedAreaKm2': affected_area,
            'buildingsAtRiskCount': buildings_at_risk,
            'majorWaterloggingPointsCount': waterlogging_points,
            'cutOffRoadCount': max(1, int(est_max_water_depth * 1.5)),
            'totalEvacuationTimeMin': int(18 + (est_max_water_depth * 12))
        },
        'floodRiskPoints': flood_points,
        'evacuationPath': [
            [center_lat - 0.006, center_lng - 0.005],
            [center_lat - 0.003, center_lng - 0.002],
            [center_lat + 0.001, center_lng + 0.001],
            [center_lat + 0.005, center_lng + 0.005]
        ]
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
