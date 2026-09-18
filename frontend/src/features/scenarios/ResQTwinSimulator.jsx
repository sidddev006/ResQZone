import React, { useState } from 'react';
import { Cpu, Play, RefreshCcw, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, TrendingUp } from 'lucide-react';
import { api } from '../../api/client';

export default function ResQTwinSimulator() {
  // Scenario toggles & sliders
  const [blockRoadR17, setBlockRoadR17] = useState(true);
  const [disableShelterS3, setDisableShelterS3] = useState(false);
  const [rainfallSpike, setRainfallSpike] = useState(50); // +50%
  const [cutWaterPipalkoti, setCutWaterPipalkoti] = useState(false);
  const [strategy, setStrategy] = useState('BALANCED');

  const [simulation, setSimulation] = useState(null);
  const [running, setRunning] = useState(false);

  const executeSimulation = async () => {
    try {
      setRunning(true);
      const blockedRoads = [];
      if (blockRoadR17) blockedRoads.push('ROAD-014'); // Joshimath-Marwari Descent (R17)

      const disabledShelters = [];
      if (disableShelterS3) disabledShelters.push('SHELTER-03'); // Helang Community Shelter

      const capFactors = {};
      if (cutWaterPipalkoti) capFactors['SHELTER-01'] = 0.5;

      const res = await api.simulateResQTwin({
        blocked_road_ids: blockedRoads,
        disabled_shelter_ids: disabledShelters,
        capacity_reduction_factors: capFactors,
        rainfall_spike_pct: rainfallSpike,
        strategy: strategy
      });
      setSimulation(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">ResQ Twin — Adaptive Relocation Digital Twin</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                FLAGSHIP INNOVATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic What-If scenario engine. Simulates infrastructure failures and generates multi-resource reallocation deltas.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive What-If Scenario Control Console */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Counterfactual Perturbation Variables</span>
          </h3>
          <span className="text-xs text-slate-400">Modify one or more operational constraints</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Var 1: Block R17 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Road R17 Blocked</label>
              <input
                type="checkbox"
                checked={blockRoadR17}
                onChange={(e) => setBlockRoadR17(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Joshimath-Marwari Descent (ROAD-014) blocked by rockfall debris.
            </p>
          </div>

          {/* Var 2: Shelter S3 Closure */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Close Helang Shelter (S3)</label>
              <input
                type="checkbox"
                checked={disableShelterS3}
                onChange={(e) => setDisableShelterS3(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Structural damage takes Helang Community Shelter offline.
            </p>
          </div>

          {/* Var 3: Rainfall Spike */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Rainfall Spike (+{rainfallSpike}%)</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">+{rainfallSpike}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={rainfallSpike}
              onChange={(e) => setRainfallSpike(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400">Expands hazard red zones and triggers critical thresholds.</p>
          </div>

          {/* Var 4: Resource Bottleneck Cut */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">50% Water Supply Drop</label>
              <input
                type="checkbox"
                checked={cutWaterPipalkoti}
                onChange={(e) => setCutWaterPipalkoti(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Pipalkoti College water supply cut; water becomes primary bottleneck.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex justify-end pt-2">
          <button
            onClick={executeSimulation}
            disabled={running}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : 'fill-slate-950'}`} />
            <span>{running ? 'Running ResQ Twin Simulation...' : 'Execute What-If Digital Twin Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results: BASELINE -> WHAT-IF -> DIFFERENCE */}
      {simulation && (
        <div className="space-y-6">
          {/* Operational Narrative Card */}
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-xl space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">ResQ Twin Adaptive Reallocation Narrative</h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed font-medium">
              {simulation.delta?.operational_narrative}
            </p>
          </div>

          {/* 3-Column Comparative Board: BASELINE -> WHAT-IF -> DELTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1: BASELINE */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Baseline State</span>
                <h4 className="font-bold text-white text-base">Original Optimal Plan</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Assigned:</span>
                  <span className="font-bold font-mono text-white">{simulation.baseline?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Travel Time:</span>
                  <span className="font-bold font-mono text-white">{simulation.baseline?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Route Risk:</span>
                  <span className="font-bold font-mono text-white">{(simulation.baseline?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmet Evacuees:</span>
                  <span className="font-bold font-mono text-emerald-400">{simulation.baseline?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 2: WHAT-IF SIMULATION */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">What-If Simulation</span>
                <h4 className="font-bold text-amber-300 text-base">Perturbed Adaptive Plan</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Assigned:</span>
                  <span className="font-bold font-mono text-white">{simulation.what_if?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Travel Time:</span>
                  <span className="font-bold font-mono text-white">{simulation.what_if?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Route Risk:</span>
                  <span className="font-bold font-mono text-white">{(simulation.what_if?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmet Deficit:</span>
                  <span className="font-bold font-mono text-red-400">{simulation.what_if?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 3: DIFFERENCE / DELTA */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Difference Analysis</span>
                <h4 className="font-bold text-emerald-400 text-base">Calculated Operational Delta</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reassigned People:</span>
                  <span className="font-bold font-mono text-indigo-300">
                    +{simulation.delta?.reassigned_people_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Travel Time Delta:</span>
                  <span className="font-bold font-mono text-amber-400">
                    {simulation.delta?.travel_time_delta_min > 0 ? '+' : ''}{simulation.delta?.travel_time_delta_min} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Hazard Delta:</span>
                  <span className="font-bold font-mono text-white">
                    {simulation.delta?.route_risk_delta > 0 ? '+' : ''}{(simulation.delta?.route_risk_delta * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity Deficit Delta:</span>
                  <span className="font-bold font-mono text-red-400">
                    +{simulation.delta?.unmet_demand_delta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shelter Load Deltas Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Shelter Occupancy Redistribution & Bottlenecks
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Shelter Name</th>
                    <th className="py-2.5 px-3">Baseline Load</th>
                    <th className="py-2.5 px-3">What-If Load</th>
                    <th className="py-2.5 px-3">Net Load Delta</th>
                    <th className="py-2.5 px-3">Bottleneck Resource</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {simulation.delta?.shelter_load_deltas?.map((s) => (
                    <tr key={s.shelter_id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono">{s.baseline_occupancy}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{s.what_if_occupancy}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={s.delta_people > 0 ? 'text-amber-400' : (s.delta_people < 0 ? 'text-blue-400' : 'text-slate-400')}>
                          {s.delta_people > 0 ? '+' : ''}{s.delta_people} ({s.percentage_point_load_change > 0 ? '+' : ''}{s.percentage_point_load_change}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-amber-300 font-mono">{s.new_bottleneck}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
