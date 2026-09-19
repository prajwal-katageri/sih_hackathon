import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MousePointer, Square, Circle, Trash2, Plus, Minus } from 'lucide-react';

export default function MapContainer({ activeZone, simResults, layers, onDrawnAreaChange }) {
  const mapRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const userDrawMarkersRef = useRef([]);

  const [activeTool, setActiveTool] = useState('polygon'); // 'pointer' | 'rect' | 'polygon'
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(activeZone.areaKm2);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: activeZone.center,
        zoom: activeZone.zoom,
        zoomControl: false,
      });

      leafletInstanceRef.current = map;
    }

    const map = leafletInstanceRef.current;
    map.setView(activeZone.center, activeZone.zoom);

    // Remove existing tile layers
    map.eachLayer((l) => {
      if (l instanceof L.TileLayer) map.removeLayer(l);
    });

    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap';

    if (layers?.satellite) {
      tileUrl = `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}${googleApiKey ? `&key=${googleApiKey}` : ''}`;
      attribution = '&copy; Google Maps Satellite';
    } else {
      tileUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${googleApiKey ? `&key=${googleApiKey}` : ''}`;
      attribution = '&copy; Google Maps Roadmap';
    }

    L.tileLayer(tileUrl, { maxZoom: 20, attribution }).addTo(map);

    // Reset default zone polygon if user hasn't drawn a custom polygon yet
    if (drawnPoints.length === 0) {
      const cLat = activeZone.center[0];
      const cLng = activeZone.center[1];
      const defaultPoly = [
        [cLat + 0.003, cLng - 0.003],
        [cLat + 0.004, cLng + 0.002],
        [cLat + 0.001, cLng + 0.005],
        [cLat - 0.003, cLng + 0.003],
        [cLat - 0.002, cLng - 0.004],
      ];
      renderPolygon(map, defaultPoly);
      setCalculatedArea(activeZone.areaKm2);
    }
  }, [activeZone, layers]);

  // Click handler to draw custom polygon points on map
  useEffect(() => {
    const map = leafletInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (activeTool !== 'polygon' && activeTool !== 'rect') return;

      const newPoint = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => {
        const next = [...prev, newPoint];
        if (next.length >= 3) {
          renderPolygon(map, next);
          // Simple polygon area estimation in km2
          const approxArea = Number((next.length * 0.084).toFixed(2));
          setCalculatedArea(approxArea);
          if (onDrawnAreaChange) onDrawnAreaChange(approxArea);
        }
        return next;
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [activeTool, onDrawnAreaChange]);

  const renderPolygon = (map, points) => {
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    userDrawMarkersRef.current.forEach((m) => map.removeLayer(m));
    userDrawMarkersRef.current = [];

    const poly = L.polygon(points, {
      color: '#2563eb',
      weight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.35,
    }).addTo(map);

    points.forEach((coord) => {
      const marker = L.circleMarker(coord, {
        radius: 4,
        fillColor: '#ffffff',
        color: '#2563eb',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      userDrawMarkersRef.current.push(marker);
    });

    polygonLayerRef.current = poly;
  };

  const handleClearDrawings = () => {
    const map = leafletInstanceRef.current;
    if (!map) return;
    setDrawnPoints([]);
    setCalculatedArea(activeZone.areaKm2);
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    userDrawMarkersRef.current.forEach((m) => map.removeLayer(m));
    userDrawMarkersRef.current = [];
  };

  const handleZoomIn = () => leafletInstanceRef.current?.zoomIn();
  const handleZoomOut = () => leafletInstanceRef.current?.zoomOut();

  return (
    <div className="relative flex-1 h-full w-full bg-slate-900 overflow-hidden">
      {/* Leaflet Mount Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Top Left Drawing Toolbar */}
      <div className="absolute top-4 left-4 z-20 bg-white shadow-lg rounded-lg p-1 flex flex-col space-y-1 border border-slate-200">
        <button
          onClick={() => setActiveTool('pointer')}
          className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'pointer' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-700'}`}
          title="Select / Inspect Tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('rect')}
          className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'rect' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-700'}`}
          title="Draw Box Area"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('polygon')}
          className={`p-2 rounded hover:bg-slate-100 ${activeTool === 'polygon' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-700'}`}
          title="Click Map to Draw Custom Area"
        >
          <Circle className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-200 my-1" />
        <button
          onClick={handleClearDrawings}
          className="p-2 rounded hover:bg-slate-100 text-slate-700 hover:text-red-600"
          title="Clear Drawn Polygon"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 bg-white shadow-lg rounded-lg p-1 flex flex-col space-y-1 border border-slate-200">
        <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-slate-100 text-slate-700">
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-200" />
        <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-slate-100 text-slate-700">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Center Tooltip: Selected Area */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white border border-slate-700 px-4 py-2 rounded-xl shadow-xl text-xs backdrop-blur text-center">
        <span className="font-semibold block text-slate-300 text-[11px]">Selected Area</span>
        <span className="font-bold text-sm text-slate-100">Area: {calculatedArea} km²</span>
      </div>

      {/* Bottom Right Elevation Gradient Box */}
      <div className="absolute bottom-6 right-4 z-20 bg-white/95 text-slate-800 border border-slate-200 p-2.5 rounded-lg shadow-lg text-xs space-y-1 backdrop-blur">
        <span className="font-bold text-[11px] block">Elevation (m)</span>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-12 bg-gradient-to-t from-emerald-600 via-yellow-400 to-rose-500 rounded-sm"></div>
          <div className="flex flex-col justify-between h-12 text-[10px] font-semibold text-slate-600">
            <span>920</span>
            <span>860</span>
          </div>
        </div>
      </div>

      {/* Bottom Left Scale Bar & Active Tool Indicator */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2">
        <div className="bg-white/95 text-slate-800 border border-slate-300 px-3 py-1 rounded text-[10px] font-bold shadow-md">
          200 m
        </div>
        <div className="bg-slate-900/90 text-blue-400 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono shadow-md">
          Tool: {activeTool === 'polygon' ? 'Click Map to Add Polygon Nodes' : activeTool}
        </div>
      </div>
    </div>
  );
}
