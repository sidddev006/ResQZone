import React, { useState, useEffect } from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, Shield, History, Clock } from 'lucide-react';
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
      case 'FRESH': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AGING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DEGRADED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Data Ingestion Adapters & Security Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Temporal freshness monitoring, multi-sensor degradation resilience, and tamper-resistant audit logs
          </p>
        </div>
      </div>

      {/* Data Source Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Integrated Geospatial & Sensor Feeds</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs">{s.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block">{s.provider}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getFreshnessBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">{s.notes}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Mode: <strong className="text-white">{s.operational_mode}</strong></span>
                <span className="text-emerald-400">{s.latency_ms}ms ping</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-5">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <History className="w-4 h-4 text-indigo-400" />
          <span>Immutable Authority Audit Trail (RBAC Enforced)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource Type</th>
                <th className="py-2.5 px-3">Resource ID</th>
                <th className="py-2.5 px-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500">No recorded audit actions.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-semibold text-emerald-400">{l.action}</td>
                    <td className="py-2 px-3 text-slate-300">{l.resource_type}</td>
                    <td className="py-2 px-3 text-indigo-300">{l.resource_id}</td>
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
