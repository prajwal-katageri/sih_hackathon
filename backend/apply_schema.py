"""
Applies corrected schema using BIGSERIAL for all id columns (matches JPA Long/BIGINT)
"""
import psycopg2

POSTGRES_URI = (
    "postgresql://neondb_owner:npg_4nGMfFDJ1oXe"
    r"@ep-snowy-darkness-b3g2skxt-pooler.c-4.ap-southeast-1.aws.neon.tech"
    "/neondb?sslmode=require"
)

SCHEMA = """
DROP TABLE IF EXISTS evacuation_routes CASCADE;
DROP TABLE IF EXISTS traffic_results CASCADE;
DROP TABLE IF EXISTS flood_results CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;
DROP TABLE IF EXISTS simulations CASCADE;
DROP TABLE IF EXISTS roads CASCADE;
DROP TABLE IF EXISTS elevation_data CASCADE;
DROP TABLE IF EXISTS rainfall_data CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'URBAN_PLANNER',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zones (
    id BIGSERIAL PRIMARY KEY,
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

CREATE TABLE rainfall_data (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    year INT NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) DEFAULT 'IMD Historical',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE elevation_data (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    elevation DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) DEFAULT 'SRTM 30m DEM',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roads (
    id VARCHAR(50) PRIMARY KEY,
    zone_id VARCHAR(64) REFERENCES zones(zone_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    road_type VARCHAR(50) DEFAULT 'ARTERIAL',
    width_m DOUBLE PRECISION DEFAULT 24.0,
    status VARCHAR(50) DEFAULT 'PASSABLE',
    coordinates_json TEXT NOT NULL
);

CREATE TABLE simulations (
    id BIGSERIAL PRIMARY KEY,
    simulation_code VARCHAR(100) UNIQUE,
    zone_id VARCHAR(64),
    change_type VARCHAR(50) NOT NULL,
    payload_json TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE scenarios (
    id BIGSERIAL PRIMARY KEY,
    simulation_id BIGINT REFERENCES simulations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    geometry_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flood_results (
    id BIGSERIAL PRIMARY KEY,
    simulation_id BIGINT REFERENCES simulations(id) ON DELETE CASCADE,
    risk_score INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    affected_area_km2 DOUBLE PRECISION,
    est_max_water_depth_m DOUBLE PRECISION,
    buildings_at_risk_count INT,
    major_waterlogging_points_count INT,
    contributing_factors_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traffic_results (
    id BIGSERIAL PRIMARY KEY,
    simulation_id BIGINT REFERENCES simulations(id) ON DELETE CASCADE,
    traffic_impact_score INT,
    cutoff_roads_count INT,
    congestion_multiplier DOUBLE PRECISION DEFAULT 1.85,
    affected_roads_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evacuation_routes (
    id BIGSERIAL PRIMARY KEY,
    simulation_id BIGINT REFERENCES simulations(id) ON DELETE CASCADE,
    start_point VARCHAR(200),
    end_point VARCHAR(200),
    distance_km DOUBLE PRECISION,
    estimated_time_min INT,
    route_geometry_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
"""

SEED = """
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@urbantwin.in', 'hashed_admin_pw', 'ADMIN'),
('Planner Priya', 'planner@bbmp.gov.in', 'hashed_planner_pw', 'URBAN_PLANNER'),
('Analyst Arun', 'analyst@urbantwin.in', 'hashed_analyst_pw', 'ANALYST')
ON CONFLICT (email) DO NOTHING;

INSERT INTO zones (zone_id, name, city, description, center_lat, center_lng, area_km2, base_elevation) VALUES
('indiranagar',   'Indiranagar',  'Bengaluru', 'Commercial & residential zone, flood-prone low-lying pockets', 12.9784, 77.6408, 3.21, 882.0),
('whitefield',    'Whitefield',   'Bengaluru', 'IT corridor with rapid infrastructure growth', 12.9698, 77.7499, 7.82, 897.0),
('hsr_layout',    'HSR Layout',   'Bengaluru', 'Planned residential zone, lake encroachment risks', 12.9116, 77.6473, 5.14, 893.0),
('koramangala',   'Koramangala',  'Bengaluru', 'Mixed use, historically flood-affected', 12.9352, 77.6245, 4.47, 879.0),
('rajajinagar',   'Rajajinagar',  'Bengaluru', 'Older residential, stormwater drainage issues', 12.9910, 77.5560, 3.86, 885.0)
ON CONFLICT (zone_id) DO NOTHING;

INSERT INTO rainfall_data (zone_id, year, rainfall_mm, source) VALUES
('indiranagar', 2015, 862.0, 'IMD Historical'),
('indiranagar', 2016, 934.0, 'IMD Historical'),
('indiranagar', 2017, 781.0, 'IMD Historical'),
('indiranagar', 2018, 1123.0, 'IMD Historical'),
('indiranagar', 2019, 992.0, 'IMD Historical'),
('indiranagar', 2020, 1087.0, 'IMD Historical'),
('indiranagar', 2021, 1156.0, 'IMD Historical'),
('indiranagar', 2022, 1243.0, 'IMD Historical'),
('indiranagar', 2023, 1312.0, 'IMD Historical'),
('indiranagar', 2024, 978.0,  'IMD Historical');
"""

conn = psycopg2.connect(POSTGRES_URI)
conn.autocommit = True
cur = conn.cursor()

for label, sql in [('SCHEMA (BIGSERIAL)', SCHEMA), ('SEED', SEED)]:
    print(f"\n=== Applying {label} ===")
    stmts = [s.strip() for s in sql.split(';') if s.strip()]
    for i, stmt in enumerate(stmts, 1):
        try:
            cur.execute(stmt)
            print(f"  [{i}/{len(stmts)}] OK: {stmt[:70].replace(chr(10), ' ')}")
        except Exception as e:
            print(f"  [{i}/{len(stmts)}] ERROR: {e}")

cur.close()
conn.close()
print("\nDone — BIGSERIAL schema applied to Neon.")
