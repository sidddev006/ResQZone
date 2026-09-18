import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { Layers, Eye, EyeOff, Info, Shield, AlertTriangle, Building, Navigation, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

// Center of Joshimath Chamoli Study Region
const DEFAULT_CENTER = [30.556, 79.566];
const DEFAULT_ZOOM = 12;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function InteractiveHazardMap({ onInspectHabitation }) {
  const [hazards, setHazards] = useState([]);
  const [habitations, setHabitations] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layer visibility toggles
  const [showHazards, setShowHazards] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  // Filter
  const [filterHazardType, setFilterHazardType] = useState('ALL');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [hazData, habData, shData, roadData] = await Promise.all([
        api.getHazardZones(),
        api.getHabitations(),
        api.getSheltersCapacity(),
        api.getRoadNetwork()
      ]);
      setHazards(hazData.features || []);
      setHabitations(habData || []);
      setShelters(shData || []);
      setRoads(roadData.features || []);
    } catch (err) {
      console.error("Map layer load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHabitationColor = (cat) => {
    switch (cat) {
      case 'CRITICAL': return '#EF4444';
      case 'WARNING': return '#F97316';
      case 'WATCH': return '#EAB308';
      default: return '#10B981';
    }
  };

  const filteredHazards = hazards.filter(h => {
    if (filterHazardType === 'ALL') return true;
    return h.properties.hazard_type === filterHazardType;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Map Control Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Interactive Multi-Hazard GIS Red Zones</h2>
            <p className="text-xs text-slate-400">Chamoli District Topographic & Infrastructure Layer</p>
          </div>
        </div>

        {/* Filter & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterHazardType}
            onChange={(e) => setFilterHazardType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Hazard Layers</option>
            <option value="LANDSLIDE">Landslides (Subsidence)</option>
            <option value="FLOOD">Flash Floods (Alaknanda)</option>
            <option value="EARTHQUAKE_EXPOSURE">Seismic Exposure (MCT)</option>
          </select>

          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-colors ${
              showHazards ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showHazards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Hazards</span>
          </button>

          <button
            onClick={() => setShowHabitations(!showHabitations)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-colors ${
              showHabitations ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showHabitations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Habitations</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-colors ${
              showShelters ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showShelters ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-colors ${
              showRoads ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showRoads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Roads</span>
          </button>
        </div>
      </div>

      {/* Map Body & Side Legend Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[650px]">
        {loading && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-emerald-400 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading PostGIS Spatial Layers...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* CartoDB Dark Matter base tile */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* 1. Road Network Segments */}
          {showRoads && roads.map((r, i) => {
            const coords = r.geometry.coordinates.map(c => [c[1], c[0]]);
            const isBlocked = r.properties.is_blocked;
            const risk = r.properties.hazard_exposure_score;
            return (
              <Polyline
                key={`road-${i}`}
                positions={coords}
                pathOptions={{
                  color: isBlocked ? '#EF4444' : (risk > 0.6 ? '#F59E0B' : '#3B82F6'),
                  weight: isBlocked ? 4 : 2.5,
                  dashArray: isBlocked ? '8, 8' : undefined,
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="font-bold text-slate-100">{r.properties.name}</div>
                    <div className="text-slate-400">Class: {r.properties.road_class}</div>
                    <div className="text-slate-400">Distance: {r.properties.distance_km} km ({r.properties.base_travel_time_min} min)</div>
                    <div className="text-slate-400">Hazard Exposure: {(risk * 100).toFixed(0)}%</div>
                    {isBlocked && (
                      <div className="font-bold text-red-400">ROAD BLOCKED: {r.properties.blocked_reason || 'Slope Failure'}</div>
                    )}
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* 2. Multi-Hazard Polygons */}
          {showHazards && filteredHazards.map((h, i) => {
            const coords = h.geometry.coordinates[0].map(c => [c[1], c[0]]);
            return (
              <Polygon
                key={`hazard-${i}`}
                positions={coords}
                pathOptions={{
                  fillColor: h.properties.color || '#EF4444',
                  fillOpacity: 0.35,
                  color: h.properties.color || '#B91C1C',
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="font-bold text-red-400">{h.properties.name}</div>
                    <div className="text-slate-300">Type: {h.properties.hazard_type} ({h.properties.severity})</div>
                    <div className="text-slate-400">Area: {h.properties.area_sqkm} sq km</div>
                    <div className="text-slate-400">Risk Score: {h.properties.risk_score} (Confidence: {(h.properties.confidence_score*100).toFixed(0)}%)</div>
                    <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-700">{h.properties.warning_message}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* 3. Habitation Points */}
          {showHabitations && habitations.map((hab) => (
            <CircleMarker
              key={`hab-${hab.id}`}
              center={[hab.latitude, hab.longitude]}
              radius={hab.risk_category === 'CRITICAL' ? 8 : 6}
              pathOptions={{
                fillColor: getHabitationColor(hab.risk_category),
                fillOpacity: 0.9,
                color: '#ffffff',
                weight: 1.5
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{hab.name}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: getHabitationColor(hab.risk_category) }}
                    >
                      {hab.risk_category}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-slate-300">
                    <div>Population: <span className="font-semibold text-white">{hab.total_population}</span></div>
                    <div>Vulnerable Cohort: <span className="font-semibold text-amber-400">{hab.vulnerable_population}</span></div>
                    <div>Slope: <span className="font-mono">{hab.slope_degrees}°</span></div>
                    <div>Hazard Score: <span className="font-mono">{hab.hazard_score.toFixed(2)}</span></div>
                  </div>
                  <button
                    onClick={() => onInspectHabitation(hab)}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors"
                  >
                    View Risk Evidence & Drivers →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* 4. Relief Shelters */}
          {showShelters && shelters.map((sh) => (
            <CircleMarker
              key={`sh-${sh.shelter_id}`}
              center={[sh.latitude, sh.longitude]}
              radius={7}
              pathOptions={{
                fillColor: '#10B981',
                fillOpacity: 0.9,
                color: '#064e3b',
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-xs min-w-[220px]">
                  <div className="font-bold text-emerald-400 text-sm">{sh.name}</div>
                  <div className="text-slate-300">Type: {sh.shelter_type}</div>
                  <div className="space-y-0.5">
                    <div>Effective Safe Capacity: <span className="font-bold text-white">{sh.effective_safe_capacity}</span></div>
                    <div>Current Occupancy: <span className="font-semibold text-slate-200">{sh.current_occupancy}</span></div>
                    <div>Available Safe Spots: <span className="font-bold text-emerald-400">{sh.available_safe_capacity}</span></div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 text-[11px] text-amber-300 border border-amber-500/20">
                    <strong>Bottleneck:</strong> {sh.bottleneck_resource.toUpperCase()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-20 p-3 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-800 text-xs space-y-2 shadow-xl">
          <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">GIS Map Legend</span>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Critical Red Zone (Evacuate)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>Warning Sector (Standby)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Safe Relief Shelter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 bg-red-500 border-dashed"></span>
              <span>Blocked Evacuation Route</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 bg-blue-500"></span>
              <span>Clear Highway / Transit Corridor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
