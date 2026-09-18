import React, { useState } from 'react';
import { Cpu, Play, RefreshCcw, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

export default function ResQTwinSimulator({ selectedRegion = 'ALL', currentRegionObj }) {
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
      if (blockRoadR17) blockedRoads.push('ROAD-01');

      const disabledShelters = [];
      if (disableShelterS3) disabledShelters.push('SH-02');

      const capFactors = {};
      if (cutWaterPipalkoti) capFactors['SH-01'] = 0.5;

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="p-6 sm:p-7 rounded-3xl eleken-card border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-semibold tracking-wide">
            <span>DIGITAL TWIN SIMULATION ENGINE</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400">COUNTERFACTUAL STRESS TESTING</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">ResQ Twin — Adaptive Relocation Digital Twin</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate real-world cascading disaster shocks (cloudburst rainfall spikes, structural road breaches, shelter resource failures) and compare deltas against baseline.
          </p>
        </div>
      </div>

      {/* Scenario Control Console */}
      <div className="p-6 sm:p-7 rounded-3xl eleken-card border border-white/[0.08] shadow-2xl space-y-5">
        <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Counterfactual Shock Injection Controls
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Perturb network corridors, facility capacities, or weather variables to stress-test system resilience.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Var 1: Block Arterial Road */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Block Key Highway</label>
              <input
                type="checkbox"
                checked={blockRoadR17}
                onChange={(e) => setBlockRoadR17(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Main arterial highway blocked by active debris avalanche.
            </p>
          </div>

          {/* Var 2: Disable Shelter */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Disable Primary Shelter</label>
              <input
                type="checkbox"
                checked={disableShelterS3}
                onChange={(e) => setDisableShelterS3(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Ground fissure damage forces relief facility offline.
            </p>
          </div>

          {/* Var 3: Rainfall Surge */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Monsoon Rainfall Surge</label>
              <span className="text-xs font-bold text-amber-400">+{rainfallSpike}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={rainfallSpike}
              onChange={(e) => setRainfallSpike(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400">Triggers river flash flood buffer expansion.</p>
          </div>

          {/* Var 4: 50% Water Supply Failure */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">50% Water Failure</label>
              <input
                type="checkbox"
                checked={cutWaterPipalkoti}
                onChange={(e) => setCutWaterPipalkoti(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Municipal pipeline rupture cuts water supply in half.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex justify-end pt-1">
          <button
            onClick={executeSimulation}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : 'fill-slate-950'}`} />
            <span>{running ? 'Calculating Digital Twin Deltas...' : 'Execute Counterfactual Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results: BASELINE -> WHAT-IF -> DIFFERENCE */}
      {simulation && (
        <div className="space-y-5">
          {/* Operational Narrative Card */}
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 space-y-1.5">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulated Operational Impact Summary</span>
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {simulation.delta?.operational_narrative}
            </p>
          </div>

          {/* 3-Column Comparative Board: BASELINE -> WHAT-IF -> DELTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Col 1: BASELINE */}
            <div className="p-5 rounded-3xl eleken-card border border-white/[0.08] space-y-3">
              <div className="border-b border-white/[0.06] pb-2.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Original State</span>
                <h4 className="font-bold text-white text-base">Baseline Benchmark</h4>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
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
            <div className="p-5 rounded-3xl eleken-card border border-amber-500/30 space-y-3">
              <div className="border-b border-white/[0.06] pb-2.5">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block">Perturbed Shock State</span>
                <h4 className="font-bold text-amber-300 text-base">Shock-Adapted Scenario</h4>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Evacuees:</span>
                  <span className="font-bold text-amber-300">{simulation.what_if?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Transit Time:</span>
                  <span className="font-bold text-amber-300">{simulation.what_if?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route Hazard Index:</span>
                  <span className="font-bold text-amber-300">{(simulation.what_if?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unmet Headcount:</span>
                  <span className="font-bold text-amber-400">{simulation.what_if?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 3: DELTA & SHOCK IMPACT */}
            <div className="p-5 rounded-3xl eleken-card border border-rose-500/30 space-y-3">
              <div className="border-b border-white/[0.06] pb-2.5">
                <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold block">Differential Impact</span>
                <h4 className="font-bold text-rose-300 text-base">Stress Delta</h4>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Displaced Deficit:</span>
                  <span className="font-bold text-rose-400">+{simulation.delta?.additional_unassigned_evacuees} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Delay:</span>
                  <span className="font-bold text-amber-400">+{simulation.delta?.travel_time_delta_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bottleneck Factor:</span>
                  <span className="font-bold text-rose-300 uppercase">{simulation.delta?.bottleneck_resource_identified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Detour Burden:</span>
                  <span className="font-bold text-white">{simulation.delta?.detour_burden_km?.toFixed(1)} km extra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
