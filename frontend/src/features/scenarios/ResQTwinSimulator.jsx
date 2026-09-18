import React, { useState } from 'react';
import { Cpu, Play, RefreshCcw, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-200">
            Core Technical Differentiator
          </span>
        </div>
        <h2 className="text-base font-semibold text-stone-900">ResQ Twin — Adaptive Relocation Digital Twin</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Deterministic counterfactual scenario modeling. Evaluates infrastructure shocks and calculates multi-resource reallocation deltas.
        </p>
      </div>

      {/* Scenario Control Console */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
            Counterfactual Scenario Parameters
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">Perturb one or more network, facility, or weather variables to measure system resilience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Var 1: Block R17 */}
          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800">Block Road R17</label>
              <input
                type="checkbox"
                checked={blockRoadR17}
                onChange={(e) => setBlockRoadR17(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Joshimath-Marwari Descent (ROAD-014) blocked by slope debris.
            </p>
          </div>

          {/* Var 2: Shelter S3 Closure */}
          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800">Close Helang Shelter (S3)</label>
              <input
                type="checkbox"
                checked={disableShelterS3}
                onChange={(e) => setDisableShelterS3(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Structural damage takes Helang Shelter offline.
            </p>
          </div>

          {/* Var 3: Rainfall Spike */}
          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800">Rainfall Surge (+{rainfallSpike}%)</label>
              <span className="text-[11px] font-mono text-stone-900 font-medium">+{rainfallSpike}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={rainfallSpike}
              onChange={(e) => setRainfallSpike(Number(e.target.value))}
              className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <p className="text-[10px] text-stone-500">Expands hazard red zones and triggers critical thresholds.</p>
          </div>

          {/* Var 4: Resource Bottleneck Cut */}
          <div className="p-4 rounded-lg bg-stone-50/70 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800">50% Water Supply Drop</label>
              <input
                type="checkbox"
                checked={cutWaterPipalkoti}
                onChange={(e) => setCutWaterPipalkoti(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Pipalkoti College water bottleneck cuts safe capacity in half.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex justify-end pt-1">
          <button
            onClick={executeSimulation}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs flex items-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : 'fill-white'}`} />
            <span>{running ? 'Running Simulation...' : 'Execute What-If Digital Twin Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results: BASELINE -> WHAT-IF -> DIFFERENCE */}
      {simulation && (
        <div className="space-y-5">
          {/* Operational Narrative Card */}
          <div className="p-5 rounded-xl bg-stone-100 border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
              Calculated Simulation Narrative
            </span>
            <p className="text-xs text-stone-800 leading-relaxed">
              {simulation.delta?.operational_narrative}
            </p>
          </div>

          {/* 3-Column Comparative Board: BASELINE -> WHAT-IF -> DELTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Col 1: BASELINE */}
            <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Baseline State</span>
                <h4 className="font-semibold text-stone-900 text-sm">Original Optimal Plan</h4>
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Assigned Evacuees:</span>
                  <span className="font-mono font-medium text-stone-900">{simulation.baseline?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Travel Time:</span>
                  <span className="font-mono font-medium text-stone-900">{simulation.baseline?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Route Risk:</span>
                  <span className="font-mono font-medium text-stone-900">{(simulation.baseline?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Unmet Deficit:</span>
                  <span className="font-mono font-medium text-stone-900">{simulation.baseline?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 2: WHAT-IF SIMULATION */}
            <div className="p-5 rounded-xl bg-white border border-amber-200 shadow-card space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-[10px] font-mono text-amber-700 uppercase block">What-If Perturbed</span>
                <h4 className="font-semibold text-amber-900 text-sm">Shock-Adapted Plan</h4>
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Assigned Evacuees:</span>
                  <span className="font-mono font-medium text-stone-900">{simulation.what_if?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Travel Time:</span>
                  <span className="font-mono font-medium text-amber-800">{simulation.what_if?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Route Risk:</span>
                  <span className="font-mono font-medium text-stone-900">{(simulation.what_if?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Unmet Deficit:</span>
                  <span className="font-mono font-medium text-rose-600">{simulation.what_if?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 3: DIFFERENCE / DELTA */}
            <div className="p-5 rounded-xl bg-white border border-stone-900 shadow-card space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <span className="text-[10px] font-mono text-stone-500 uppercase block">Calculated Delta</span>
                <h4 className="font-semibold text-stone-900 text-sm">Net Operational Impact</h4>
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Reassigned People:</span>
                  <span className="font-mono font-bold text-stone-900">
                    +{simulation.delta?.reassigned_people_count?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Time Shift:</span>
                  <span className="font-mono font-bold text-amber-700">
                    {simulation.delta?.travel_time_delta_min > 0 ? '+' : ''}{simulation.delta?.travel_time_delta_min} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Route Hazard Shift:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {simulation.delta?.route_risk_delta > 0 ? '+' : ''}{(simulation.delta?.route_risk_delta * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity Deficit Shift:</span>
                  <span className="font-mono font-bold text-rose-600">
                    +{simulation.delta?.unmet_demand_delta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shelter Load Deltas Breakdown */}
          <div className="p-5 rounded-xl bg-white border border-stone-200/80 shadow-card space-y-3">
            <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Shelter Redistribution & Bottleneck Impacts
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-medium text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Shelter Name</th>
                    <th className="py-2.5 px-3">Baseline Load</th>
                    <th className="py-2.5 px-3">What-If Load</th>
                    <th className="py-2.5 px-3">Net Shift</th>
                    <th className="py-2.5 px-3">Bottleneck</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {simulation.delta?.shelter_load_deltas?.map((s) => (
                    <tr key={s.shelter_id} className="hover:bg-stone-50/40">
                      <td className="py-2.5 px-3 font-medium text-stone-900">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono">{s.baseline_occupancy}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">{s.what_if_occupancy}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={s.delta_people > 0 ? 'text-amber-800' : 'text-stone-500'}>
                          {s.delta_people > 0 ? '+' : ''}{s.delta_people} ({s.percentage_point_load_change > 0 ? '+' : ''}{s.percentage_point_load_change}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-stone-700">{s.new_bottleneck}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 font-medium border border-stone-200">
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
