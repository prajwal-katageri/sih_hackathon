// Pilot zones in Bengaluru with geo coordinates, elevation baselines, and historical IMD datasets
export const PILOT_ZONES = [
  {
    id: 'indiranagar',
    name: 'Indiranagar Zone (Pilot)',
    city: 'Bengaluru',
    center: [12.9784, 77.6408],
    zoom: 15,
    areaKm2: 0.42,
    baseElevation: 885, // meters above sea level
    imdHistoricalRainfall: [
      { year: 2018, rainfallMm: 890 },
      { year: 2019, rainfallMm: 1020 },
      { year: 2020, rainfallMm: 950 },
      { year: 2021, rainfallMm: 1140 },
      { year: 2022, rainfallMm: 1290 },
      { year: 2023, rainfallMm: 980 },
      { year: 2024, rainfallMm: 1110 },
    ],
    evacuationHubs: [
      { name: 'Indiranagar Metro Station (Elevated Safe Zone)', lat: 12.9783, lng: 77.6385, capacity: 2500 },
      { name: 'Chinmaya Mission Hospital Grounds', lat: 12.9765, lng: 77.6420, capacity: 1800 },
    ],
    roads: [
      { id: 'r1', name: '100ft Road Main Arterial', coordinates: [[12.9750, 77.6410], [12.9820, 77.6405]], width: 30, elevationOffset: -1.2 },
      { id: 'r2', name: '12th Main Commerce Collector', coordinates: [[12.9780, 77.6360], [12.9780, 77.6450]], width: 18, elevationOffset: -0.5 },
      { id: 'r3', name: 'CMH Road Evacuation Route', coordinates: [[12.9760, 77.6370], [12.9760, 77.6440]], width: 24, elevationOffset: 0.8 },
    ]
  },
  {
    id: 'koramangala',
    name: 'Koramangala 4th Block (Valley Zone)',
    city: 'Bengaluru',
    center: [12.9348, 77.6253],
    zoom: 15,
    areaKm2: 0.58,
    baseElevation: 870,
    imdHistoricalRainfall: [
      { year: 2018, rainfallMm: 920 },
      { year: 2019, rainfallMm: 1100 },
      { year: 2020, rainfallMm: 1040 },
      { year: 2021, rainfallMm: 1250 },
      { year: 2022, rainfallMm: 1410 },
      { year: 2023, rainfallMm: 1050 },
      { year: 2024, rainfallMm: 1200 },
    ],
    evacuationHubs: [
      { name: 'St. John Stadium High Ground', lat: 12.9320, lng: 77.6210, capacity: 5000 },
      { name: 'Koramangala Indoor Stadium', lat: 12.9360, lng: 77.6270, capacity: 3500 },
    ],
    roads: [
      { id: 'rk1', name: '80ft Road Main Drain Corridor', coordinates: [[12.9320, 77.6250], [12.9380, 77.6250]], width: 24, elevationOffset: -2.5 },
      { id: 'rk2', name: '100ft Intermediate Ring Road', coordinates: [[12.9350, 77.6200], [12.9350, 77.6300]], width: 32, elevationOffset: -1.0 },
    ]
  },
  {
    id: 'hsr',
    name: 'HSR Layout Sector 6 (Lowland)',
    city: 'Bengaluru',
    center: [12.9116, 77.6389],
    zoom: 15,
    areaKm2: 0.65,
    baseElevation: 875,
    imdHistoricalRainfall: [
      { year: 2018, rainfallMm: 870 },
      { year: 2019, rainfallMm: 1010 },
      { year: 2020, rainfallMm: 990 },
      { year: 2021, rainfallMm: 1180 },
      { year: 2022, rainfallMm: 1320 },
      { year: 2023, rainfallMm: 990 },
      { year: 2024, rainfallMm: 1150 },
    ],
    evacuationHubs: [
      { name: 'HSR BDA Complex Elevated Deck', lat: 12.9125, lng: 77.6370, capacity: 4000 },
    ],
    roads: [
      { id: 'rh1', name: 'Outer Ring Road HSR Feeder', coordinates: [[12.9090, 77.6380], [12.9140, 77.6395]], width: 28, elevationOffset: -1.8 },
    ]
  }
];

export const BUILDING_MATERIALS = [
  { id: 'concrete', name: 'Concrete (Standard)', runoffCoeff: 0.92, absorptionRate: 'Very Low (8%)' },
  { id: 'permeable', name: 'Permeable Concrete / Pavement', runoffCoeff: 0.35, absorptionRate: 'High (65%)' },
  { id: 'green_roof', name: 'Green Roof / Eco-Structure', runoffCoeff: 0.45, absorptionRate: 'Moderate-High (55%)' },
  { id: 'asphalt', name: 'Dense Asphalt Surface', runoffCoeff: 0.95, absorptionRate: 'Negligible (5%)' },
];

export const INTERVENTION_TYPES = [
  { id: 'building', name: 'New Building / Structure Construction', icon: 'Building' },
  { id: 'road', name: 'Road Widening / Elevation', icon: 'Route' },
  { id: 'drainage', name: 'Drainage Channel Upgrade', icon: 'Waves' },
];
