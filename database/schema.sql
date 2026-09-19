-- UrbanTwin PostgreSQL Schema v2 — aligned with Spring Boot JPA entities
-- Target: Neon Cloud PostgreSQL

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'URBAN_PLANNER',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Zones  (id is SERIAL to match JPA @GeneratedValue; zone_id is the human-readable slug)
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    description TEXT,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    area_km2 DOUBLE PRECISION,
    base_elevation DOUBLE PRECISION DEFAULT 880.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Historical Rainfall Data
CREATE TABLE IF NOT EXISTS rainfall_data (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    year INT NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) DEFAULT 'IMD Historical',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Elevation Data
CREATE TABLE IF NOT EXISTS elevation_data (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    elevation DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) DEFAULT 'SRTM 30m DEM',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Roads
CREATE TABLE IF NOT EXISTS roads (
    id VARCHAR(50) PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    road_type VARCHAR(50) DEFAULT 'ARTERIAL',
    width_m DOUBLE PRECISION DEFAULT 24.0,
    status VARCHAR(50) DEFAULT 'PASSABLE',
    coordinates_json TEXT NOT NULL
);

-- 6. Simulations  (payload_json + completed_at added for JPA entity)
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    simulation_code VARCHAR(100) UNIQUE,
    zone_id VARCHAR(64),
    change_type VARCHAR(50) NOT NULL,
    payload_json TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 7. Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    simulation_id INT REFERENCES simulations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    geometry_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Flood Results  (simulation_id direct link, contributing_factors_json added)
CREATE TABLE IF NOT EXISTS flood_results (
    id SERIAL PRIMARY KEY,
    simulation_id INT REFERENCES simulations(id) ON DELETE CASCADE,
    risk_score INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    affected_area_km2 DOUBLE PRECISION,
    est_max_water_depth_m DOUBLE PRECISION,
    buildings_at_risk_count INT,
    major_waterlogging_points_count INT,
    contributing_factors_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Traffic Results
CREATE TABLE IF NOT EXISTS traffic_results (
    id SERIAL PRIMARY KEY,
    simulation_id INT REFERENCES simulations(id) ON DELETE CASCADE,
    traffic_impact_score INT,
    cutoff_roads_count INT,
    congestion_multiplier DOUBLE PRECISION DEFAULT 1.85,
    affected_roads_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Evacuation Routes
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id SERIAL PRIMARY KEY,
    simulation_id INT REFERENCES simulations(id) ON DELETE CASCADE,
    start_point VARCHAR(200),
    end_point VARCHAR(200),
    distance_km DOUBLE PRECISION,
    estimated_time_min INT,
    route_geometry_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
