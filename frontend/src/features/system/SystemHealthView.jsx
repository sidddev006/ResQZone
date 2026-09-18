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
      case 'FRESH': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AGING': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DEGRADED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex items-center space-x-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Data Adapters & System Audit Trail</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Temporal freshness monitoring, multi-sensor degradation resilience, and tamper-resistant audit logs
          </p>
        </div>
      </div>

      {/* Data Source Cards */}
      <div>
        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <span>Geospatial & Sensor Adapter Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sources.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-2.5 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-stone-900 text-xs">{s.name}</h4>
                  <span className="text-[10px] text-stone-400 font-mono block">{s.provider}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getFreshnessBadge(s.status)}`}>
                  {s.status}
                </span>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">{s.notes}</p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                <span>Mode: <strong className="text-stone-800">{s.operational_mode}</strong></span>
                <span className="text-emerald-700">{s.latency_ms}ms latency</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-card p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-stone-400" />
          <span>Authority Audit Trail (RBAC Immutable)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-medium text-[10px]">
              <tr>
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Resource Type</th>
                <th className="py-2 px-3">Resource ID</th>
                <th className="py-2 px-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-stone-400">No recorded audit actions.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/40">
                    <td className="py-2 px-3 text-stone-500">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">{l.action}</td>
                    <td className="py-2 px-3 text-stone-600">{l.resource_type}</td>
                    <td className="py-2 px-3 text-stone-800">{l.resource_id}</td>
                    <td className="py-2 px-3 text-stone-400">{l.ip_address}</td>
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
