import React, { useState, useEffect } from 'react';
import { Navigation2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Compass, Route } from 'lucide-react';
import { api } from '../../api/client';

export default function RelocationPlanner() {
  const [strategy, setStrategy] = useState('BALANCED');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runOptimization();
  }, [strategy]);

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
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-mono text-cyan-400">
            <span>CONSTRAINED BIPARTITE MATCHING</span>
            <span>•</span>
            <span className="text-slate-400">NETWORKX GRAPH SOLVER</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">Constrained Relocation Optimization Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic spatial optimization enforcing strict shelter capacity bounds and hazard detour clearances
          </p>
        </div>

        {/* Strategy Segmented Selector */}
        <div className="flex items-center space-x-1 bg-[#131A2B] p-1 rounded-xl border border-white/10 font-mono text-xs">
          {['BALANCED', 'SAFEST', 'FASTEST'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                strategy === strat
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
          <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Target Evacuees</span>
            <div className="text-2xl font-extrabold text-white mt-1">{plan.total_targeted_evacuees?.toLocaleString()}</div>
            <span className="text-[10px] text-rose-400">Critical & high-risk</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Assigned Evacuees</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{plan.total_assigned?.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-300">Within safe capacities</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Unassigned Deficit</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{plan.total_unassigned?.toLocaleString()}</div>
            <span className="text-[10px] text-amber-300">Bottleneck spillovers</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Avg Transit Time</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{plan.average_travel_time_min} min</div>
            <span className="text-[10px] text-slate-400">{strategy} profile</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17]/90 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase">Avg Route Risk</span>
            <div className="text-2xl font-extrabold text-white mt-1">{(plan.average_route_risk * 100).toFixed(0)}%</div>
            <span className="text-[10px] text-slate-400">Corridor exposure score</span>
          </div>
        </div>
      )}

      {/* Manifest Table */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evacuation Assignment Manifest</h3>
            <p className="text-[11px] text-slate-400">Origin to shelter allocation matrix and transit times</p>
          </div>
          <button
            onClick={runOptimization}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-glow-cyan/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>RE-SOLVE GRAPH</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131A2B]/80 border-b border-white/10 text-slate-400 font-medium text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ORIGIN HABITATION</th>
                <th className="py-3.5 px-4">ASSIGNED RELIEF SHELTER</th>
                <th className="py-3.5 px-4">ALLOCATED HEADCOUNT</th>
                <th className="py-3.5 px-4">EST. TRANSIT TIME</th>
                <th className="py-3.5 px-4">DISTANCE</th>
                <th className="py-3.5 px-4">ROUTE HAZARD EXPOSURE</th>
                <th className="py-3.5 px-4">GRAPH CORRIDOR PATH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-mono">
                    SOLVING CONSTRAINED NETWORK OPTIMIZATION...
                  </td>
                </tr>
              ) : plan?.assignments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-mono">
                    No active evacuation assignments.
                  </td>
                </tr>
              ) : (
                plan?.assignments?.map((a, i) => (
                  <tr key={i} className="hover:bg-[#131A2B]/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {a.habitation_name}
                      <span className="text-[10px] text-cyan-400/80 block">{a.habitation_id}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {a.shelter_name}
                      <span className="text-[10px] text-slate-500 block">{a.shelter_id}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-white text-[13px]">
                      {a.allocated_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-bold">
                      {a.travel_time_min} min
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {a.distance_km} km
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        a.route_risk_score > 0.6 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {a.hazard_exposure_label} ({(a.route_risk_score * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 max-w-xs truncate font-mono">
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
