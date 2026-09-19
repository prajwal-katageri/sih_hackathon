"""
UrbanTwin – Python Flask Simulation Engine
Port: 5001 (distinct from existing Flask service on 5000)
Called by: Spring Boot Backend via HTTP POST
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from simulation.risk import run_combined_simulation
from simulation.flood import calculate_flood_risk
from simulation.traffic import calculate_traffic_impact
from simulation.routing import calculate_evacuation_route

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("UrbanTwin-SimEngine")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "online", "service": "UrbanTwin Simulation Engine", "version": "1.0.0"})


@app.route('/simulation/flood', methods=['POST'])
def flood():
    data = request.get_json() or {}
    logger.info(f"[FLOOD] Zone={data.get('zoneId')} Change={data.get('changeType')}")
    try:
        result = calculate_flood_risk(
            rainfall_mm_hr=float(data.get('rainfallMmHr', 85)),
            base_elevation=float(data.get('baseElevation', 885)),
            footprint_area=float(data.get('footprintArea', 1200)),
            floors=int(data.get('floors', 10)),
            material_id=data.get('materialId', 'concrete'),
            change_type=data.get('changeType', 'NEW_CONSTRUCTION')
        )
        return jsonify({"success": True, **result})
    except Exception as e:
        logger.error(f"[FLOOD ERROR] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/simulation/traffic', methods=['POST'])
def traffic():
    data = request.get_json() or {}
    logger.info(f"[TRAFFIC] RiskScore={data.get('riskScore')}")
    try:
        result = calculate_traffic_impact(
            risk_score=int(data.get('riskScore', 50)),
            change_type=data.get('changeType', 'NEW_CONSTRUCTION')
        )
        return jsonify({"success": True, **result})
    except Exception as e:
        logger.error(f"[TRAFFIC ERROR] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/simulation/combined', methods=['POST'])
def combined():
    data = request.get_json() or {}
    logger.info(f"[COMBINED] Zone={data.get('zoneId')} Change={data.get('changeType')}")
    try:
        result = run_combined_simulation(data)
        logger.info(f"[COMBINED RESULT] {result.get('simulationCode')} FloodRisk={result['floodRisk']['riskLevel']}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"[COMBINED ERROR] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/routing/evacuation', methods=['POST'])
def evacuation():
    data = request.get_json() or {}
    try:
        result = calculate_evacuation_route(
            start_coord=data.get('startCoord'),
            center_lat=float(data.get('centerLat', 12.9784)),
            center_lng=float(data.get('centerLng', 77.6408))
        )
        return jsonify({"success": True, **result})
    except Exception as e:
        logger.error(f"[ROUTING ERROR] {e}")
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    logger.info(f"UrbanTwin Simulation Engine starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
