import React, { useState } from 'react';
import { Cpu, Play, RefreshCcw, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

export default function ResQTwinSimulator() {
  const [blockRoadR17, setBlockRoadR17] = useState(true);
  const [disableShelterS3, setDisableShelterS3] = useState(false);
  const [rainfallSpike, setRainfallSpike] = useState(50);
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
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-mono text-cyan-400">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              CORE INNOVATION • SIH26191
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">COUNTERFACTUAL ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">ResQ Twin — Adaptive Relocation Digital Twin</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic scenario simulator modeling infrastructure shocks, road closures, and humanitarian resource displacement deltas.
          </p>
        </div>
      </div>

      {/* Scenario Control Console */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-5 font-mono">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              COUNTERFACTUAL SCENARIO INJECTION CONTROLS
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Perturb network corridors, facility capacities, or weather variables to stress-test system resilience.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Var 1: Block R17 */}
          <div className="p-4 rounded-xl bg-[#131A2B] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Block Road R17</label>
              <input
                type="checkbox"
                checked={blockRoadR17}
                onChange={(e) => setBlockRoadR17(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-[#0B0F17] border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Joshimath-Marwari Descent (ROAD-014) blocked by landslide.
            </p>
          </div>

          {/* Var 2: Shelter S3 Closure */}
          <div className="p-4 rounded-xl bg-[#131A2B] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Disable Helang Shelter</label>
              <input
                type="checkbox"
                checked={disableShelterS3}
                onChange={(e) => setDisableShelterS3(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-[#0B0F17] border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Structural fissures take Helang Facility (S3) offline.
            </p>
          </div>

          {/* Var 3: Rainfall Spike */}
          <div className="p-4 rounded-xl bg-[#131A2B] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Rainfall Surge</label>
              <span className="text-[11px] font-bold text-amber-400">+{rainfallSpike}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={rainfallSpike}
              onChange={(e) => setRainfallSpike(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0B0F17] rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[10px] text-slate-400">Triggers Alaknanda flash flood buffer expansion.</p>
          </div>

          {/* Var 4: Resource Bottleneck Cut */}
          <div className="p-4 rounded-xl bg-[#131A2B] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">50% Water Failure</label>
              <input
                type="checkbox"
                checked={cutWaterPipalkoti}
                onChange={(e) => setCutWaterPipalkoti(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-[#0B0F17] border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Pipalkoti College water supply drops, cutting capacity in half.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex justify-end pt-1">
          <button
            onClick={executeSimulation}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono flex items-center space-x-2 shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : 'fill-slate-950'}`} />
            <span>{running ? 'CALCULATING DIGITAL TWIN DELTAS...' : 'EXECUTE COUNTERFACTUAL SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results: BASELINE -> WHAT-IF -> DIFFERENCE */}
      {simulation && (
        <div className="space-y-5 font-mono">
          {/* Operational Narrative Card */}
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-glow-cyan/20 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIMULATED OPERATIONAL IMPACT SUMMARY</span>
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {simulation.delta?.operational_narrative}
            </p>
          </div>

          {/* 3-Column Comparative Board: BASELINE -> WHAT-IF -> DELTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1: BASELINE */}
            <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-3">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[10px] text-slate-400 uppercase block">Original State</span>
                <h4 className="font-bold text-white text-sm">Baseline Benchmark</h4>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Evacuees:</span>
                  <span className="font-bold text-white">{simulation.baseline?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Transit Time:</span>
                  <span className="font-bold text-white">{simulation.baseline?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Hazard Index:</span>
                  <span className="font-bold text-white">{(simulation.baseline?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmet Headcount:</span>
                  <span className="font-bold text-white">{simulation.baseline?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 2: WHAT-IF SIMULATION */}
            <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-amber-500/40 shadow-2xl space-y-3">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[10px] text-amber-400 uppercase block">Perturbed Shock State</span>
                <h4 className="font-bold text-amber-300 text-sm">Shock-Adapted Scenario</h4>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Evacuees:</span>
                  <span className="font-bold text-white">{simulation.what_if?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Transit Time:</span>
                  <span className="font-bold text-amber-400">{simulation.what_if?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Hazard Index:</span>
                  <span className="font-bold text-white">{(simulation.what_if?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmet Headcount:</span>
                  <span className="font-bold text-rose-400">{simulation.what_if?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 3: DIFFERENCE / DELTA */}
            <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-cyan-500/40 shadow-glow-cyan/20 space-y-3">
              <div className="border-b border-white/10 pb-2">
                <span className="text-[10px] text-cyan-400 uppercase block">Differential Analysis</span>
                <h4 className="font-bold text-cyan-300 text-sm">Calculated Impact Delta</h4>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reassigned Citizens:</span>
                  <span className="font-extrabold text-white">
                    +{simulation.delta?.reassigned_people_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Shift:</span>
                  <span className="font-extrabold text-amber-400">
                    {simulation.delta?.travel_time_delta_min > 0 ? '+' : ''}{simulation.delta?.travel_time_delta_min} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hazard Shift:</span>
                  <span className="font-extrabold text-white">
                    {simulation.delta?.route_risk_delta > 0 ? '+' : ''}{(simulation.delta?.route_risk_delta * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity Deficit:</span>
                  <span className="font-extrabold text-rose-400">
                    +{simulation.delta?.unmet_demand_delta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shelter Load Deltas Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 shadow-2xl space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              FACILITY REDISTRIBUTION & BOTTLENECK STRESS MATRIX
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131A2B]/80 border-b border-white/10 text-slate-400 font-medium text-[11px]">
                  <tr>
                    <th className="py-3 px-3">SHELTER NODE</th>
                    <th className="py-3 px-3">BASELINE LOAD</th>
                    <th className="py-3 px-3">WHAT-IF LOAD</th>
                    <th className="py-3 px-3">NET SHIFT</th>
                    <th className="py-3 px-3">LIMITING RESOURCE</th>
                    <th className="py-3 px-3">OPERATIONAL STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {simulation.delta?.shelter_load_deltas?.map((s) => (
                    <tr key={s.shelter_id} className="hover:bg-[#131A2B]/70 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.baseline_occupancy}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{s.what_if_occupancy}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${s.delta_people > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {s.delta_people > 0 ? '+' : ''}{s.delta_people} ({s.percentage_point_load_change > 0 ? '+' : ''}{s.percentage_point_load_change}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-cyan-300">{s.new_bottleneck}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300 border border-white/10 font-bold">
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
