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
      setAlerts(alertData.slice(0, 2));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Critical', count: kpis?.critical_zones_count || 3, color: '#dc2626' },
    { name: 'Warning', count: kpis?.warning_zones_count || 5, color: '#ea580c' },
    { name: 'Watch', count: 8, color: '#d97706' },
    { name: 'Safe', count: 4, color: '#16a34a' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-mono font-medium text-stone-500 uppercase tracking-wider">
              Chamoli-Joshimath District Grid
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[11px] text-amber-700 font-medium">Active Monsoonal InSAR Watch</span>
          </div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Vulnerability & Relocation Command Center
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Deterministic GIS multi-hazard fusion, shelter carrying-capacity constraints, and constrained relocation decision support.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={() => onNavigate('resq_twin')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate ResQ Twin</span>
          </button>
        </div>
      </div>

      {/* Understated Alert Notice */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  {alerts[0].severity}
                </span>
                <span className="text-xs font-medium text-amber-900">{alerts[0].title}</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{alerts[0].recommended_action}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="shrink-0 text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center space-x-1"
          >
            <span>Review Alerts</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 8 Primary Decision KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Critical Red Zones</span>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">{kpis?.critical_zones_count ?? 3}</div>
          <p className="text-[11px] text-stone-400 mt-1">Compulsory evacuation</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Warning Sectors</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{kpis?.warning_zones_count ?? 5}</div>
          <p className="text-[11px] text-stone-400 mt-1">Pre-evacuation standby</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Citizens at Risk</span>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{kpis?.people_at_risk?.toLocaleString() ?? '5,420'}</div>
          <p className="text-[11px] text-stone-500 mt-1">
            {kpis?.vulnerable_people_at_risk?.toLocaleString() ?? '1,840'} high dependency
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Immediate Evacuees</span>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{kpis?.immediate_relocation_candidates_count ?? 6}</div>
          <p className="text-[11px] text-stone-400 mt-1">Critical habitations</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Effective Safe Capacity</span>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{kpis?.total_safe_capacity?.toLocaleString() ?? '7,200'}</div>
          <p className="text-[11px] text-stone-400 mt-1">Resource bottleneck adjusted</p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Shelter Utilization</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{kpis?.capacity_utilization_pct ?? 29.5}%</div>
          <p className="text-[11px] text-stone-500 mt-1">{kpis?.available_safe_capacity?.toLocaleString() ?? '5,080'} safe spots available</p>
        </div>

        {/* KPI 7 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Active Alerts</span>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{kpis?.unresolved_alerts_count ?? 2}</div>
          <p className="text-[11px] text-stone-400 mt-1">Multi-sensor triggers</p>
        </div>

        {/* KPI 8 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
          <span className="text-[11px] font-medium text-stone-500 block">Data Sources Health</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{kpis?.data_sources_healthy ?? '6/6'}</div>
          <p className="text-[11px] text-stone-400 mt-1">IMD, InSAR, DEM, OSM Fresh</p>
        </div>
      </div>

      {/* Main Grid: Visual Risk Distribution & Fast Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Distribution Graph & Overview */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">District Hazard Classification</h3>
              <p className="text-xs text-stone-500">Distribution of surveyed habitations across tiered risk categories</p>
            </div>
            <button
              onClick={() => onNavigate('habitations')}
              className="text-xs font-medium text-stone-700 hover:text-stone-900 flex items-center space-x-1"
            >
              <span>View All Habitations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#44403c" fontSize={12} width={65} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.5rem', color: '#1c1917', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-stone-100 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="font-medium text-rose-700 block">Manohar Bagh</span>
              <span className="text-[10px] text-stone-500">Score 0.94 • Subsidence</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="font-medium text-rose-700 block">Sunil Ward</span>
              <span className="text-[10px] text-stone-500">Score 0.95 • Slope Slump</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="font-medium text-amber-700 block">Marwari</span>
              <span className="text-[10px] text-stone-500">Score 0.81 • Flash Flood</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="font-medium text-emerald-700 block">Pipalkoti</span>
              <span className="text-[10px] text-stone-500">Score 0.15 • Safe Basin</span>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Execution Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-semibold text-stone-900 text-xs">ResQ Twin Digital Simulator</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Test what happens when Road R17 is blocked or Shelter S2 reaches capacity. Calculate the exact delta from baseline.
            </p>
            <button
              onClick={() => onNavigate('resq_twin')}
              className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-semibold text-stone-900 text-xs">Interactive GIS Layers</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Inspect multi-hazard polygons, relief shelter coordinates, and road networks directly on the Leaflet map.
            </p>
            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <span>Open GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
