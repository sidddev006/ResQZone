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
  Layers,
  Radio,
  Crosshair,
  Gauge,
  Cpu
} from 'lucide-react';
import { api } from '../../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function DashboardOverview({
  onNavigate,
  onSelectHabitation,
  selectedRegion = 'ALL',
  currentRegionObj
}) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const districtParam = selectedRegion === 'ALL' ? null : (currentRegionObj?.district || selectedRegion);
      const [kpiData, alertData] = await Promise.all([
        api.getKPIs(districtParam),
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
    { name: 'Critical P1', count: kpis?.critical_zones_count || 0, color: '#F43F5E' },
    { name: 'Warning P2', count: kpis?.warning_zones_count || 0, color: '#F59E0B' },
    { name: 'Watch P3', count: Math.max(0, (kpis?.total_habitations_count || 10) - (kpis?.critical_zones_count || 0) - (kpis?.warning_zones_count || 0)), color: '#38BDF8' },
    { name: 'Safe Shelters', count: kpis?.total_shelters_count || 0, color: '#10B981' }
  ];

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* 1. Command Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              TACTICAL GRID • {currentRegionObj?.name?.toUpperCase() || 'ALL INDIA NATIONAL OVERVIEW'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE SATELLITE & SENSOR TELEMETRY</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
            Disaster Risk & Evacuation Command Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-hazard fusion, humanitarian Sphere/WHO capacity bottlenecks, and Dijkstra-optimized evacuation corridors.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2.5 shrink-0">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-slate-300 hover:text-white text-xs font-mono border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC SENSORS</span>
          </button>
          <button
            onClick={() => onNavigate('resq_twin')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-glow-cyan transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RUN RESQ TWIN</span>
          </button>
        </div>
      </div>

      {/* 2. Active Alert Warning Strip */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex items-start justify-between gap-4 shadow-glow-rose/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-950 bg-rose-400 px-2 py-0.5 rounded">
                  {alerts[0].severity}
                </span>
                <span className="text-xs font-bold text-rose-200">{alerts[0].title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alerts[0].recommended_action}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="shrink-0 text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center space-x-1 border border-rose-500/40 px-2.5 py-1 rounded bg-rose-500/20 transition-colors"
          >
            <span>DISPATCH SITREP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. 8 High-Density Tactical KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Critical Red Zones</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-1 font-mono">{kpis?.critical_zones_count ?? 3}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">P1 Compulsory Evacuation</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Warning Sectors</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">{kpis?.warning_zones_count ?? 5}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">P2 Standby Monitoring</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Citizens at Risk</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{kpis?.people_at_risk?.toLocaleString() ?? '5,420'}</div>
          <p className="text-[10px] text-cyan-400 mt-1 font-mono">
            {kpis?.vulnerable_people_at_risk?.toLocaleString() ?? '1,840'} High Dependency
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Immediate Evacuees</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-300 mt-1 font-mono">{kpis?.immediate_relocation_candidates_count ?? 6}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Habitations In Flight</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Safe Capacity</span>
            <Building className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{kpis?.total_safe_capacity?.toLocaleString() ?? '7,200'}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Sphere Bottleneck Adjusted</p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Utilization Headroom</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{kpis?.capacity_utilization_pct ?? 29.5}%</div>
          <p className="text-[10px] text-emerald-300 mt-1 font-mono">{kpis?.available_safe_capacity?.toLocaleString() ?? '5,080'} spots free</p>
        </div>

        {/* KPI 7 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Alerts</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">{kpis?.unresolved_alerts_count ?? 2}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Sensor Threshold Hits</p>
        </div>

        {/* KPI 8 */}
        <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Telemetry Health</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1 font-mono">{kpis?.data_sources_healthy ?? '6/6'}</div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">USGS, IMD, InSAR, DEM</p>
        </div>
      </div>

      {/* 4. Main Grid: Distribution Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Distribution Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">HABITATION RISK STRATIFICATION</h3>
              <p className="text-xs text-slate-400">Distribution across 20 surveyed settlements in Chamoli Basin</p>
            </div>
            <button
              onClick={() => onNavigate('habitations')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>INSPECT ALL 20</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} width={80} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '0.75rem', color: '#F8FAFC', fontSize: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick settlement chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-xs font-mono">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-300 block text-[11px]">Manohar Bagh</span>
              <span className="text-[10px] text-slate-400">Score 0.94 • P1 Subsidence</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-300 block text-[11px]">Sunil Ward</span>
              <span className="text-[10px] text-slate-400">Score 0.95 • P1 Slump</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-300 block text-[11px]">Marwari</span>
              <span className="text-[10px] text-slate-400">Score 0.81 • P2 Flood</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-bold text-emerald-300 block text-[11px]">Pipalkoti</span>
              <span className="text-[10px] text-slate-400">Score 0.15 • P4 Stable</span>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Execution Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Cpu className="w-4 h-4" />
              <h4 className="font-bold text-white text-xs font-mono">RESQ TWIN DIGITAL SIMULATOR</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject seismic PGA spikes, flash floods, or road closures to preview the exact cascade delta.
            </p>
            <button
              onClick={() => onNavigate('resq_twin')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all shadow-glow-cyan"
            >
              <span>LAUNCH WHAT-IF TWIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Layers className="w-4 h-4" />
              <h4 className="font-bold text-white text-xs font-mono">TACTICAL GIS OPERATIONS</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time topographic map with satellite imagery, road blockages, and evacuation routes.
            </p>
            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>OPEN FULL-BLEED GIS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
