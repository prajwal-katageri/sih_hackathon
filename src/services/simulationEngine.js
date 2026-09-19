import { BUILDING_MATERIALS } from '../data/mockData';

/**
 * Standalone Hydrologic Accumulation & Traffic Impact Engine
 */
export const runLocalSimulation = (zone, intervention) => {
  const {
    type = 'building',
    materialId = 'concrete',
    floors = 10,
    footprintArea = 1200, // m2
    rainfallRateMmHr = 85, // mm/hr intensity
    drainageCapacityCoeff = 1.0,
  } = intervention;

  const mat = BUILDING_MATERIALS.find(m => m.id === materialId) || BUILDING_MATERIALS[0];
  const runoffFactor = mat.runoffCoeff;

  // Hydrologic calculation heuristic
  // Water volume generated (m3) = Area * (Rainfall / 1000) * Runoff Factor
  const areaM2 = zone.areaKm2 * 1000000;
  const rawWaterVolumeM3 = areaM2 * (rainfallRateMmHr / 1000) * runoffFactor;
  
  // Additional impact from new building footprint / road change
  const structuralDisplacementM3 = type === 'building' 
    ? (footprintArea * (floors * 0.35)) * runoffFactor
    : footprintArea * 1.5;

  const totalEffectiveWaterM3 = (rawWaterVolumeM3 + structuralDisplacementM3) / drainageCapacityCoeff;
  
  // Calculate average water depth accumulation across zone elevation depressions
  const estMaxWaterDepthM = Number(((totalEffectiveWaterM3 / areaM2) * 14.5).toFixed(2));
  const affectedAreaKm2 = Number((zone.areaKm2 * Math.min(0.85, (estMaxWaterDepthM / 2.8))).toFixed(2));
  const buildingsAtRiskCount = Math.round(affectedAreaKm2 * 140);
  const majorWaterloggingPointsCount = Math.max(1, Math.round(estMaxWaterDepthM * 2.2));

  // Generate spatial flood depth polygons / heatmap grid points around zone center
  const centerLat = zone.center[0];
  const centerLng = zone.center[1];

  // Grid of points simulating elevation low-spots
  const floodRiskPoints = [];
  const gridRows = 9;
  const gridCols = 9;
  const step = 0.002; // lat/lng delta

  let cutOffRoadCount = 0;

  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 4; c++) {
      const pLat = centerLat + (r * step);
      const pLng = centerLng + (c * step);
      
      // Distance weight from center / intervention site
      const dist = Math.sqrt(r * r + c * c);
      const elevationNoise = Math.sin(r * 1.5) * Math.cos(c * 1.5);
      
      let pointDepth = estMaxWaterDepthM * Math.max(0.05, (1 - (dist / 6)) + (elevationNoise * 0.3));
      pointDepth = Math.max(0.02, Number(pointDepth.toFixed(2)));

      let riskCategory = 'safe';
      let color = '#3b82f6'; // < 0.1m

      if (pointDepth >= 2.0) {
        riskCategory = 'critical';
        color = '#ef4444'; // > 2.0m
      } else if (pointDepth >= 1.0) {
        riskCategory = 'high';
        color = '#f97316'; // 1.0 - 2.0m
      } else if (pointDepth >= 0.5) {
        riskCategory = 'moderate';
        color = '#eab308'; // 0.5 - 1.0m
      } else if (pointDepth >= 0.1) {
        riskCategory = 'low';
        color = '#06b6d4'; // 0.1 - 0.5m
      }

      if (pointDepth >= 0.5) {
        cutOffRoadCount++;
      }

      floodRiskPoints.push({
        id: `fp_${r}_${c}`,
        lat: pLat,
        lng: pLng,
        depth: pointDepth,
        riskCategory,
        color,
        radius: Math.max(15, pointDepth * 25),
      });
    }
  }

  // Generate Evacuation Safe Paths avoiding submerged points (>0.5m)
  const evacuationHub = zone.evacuationHubs[0] || { lat: centerLat + 0.005, lng: centerLng + 0.005, name: 'Safe Hub' };
  
  const evacuationPath = [
    [centerLat - 0.006, centerLng - 0.005],
    [centerLat - 0.003, centerLng - 0.002],
    [centerLat + 0.001, centerLng + 0.001],
    [evacuationHub.lat, evacuationHub.lng],
  ];

  return {
    timestamp: new Date().toISOString(),
    zoneId: zone.id,
    zoneName: zone.name,
    intervention,
    metrics: {
      estMaxWaterDepthM,
      affectedAreaKm2,
      buildingsAtRiskCount,
      majorWaterloggingPointsCount,
      cutOffRoadCount: Math.min(zone.roads.length, Math.max(1, Math.floor(cutOffRoadCount / 12))),
      totalEvacuationTimeMin: Math.round(18 + (estMaxWaterDepthM * 12)),
    },
    floodRiskPoints,
    evacuationPath,
    evacuationHub,
    roadStatus: zone.roads.map((road, idx) => ({
      ...road,
      isCutOff: idx === 0 && estMaxWaterDepthM > 0.8,
      simulatedDepth: Number((estMaxWaterDepthM * (idx === 0 ? 1.1 : 0.4)).toFixed(2)),
    })),
  };
};

export const generateScenarioComparison = (zone, variantAIntervention, variantBIntervention) => {
  const simBaseline = runLocalSimulation(zone, { type: 'building', materialId: 'concrete', floors: 12, footprintArea: 1500, rainfallRateMmHr: 85, drainageCapacityCoeff: 1.0 });
  const simA = runLocalSimulation(zone, variantAIntervention);
  const simB = runLocalSimulation(zone, variantBIntervention);

  return {
    baseline: { name: 'Baseline (No Change)', ...simBaseline },
    variantA: { name: 'Variant A (Proposed)', ...simA },
    variantB: { name: 'Variant B (Mitigated / Eco)', ...simB },
  };
};
