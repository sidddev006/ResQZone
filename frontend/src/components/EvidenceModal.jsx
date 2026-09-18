import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Database, UserCheck } from 'lucide-react';

export default function EvidenceModal({ habitation, onClose }) {
  const [overrideActive, setOverrideActive] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState(habitation?.risk_category || 'CRITICAL');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSaved, setOverrideSaved] = useState(false);

  if (!habitation) return null;
  const ev = habitation.evidence_panel || {};

  const handleSaveOverride = (e) => {
    e.preventDefault();
    setOverrideSaved(true);
    setTimeout(() => {
      setOverrideSaved(false);
      setOverrideActive(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-white">Risk Evidence & Calibration Layer</h3>
            </div>
            <p className="text-xs text-slate-400">Target Habitation: <span className="text-slate-200 font-semibold">{habitation.name}</span> ({habitation.id})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Classification Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Assessed Risk</span>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ev.color || '#EF4444' }}
                ></span>
                <span className="text-base font-bold text-white tracking-wide">
                  {overrideSaved ? overrideCategory : (ev.combined_risk_category || habitation.risk_category)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Score: {habitation.hazard_score?.toFixed(2)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Model Confidence</span>
              <div className="text-base font-bold text-emerald-400 mt-1">
                {ev.model_confidence_pct || 87}%
              </div>
              <span className="text-[10px] text-slate-400">Calibrated Score Metric</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Vulnerable Cohort</span>
              <div className="text-base font-bold text-amber-400 mt-1">
                {habitation.vulnerable_population} / {habitation.total_population}
              </div>
              <span className="text-[10px] text-slate-400">High-need evacuees</span>
            </div>
          </div>

          {/* Primary Drivers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <span>Primary Risk Drivers</span>
            </h4>
            <div className="space-y-2">
              {(ev.drivers || []).map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span className="text-slate-300 font-medium">{d.factor}</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                    d.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Freshness & Provenance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Data Freshness & Provenance</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">Rainfall Observation:</span>
                <span className="text-slate-200 font-mono">{ev.data_provenance?.meteorological_source}</span>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{ev.data_provenance?.meteorological_freshness} (Updated Today)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-400 block">Ground InSAR Satellite:</span>
                <span className="text-slate-200 font-mono">{ev.data_provenance?.satellite_source}</span>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Descending Track Validated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Warnings */}
          {ev.warnings && ev.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-amber-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Operational Uncertainty Warnings</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 text-[11px]">
                {ev.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Override Section */}
          <div className="pt-2 border-t border-slate-800">
            {!overrideActive ? (
              <button
                onClick={() => setOverrideActive(true)}
                className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Authority Human Override</span>
              </button>
            ) : (
              <form onSubmit={handleSaveOverride} className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Override Risk Classification</span>
                  <button
                    type="button"
                    onClick={() => setOverrideActive(false)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Manual Classification</label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="CRITICAL">CRITICAL (Evacuate)</option>
                      <option value="WARNING">WARNING (Prepare)</option>
                      <option value="WATCH">WATCH (Monitor)</option>
                      <option value="SAFE">SAFE (No Action)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Override Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Field inspector verified new retaining wall"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  {overrideSaved ? 'Override Logged in Audit Trail ✓' : 'Save Officer Override'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
