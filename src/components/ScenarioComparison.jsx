import React, { useState } from 'react';
import { GitCompare, CheckCircle2, ShieldAlert, ArrowRight, Sparkles, Building, Waves } from 'lucide-react';
import { generateScenarioComparison } from '../services/simulationEngine';
import { BUILDING_MATERIALS } from '../data/mockData';

export default function ScenarioComparison({ activeZone, intervention }) {
  const [comparisonData, setComparisonData] = useState(() => {
    // Generate comparison between 3 design variants
    return generateScenarioComparison(
      activeZone,
      { ...intervention, materialId: 'concrete', footprintArea: 1800, floors: 14 },
      { ...intervention, materialId: 'permeable', footprintArea: 1400, floors: 10, drainageCapacityCoeff: 1.6 }
    );
  });

  const { baseline, variantA, variantB } = comparisonData;

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Pre-Construction Scenario Comparison</h2>
            <span className="bg-emerald-950 border border-emerald-700/50 text-emerald-400 text-xs px-2 py-0.5 rounded font-mono">
              SIH Core Feature
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare 2-3 infrastructure design variants side-by-side for <span className="text-slate-200 font-semibold">{activeZone.name}</span> before pouring concrete.
          </p>
        </div>

        <button
          onClick={() => {
            setComparisonData(
              generateScenarioComparison(
                activeZone,
                { ...intervention, materialId: 'asphalt', footprintArea: 2000, floors: 16 },
                { ...intervention, materialId: 'permeable', footprintArea: 1200, floors: 8, drainageCapacityCoeff: 1.8 }
              )
            );
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Recalculate Variants</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Baseline Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Existing Status</span>
              <h3 className="font-bold text-slate-100">{baseline.name}</h3>
            </div>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Control
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Max Flood Water Depth</span>
              <span className="text-xl font-extrabold text-red-400">{baseline.metrics.estMaxWaterDepthM} m</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Submerged Urban Area</span>
              <span className="text-xl font-extrabold text-amber-400">{baseline.metrics.affectedAreaKm2} km²</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Buildings Exposed to Risk</span>
              <span className="text-xl font-extrabold text-yellow-400">{baseline.metrics.buildingsAtRiskCount}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Evacuation Time</span>
              <span className="text-lg font-bold text-slate-200">{baseline.metrics.totalEvacuationTimeMin} mins</span>
            </div>
          </div>
        </div>

        {/* Variant A Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400 block">Proposal 1</span>
              <h3 className="font-bold text-slate-100">{variantA.name}</h3>
            </div>
            <span className="bg-blue-950 border border-blue-700 text-blue-300 text-xs px-2.5 py-1 rounded-full font-medium">
              Dense Design
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Max Flood Water Depth</span>
                <span className="text-xl font-extrabold text-rose-400">{variantA.metrics.estMaxWaterDepthM} m</span>
              </div>
              <span className="text-xs text-rose-400 font-bold bg-rose-950 px-2 py-1 rounded">
                +{(variantA.metrics.estMaxWaterDepthM - baseline.metrics.estMaxWaterDepthM).toFixed(2)}m
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Submerged Urban Area</span>
                <span className="text-xl font-extrabold text-orange-400">{variantA.metrics.affectedAreaKm2} km²</span>
              </div>
              <span className="text-xs text-orange-400 font-bold bg-orange-950 px-2 py-1 rounded">
                +{(variantA.metrics.affectedAreaKm2 - baseline.metrics.affectedAreaKm2).toFixed(2)}km²
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Buildings Exposed to Risk</span>
              <span className="text-xl font-extrabold text-yellow-400">{variantA.metrics.buildingsAtRiskCount}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Evacuation Time</span>
              <span className="text-lg font-bold text-slate-200">{variantA.metrics.totalEvacuationTimeMin} mins</span>
            </div>
          </div>
        </div>

        {/* Variant B Card (Recommended Eco Mitigation) */}
        <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-xl p-5 space-y-4 relative overflow-hidden shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Recommended Proposal</span>
              </span>
              <h3 className="font-bold text-slate-100">{variantB.name}</h3>
            </div>
            <span className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold">
              Optimal Safe
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Max Flood Water Depth</span>
                <span className="text-xl font-extrabold text-emerald-400">{variantB.metrics.estMaxWaterDepthM} m</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-700 px-2 py-1 rounded">
                -{(baseline.metrics.estMaxWaterDepthM - variantB.metrics.estMaxWaterDepthM).toFixed(2)}m
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Submerged Urban Area</span>
                <span className="text-xl font-extrabold text-emerald-400">{variantB.metrics.affectedAreaKm2} km²</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-700 px-2 py-1 rounded">
                -{(baseline.metrics.affectedAreaKm2 - variantB.metrics.affectedAreaKm2).toFixed(2)}km²
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Buildings Exposed to Risk</span>
              <span className="text-xl font-extrabold text-emerald-400">{variantB.metrics.buildingsAtRiskCount}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs text-slate-400 block">Evacuation Time</span>
              <span className="text-lg font-bold text-emerald-300">{variantB.metrics.totalEvacuationTimeMin} mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
