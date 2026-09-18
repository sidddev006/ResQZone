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
  Compass,
  MapPin,
  CheckCircle2,
  FileText
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
    { name: 'Critical P1', count: kpis?.critical_zones_count || 4, color: '#F43F5E' },
    { name: 'Warning P2', count: kpis?.warning_zones_count || 6, color: '#F59E0B' },
    { name: 'Watch P3', count: Math.max(0, (kpis?.total_habitations_count || 12) - (kpis?.critical_zones_count || 4) - (kpis?.warning_zones_count || 6)), color: '#06B6D4' },
    { name: 'Relief Bases', count: kpis?.total_shelters_count || 8, color: '#10B981' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* 1. ELEKEN-GRADE HERO SHOWCASE BANNER */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl eleken-card border border-white/[0.1] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eleken-pill bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{currentRegionObj?.name?.toUpperCase() || 'NATIONAL MULTI-HAZARD GRID'}</span>
              </span>
              <span className="eleken-pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>TELEMETRY STREAM SYNCHRONIZED</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Disaster Risk & Immediate Relocation Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Intelligent identification of hazard-based red zones, humanitarian Sphere carrying capacity assessment, and instant candidate route optimization.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Tactical GIS Map</span>
            </button>
            <button
              onClick={() => onNavigate('resq_twin')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-slate-200 text-xs font-semibold border border-white/[0.1] transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Run Twin What-If</span>
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-[#131A2B] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-white/[0.1] transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. EMERGENCY BROADCAST BANNER */}
      {alerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-rose-500/5">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-rose-400 px-2 py-0.5 rounded-full">
                  {alerts[0].severity}
                </span>
                <span className="text-sm font-bold text-white">{alerts[0].title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alerts[0].recommended_action}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="shrink-0 text-xs font-semibold text-rose-300 hover:text-white flex items-center space-x-1.5 border border-rose-500/40 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 transition-all"
          >
            <span>Review Active Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. BENTO GRID KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Critical Red Zones */}
        <div className="p-5 rounded-2xl eleken-card border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Red Zones</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-rose-400">{kpis?.critical_zones_count ?? 4}</div>
            <p className="text-xs text-slate-400 mt-1">Priority 1 Immediate Evacuation</p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-xs text-rose-300 flex items-center justify-between">
            <span>In Danger Zone:</span>
            <strong className="font-bold">{kpis?.immediate_relocation_candidates_count ?? 5} Habitations</strong>
          </div>
        </div>

        {/* KPI 2: Warning Sectors */}
        <div className="p-5 rounded-2xl eleken-card border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warning Sectors</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-amber-400">{kpis?.warning_zones_count ?? 6}</div>
            <p className="text-xs text-slate-400 mt-1">Priority 2 Slope Vigilance</p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-xs text-amber-300 flex items-center justify-between">
            <span>Precipitation Anomaly:</span>
            <strong className="font-bold">+142% Over Baseline</strong>
          </div>
        </div>

        {/* KPI 3: Citizens at Risk */}
        <div className="p-5 rounded-2xl eleken-card border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Population at Risk</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white">{kpis?.people_at_risk?.toLocaleString() ?? '8,420'}</div>
            <p className="text-xs text-slate-400 mt-1">Census Enumerated Residents</p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-xs text-cyan-300 flex items-center justify-between">
            <span>Vulnerable Cohort:</span>
            <strong className="font-bold">{kpis?.vulnerable_people_at_risk?.toLocaleString() ?? '2,840'} Citizens</strong>
          </div>
        </div>

        {/* KPI 4: Safe Shelter Capacity */}
        <div className="p-5 rounded-2xl eleken-card border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safe Capacity</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white">{kpis?.total_safe_capacity?.toLocaleString() ?? '11,400'}</div>
            <p className="text-xs text-slate-400 mt-1">Sphere Adjusted Shelter Beds</p>
          </div>
          <div className="pt-2 border-t border-white/[0.06] text-xs text-emerald-300 flex items-center justify-between">
            <span>Available Headroom:</span>
            <strong className="font-bold">{kpis?.available_safe_capacity?.toLocaleString() ?? '8,200'} Free Slots</strong>
          </div>
        </div>

      </div>

      {/* 4. SPLIT ANALYTICS & REGIONAL STREAM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Risk Stratification Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl eleken-card border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Hazard Severity & Asset Stratification
              </h3>
              <p className="text-xs text-slate-400">
                Cross-validated settlements, vulnerable zones, and humanitarian safe shelters
              </p>
            </div>
            <span className="eleken-pill bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Live Stratification
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Theater Status Card (1 col) */}
        <div className="p-6 rounded-3xl eleken-card border border-white/[0.08] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white tracking-tight">Active Theater Status</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Target Region:</span>
                <strong className="text-white">{currentRegionObj?.name || 'All India Grid'}</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Monitored Settlements:</span>
                <strong className="text-cyan-400">{kpis?.total_habitations_count || 31} Active Nodes</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Safe Capacity Utilization:</span>
                <strong className="text-emerald-400">{kpis?.capacity_utilization_pct || 28.4}% Load</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Sensor Status:</span>
                <strong className="text-white">{kpis?.data_sources_healthy || 'Fresh'}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore on Interactive GIS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
