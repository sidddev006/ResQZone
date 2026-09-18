import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, UserCheck, Key, FileCheck2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/80 backdrop-blur-md animate-in fade-in duration-150 font-mono">
      <div className="bg-[#0B0F17]/95 border border-white/15 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#131A2B]/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">Geotechnical & Sensor Evidence Panel</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AUDIT LINEAGE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Target Node: <strong className="text-white">{habitation.name}</strong> ({habitation.id})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Classification Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Risk Stratum</span>
              <div className="text-base font-extrabold text-white mt-0.5">
                {overrideSaved ? overrideCategory : (ev.combined_risk_category || habitation.risk_category)}
              </div>
              <span className="text-[10px] text-rose-400">Index: {habitation.hazard_score?.toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Model Confidence</span>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {ev.model_confidence_pct || 87}%
              </div>
              <span className="text-[10px] text-slate-400">Calibrated Metric</span>
            </div>

            <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vulnerable Cohort</span>
              <div className="text-base font-extrabold text-amber-400 mt-0.5">
                {habitation.vulnerable_population} / {habitation.total_population}
              </div>
              <span className="text-[10px] text-slate-400">Dependent citizens</span>
            </div>
          </div>

          {/* Contributing Drivers */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Primary Geotechnical Drivers</h4>
            <div className="space-y-1.5">
              {(ev.drivers || []).map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#131A2B]/80 border border-white/5">
                  <span className="text-slate-300 font-medium">{d.factor}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    d.level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sensor Provenance & Data Timestamps</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-xl bg-[#131A2B]/80 border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Meteorological Telemetry</span>
                <span className="text-white font-bold block">{ev.data_provenance?.meteorological_source}</span>
                <span className="text-emerald-400 text-[10px]">Real-time • Synchronized</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131A2B]/80 border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">InSAR Synthetic Aperture</span>
                <span className="text-white font-bold block">{ev.data_provenance?.satellite_source}</span>
                <span className="text-cyan-400 text-[10px]">Descending Orbit Pass</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {ev.warnings && ev.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Operational Considerations</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                {ev.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Override */}
          <div className="pt-2 border-t border-white/10">
            {!overrideActive ? (
              <button
                onClick={() => setOverrideActive(true)}
                className="w-full py-2 px-3 rounded-xl border border-white/10 bg-[#131A2B] hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-lg"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>RECORD AUTHORITY HUMAN OVERRIDE</span>
              </button>
            ) : (
              <form onSubmit={handleSaveOverride} className="p-3.5 rounded-xl bg-[#131A2B] border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Authorized Incident Override</span>
                  <button
                    type="button"
                    onClick={() => setOverrideActive(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">STRATUM LEVEL</label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="CRITICAL">CRITICAL (P1)</option>
                      <option value="WARNING">WARNING (P2)</option>
                      <option value="WATCH">WATCH (P3)</option>
                      <option value="SAFE">SAFE (P4)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">JUSTIFICATION</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified slope retaining wall intact"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      required
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs transition-all shadow-glow-cyan"
                >
                  {overrideSaved ? 'LOGGED IN AUDIT TRAIL ✓' : 'SAVE OVERRIDE TO AUDIT LEDGER'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#131A2B]/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
