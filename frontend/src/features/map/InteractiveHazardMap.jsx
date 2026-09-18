import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import { 
  Layers, Eye, EyeOff, Shield, AlertTriangle, Building, Navigation, 
  RefreshCw, Crosshair, Compass, Mountain, Maximize2, Minimize2, 
  Route, CheckCircle2, ChevronRight, X, Activity, Radio, MapPin,
  Search, Filter, Users, ArrowUpRight, Droplets, Bed, ExternalLink, HelpCircle
} from 'lucide-react';
import { api } from '../../api/client';

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

// Dynamic Tactical Map Controller supporting auto-resize, cursor HUD, and programmatic flyTo by Region or Target
function TacticalMapController({ selectedTarget, regionBounds, regionCenter, regionZoom, fitSignal, onCursorMove }) {
  const map = useMap();

  // Handle container resize & invalidation
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

  // Handle fit bounds or region switch
  useEffect(() => {
    if (regionBounds && regionBounds.length === 2) {
      map.fitBounds(regionBounds, { padding: [40, 40], maxZoom: regionZoom || 13, duration: 1.2 });
    } else if (regionCenter) {
      map.flyTo(regionCenter, regionZoom || 11, { duration: 1.2 });
    }
  }, [regionBounds, regionCenter, regionZoom, fitSignal, map]);

  // Programmatic fly to target
  useEffect(() => {
    if (selectedTarget && selectedTarget.lat && selectedTarget.lng) {
      map.flyTo([selectedTarget.lat, selectedTarget.lng], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedTarget, map]);

  // Track cursor position
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

export default function InteractiveHazardMap({
  onInspectHabitation,
  selectedRegion = 'ALL',
  onSelectRegion,
  regions = [],
  currentRegionObj
}) {
  // Core Data
  const [hazards, setHazards] = useState([]);
  const [habitations, setHabitations] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  // UNITED24 View Mode: 'map' (GIS Map View) or 'grid' (Ledger Grid View)
  const [viewMode, setViewMode] = useState('map');

  // Basemap & Layers
  const [currentBasemap, setCurrentBasemap] = useState('tactical_dark');
  const [showHazards, setShowHazards] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRiskCategory, setFilterRiskCategory] = useState('ALL');
  const [filterHazardType, setFilterHazardType] = useState('ALL');
  const [gridTab, setGridTab] = useState('habitations'); // 'habitations' | 'shelters'

  // Selection & Telemetry
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [cursorPos, setCursorPos] = useState({ lat: 22.97, lng: 78.65 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Routing Solver
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeObjective, setRouteObjective] = useState('BALANCED');
  const [activeRoutePath, setActiveRoutePath] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  // Load GIS layers when selectedRegion changes
  useEffect(() => {
    loadMapData();
  }, [selectedRegion]);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const districtParam = selectedRegion === 'ALL' ? null : (currentRegionObj?.district || selectedRegion);
      
      const [hazData, habData, shData, roadData] = await Promise.all([
        api.getHazardZones(districtParam),
        api.getHabitations({ district: districtParam }),
        api.getSheltersCapacity(districtParam),
        api.getRoadNetwork(districtParam)
      ]);

      setHazards(hazData?.features || []);
      setHabitations(habData || []);
      setShelters(shData || []);
      setRoads(roadData?.features || []);

      if (habData && habData.length > 0) {
        setRouteOrigin(habData[0].id.toString());
      }
      if (shData && shData.length > 0) {
        setRouteDest(shData[0].shelter_id.toString());
      }
    } catch (err) {
      console.error("GIS layer load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!routeOrigin || !routeDest) return;
    try {
      setRoutingLoading(true);
      const res = await api.calculateRoute(routeOrigin, routeDest, []);
      setActiveRoutePath(res);
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

  // Filtered Habitations for map & ledger
  const filteredHabitations = useMemo(() => {
    return habitations.filter(h => {
      const matchesSearch = !searchQuery || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRiskCategory === 'ALL' || h.risk_category === filterRiskCategory;
      const matchesHazard = filterHazardType === 'ALL' || h.primary_hazard_type === filterHazardType;
      return matchesSearch && matchesRisk && matchesHazard;
    });
  }, [habitations, searchQuery, filterRiskCategory, filterHazardType]);

  // Filtered Shelters
  const filteredShelters = useMemo(() => {
    return shelters.filter(s => {
      return !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.district && s.district.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [shelters, searchQuery]);

  // Filtered Hazards
  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      if (filterHazardType === 'ALL') return true;
      return h.properties.hazard_type === filterHazardType;
    });
  }, [hazards, filterHazardType]);

  // Map Center and Bounds
  const mapCenter = currentRegionObj?.center || [22.9734, 78.6569];
  const mapBounds = currentRegionObj?.bounds || [[8.0, 68.0], [35.5, 97.5]];
  const mapZoom = currentRegionObj?.zoom || (selectedRegion === 'ALL' ? 5 : 12);

  // Jump from Ledger card to GIS Map
  const handleLocateOnMap = (item, type) => {
    setViewMode('map');
    setSelectedEntity({
      type: type,
      lat: item.latitude,
      lng: item.longitude,
      data: item
    });
  };

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-[#07090E]' : 'h-[calc(100vh-8.5rem)] rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#07090E]'}`}>
      
      {/* 1. ELEKEN / UNITED24 HEADER CONTROL BAR */}
      <div className="z-20 px-4 py-2.5 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: View Mode Toggle (Map View vs Ledger Grid View) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#070B12] p-1 rounded-lg border border-slate-800/90 shadow-inner">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ledger Grid View</span>
            </button>
          </div>

          {/* Active Theater Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold">{currentRegionObj?.name || 'All India National Grid'}</span>
          </div>
        </div>

        {/* Center/Right: Basemap Selector & GIS Layer Controls (Visible in Map Mode) */}
        {viewMode === 'map' && (
          <div className="flex items-center flex-wrap gap-2">
            {/* Basemap Switcher */}
            <div className="flex items-center bg-[#131A2B] rounded-lg p-0.5 border border-slate-800">
              {Object.entries(BASEMAPS).map(([key, bmp]) => (
                <button
                  key={key}
                  onClick={() => setCurrentBasemap(key)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                    currentBasemap === key
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bmp.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center space-x-1 bg-[#131A2B] p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setShowHazards(!showHazards)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                  showHazards ? 'text-rose-400 bg-rose-500/10 font-semibold' : 'text-slate-500 line-through'
                }`}
                title="Toggle Multi-Hazard Zones"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Hazards</span>
              </button>
              <button
                onClick={() => setShowHabitations(!showHabitations)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                  showHabitations ? 'text-cyan-400 bg-cyan-500/10 font-semibold' : 'text-slate-500 line-through'
                }`}
                title="Toggle Habitations"
              >
                <Mountain className="w-3 h-3" />
                <span>Habitations ({filteredHabitations.length})</span>
              </button>
              <button
                onClick={() => setShowShelters(!showShelters)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                  showShelters ? 'text-emerald-400 bg-emerald-500/10 font-semibold' : 'text-slate-500 line-through'
                }`}
                title="Toggle Shelters"
              >
                <Building className="w-3 h-3" />
                <span>Shelters ({filteredShelters.length})</span>
              </button>
            </div>

            {/* Reset Bounds & Fullscreen */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setFitTrigger(prev => prev + 1)}
                className="p-1.5 rounded-lg bg-[#131A2B] hover:bg-[#1C253B] text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Fit Region Bounds"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-[#131A2B] hover:bg-[#1C253B] text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Search Bar in Grid Mode */}
        {viewMode === 'grid' && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search habitation or shelter..."
                className="pl-8 pr-3 py-1 bg-[#131A2B] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. MAIN CONTENT VIEW: MAP OR GRID */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* ========================================================
            VIEW MODE A: INTERACTIVE LEAFLET GIS MAP
           ======================================================== */}
        {viewMode === 'map' && (
          <>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full z-10"
              style={{ background: '#07090E' }}
              zoomControl={false}
            >
              <TacticalMapController
                selectedTarget={selectedEntity}
                regionBounds={mapBounds}
                regionCenter={mapCenter}
                regionZoom={mapZoom}
                fitSignal={fitTrigger}
                onCursorMove={setCursorPos}
              />

              {/* Basemap Tile Layer */}
              <TileLayer
                url={BASEMAPS[currentBasemap].url}
                attribution={BASEMAPS[currentBasemap].attribution}
                maxZoom={18}
              />

              {/* 1. Multi-Hazard Zones Polygons */}
              {showHazards && filteredHazards.map(h => {
                const coords = h.geometry.coordinates[0].map(c => [c[1], c[0]]);
                const props = h.properties;
                return (
                  <Polygon
                    key={props.id}
                    positions={coords}
                    pathOptions={{
                      color: props.color || '#EF4444',
                      weight: 2,
                      fillColor: props.color || '#EF4444',
                      fillOpacity: 0.28,
                      dashArray: props.severity === 'CRITICAL' ? '4, 4' : undefined
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedEntity({
                          type: 'hazard',
                          lat: coords[0][0],
                          lng: coords[0][1],
                          data: props
                        });
                      }
                    }}
                  >
                    <Popup className="dark-popup">
                      <div className="p-2 space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{props.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{props.warning_message}</p>
                        <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                          <span>Severity: <strong className="text-white">{props.severity}</strong></span>
                          <span>Score: <strong className="text-rose-400">{props.risk_score}</strong></span>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

              {/* 2. Road Network Segments */}
              {showRoads && roads.map(r => {
                const coords = r.geometry.coordinates.map(c => [c[1], c[0]]);
                const props = r.properties;
                return (
                  <Polyline
                    key={props.id}
                    positions={coords}
                    pathOptions={{
                      color: props.hazard_exposure_score > 0.8 ? '#F43F5E' : '#38BDF8',
                      weight: 2.5,
                      opacity: 0.65,
                      dashArray: '3, 6'
                    }}
                  />
                );
              })}

              {/* 3. Active Calculated Evacuation Route Path */}
              {activeRoutePath && activeRoutePath.waypoints && (
                <Polyline
                  positions={activeRoutePath.waypoints.map(w => [w.lat, w.lng])}
                  pathOptions={{
                    color: '#06B6D4',
                    weight: 5,
                    opacity: 0.95,
                    dashArray: '6, 6'
                  }}
                />
              )}

              {/* 4. Safe Shelters Markers */}
              {showShelters && filteredShelters.map(s => {
                const isSelected = selectedEntity?.data?.shelter_id === s.shelter_id;
                return (
                  <CircleMarker
                    key={s.shelter_id}
                    center={[s.latitude, s.longitude]}
                    radius={isSelected ? 11 : 7}
                    pathOptions={{
                      color: '#10B981',
                      fillColor: '#059669',
                      fillOpacity: 0.9,
                      weight: isSelected ? 3 : 1.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedEntity({
                          type: 'shelter',
                          lat: s.latitude,
                          lng: s.longitude,
                          data: s
                        });
                        setRouteDest(s.shelter_id.toString());
                      }
                    }}
                  >
                    <Popup className="dark-popup">
                      <div className="p-2 space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                          <Building className="w-3.5 h-3.5" />
                          <span>{s.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Safe Capacity: <strong className="text-white">{s.effective_safe_capacity}</strong> | Occupants: {s.current_occupancy}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Status: <span className="text-emerald-400 font-bold">{s.capacity_status}</span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* 5. Habitations Markers */}
              {showHabitations && filteredHabitations.map(h => {
                const isSelected = selectedEntity?.data?.id === h.id;
                const markerColor = getHabitationColor(h.risk_category);
                return (
                  <CircleMarker
                    key={h.id}
                    center={[h.latitude, h.longitude]}
                    radius={isSelected ? 12 : (h.risk_category === 'CRITICAL' ? 8 : 6)}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: 0.85,
                      weight: isSelected ? 3.5 : 1.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedEntity({
                          type: 'habitation',
                          lat: h.latitude,
                          lng: h.longitude,
                          data: h
                        });
                        setRouteOrigin(h.id.toString());
                      }
                    }}
                  >
                    <Popup className="dark-popup">
                      <div className="p-2 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{h.name}</span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-slate-950"
                            style={{ backgroundColor: markerColor }}
                          >
                            {h.risk_category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{h.district} • Pop: {h.total_population} • Hazard: {h.primary_hazard_type}</p>
                        <div className="flex space-x-1 pt-1.5">
                          <button
                            onClick={() => onInspectHabitation(h)}
                            className="w-full py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[10px] font-mono border border-cyan-500/40"
                          >
                            Audit Evidence
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* LIVE GEOSPATIAL TELEMETRY HUD (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 z-20 px-3 py-2 rounded-xl bg-[#0B0F17]/90 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400 shadow-2xl flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-white font-semibold">
                  {cursorPos.lat.toFixed(4)}°N, {cursorPos.lng.toFixed(4)}°E
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                THEATER: <strong className="text-white">{currentRegionObj?.name?.split('&')[0] || 'National'}</strong>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                WGS84 DATUM • EPSG:4326
              </div>
            </div>

            {/* FLOATING ROUTE CALCULATOR BUTTON */}
            <button
              onClick={() => setShowRoutePanel(!showRoutePanel)}
              className="absolute top-4 right-4 z-20 flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#0F172A]/95 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold hover:bg-cyan-950/40 transition-all shadow-glow-cyan"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tactical Evac Solver</span>
            </button>

            {/* ROUTE SOLVER FLYOUT PANEL */}
            {showRoutePanel && (
              <div className="absolute top-14 right-4 z-20 w-80 p-4 rounded-xl bg-[#0B0F17]/95 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Route className="w-4 h-4 text-cyan-400" />
                    <span>Evacuation Route Engine</span>
                  </span>
                  <button onClick={() => setShowRoutePanel(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Origin Habitation:</label>
                    <select
                      value={routeOrigin}
                      onChange={(e) => setRouteOrigin(e.target.value)}
                      className="w-full bg-[#131A2B] border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      {filteredHabitations.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.risk_category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Destination Safe Shelter:</label>
                    <select
                      value={routeDest}
                      onChange={(e) => setRouteDest(e.target.value)}
                      className="w-full bg-[#131A2B] border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      {filteredShelters.map(s => (
                        <option key={s.shelter_id} value={s.shelter_id}>
                          {s.name} ({s.effective_safe_capacity} cap)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Route Objective:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['BALANCED', 'SAFEST', 'FASTEST'].map(obj => (
                        <button
                          key={obj}
                          onClick={() => setRouteObjective(obj)}
                          className={`py-1 text-[10px] rounded transition-colors ${
                            routeObjective === obj
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50'
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
                    <span>COMPUTE PATH</span>
                  </button>

                  {activeRoutePath && (
                    <div className="p-2.5 rounded-lg bg-[#131A2B] border border-slate-800 space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between text-cyan-300 font-bold">
                        <span>STATUS:</span>
                        <span>SOLVED</span>
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

            {/* TARGET TELEMETRY DRAWER */}
            {selectedEntity && (
              <div className="absolute top-4 left-4 z-20 w-80 p-4 rounded-xl bg-[#0B0F17]/95 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-2.5 font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
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
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                        style={{ backgroundColor: getHabitationColor(selectedEntity.data.risk_category) }}
                      >
                        {selectedEntity.data.risk_category}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">District / State:</span>
                        <span className="text-white">{selectedEntity.data.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Population:</span>
                        <span className="text-white">{selectedEntity.data.total_population}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vulnerable Cohort:</span>
                        <span className="text-amber-400">{selectedEntity.data.vulnerable_population}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slope Gradient:</span>
                        <span className="text-white">{selectedEntity.data.slope_degrees}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary Hazard:</span>
                        <span className="text-rose-400 font-bold">{selectedEntity.data.primary_hazard_type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onInspectHabitation(selectedEntity.data)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                    >
                      <span>Open Full Cryptographic Audit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {selectedEntity.type === 'shelter' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-400 text-sm">{selectedEntity.data.name}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                        {selectedEntity.data.shelter_type}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">District:</span>
                        <span className="text-white">{selectedEntity.data.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Safe Capacity:</span>
                        <span className="text-white">{selectedEntity.data.effective_safe_capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Occupants:</span>
                        <span className="text-slate-300">{selectedEntity.data.current_occupancy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-emerald-400 font-bold">{selectedEntity.data.capacity_status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================
            VIEW MODE B: UNITED24 STYLE REGISTRY & RELIEF LEDGER GRID
           ======================================================== */}
        {viewMode === 'grid' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 bg-[#07090E] space-y-6">
            
            {/* Filter Tabs & Quick Stats Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGridTab('habitations')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    gridTab === 'habitations'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-[#131A2B] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Vulnerable Habitations ({filteredHabitations.length})
                </button>
                <button
                  onClick={() => setGridTab('shelters')}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    gridTab === 'shelters'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-[#131A2B] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Safe Shelters ({filteredShelters.length})
                </button>
              </div>

              {/* Risk Level Pills */}
              {gridTab === 'habitations' && (
                <div className="flex items-center space-x-1 bg-[#131A2B] p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterRiskCategory(cat)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        filterRiskCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 1. Habitations Grid Cards */}
            {gridTab === 'habitations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredHabitations.map(hab => {
                  const riskColor = getHabitationColor(hab.risk_category);
                  return (
                    <div
                      key={hab.id}
                      className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between space-y-3 group"
                    >
                      {/* Top row */}
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {hab.district}
                          </span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded text-slate-950"
                            style={{ backgroundColor: riskColor }}
                          >
                            {hab.risk_category}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                          {hab.name}
                        </h4>
                      </div>

                      {/* Hazard & Risk Gauge */}
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Hazard Risk Score</span>
                          <span className="font-bold text-white">{((hab.hazard_score || 0.8) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(hab.hazard_score || 0.8) * 100}%`,
                              backgroundColor: riskColor
                            }}
                          />
                        </div>

                        {/* Demographics */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">POPULATION</span>
                            <strong className="text-white">{hab.total_population}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">VULNERABLE</span>
                            <strong className="text-amber-400">{hab.vulnerable_population}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">TERRAIN SLOPE</span>
                            <strong className="text-white">{hab.slope_degrees}°</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">PRIMARY HAZARD</span>
                            <strong className="text-rose-400">{hab.primary_hazard_type}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleLocateOnMap(hab, 'habitation')}
                          className="px-2 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-medium flex items-center justify-center space-x-1"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Locate Map</span>
                        </button>
                        <button
                          onClick={() => onInspectHabitation(hab)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono font-medium flex items-center justify-center space-x-1"
                        >
                          <span>Evidence</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Shelters Grid Cards */}
            {gridTab === 'shelters' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredShelters.map(sh => (
                  <div
                    key={sh.shelter_id}
                    className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/50 transition-all shadow-lg flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {sh.district}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          {sh.capacity_status || 'AVAILABLE'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{sh.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{sh.shelter_type}</p>
                    </div>

                    {/* Capacity meter */}
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Safe Capacity</span>
                        <span className="text-emerald-400 font-bold">{sh.effective_safe_capacity} People</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (sh.current_occupancy / Math.max(1, sh.effective_safe_capacity)) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Current: {sh.current_occupancy}</span>
                        <span>Available: {sh.available_safe_capacity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLocateOnMap(sh, 'shelter')}
                      className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-medium flex items-center justify-center space-x-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Locate on Tactical Map</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
