-- UrbanTwin Database Seed Data (Bengaluru Pilot Zones & IMD Rainfall)

-- Seed Initial Users
INSERT INTO users (name, email, password_hash, role) VALUES
('Urban Planner Admin', 'planner@urbantwin.org', 'pbkdf2_sha256$hash$planner123', 'URBAN_PLANNER'),
('Municipal Officer', 'authority@urbantwin.org', 'pbkdf2_sha256$hash$authority123', 'MUNICIPAL_AUTHORITY'),
('Disaster Response Lead', 'disaster@urbantwin.org', 'pbkdf2_sha256$hash$disaster123', 'DISASTER_MANAGEMENT')
ON CONFLICT (email) DO NOTHING;

-- Seed Pilot Zones
INSERT INTO zones (id, name, city, description, center_lat, center_lng, area_km2, base_elevation) VALUES
('indiranagar', 'Indiranagar Zone', 'Bengaluru', 'Commercial and high-density residential zone', 12.9784, 77.6408, 0.42, 885.0),
('hsr', 'HSR Layout Sector 6', 'Bengaluru', 'Lowland valley residential layout prone to runoff', 12.9116, 77.6389, 0.65, 875.0),
('koramangala', 'Koramangala 4th Block', 'Bengaluru', 'Intermediate ring corridor near primary drainage', 12.9348, 77.6253, 0.58, 870.0),
('whitefield', 'Whitefield Tech Corridor', 'Bengaluru', 'High-growth IT park and infrastructure expansion zone', 12.9698, 77.7499, 0.72, 890.0),
('electronic_city', 'Electronic City Phase 1', 'Bengaluru', 'Industrial tech hub with major flyover arterials', 12.8452, 77.6602, 0.80, 895.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Historical IMD Rainfall Data (2015-2024)
INSERT INTO rainfall_data (zone_id, year, rainfall_mm, source) VALUES
('indiranagar', 2015, 890, 'IMD Pune Historical'),
('indiranagar', 2016, 920, 'IMD Pune Historical'),
('indiranagar', 2017, 1680, 'IMD Pune Historical'),
('indiranagar', 2018, 1340, 'IMD Pune Historical'),
('indiranagar', 2019, 1980, 'IMD Pune Historical'),
('indiranagar', 2020, 1490, 'IMD Pune Historical'),
('indiranagar', 2021, 1120, 'IMD Pune Historical'),
('indiranagar', 2022, 1620, 'IMD Pune Historical'),
('indiranagar', 2023, 1080, 'IMD Pune Historical'),
('indiranagar', 2024, 1310, 'IMD Pune Historical')
ON CONFLICT DO NOTHING;
