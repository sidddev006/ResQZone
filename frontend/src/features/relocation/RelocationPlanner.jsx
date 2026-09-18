import React, { useState, useEffect } from 'react';
import { Navigation2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Zap } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
            <Navigation2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Constrained Relocation Optimization Engine</h2>
            <p className="text-xs text-slate-400">
              Deterministic NetworkX solver enforcing shelter capacity & route hazard constraints
            </p>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 pl-2 pr-1 uppercase">Objective:</span>
          {['BALANCED', 'SAFEST', 'FASTEST'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                strategy === strat
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {strat}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights of Plan */}
      {plan && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block uppercase">Targeted Evacuees</span>
            <div className="text-2xl font-black text-white mt-1">{plan.total_targeted_evacuees?.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400">Critical & high-risk</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
            <span className="text-[11px] text-emerald-400 block uppercase">Assigned to Shelters</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{plan.total_assigned?.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-300 font-semibold">100% within safe capacity</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block uppercase">Unassigned Deficit</span>
            <div className="text-2xl font-black text-slate-300 mt-1">{plan.total_unassigned?.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400">Bottleneck spillovers</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block uppercase">Avg Travel Time</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{plan.average_travel_time_min} min</div>
            <span className="text-[10px] text-slate-400">{strategy} routing profile</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block uppercase">Avg Hazard Exposure</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{(plan.average_route_risk * 100).toFixed(0)}%</div>
            <span className="text-[10px] text-slate-400">Route risk weight</span>
          </div>
        </div>
      )}

      {/* Relocation Manifest Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Evacuation Assignment Manifest</h3>
            <p className="text-xs text-slate-400">Habitation origin to destination shelter routing allocations</p>
          </div>
          <button
            onClick={runOptimization}
            className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Origin Habitation</th>
                <th className="py-3 px-4">Assigned Shelter</th>
                <th className="py-3 px-4">Allocated Population</th>
                <th className="py-3 px-4">Est. Travel Time</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Route Risk</th>
                <th className="py-3 px-4">Corridor Nodes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Solving constrained optimization...</td>
                </tr>
              ) : plan?.assignments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No active evacuation assignments.</td>
                </tr>
              ) : (
                plan?.assignments?.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {a.habitation_name}
                      <span className="text-[10px] font-mono text-slate-400 block">{a.habitation_id}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-400">
                      {a.shelter_name}
                      <span className="text-[10px] font-mono text-slate-400 block">{a.shelter_id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {a.allocated_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-300">
                      {a.travel_time_min} min
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {a.distance_km} km
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.route_risk_score > 0.6 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {a.hazard_exposure_label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
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
