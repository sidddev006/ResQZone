import React, { useState, useEffect } from 'react';
import { Navigation2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Compass, Route } from 'lucide-react';
import { api } from '../../api/client';

export default function RelocationPlanner({ selectedRegion = 'ALL', currentRegionObj }) {
  const [strategy, setStrategy] = useState('BALANCED');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

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
      <div className="p-6 sm:p-7 rounded-3xl eleken-card border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-semibold tracking-wide">
            <span>CONSTRAINED BIPARTITE OPTIMIZATION</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{currentRegionObj?.name?.toUpperCase() || 'PAN-INDIA SOLVER'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Constrained Relocation Optimization Planner</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Deterministic graph optimization strictly adhering to humanitarian safe capacities and hazard detour parameters.
          </p>
        </div>

        {/* Strategy Segmented Selector */}
        <div className="flex items-center space-x-1 bg-[#131A2B] p-1 rounded-2xl border border-white/[0.08] text-xs">
          {['BALANCED', 'SAFEST', 'FASTEST'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                strategy === strat
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
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
          <div className="p-4 rounded-2xl eleken-card border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Target Evacuees</span>
            <div className="text-2xl font-extrabold text-white mt-1">{plan.total_targeted_evacuees?.toLocaleString()}</div>
            <span className="text-[11px] text-rose-400 font-medium">Critical & high-risk</span>
          </div>

          <div className="p-4 rounded-2xl eleken-card border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Assigned Evacuees</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{plan.total_assigned?.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-300 font-medium">Within safe capacity</span>
          </div>

          <div className="p-4 rounded-2xl eleken-card border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Unassigned Deficit</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{plan.total_unassigned?.toLocaleString()}</div>
            <span className="text-[11px] text-amber-300 font-medium">Bottleneck spillovers</span>
          </div>

          <div className="p-4 rounded-2xl eleken-card border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Avg Transit Time</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{plan.average_travel_time_min} min</div>
            <span className="text-[11px] text-slate-400 font-medium">{strategy} profile</span>
          </div>

          <div className="p-4 rounded-2xl eleken-card border border-white/[0.08]">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Avg Route Risk</span>
            <div className="text-2xl font-extrabold text-white mt-1">{(plan.average_route_risk * 100).toFixed(0)}%</div>
            <span className="text-[11px] text-slate-400 font-medium">Corridor exposure score</span>
          </div>
        </div>
      )}

      {/* Manifest Table */}
      <div className="eleken-card border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Evacuation Assignment Manifest</h3>
            <p className="text-xs text-slate-400">Origin to shelter allocation matrix and transit times</p>
          </div>
          <button
            onClick={runOptimization}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Solve Solver</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#131A2B]/80 border-b border-white/[0.06] text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
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
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
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
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white text-sm">
                      {a.habitation_name}
                      <span className="text-[11px] text-cyan-400 font-medium block">{a.habitation_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      {a.shelter_name}
                      <span className="text-[11px] text-slate-400 font-medium block">{a.shelter_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                      {a.allocated_population.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">
                      {a.travel_time_min} min
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {a.distance_km} km
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        a.route_risk_score > 0.6 ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {a.hazard_exposure_label} ({(a.route_risk_score * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 max-w-xs truncate font-mono">
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
