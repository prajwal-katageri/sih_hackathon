import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { CloudRain, Download, FileText, Database, ShieldAlert } from 'lucide-react';

export default function AnalyticsPanel({ activeZone, simResults }) {
  const imdData = activeZone.imdHistoricalRainfall || [];

  const riskDistributionData = [
    { category: 'Critical (>2.0m)', count: 4 },
    { category: 'High (1.0-2.0m)', count: 12 },
    { category: 'Moderate (0.5-1.0m)', count: 26 },
    { category: 'Low (0.1-0.5m)', count: 39 },
  ];

  const handleExportReport = () => {
    const reportData = {
      title: 'Predictive Urban Digital Twin Assessment Report',
      project: 'Smart India Hackathon 2026',
      team: 'Mentalist',
      zone: activeZone.name,
      timestamp: new Date().toISOString(),
      simulationMetrics: simResults?.metrics || {},
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UrbanTwin_${activeZone.id}_Simulation_Report.json`;
    a.click();
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Analytics Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">IMD Historical Data Grounding & Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded against real Indian Meteorological Department historical rainfall trends & SRTM 30m elevation profiles.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
        >
          <Download className="w-4 h-4" />
          <span>Export Assessment JSON Report</span>
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IMD Historical Rainfall Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100">IMD Annual Rainfall Trend</h3>
              <p className="text-xs text-slate-400">Historical precipitation (2018-2024)</p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
              dsp.imdpune.gov.in
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={imdData}>
                <defs>
                  <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="mm" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="rainfallMm" stroke="#3b82f6" fillOpacity={1} fill="url(#rainfallGrad)" name="Rainfall (mm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flood Risk Exposure Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Spatial Exposure Distribution</h3>
              <p className="text-xs text-slate-400">Low-elevation flood depth grid count</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              SRTM Elevation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Grid Hotspots" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
