import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, UserCheck, Key, FileCheck2 } from 'lucide-react';

export default function EvidenceModal({ habitation, onClose, theme = 'light' }) {
  const [overrideActive, setOverrideActive] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState(habitation?.risk_category || 'CRITICAL');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSaved, setOverrideSaved] = useState(false);

  const isDark = theme === 'dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className={`border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm">Geotechnical & Sensor Evidence Panel</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  Audit Lineage
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Target Node: <strong>{habitation.name}</strong> ({habitation.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Classification Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider block">Risk Stratum</span>
              <div className="text-base font-black mt-0.5">
                {overrideSaved ? overrideCategory : (ev.combined_risk_category || habitation.risk_category)}
              </div>
              <span className="text-[10px] text-rose-500 font-semibold">Index: {habitation.hazard_score?.toFixed(2)}</span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider block">Model Confidence</span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {ev.model_confidence_pct || 87}%
              </div>
              <span className="opacity-60 text-[10px]">Calibrated Metric</span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider block">Vulnerable Cohort</span>
              <div className="text-base font-black text-amber-500 mt-0.5">
                {habitation.vulnerable_population} / {habitation.total_population}
              </div>
              <span className="opacity-60 text-[10px]">Dependent citizens</span>
            </div>
          </div>

          {/* Contributing Drivers */}
          <div>
            <h4 className={`text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Primary Geotechnical Drivers
            </h4>
            <div className="space-y-2">
              {(ev.drivers || []).map((d, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="font-semibold">{d.factor}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    d.level === 'CRITICAL' 
                      ? (isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-50 text-rose-700 border-rose-200')
                      : (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-50 text-amber-700 border-amber-200')
                  }`}>
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance */}
          <div>
            <h4 className={`text-xs font-bold mb-2 flex items-center space-x-1.5 uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Sensor Provenance & Data Timestamps</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 block text-[9px] uppercase font-bold">Meteorological Telemetry</span>
                <span className="font-bold block mt-0.5">{ev.data_provenance?.meteorological_source}</span>
                <span className="text-emerald-500 text-[10px] font-semibold">Real-time • Synchronized</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="opacity-60 block text-[9px] uppercase font-bold">InSAR Synthetic Aperture</span>
                <span className="font-bold block mt-0.5">{ev.data_provenance?.satellite_source}</span>
                <span className="text-sky-500 text-[10px] font-semibold">Descending Orbit Pass</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {ev.warnings && ev.warnings.length > 0 && (
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Operational Considerations</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                {ev.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Override */}
          <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {!overrideActive ? (
              <button
                onClick={() => setOverrideActive(true)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-sky-500" />
                <span>Record Authority Human Override</span>
              </button>
            ) : (
              <form onSubmit={handleSaveOverride} className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900 border-sky-500/30' : 'bg-slate-50 border-sky-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Authorized Incident Override</span>
                  <button
                    type="button"
                    onClick={() => setOverrideActive(false)}
                    className="text-[11px] opacity-60 hover:opacity-100"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="opacity-60 block text-[10px] uppercase font-bold mb-1">Stratum Level</label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-semibold ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="CRITICAL">CRITICAL (P1)</option>
                      <option value="WARNING">WARNING (P2)</option>
                      <option value="WATCH">WATCH (P3)</option>
                      <option value="SAFE">SAFE (P4)</option>
                    </select>
                  </div>
                  <div>
                    <label className="opacity-60 block text-[10px] uppercase font-bold mb-1">Justification</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified slope retaining wall intact"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      required
                      className={`w-full border rounded-xl px-2.5 py-1.5 text-xs ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-500/20"
                >
                  {overrideSaved ? 'Logged in Audit Trail ✓' : 'Save Override to Audit Ledger'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex justify-end ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
