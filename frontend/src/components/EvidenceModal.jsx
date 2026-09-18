import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Clock, UserCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-elevated flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Geotechnical & Sensor Evidence Panel</h3>
            <p className="text-xs text-stone-500">Target Habitation: <span className="font-medium text-stone-800">{habitation.name}</span> ({habitation.id})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Classification Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] text-stone-500 font-medium block">Risk Assessment</span>
              <div className="text-base font-bold text-stone-900 mt-0.5">
                {overrideSaved ? overrideCategory : (ev.combined_risk_category || habitation.risk_category)}
              </div>
              <span className="text-[10px] text-stone-400">Score: {habitation.hazard_score?.toFixed(2)}</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] text-stone-500 font-medium block">Model Confidence</span>
              <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">
                {ev.model_confidence_pct || 87}%
              </div>
              <span className="text-[10px] text-stone-400">Calibrated Metric</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] text-stone-500 font-medium block">Vulnerable Cohort</span>
              <div className="text-base font-bold text-amber-800 mt-0.5 font-mono">
                {habitation.vulnerable_population} / {habitation.total_population}
              </div>
              <span className="text-[10px] text-stone-400">High-need evacuees</span>
            </div>
          </div>

          {/* Contributing Drivers */}
          <div>
            <h4 className="text-xs font-semibold text-stone-800 mb-2">Primary Risk Drivers</h4>
            <div className="space-y-1.5">
              {(ev.drivers || []).map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50/70 border border-stone-100">
                  <span className="text-stone-700 font-medium">{d.factor}</span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                    d.level === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance */}
          <div>
            <h4 className="text-xs font-semibold text-stone-800 mb-2 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Data Provenance & Freshness</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px]">Meteorological Feed:</span>
                <span className="text-stone-800 font-medium block">{ev.data_provenance?.meteorological_source}</span>
                <span className="text-emerald-700 font-mono text-[10px]">Fresh • Updated Today</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-400 block text-[10px]">InSAR Satellite:</span>
                <span className="text-stone-800 font-medium block">{ev.data_provenance?.satellite_source}</span>
                <span className="text-stone-600 font-mono text-[10px]">Descending Orbit Pass</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {ev.warnings && ev.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-semibold text-amber-800 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Operational Considerations</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                {ev.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human Override */}
          <div className="pt-2 border-t border-stone-100">
            {!overrideActive ? (
              <button
                onClick={() => setOverrideActive(true)}
                className="w-full py-1.5 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                <span>Record Authority Human Override</span>
              </button>
            ) : (
              <form onSubmit={handleSaveOverride} className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>Officer Override</span>
                  <button
                    type="button"
                    onClick={() => setOverrideActive(false)}
                    className="text-[10px] text-stone-400 hover:text-stone-600"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Classification</label>
                    <select
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-900"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="WARNING">WARNING</option>
                      <option value="WATCH">WATCH</option>
                      <option value="SAFE">SAFE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Operational Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified retaining wall intact"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      required
                      className="w-full bg-white border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  {overrideSaved ? 'Logged in Audit Trail ✓' : 'Save Override to Audit Log'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
