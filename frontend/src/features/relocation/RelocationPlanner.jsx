import React, { useState, useEffect } from 'react';
import { Navigation2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
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
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Constrained Relocation Optimization Planner</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Deterministic NetworkX solver enforcing shelter capacity limits and detour route safety
          </p>
        </div>

        {/* Strategy Segmented Selector */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
          {['BALANCED', 'SAFEST', 'FASTEST'].map((strat) => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                strategy === strat
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {strat}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Metrics Row */}
      {plan && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
            <span className="text-[11px] text-stone-500 block">Target Evacuees</span>
            <div className="text-xl font-bold text-stone-900 mt-1 font-mono">{plan.total_targeted_evacuees?.toLocaleString()}</div>
            <span className="text-[10px] text-stone-400">Critical & high-risk</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
            <span className="text-[11px] text-stone-500 block">Assigned Evacuees</span>
            <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">{plan.total_assigned?.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600">Within safe capacities</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
            <span className="text-[11px] text-stone-500 block">Unassigned Deficit</span>
            <div className="text-xl font-bold text-stone-700 mt-1 font-mono">{plan.total_unassigned?.toLocaleString()}</div>
            <span className="text-[10px] text-stone-400">Bottleneck spillovers</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
            <span className="text-[11px] text-stone-500 block">Avg Transit Time</span>
            <div className="text-xl font-bold text-stone-900 mt-1 font-mono">{plan.average_travel_time_min} min</div>
            <span className="text-[10px] text-stone-400">{strategy} profile</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-card">
            <span className="text-[11px] text-stone-500 block">Avg Hazard Exposure</span>
            <div className="text-xl font-bold text-stone-900 mt-1 font-mono">{(plan.average_route_risk * 100).toFixed(0)}%</div>
            <span className="text-[10px] text-stone-400">Corridor risk score</span>
          </div>
        </div>
      )}

      {/* Manifest Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-stone-900">Evacuation Assignment Manifest</h3>
            <p className="text-[11px] text-stone-500">Origin to shelter allocation matrix and transit times</p>
          </div>
          <button
            onClick={runOptimization}
            className="flex items-center space-x-1 text-xs text-stone-600 hover:text-stone-900 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-medium text-[11px]">
              <tr>
                <th className="py-3 px-4">Origin Habitation</th>
                <th className="py-3 px-4">Assigned Shelter</th>
                <th className="py-3 px-4">Allocated Population</th>
                <th className="py-3 px-4">Est. Travel Time</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Route Risk</th>
                <th className="py-3 px-4">Corridor Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-400">Solving constrained optimization...</td>
                </tr>
              ) : plan?.assignments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-400">No active evacuation assignments.</td>
                </tr>
              ) : (
                plan?.assignments?.map((a, i) => (
                  <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {a.habitation_name}
                      <span className="text-[10px] font-mono text-stone-400 block">{a.habitation_id}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-800">
                      {a.shelter_name}
                      <span className="text-[10px] font-mono text-stone-400 block">{a.shelter_id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">
                      {a.allocated_population.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-800">
                      {a.travel_time_min} min
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-500">
                      {a.distance_km} km
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        a.route_risk_score > 0.6 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {a.hazard_exposure_label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-500">
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
