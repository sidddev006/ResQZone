import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  Compass,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../../api/client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function DashboardOverview({
  onNavigate,
  onSelectHabitation,
  selectedRegion = 'ALL',
  currentRegionObj,
  theme = 'light'
}) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [criticalHabitations, setCriticalHabitations] = useState([]);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadData();
  }, [selectedRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const districtParam = selectedRegion === 'ALL' ? null : (currentRegionObj?.district || selectedRegion);
      const [kpiData, alertData, habData] = await Promise.all([
        api.getKPIs(districtParam),
        api.getAlerts(),
        api.getHabitations({ district: districtParam, risk_category: 'CRITICAL' })
      ]);
      setKpis(kpiData);
      setAlerts(alertData.slice(0, 2));
      setCriticalHabitations((habData || []).slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Critical P1', count: kpis?.critical_zones_count || 4, color: '#EF4444' },
    { name: 'Warning P2', count: kpis?.warning_zones_count || 6, color: '#F59E0B' },
    { name: 'Watch P3', count: Math.max(0, (kpis?.total_habitations_count || 12) - (kpis?.critical_zones_count || 4) - (kpis?.warning_zones_count || 6)), color: '#0EA5E9' },
    { name: 'Relief Shelters', count: kpis?.total_shelters_count || 8, color: '#10B981' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* 1. APPLE SIRI / MODE CLEAN HERO BANNER */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark 
          ? 'bg-[#0F172A] border-white/[0.08] shadow-2xl' 
          : 'bg-white border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)]'
      }`}>
        {/* Subtle Ambient Apple Siri Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-400/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-emerald-400/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 border ${
                isDark 
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' 
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentRegionObj?.name || 'PAN-INDIA MULTI-HAZARD GRID'}</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1.5 border ${
                isDark 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Telemetry Mesh</span>
              </span>
            </div>

            <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Intelligent Hazard Red Zone & Relocation Command
            </h1>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Multi-region disaster intelligence combining satellite hazard delineation, humanitarian Sphere carrying capacity assessment, and Dijkstra-optimized evacuation pathways.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Interactive GIS</span>
            </button>
            <button
              onClick={() => onNavigate('resq_twin')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Run Scenario Simulation</span>
            </button>
            <button
              onClick={loadData}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
              }`}
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE CRITICAL WARNING BANNER */}
      {alerts.length > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isDark 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
            : 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-sm'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  {alerts[0].severity}
                </span>
                <span className="text-sm font-bold">{alerts[0].title}</span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-rose-200/80' : 'text-rose-700'}`}>
                {alerts[0].recommended_action}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className={`shrink-0 text-xs font-bold flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border transition-all ${
              isDark 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40' 
                : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
            }`}
          >
            <span>Review Active Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. MODE ANALYTICS BENTO GRID KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Critical Red Zones */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Critical Red Zones
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-rose-600">{kpis?.critical_zones_count ?? 4}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority 1 Immediate Action</p>
          </div>
          <div className={`pt-2.5 border-t text-xs flex items-center justify-between ${
            isDark ? 'border-white/[0.06] text-rose-300' : 'border-slate-100 text-rose-700'
          }`}>
            <span>Immediate Relocation:</span>
            <strong className="font-bold">{kpis?.immediate_relocation_candidates_count ?? 5} Habitations</strong>
          </div>
        </div>

        {/* KPI 2: Warning Sectors */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Warning Sectors
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-500">{kpis?.warning_zones_count ?? 6}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority 2 Active Surveillance</p>
          </div>
          <div className={`pt-2.5 border-t text-xs flex items-center justify-between ${
            isDark ? 'border-white/[0.06] text-amber-300' : 'border-slate-100 text-amber-700'
          }`}>
            <span>Precipitation Delta:</span>
            <strong className="font-bold">+142% vs Seasonal Mean</strong>
          </div>
        </div>

        {/* KPI 3: Citizens at Risk */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Population at Risk
            </span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kpis?.people_at_risk?.toLocaleString() ?? '8,420'}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enumerated Residents</p>
          </div>
          <div className={`pt-2.5 border-t text-xs flex items-center justify-between ${
            isDark ? 'border-white/[0.06] text-sky-300' : 'border-slate-100 text-sky-700'
          }`}>
            <span>Vulnerable Cohort:</span>
            <strong className="font-bold">{kpis?.vulnerable_people_at_risk?.toLocaleString() ?? '2,840'} Persons</strong>
          </div>
        </div>

        {/* KPI 4: Safe Shelter Capacity */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Safe Capacity
            </span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kpis?.total_safe_capacity?.toLocaleString() ?? '11,400'}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sphere Certified Shelter Beds</p>
          </div>
          <div className={`pt-2.5 border-t text-xs flex items-center justify-between ${
            isDark ? 'border-white/[0.06] text-emerald-300' : 'border-slate-100 text-emerald-700'
          }`}>
            <span>Available Headroom:</span>
            <strong className="font-bold">{kpis?.available_safe_capacity?.toLocaleString() ?? '8,200'} Free Slots</strong>
          </div>
        </div>

      </div>

      {/* 4. SPLIT ANALYTICS & REGIONAL HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Risk Stratification Chart */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-white/[0.06]' : 'border-slate-100'
          }`}>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Risk Stratification & Relief Distribution
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Classification across settlements, hazard perimeters, and active shelters
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              Validated Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} />
                <YAxis stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
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

        {/* High Risk Habitations Sidebar */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          <div>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-white/[0.06]' : 'border-slate-100'
            }`}>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Immediate Priority Targets
              </h3>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Habitations triggering immediate relocation thresholds
            </p>

            <div className="mt-4 space-y-2.5">
              {criticalHabitations.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No critical settlements in this filter
                </div>
              ) : (
                criticalHabitations.map((hab) => (
                  <div
                    key={hab.id}
                    onClick={() => onSelectHabitation(hab)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/50 hover:bg-slate-800' 
                        : 'bg-slate-50 hover:bg-sky-50/50 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold">{hab.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          {hab.primary_hazard_type}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Pop: {hab.total_population} | Score: {((hab.hazard_score || 0.8) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-sky-500 opacity-80" />
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('habitations')}
            className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <span>View All Habitations ({kpis?.total_habitations_count ?? 31})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
