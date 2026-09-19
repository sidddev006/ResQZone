import React, { useState, useEffect } from 'react';
import { 
  Activity, Database, CheckCircle2, AlertTriangle, Shield, History, 
  Clock, Radio, Server, Lock, Key, ShieldCheck, X, Check, Eye, EyeOff 
} from 'lucide-react';
import { api } from '../../api/client';

export default function SystemHealthView({ selectedRegion = 'ALL', theme = 'light' }) {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [keysStatus, setKeysStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Key Update Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [cartoKeyInput, setCartoKeyInput] = useState('');
  const [mapboxTokenInput, setMapboxTokenInput] = useState('');
  const [imdKeyInput, setImdKeyInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadData();
  }, [selectedRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcData, logData, keyData] = await Promise.all([
        api.getDataSources(),
        api.getAuditLogs(),
        api.getSystemKeysStatus().catch(() => null)
      ]);
      setSources(srcData || []);
      setLogs(logData || []);
      setKeysStatus(keyData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKeys = async (e) => {
    e.preventDefault();
    if (!adminSecret.trim()) {
      setFeedback({ type: 'error', message: 'Admin Secret is required.' });
      return;
    }

    try {
      setUpdating(true);
      setFeedback(null);
      const payload = { admin_secret: adminSecret.trim() };
      if (geminiKeyInput.trim()) payload.gemini_api_key = geminiKeyInput.trim();
      if (cartoKeyInput.trim()) payload.carto_api_key = cartoKeyInput.trim();
      if (mapboxTokenInput.trim()) payload.mapbox_token = mapboxTokenInput.trim();
      if (imdKeyInput.trim()) payload.imd_api_key = imdKeyInput.trim();

      const res = await api.updateSystemKeys(payload);
      setFeedback({ type: 'success', message: res.message || 'API keys updated successfully on backend!' });
      
      // Refresh status & audit trail
      await loadData();
      setTimeout(() => {
        setShowAdminModal(false);
        setFeedback(null);
        setAdminSecret('');
        setGeminiKeyInput('');
        setCartoKeyInput('');
        setMapboxTokenInput('');
        setImdKeyInput('');
      }, 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update keys. Verify Admin Secret.' });
    } finally {
      setUpdating(false);
    }
  };

  const getFreshnessBadge = (status) => {
    if (isDark) {
      switch (status) {
        case 'FRESH': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        case 'AGING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        case 'DEGRADED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        default: return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    } else {
      switch (status) {
        case 'FRESH': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'AGING': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'DEGRADED': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">OBSERVABILITY PIPELINE</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>TELEMETRY INGESTION & AUDIT TRAILS</span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Data Adapters & System Sensor Health
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Temporal freshness monitoring, multi-sensor degradation resilience, and tamper-resistant audit logs.
          </p>
        </div>
      </div>

      {/* Data Source Cards */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center space-x-2 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span>Geospatial & Sensor Adapter Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((s) => (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border space-y-2.5 shadow-sm transition-all ${
                isDark ? 'bg-[#0F172A] border-white/[0.08] hover:border-sky-500/40' : 'bg-white border-slate-200/90 hover:border-sky-300'
              }`}
            >
              <div className={`flex items-start justify-between gap-2 border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</h4>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block">{s.provider}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFreshnessBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {s.notes}
              </p>

              <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>MODE: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{s.operational_mode}</strong></span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{s.latency_ms}ms latency</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backend Security & API Key Vault */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>CONFIDENTIAL SERVER-SIDE VAULT</span>
            </div>
            <h3 className={`text-lg font-extrabold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Backend API Key Vault & Encryption Status
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              External API secrets are isolated in server environment memory. Zero keys are exposed to client browsers or localStorage.
            </p>
          </div>

          <button
            onClick={() => setShowAdminModal(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Update Vault (Admin)</span>
          </button>
        </div>

        {/* Key Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              id: 'gemini',
              title: 'Google Gemini 1.5 LLM',
              desc: 'Disaster reasoning copilot engine',
              status: keysStatus?.gemini
            },
            {
              id: 'carto',
              title: 'CARTO Basemaps API',
              desc: 'HD Vector & Raster GIS tiles',
              status: keysStatus?.carto
            },
            {
              id: 'mapbox',
              title: 'Mapbox GIS Tiles',
              desc: 'High-res basemap & satellite layer',
              status: keysStatus?.mapbox
            },
            {
              id: 'imd',
              title: 'IMD Weather Telemetry',
              desc: 'Rainfall radar precipitation feeds',
              status: keysStatus?.imd
            },
            {
              id: 'bhuvan',
              title: 'ISRO Bhuvan Geo-Portal',
              desc: 'Terrain elevation & hazard boundaries',
              status: keysStatus?.bhuvan
            }
          ].map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{item.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                  item.status?.configured
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {item.status?.configured ? 'Active Vault' : 'Fallback Active'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</p>
              <div className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] border truncate ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                {item.status?.preview || 'Loading status...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm p-6 space-y-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <History className="w-4 h-4 text-sky-500" />
          <span>Authority Audit Trail (Forensic Log)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className={`border-b font-bold text-[10px] uppercase ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">RESOURCE TYPE</th>
                <th className="py-2.5 px-3">RESOURCE ID</th>
                <th className="py-2.5 px-3">NODE IP</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-[11px] ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center opacity-60">No recorded audit actions.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className="py-2 px-3 opacity-70">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">{l.action}</td>
                    <td className="py-2 px-3">{l.resource_type}</td>
                    <td className="py-2 px-3 font-bold">{l.resource_id}</td>
                    <td className="py-2 px-3 opacity-60 font-mono text-[10px]">{l.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin API Key Vault Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 ${
            isDark ? 'bg-[#0F172A] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Server-Side API Key Vault</h4>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Update keys securely in backend memory
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAdminModal(false); setFeedback(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateKeys} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[11px] mb-1">
                  Backend Admin Secret <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter ADMIN_SECRET to authorize changes"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">
                  Google Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy... (leave empty to keep current)"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1 flex items-center justify-between">
                  <span>CARTO Basemaps API Key (Optional)</span>
                  <a href="https://carto.com/basemaps/apikey/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-500 hover:underline">
                    Get Free Key &rarr;
                  </a>
                </label>
                <input
                  type="password"
                  value={cartoKeyInput}
                  onChange={(e) => setCartoKeyInput(e.target.value)}
                  placeholder="Paste CARTO basemap key (carto.com/basemaps/apikey)"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">
                  Mapbox Access Token (Optional)
                </label>
                <input
                  type="password"
                  value={mapboxTokenInput}
                  onChange={(e) => setMapboxTokenInput(e.target.value)}
                  placeholder="pk.eyJ1... (leave empty to keep current)"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-[11px] mb-1">
                  IMD Weather API Key (Optional)
                </label>
                <input
                  type="password"
                  value={imdKeyInput}
                  onChange={(e) => setImdKeyInput(e.target.value)}
                  placeholder="IMD key... (leave empty to keep current)"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {updating ? 'Securing...' : 'Commit to Backend Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
