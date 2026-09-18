import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import { 
  Layers, Eye, EyeOff, Shield, AlertTriangle, Building, Navigation, 
  RefreshCw, Crosshair, Compass, Mountain, Maximize2, Minimize2, 
  Route, CheckCircle2, ChevronRight, X, Activity, Radio
} from 'lucide-react';
import { api } from '../../api/client';

// Center of Chamoli-Joshimath Study Region
const DEFAULT_CENTER = [30.556, 79.566];
const DEFAULT_ZOOM = 12;
const CHAMOLI_BOUNDS = [
  [30.41, 79.40],
  [30.68, 79.75]
];

// Basemap Tile Providers
const BASEMAPS = {
  tactical_dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
  },
  topo: {
    name: 'Topographic Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenTopoMap (CC-BY-SA)'
  },
  voyager: {
    name: 'Voyager Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO'
  }
};

// Map Controller for bulletproof resize handling, cursor telemetry, and programmatic flyTo
function TacticalMapController({ selectedTarget, fitSignal, onCursorMove }) {
  const map = useMap();

  // Invalidate size immediately, at 150ms, at 500ms and on window resize
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Handle fit bounds
  useEffect(() => {
    if (fitSignal) {
      map.fitBounds(CHAMOLI_BOUNDS, { padding: [30, 30], maxZoom: 13 });
    }
  }, [fitSignal, map]);

  // Fly to selected target
  useEffect(() => {
    if (selectedTarget && selectedTarget.lat && selectedTarget.lng) {
      map.flyTo([selectedTarget.lat, selectedTarget.lng], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedTarget, map]);

  // Track cursor coordinates
  useMapEvents({
    mousemove(e) {
      if (onCursorMove) {
        onCursorMove({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });

  return null;
}

export default function InteractiveHazardMap({ onInspectHabitation }) {
  const [hazards, setHazards] = useState([]);
  const [habitations, setHabitations] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Basemap
  const [currentBasemap, setCurrentBasemap] = useState('tactical_dark');

  // Layer toggles
  const [showHazards, setShowHazards] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [filterHazardType, setFilterHazardType] = useState('ALL');

  // Selection & Inspector state
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [cursorPos, setCursorPos] = useState({ lat: 30.556, lng: 79.566 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tactical Route Planner overlay
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeObjective, setRouteObjective] = useState('BALANCED');
  const [activeRoutePath, setActiveRoutePath] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

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

      if (habData && habData.length > 0) {
        setRouteOrigin(habData[0].id.toString());
      }
      if (shData && shData.length > 0) {
        setRouteDest(shData[0].shelter_id.toString());
      }
    } catch (err) {
      console.error("Tactical GIS layer load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!routeOrigin || !routeDest) return;
    try {
      setRoutingLoading(true);
      const res = await api.calculateRoute({
        origin_habitation_id: parseInt(routeOrigin),
        dest_shelter_id: parseInt(routeDest),
        objective: routeObjective
      });
      setActiveRoutePath(res);
      // Center route on map
      if (res && res.waypoints && res.waypoints.length > 0) {
        const first = res.waypoints[0];
        setSelectedEntity({
          type: 'route',
          lat: first.lat,
          lng: first.lng,
          data: res
        });
      }
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setRoutingLoading(false);
    }
  };

  const getHabitationColor = (cat) => {
    switch (cat) {
      case 'CRITICAL': return '#F43F5E';
      case 'WARNING': return '#F59E0B';
      case 'WATCH': return '#38BDF8';
      default: return '#10B981';
    }
  };

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      if (filterHazardType === 'ALL') return true;
      return h.properties.hazard_type === filterHazardType;
    });
  }, [hazards, filterHazardType]);

  const targetCoords = useMemo(() => {
    if (!selectedEntity) return null;
    return { lat: selectedEntity.lat, lng: selectedEntity.lng };
  }, [selectedEntity]);

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-[#07090E]' : 'h-[calc(100vh-8.5rem)] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#07090E]'}`}>
      
      {/* 1. TOP TACTICAL GIS HUD TOOLBAR */}
      <div className="z-20 px-4 py-2.5 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* District & Region Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-semibold tracking-wider">CHAMOLI TACTICAL GIS</span>
          </div>

          {/* Basemap Selector */}
          <div className="flex items-center bg-[#131A2B] rounded-lg p-0.5 border border-white/10">
            {Object.entries(BASEMAPS).map(([key, bmp]) => (
              <button
                key={key}
                onClick={() => setCurrentBasemap(key)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  currentBasemap === key 
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-glow-cyan' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {bmp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Switches & Route Tools */}
        <div className="flex items-center space-x-2">
          {/* Hazard Filter */}
          <select
            value={filterHazardType}
            onChange={(e) => setFilterHazardType(e.target.value)}
            className="bg-[#131A2B] border border-white/10 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">All Red Zones</option>
            <option value="LANDSLIDE">Subsidence & Landslides</option>
            <option value="FLOOD">Flash Flood Buffers</option>
            <option value="EARTHQUAKE_EXPOSURE">MCT Fault Exposure</option>
          </select>

          {/* Layer Pills */}
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
              showHazards 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30' 
                : 'bg-[#131A2B] text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showHazards ? 'bg-rose-400' : 'bg-slate-600'}`}></span>
            <span>Zones ({hazards.length})</span>
          </button>

          <button
            onClick={() => setShowHabitations(!showHabitations)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
              showHabitations 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-[#131A2B] text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showHabitations ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
            <span>Habitations ({habitations.length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
              showShelters 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald/30' 
                : 'bg-[#131A2B] text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showShelters ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            <span>Shelters ({shelters.length})</span>
          </button>

          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center space-x-1.5 transition-all ${
              showRoads 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                : 'bg-[#131A2B] text-slate-500 border-white/5 hover:border-white/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showRoads ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
            <span>Roads ({roads.length})</span>
          </button>

          {/* Route Drawer Toggle */}
          <button
            onClick={() => setShowRoutePanel(!showRoutePanel)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all ${
              showRoutePanel 
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan' 
                : 'bg-[#131A2B] text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Tactical Corridors</span>
          </button>

          {/* Reset Basin Bounds */}
          <button
            onClick={() => setFitTrigger(prev => prev + 1)}
            title="Reset to Full Chamoli Basin View"
            className="p-1.5 rounded-lg bg-[#131A2B] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen GIS"
            className="p-1.5 rounded-lg bg-[#131A2B] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN MAP CONTAINER WITH LEAFLET ENGINE */}
      <div className="relative flex-1 w-full h-full min-h-0">
        {loading && (
          <div className="absolute inset-0 z-30 bg-[#07090E]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-cyan-500/30 shadow-glow-cyan flex items-center space-x-3 text-cyan-300 font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>SYNCHRONIZING TOPOGRAPHIC GIS TELEMETRY...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#07090E' }}
        >
          {/* Active Basemap Layer */}
          <TileLayer
            key={currentBasemap}
            attribution={BASEMAPS[currentBasemap].attribution}
            url={BASEMAPS[currentBasemap].url}
            maxZoom={18}
          />

          {/* Robust Controller: Handles invalidateSize, flyTo, cursor, and bounds */}
          <TacticalMapController
            selectedTarget={targetCoords}
            fitSignal={fitTrigger}
            onCursorMove={setCursorPos}
          />

          {/* A. ROAD NETWORK POLYLINES */}
          {showRoads && roads.map((r, i) => {
            const coords = r.geometry.coordinates.map(c => [c[1], c[0]]);
            const isBlocked = r.properties.is_blocked;
            const risk = r.properties.hazard_exposure_score;
            return (
              <Polyline
                key={`road-${i}`}
                positions={coords}
                pathOptions={{
                  color: isBlocked ? '#F43F5E' : (risk > 0.6 ? '#F59E0B' : '#38BDF8'),
                  weight: isBlocked ? 3.5 : 2,
                  dashArray: isBlocked ? '6, 6' : undefined,
                  opacity: isBlocked ? 0.95 : 0.65
                }}
              >
                <Popup>
                  <div className="space-y-1.5 text-xs text-slate-100">
                    <div className="font-semibold text-cyan-300 flex items-center justify-between">
                      <span>{r.properties.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {r.properties.road_class}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Distance: <span className="text-slate-200 font-mono">{r.properties.distance_km} km</span> • 
                      Est Time: <span className="text-slate-200 font-mono">{r.properties.base_travel_time_min} min</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Hazard Exposure Score: <span className="text-amber-400 font-mono">{(risk * 100).toFixed(0)}%</span>
                    </div>
                    {isBlocked && (
                      <div className="p-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold">
                        CRITICAL BLOCKAGE: {r.properties.blocked_reason || 'Debris Hazard'}
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* B. MULTI-HAZARD RED ZONE POLYGONS */}
          {showHazards && filteredHazards.map((h, i) => {
            const coords = h.geometry.coordinates[0].map(c => [c[1], c[0]]);
            const color = h.properties.color || '#F43F5E';
            return (
              <Polygon
                key={`hazard-${i}`}
                positions={coords}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: currentBasemap === 'satellite' ? 0.35 : 0.25,
                  color: color,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              >
                <Popup>
                  <div className="space-y-1.5 text-xs text-slate-100 min-w-[210px]">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <span className="font-bold text-rose-400">{h.properties.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                        {h.properties.severity}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {h.properties.warning_message}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                      <span>RISK: <strong className="text-rose-400">{h.properties.risk_score}</strong></span>
                      <span>CONFIDENCE: <strong className="text-cyan-400">{(h.properties.confidence_score * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* C. ACTIVE TACTICAL ROUTE (CALCULATED PATH) */}
          {activeRoutePath && activeRoutePath.waypoints && (
            <Polyline
              positions={activeRoutePath.waypoints.map(w => [w.lat, w.lng])}
              pathOptions={{
                color: '#00F0FF',
                weight: 5,
                opacity: 0.95,
                dashArray: '8, 8'
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 text-slate-100">
                  <div className="font-bold text-cyan-300">ACTIVE EVACUATION CORRIDOR</div>
                  <div className="text-[11px] text-slate-400">
                    Mode: <span className="text-white font-mono">{activeRoutePath.objective}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Distance: <span className="text-white font-mono">{activeRoutePath.total_distance_km.toFixed(1)} km</span> • 
                    Time: <span className="text-cyan-400 font-mono">{activeRoutePath.total_time_min.toFixed(0)} min</span>
                  </div>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* D. HABITATIONS (VULNERABLE SETTLEMENTS) */}
          {showHabitations && habitations.map((hab) => {
            const isSelected = selectedEntity && selectedEntity.data && selectedEntity.data.id === hab.id;
            const color = getHabitationColor(hab.risk_category);
            return (
              <CircleMarker
                key={`hab-${hab.id}`}
                center={[hab.latitude, hab.longitude]}
                radius={hab.risk_category === 'CRITICAL' ? 8.5 : 6}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.9,
                  color: isSelected ? '#FFFFFF' : '#0B0F17',
                  weight: isSelected ? 2.5 : 1.5
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({
                      type: 'habitation',
                      lat: hab.latitude,
                      lng: hab.longitude,
                      data: hab
                    });
                  }
                }}
              >
                <Popup>
                  <div className="space-y-2 text-xs text-slate-100 min-w-[220px]">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <span className="font-bold text-white text-sm">{hab.name}</span>
                      <span
                        className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold text-slate-950"
                        style={{ backgroundColor: color }}
                      >
                        {hab.risk_category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                      <div>Population: <strong className="text-white font-mono">{hab.total_population}</strong></div>
                      <div>High-Need: <strong className="text-amber-400 font-mono">{hab.vulnerable_population}</strong></div>
                      <div>Hazard Score: <strong className="text-rose-400 font-mono">{hab.hazard_score.toFixed(2)}</strong></div>
                      <div>Slope: <strong className="text-slate-300 font-mono">{hab.slope_degrees}°</strong></div>
                    </div>
                    <div className="flex items-center space-x-1.5 pt-2">
                      <button
                        onClick={() => {
                          setRouteOrigin(hab.id.toString());
                          setShowRoutePanel(true);
                        }}
                        className="flex-1 py-1 px-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] transition-colors flex items-center justify-center space-x-1"
                      >
                        <Route className="w-3 h-3" />
                        <span>Route Evac</span>
                      </button>
                      <button
                        onClick={() => onInspectHabitation(hab)}
                        className="py-1 px-2 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-[10px] transition-colors"
                      >
                        Audit
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* E. RELIEF SHELTERS */}
          {showShelters && shelters.map((sh) => {
            const isSelected = selectedEntity && selectedEntity.data && selectedEntity.data.shelter_id === sh.shelter_id;
            return (
              <CircleMarker
                key={`sh-${sh.shelter_id}`}
                center={[sh.latitude, sh.longitude]}
                radius={7.5}
                pathOptions={{
                  fillColor: '#10B981',
                  fillOpacity: 0.95,
                  color: isSelected ? '#00F0FF' : '#FFFFFF',
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({
                      type: 'shelter',
                      lat: sh.latitude,
                      lng: sh.longitude,
                      data: sh
                    });
                  }
                }}
              >
                <Popup>
                  <div className="space-y-1.5 text-xs text-slate-100 min-w-[220px]">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <span className="font-bold text-emerald-400">{sh.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {sh.shelter_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div>Safe Effective Capacity: <strong className="text-white font-mono">{sh.effective_safe_capacity}</strong></div>
                      <div>Current Occupancy: <span className="text-slate-400 font-mono">{sh.current_occupancy}</span></div>
                      <div>Available Margin: <strong className="text-emerald-400 font-mono">{sh.available_safe_capacity} beds</strong></div>
                    </div>
                    <div className="p-1 rounded bg-[#101726] border border-white/10 text-[10px] text-amber-300">
                      <strong>Limiting Sphere Resource:</strong> {sh.bottleneck_resource?.toUpperCase()}
                    </div>
                    <button
                      onClick={() => {
                        setRouteDest(sh.shelter_id.toString());
                        setShowRoutePanel(true);
                      }}
                      className="w-full mt-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] transition-colors"
                    >
                      Set as Evacuation Target
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* 3. FLOATING TACTICAL TELEMETRY HUD (BOTTOM LEFT) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="p-2.5 rounded-lg bg-[#0B0F17]/90 backdrop-blur-md border border-white/10 shadow-hud font-mono text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-[10px] tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>REAL-TIME GEOSPATIAL TELEMETRY</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span>LAT: <strong className="text-slate-100">{cursorPos.lat.toFixed(4)}°N</strong></span>
              <span>LON: <strong className="text-slate-100">{cursorPos.lng.toFixed(4)}°E</strong></span>
              <span>ELEV: <strong className="text-cyan-400">~1,875m</strong></span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-2">
              <span>MGRS: 44R MR 574 832</span>
              <span>•</span>
              <span className="text-emerald-400">WGS84 DATUM ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 4. FLOATING MAP LEGEND (BOTTOM RIGHT) */}
        <div className="absolute bottom-4 right-4 z-20 p-3 rounded-lg bg-[#0B0F17]/90 backdrop-blur-md border border-white/10 shadow-hud text-xs space-y-2">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block border-b border-white/10 pb-1">
            Tactical Map Legend
          </span>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose/50"></span>
              <span>Critical Red Zone (P1 Evac)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Warning Sector (P2 Alert)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald/50"></span>
              <span>Relief Shelter Node</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-rose-500 border-dashed"></span>
              <span>Blocked Himalayan Highway</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-cyan-400 shadow-glow-cyan"></span>
              <span>Active Relief Corridor</span>
            </div>
          </div>
        </div>

        {/* 5. SLIDING TACTICAL ROUTE PLANNER DRAWER (TOP-RIGHT OVERLAY) */}
        {showRoutePanel && (
          <div className="absolute top-4 right-4 z-20 w-80 p-4 rounded-xl bg-[#0B0F17]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                <Route className="w-4 h-4" />
                <span>TACTICAL CORRIDOR SOLVER</span>
              </div>
              <button
                onClick={() => setShowRoutePanel(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">ORIGIN HABITATION</label>
                <select
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="w-full bg-[#131A2B] border border-white/10 rounded-lg p-1.5 text-slate-200 text-xs focus:border-cyan-400"
                >
                  {habitations.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.risk_category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">DESTINATION RELIEF SHELTER</label>
                <select
                  value={routeDest}
                  onChange={(e) => setRouteDest(e.target.value)}
                  className="w-full bg-[#131A2B] border border-white/10 rounded-lg p-1.5 text-slate-200 text-xs focus:border-cyan-400"
                >
                  {shelters.map(s => (
                    <option key={s.shelter_id} value={s.shelter_id}>{s.name} ({s.available_safe_capacity} free)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">OPTIMIZATION OBJECTIVE</label>
                <div className="grid grid-cols-3 gap-1">
                  {['FASTEST', 'SAFEST', 'BALANCED'].map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setRouteObjective(obj)}
                      className={`py-1 rounded text-[10px] font-mono transition-all ${
                        routeObjective === obj
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                          : 'bg-[#131A2B] text-slate-400 hover:text-white'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculateRoute}
                disabled={routingLoading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-1.5 mt-2"
              >
                {routingLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>COMPUTE EVACUATION PATH</span>
              </button>

              {activeRoutePath && (
                <div className="p-2.5 rounded-lg bg-[#131A2B] border border-white/10 space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex justify-between text-cyan-300">
                    <span>STATUS:</span>
                    <span>ROUTE READY</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DISTANCE:</span>
                    <span className="text-white">{activeRoutePath.total_distance_km.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRANSIT TIME:</span>
                    <span className="text-amber-400">{activeRoutePath.total_time_min.toFixed(0)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HAZARD INDEX:</span>
                    <span className="text-rose-400">{activeRoutePath.total_risk_score.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. INSPECTION OVERLAY CARD (WHEN AN ENTITY IS SELECTED) */}
        {selectedEntity && (
          <div className="absolute top-4 left-4 z-20 w-84 p-4 rounded-xl bg-[#0B0F17]/95 backdrop-blur-xl border border-white/15 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                TARGET TELEMETRY INSPECTOR
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEntity.type === 'habitation' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{selectedEntity.data.name}</h3>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-950"
                    style={{ backgroundColor: getHabitationColor(selectedEntity.data.risk_category) }}
                  >
                    {selectedEntity.data.risk_category}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Census Population:</span>
                    <span className="font-mono text-white">{selectedEntity.data.total_population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vulnerable Cohort:</span>
                    <span className="font-mono text-amber-400">{selectedEntity.data.vulnerable_population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slope Gradient:</span>
                    <span className="font-mono text-white">{selectedEntity.data.slope_degrees}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soil Moisture Saturation:</span>
                    <span className="font-mono text-cyan-400">{(selectedEntity.data.soil_moisture * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hazard Exposure Score:</span>
                    <span className="font-mono text-rose-400 font-bold">{selectedEntity.data.hazard_score.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onInspectHabitation(selectedEntity.data)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                >
                  <span>Open Full Audit & Drivers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedEntity.type === 'shelter' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-400 text-sm">{selectedEntity.data.name}</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                    {selectedEntity.data.shelter_type}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Effective Safe Capacity:</span>
                    <span className="font-mono text-white">{selectedEntity.data.effective_safe_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Occupants:</span>
                    <span className="font-mono text-slate-300">{selectedEntity.data.current_occupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Safe Headroom:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedEntity.data.available_safe_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sphere Bottleneck Resource:</span>
                    <span className="font-mono text-amber-400">{selectedEntity.data.bottleneck_resource?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

