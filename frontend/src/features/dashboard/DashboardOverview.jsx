import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Users,
  ShieldAlert,
  Building,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function DashboardOverview({ onNavigate, onSelectHabitation }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiData, alertData] = await Promise.all([
        api.getKPIs(),
        api.getAlerts()
      ]);
      setKpis(kpiData);
      setAlerts(alertData.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Critical', count: kpis?.critical_zones_count || 3, color: '#EF4444' },
    { name: 'Warning', count: kpis?.warning_zones_count || 5, color: '#F97316' },
    { name: 'Watch', count: 8, color: '#EAB308' },
    { name: 'Safe', count: 4, color: '#10B981' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
              Active Monsoonal InSAR Watch
            </span>
            <span className="text-xs text-slate-400">Chamoli High-Altitude Grid</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Vulnerability & Carrying Capacity Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time multi-hazard fusion, shelter resource bottleneck detection, and constrained relocation decision support.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={() => onNavigate('resq_twin')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Simulate ResQ Twin</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Bar if any */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-red-400">{alerts[0].severity} DISPATCH</span>
                <span className="text-xs text-slate-400">• {alerts[0].target_area}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{alerts[0].title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{alerts[0].recommended_action}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 8 Primary Decision KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Critical Red Zones</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{kpis?.critical_zones_count ?? 3}</div>
          <p className="text-[11px] text-slate-400 mt-1">Immediate evacuation priority</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Warning Sectors</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{kpis?.warning_zones_count ?? 5}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pre-evacuation standby</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>People at Risk</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{kpis?.people_at_risk?.toLocaleString() ?? '5,420'}</div>
          <p className="text-[11px] text-indigo-300 mt-1">
            {kpis?.vulnerable_people_at_risk?.toLocaleString() ?? '1,840'} high dependency
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Immediate Evacuees</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{kpis?.immediate_relocation_candidates_count ?? 6}</div>
          <p className="text-[11px] text-slate-400 mt-1">Compulsory relocation</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Safe Shelter Capacity</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{kpis?.total_safe_capacity?.toLocaleString() ?? '7,200'}</div>
          <p className="text-[11px] text-slate-400 mt-1">Resource-bottleneck adjusted</p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Capacity Utilization</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">{kpis?.capacity_utilization_pct ?? 29.5}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{kpis?.available_safe_capacity?.toLocaleString() ?? '5,080'} safe spots open</p>
        </div>

        {/* KPI 7 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{kpis?.unresolved_alerts_count ?? 3}</div>
          <p className="text-[11px] text-slate-400 mt-1">Real-time sensor triggers</p>
        </div>

        {/* KPI 8 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Data Sources Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{kpis?.data_sources_healthy ?? '6/6'}</div>
          <p className="text-[11px] text-slate-400 mt-1">IMD, InSAR, DEM, OSM Fresh</p>
        </div>
      </div>

      {/* Main Grid: Visual Risk Distribution & Fast Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution Graph & Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">District Hazard Risk Classification</h3>
              <p className="text-xs text-slate-400">Distribution of surveyed habitations across tiered risk levels</p>
            </div>
            <button
              onClick={() => onNavigate('habitations')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View All 20 Habitations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div className="p-2 rounded-lg bg-red-500/10">
              <span className="font-bold text-red-400 block">Manohar Bagh</span>
              <span className="text-[10px] text-slate-400">Score: 0.94 (Subsidence)</span>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10">
              <span className="font-bold text-red-400 block">Sunil Ward</span>
              <span className="text-[10px] text-slate-400">Score: 0.95 (Slope Slump)</span>
            </div>
            <div className="p-2 rounded-lg bg-orange-500/10">
              <span className="font-bold text-orange-400 block">Marwari</span>
              <span className="text-[10px] text-slate-400">Score: 0.81 (Flash Flood)</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <span className="font-bold text-emerald-400 block">Pipalkoti</span>
              <span className="text-[10px] text-slate-400">Score: 0.15 (Safe Basin)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Execution Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">ResQ Twin Digital Simulator</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test what happens when Road R17 is blocked or Shelter S2 reaches capacity. Calculate the exact delta from baseline.
            </p>
            <button
              onClick={() => onNavigate('resq_twin')}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Launch ResQ Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Interactive GIS Map</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore landslide polygons, flood corridors, fault line buffers, shelters, and connected road segments on Leaflet.
            </p>
            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Open GIS Map View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
