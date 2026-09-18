import React, { useState, useEffect } from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, Shield, History, Clock, Radio, Server } from 'lucide-react';
import { api } from '../../api/client';

export default function SystemHealthView() {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcData, logData] = await Promise.all([
        api.getDataSources(),
        api.getAuditLogs()
      ]);
      setSources(srcData || []);
      setLogs(logData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFreshnessBadge = (status) => {
    switch (status) {
      case 'FRESH': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald/30';
      case 'AGING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DEGRADED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400">
            <span>OBSERVABILITY PIPELINE</span>
            <span>•</span>
            <span className="text-slate-400">TELEMETRY INGESTION & DATA PROVENANCE</span>
          </div>
          <h2 className="text-xl font-bold text-white">Data Adapters & System Audit Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal freshness monitoring, multi-sensor degradation resilience, and tamper-resistant cryptographic audit logs
          </p>
        </div>
      </div>

      {/* Data Source Cards */}
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
          <span>GEOSPATIAL & SENSOR ADAPTER PIPELINE</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sources.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-[#0B0F17]/90 border border-white/10 space-y-2.5 shadow-2xl hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <h4 className="font-bold text-white text-xs">{s.name}</h4>
                  <span className="text-[10px] text-cyan-400 block">{s.provider}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getFreshnessBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 font-sans">{s.notes}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>MODE: <strong className="text-white">{s.operational_mode}</strong></span>
                <span className="text-cyan-400 font-bold">{s.latency_ms}ms latency</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0B0F17]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>AUTHORITY AUDIT TRAIL (IMMUTABLE FORENSIC LOG)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131A2B] text-slate-400 font-medium text-[10px]">
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">RESOURCE TYPE</th>
                <th className="py-2.5 px-3">RESOURCE ID</th>
                <th className="py-2.5 px-3">NODE IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No recorded audit actions.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#131A2B]/60">
                    <td className="py-2 px-3 text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-bold text-cyan-300">{l.action}</td>
                    <td className="py-2 px-3 text-slate-300">{l.resource_type}</td>
                    <td className="py-2 px-3 text-white font-bold">{l.resource_id}</td>
                    <td className="py-2 px-3 text-slate-500">{l.ip_address}</td>
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
