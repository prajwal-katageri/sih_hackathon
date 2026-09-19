import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  X, 
  Play, 
  ChevronDown, 
  SlidersHorizontal,
  Box
} from 'lucide-react';
import { BUILDING_MATERIALS } from '../data/mockData';

const SAMPLE_MODELS = [
  { name: 'commercial_highrise.obj', size: '3.2 MB', path: '/models/commercial_highrise.obj' },
  { name: 'residential_block.obj', size: '2.4 MB', path: '/models/residential_block.obj' },
  { name: 'drainage_culvert_upgrade.obj', size: '1.8 MB', path: '/models/drainage_culvert_upgrade.obj' },
  { name: 'elevated_flyover_road.obj', size: '4.1 MB', path: '/models/elevated_flyover_road.obj' },
];

export default function SimulationSetupSidebar({
  intervention,
  setIntervention,
  onRunSimulation,
  isSimulating
}) {
  const [uploadedFile, setUploadedFile] = useState(SAMPLE_MODELS[1]); // Default to residential_block.obj

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setUploadedFile({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        path: ''
      });
    }
  };

  const handleSelectSampleModel = (modelName) => {
    const found = SAMPLE_MODELS.find(m => m.name === modelName);
    if (found) setUploadedFile(found);
  };

  return (
    <aside className="w-80 bg-[#111827] border-l border-slate-800 flex flex-col h-full overflow-y-auto shrink-0 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <SlidersHorizontal className="w-4 h-4 text-blue-400" />
        <h2 className="font-bold text-sm text-slate-100">Simulation Setup</h2>
      </div>

      {/* Step 1: Choose Intervention */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">1</span>
          <span>Choose Intervention</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setIntervention({ ...intervention, type: 'road' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              intervention.type === 'road'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Road
          </button>

          <button
            onClick={() => setIntervention({ ...intervention, type: 'building' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              intervention.type === 'building'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Building
          </button>

          <button
            onClick={() => setIntervention({ ...intervention, type: 'drainage' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              intervention.type === 'drainage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Drainage
          </button>
        </div>
      </div>

      {/* Step 2: Upload or Select 3D Building Design */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Upload Building Design</span>
          </span>
          <span className="text-[10px] text-blue-400 font-mono">4 CAD Presets</span>
        </label>

        {/* Predefined 3D Model Preset Selector */}
        <div className="relative">
          <select
            value={uploadedFile?.name || ''}
            onChange={(e) => handleSelectSampleModel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none appearance-none cursor-pointer"
          >
            {SAMPLE_MODELS.map(m => (
              <option key={m.name} value={m.name}>
                Preset: {m.name} ({m.size})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
        </div>

        {/* Drag & Drop Upload Box */}
        <div className="border border-dashed border-slate-700/80 hover:border-slate-600 rounded-xl p-3 text-center bg-slate-900/50 transition">
          <input
            type="file"
            accept=".ifc,.obj,.glb,.gltf"
            onChange={handleFileChange}
            className="hidden"
            id="sidebar-file-upload"
          />
          <label htmlFor="sidebar-file-upload" className="cursor-pointer space-y-1 block">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300">
              Drag & drop custom 3D model (IFC/OBJ) <br />
              <span className="text-slate-500">or</span>
            </p>
            <span className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium px-3 py-1 rounded-lg border border-slate-700">
              Choose File
            </span>
          </label>
        </div>

        {/* Selected File Card */}
        {uploadedFile && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-blue-950 border border-blue-800/80 rounded flex items-center justify-center text-blue-400">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200 leading-tight">{uploadedFile.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{uploadedFile.size}</p>
              </div>
            </div>
            <button 
              onClick={() => setUploadedFile(null)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Material & Parameters */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">3</span>
          <span>Material & Parameters</span>
        </label>

        <div className="space-y-2.5 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 block text-[11px]">Building Material</label>
            <div className="relative">
              <select
                value={intervention.materialId}
                onChange={(e) => setIntervention({ ...intervention, materialId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {BUILDING_MATERIALS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 block text-[11px]">Floors</label>
              <input
                type="number"
                min="1"
                max="50"
                value={intervention.floors}
                onChange={(e) => setIntervention({ ...intervention, floors: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block text-[11px]">Footprint Area (m²)</label>
              <input
                type="number"
                min="100"
                max="10000"
                value={intervention.footprintArea}
                onChange={(e) => setIntervention({ ...intervention, footprintArea: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Weather Data */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-bold">4</span>
          <span>Weather Data</span>
        </label>

        <div className="space-y-2 text-xs">
          <div className="relative">
            <select className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 appearance-none focus:outline-none cursor-pointer">
              <option>Use Historical Data (IMD)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 appearance-none focus:outline-none cursor-pointer">
              <option>Bengaluru (2015 - 2024)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Run Simulation CTA Button */}
      <div className="pt-2">
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          {isSimulating ? (
            <span>Running Simulation...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Simulation</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
