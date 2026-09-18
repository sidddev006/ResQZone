import React, { useState } from 'react';
import { Cpu, Play, RefreshCcw, ArrowRight, AlertTriangle, ShieldCheck, Zap, Layers, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

export default function ResQTwinSimulator({ 
  selectedRegion = 'ALL', 
  currentRegionObj,
  theme = 'light' 
}) {
  const [blockRoadR17, setBlockRoadR17] = useState(true);
  const [disableShelterS3, setDisableShelterS3] = useState(false);
  const [rainfallSpike, setRainfallSpike] = useState(50);
  const [cutWaterPipalkoti, setCutWaterPipalkoti] = useState(false);
  const [strategy, setStrategy] = useState('BALANCED');

  const [simulation, setSimulation] = useState(null);
  const [running, setRunning] = useState(false);

  const isDark = theme === 'dark';

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
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">DIGITAL TWIN SIMULATION ENGINE</span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-500">COUNTERFACTUAL STRESS TESTING</span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ResQ Twin — Adaptive Relocation Digital Twin
          </h2>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Simulate real-world cascading disaster shocks (cloudburst rainfall spikes, structural road breaches, shelter resource failures) and compare deltas against baseline.
          </p>
        </div>
      </div>

      {/* Scenario Control Console */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm space-y-5 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div className={`border-b pb-3 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Counterfactual Shock Injection Controls
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Perturb network corridors, facility capacities, or weather variables to stress-test system resilience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Var 1: Block Arterial Road */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Block Key Highway</label>
              <input
                type="checkbox"
                checked={blockRoadR17}
                onChange={(e) => setBlockRoadR17(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className={`text-[11px] leading-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Main arterial highway blocked by active debris avalanche.
            </p>
          </div>

          {/* Var 2: Disable Shelter */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Disable Primary Shelter</label>
              <input
                type="checkbox"
                checked={disableShelterS3}
                onChange={(e) => setDisableShelterS3(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className={`text-[11px] leading-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ground fissure damage forces relief facility offline.
            </p>
          </div>

          {/* Var 3: Rainfall Surge */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Monsoon Rainfall Surge</label>
              <span className="text-xs font-extrabold text-amber-500">+{rainfallSpike}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={rainfallSpike}
              onChange={(e) => setRainfallSpike(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Triggers river flash flood buffer expansion.</p>
          </div>

          {/* Var 4: 50% Water Supply Failure */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>50% Water Failure</label>
              <input
                type="checkbox"
                checked={cutWaterPipalkoti}
                onChange={(e) => setCutWaterPipalkoti(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </div>
            <p className={`text-[11px] leading-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Municipal pipeline rupture cuts water supply in half.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex justify-end pt-1">
          <button
            onClick={executeSimulation}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : 'fill-white'}`} />
            <span>{running ? 'Calculating Digital Twin Deltas...' : 'Execute Counterfactual Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results: BASELINE -> WHAT-IF -> DIFFERENCE */}
      {simulation && (
        <div className="space-y-5">
          {/* Operational Narrative Card */}
          <div className={`p-5 rounded-2xl border shadow-sm space-y-1.5 ${
            isDark ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50 border-sky-200'
          }`}>
            <span className="text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Simulated Operational Impact Summary</span>
            </span>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {simulation.delta?.operational_narrative}
            </p>
          </div>

          {/* 3-Column Comparative Board: BASELINE -> WHAT-IF -> DELTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Col 1: BASELINE */}
            <div className={`p-5 rounded-3xl border space-y-3 shadow-sm ${
              isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
            }`}>
              <div className={`border-b pb-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className="text-[10px] opacity-60 uppercase tracking-wider font-bold block">Original State</span>
                <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Baseline Benchmark</h4>
              </div>
              <div className={`space-y-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="flex justify-between">
                  <span className="opacity-70">Assigned Evacuees:</span>
                  <span className="font-bold">{simulation.baseline?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Avg Transit Time:</span>
                  <span className="font-bold">{simulation.baseline?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Route Hazard Index:</span>
                  <span className="font-bold">{(simulation.baseline?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Unmet Headcount:</span>
                  <span className="font-bold">{simulation.baseline?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 2: WHAT-IF SIMULATION */}
            <div className={`p-5 rounded-3xl border space-y-3 shadow-sm ${
              isDark ? 'bg-[#0F172A] border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className={`border-b pb-2.5 ${isDark ? 'border-slate-800' : 'border-amber-200'}`}>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold block">Perturbed Shock State</span>
                <h4 className="font-bold text-amber-700 dark:text-amber-300 text-base">Shock-Adapted Scenario</h4>
              </div>
              <div className={`space-y-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-amber-900'}`}>
                <div className="flex justify-between">
                  <span className="opacity-70">Assigned Evacuees:</span>
                  <span className="font-bold">{simulation.what_if?.total_assigned?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Avg Transit Time:</span>
                  <span className="font-bold">{simulation.what_if?.average_travel_time_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Route Hazard Index:</span>
                  <span className="font-bold">{(simulation.what_if?.average_route_risk * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Unmet Headcount:</span>
                  <span className="font-bold">{simulation.what_if?.total_unassigned}</span>
                </div>
              </div>
            </div>

            {/* Col 3: DELTA & SHOCK IMPACT */}
            <div className={`p-5 rounded-3xl border space-y-3 shadow-sm ${
              isDark ? 'bg-[#0F172A] border-rose-500/30' : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className={`border-b pb-2.5 ${isDark ? 'border-slate-800' : 'border-rose-200'}`}>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-bold block">Differential Impact</span>
                <h4 className="font-bold text-rose-700 dark:text-rose-300 text-base">Stress Delta</h4>
              </div>
              <div className={`space-y-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-rose-900'}`}>
                <div className="flex justify-between">
                  <span className="opacity-70">Displaced Deficit:</span>
                  <span className="font-bold text-rose-600">+{simulation.delta?.additional_unassigned_evacuees} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Transit Delay:</span>
                  <span className="font-bold text-amber-600">+{simulation.delta?.travel_time_delta_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Bottleneck Factor:</span>
                  <span className="font-bold uppercase">{simulation.delta?.bottleneck_resource_identified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Detour Burden:</span>
                  <span className="font-bold">{simulation.delta?.detour_burden_km?.toFixed(1)} km extra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
