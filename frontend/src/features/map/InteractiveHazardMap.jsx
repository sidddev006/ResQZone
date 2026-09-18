import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { Layers, Eye, EyeOff, Info, Shield, AlertTriangle, Building, Navigation, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

// Center of Joshimath Chamoli Study Region
const DEFAULT_CENTER = [30.556, 79.566];
const DEFAULT_ZOOM = 12;

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
      case 'CRITICAL': return '#dc2626';
      case 'WARNING': return '#ea580c';
      case 'WATCH': return '#d97706';
      default: return '#16a34a';
    }
  };

  const filteredHazards = hazards.filter(h => {
    if (filterHazardType === 'ALL') return true;
    return h.properties.hazard_type === filterHazardType;
  });

  return (
    <div className="space-y-4 pb-12 max-w-7xl mx-auto">
      {/* Map Control Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Multi-Hazard GIS Spatial Explorer</h2>
            <p className="text-xs text-stone-500">Chamoli District Topography, Red Zones & Relief Corridors</p>
          </div>
        </div>

        {/* Filter & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterHazardType}
            onChange={(e) => setFilterHazardType(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400 shadow-xs"
          >
            <option value="ALL">All Hazard Layers</option>
            <option value="LANDSLIDE">Landslides (Subsidence)</option>
            <option value="FLOOD">Flash Floods (Alaknanda)</option>
            <option value="EARTHQUAKE_EXPOSURE">Seismic Exposure (MCT)</option>
          </select>

          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
              showHazards ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {showHazards ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Hazards</span>
          </button>

          <button
            onClick={() => setShowHabitations(!showHabitations)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
              showHabitations ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {showHabitations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Habitations</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
              showShelters ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {showShelters ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
              showRoads ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {showRoads ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Roads</span>
          </button>
        </div>
      </div>

      {/* Map Body & Side Legend Container */}
      <div className="relative rounded-xl overflow-hidden border border-stone-200/80 shadow-card h-[640px] bg-stone-100">
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-stone-700 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-500" />
              <span>Rendering Spatial GIS Layers...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* CartoDB Voyager / Light basemap tile for clean elegant map aesthetics */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                  color: isBlocked ? '#dc2626' : (risk > 0.6 ? '#d97706' : '#2563eb'),
                  weight: isBlocked ? 3.5 : 2.5,
                  dashArray: isBlocked ? '6, 6' : undefined,
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-stone-900">{r.properties.name}</div>
                    <div className="text-stone-500 text-[11px]">Class: {r.properties.road_class}</div>
                    <div className="text-stone-600 text-[11px]">Length: {r.properties.distance_km} km ({r.properties.base_travel_time_min} min)</div>
                    <div className="text-stone-600 text-[11px]">Hazard Exposure: {(risk * 100).toFixed(0)}%</div>
                    {isBlocked && (
                      <div className="font-semibold text-rose-600 pt-1 border-t border-stone-100 text-[11px]">
                        BLOCKED: {r.properties.blocked_reason || 'Debris Hazard'}
                      </div>
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
                  fillColor: h.properties.color || '#dc2626',
                  fillOpacity: 0.25,
                  color: h.properties.color || '#b91c1c',
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-stone-900">{h.properties.name}</div>
                    <div className="text-stone-600 text-[11px]">Type: {h.properties.hazard_type} ({h.properties.severity})</div>
                    <div className="text-stone-500 text-[11px]">Risk Score: {h.properties.risk_score} (Confidence: {(h.properties.confidence_score*100).toFixed(0)}%)</div>
                    <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-100 leading-relaxed">{h.properties.warning_message}</div>
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
              radius={hab.risk_category === 'CRITICAL' ? 7 : 5.5}
              pathOptions={{
                fillColor: getHabitationColor(hab.risk_category),
                fillOpacity: 0.9,
                color: '#ffffff',
                weight: 1.5
              }}
            >
              <Popup>
                <div className="space-y-2 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{hab.name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: getHabitationColor(hab.risk_category) }}
                    >
                      {hab.risk_category}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-stone-600 text-[11px]">
                    <div>Total Population: <span className="font-medium text-stone-900">{hab.total_population}</span></div>
                    <div>High-Need Cohort: <span className="font-medium text-amber-800">{hab.vulnerable_population}</span></div>
                    <div>Slope: <span className="font-mono">{hab.slope_degrees}°</span></div>
                    <div>Hazard Score: <span className="font-mono font-medium">{hab.hazard_score.toFixed(2)}</span></div>
                  </div>
                  <button
                    onClick={() => onInspectHabitation(hab)}
                    className="w-full py-1 rounded bg-stone-900 hover:bg-stone-800 text-white font-medium text-[11px] transition-colors"
                  >
                    View Evidence & Drivers →
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
              radius={6.5}
              pathOptions={{
                fillColor: '#16a34a',
                fillOpacity: 0.9,
                color: '#ffffff',
                weight: 1.5
              }}
            >
              <Popup>
                <div className="space-y-1.5 text-xs min-w-[210px]">
                  <div className="font-semibold text-stone-900">{sh.name}</div>
                  <div className="text-stone-500 text-[11px]">Facility: {sh.shelter_type}</div>
                  <div className="space-y-0.5 text-[11px] text-stone-600">
                    <div>Effective Safe Capacity: <span className="font-semibold text-stone-900">{sh.effective_safe_capacity}</span></div>
                    <div>Current Occupancy: <span>{sh.current_occupancy}</span></div>
                    <div>Available Spots: <span className="font-medium text-emerald-700">{sh.available_safe_capacity}</span></div>
                  </div>
                  <div className="p-1 rounded bg-stone-50 border border-stone-200 text-[10px] text-stone-700">
                    <strong>Bottleneck:</strong> {sh.bottleneck_resource.toUpperCase()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Minimal Map Legend */}
        <div className="absolute bottom-4 right-4 z-20 p-3 rounded-lg bg-white/95 backdrop-blur border border-stone-200/90 text-xs space-y-1.5 shadow-card">
          <span className="font-semibold text-stone-800 block text-[11px] uppercase tracking-wider">Map Legend</span>
          <div className="space-y-1 text-[11px] text-stone-600">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Critical Red Zone</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span>Warning Sector</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Relief Shelter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 bg-red-600 border-dashed"></span>
              <span>Blocked Evacuation Route</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-0.5 bg-blue-600"></span>
              <span>Clear Highway Corridor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
