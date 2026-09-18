import React, { useState, useEffect } from 'react';
import { Navigation2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Compass, Route } from 'lucide-react';
import { api } from '../../api/client';

export default function RelocationPlanner({ 
  selectedRegion = 'ALL', 
  currentRegionObj,
  theme = 'light' 
}) {
  const [strategy, setStrategy] = useState('BALANCED');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    runOptimization();
  }, [strategy, selectedRegion]);

  const runOptimization = async () => {
    try {
      setLoading(true);
      const res = await api.optimizeRelocation(strategy);
      setPlan(res);
    } catch (err) {
      console.error("Relocation optimization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">CONSTRAINED BIPARTITE OPTIMIZATION</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA SOLVER'}
            </span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Constrained Relocation Optimization Planner
          </h2>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Deterministic graph optimization strictly adhering to humanitarian safe capacities and hazard detour parameters.
          </p>
        </div>

        {/* Strategy Selector */}
        <div className={`flex items-center space-x-1 p-1 rounded-2xl border text-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {['BALANCED', 'SAFEST', 'FASTEST'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                strategy === strat
                  ? (isDark ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25' : 'bg-white text-sky-950 font-bold shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              {strat}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Metrics Row */}
      {plan && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className={`p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
          }`}>
            <span className={`text-xs font-bold block uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Target Evacuees
            </span>
            <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {plan.total_targeted_evacuees?.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-500 font-bold">Critical & high-risk</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
          }`}>
            <span className={`text-xs font-bold block uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Assigned Evacuees
            </span>
            <div className="text-2xl font-black text-emerald-500 mt-1">
              {plan.total_assigned?.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Within safe capacity</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
          }`}>
            <span className={`text-xs font-bold block uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Unassigned Deficit
            </span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {plan.total_unassigned?.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Bottleneck spillovers</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
          }`}>
            <span className={`text-xs font-bold block uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Avg Transit Time
            </span>
            <div className="text-2xl font-black text-sky-500 mt-1">
              {plan.average_travel_time_min} min
            </div>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{strategy} profile</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-sm ${
            isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
          }`}>
            <span className={`text-xs font-bold block uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Avg Route Risk
            </span>
            <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {(plan.average_route_risk * 100).toFixed(0)}%
            </div>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Corridor exposure score</span>
          </div>
        </div>
      )}

      {/* Manifest Table */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Evacuation Assignment Manifest
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Origin to shelter allocation matrix and transit times
            </p>
          </div>
          <button
            onClick={runOptimization}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              isDark 
                ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30' 
                : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 shadow-xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Solve Solver</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className={`border-b font-bold text-[11px] tracking-wider uppercase ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="py-3.5 px-5">Origin Settlement</th>
                <th className="py-3.5 px-4">Assigned Relief Shelter</th>
                <th className="py-3.5 px-4">Allocated Population</th>
                <th className="py-3.5 px-4">Est. Transit Time</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4">Route Risk Exposure</th>
                <th className="py-3.5 px-5">Graph Corridor Path</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-500">
                    Solving constrained network optimization...
                  </td>
                </tr>
              ) : plan?.assignments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-500">
                    No active evacuation assignments.
                  </td>
                </tr>
              ) : (
                plan?.assignments?.map((a, i) => (
                  <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-5">
                      <span className={`font-bold text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.habitation_name}</span>
                      <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">{a.habitation_id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">{a.shelter_name}</span>
                      <span className="text-[11px] opacity-60 font-medium">{a.shelter_id}</span>
                    </td>
                    <td className={`py-3.5 px-4 font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {a.allocated_population.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-amber-500 font-bold">
                      {a.travel_time_min} min
                    </td>
                    <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {a.distance_km} km
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        a.route_risk_score > 0.6 
                          ? (isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200')
                          : (isDark ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200')
                      }`}>
                        {a.hazard_exposure_label} ({(a.route_risk_score * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs opacity-70 max-w-xs truncate font-mono">
                      {a.path_nodes?.join(' → ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
