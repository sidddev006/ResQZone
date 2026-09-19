import React, { useState, useEffect } from 'react';
import { 
  Activity, Database, CheckCircle2, AlertTriangle, Shield, History, 
  Clock, Radio, Server, ShieldCheck 
} from 'lucide-react';
import { api } from '../../api/client';

export default function SystemHealthView({ selectedRegion = 'ALL', theme = 'light' }) {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [keysStatus, setKeysStatus] = useState(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}
