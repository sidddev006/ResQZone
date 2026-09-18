import React, { useState, useEffect } from 'react';
import { BellRing, Send, CheckCircle2, AlertOctagon, Radio, Shield, Users, RadioTower, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client';

export default function AlertsManager() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('WARNING');
  const [category, setCategory] = useState('LANDSLIDE_ALERT');
  const [targetArea, setTargetArea] = useState('Joshimath Sunil Sector');
  const [affectedPop, setAffectedPop] = useState(1850);
  const [message, setMessage] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newAlert = await api.createAlert({
        title,
        severity,
        category,
        target_area: targetArea,
        affected_population: Number(affectedPop),
        message,
        recommended_action: action
      });
      setAlerts([newAlert, ...alerts]);
      setShowCreateModal(false);
      setTitle('');
      setMessage('');
      setAction('');
    } catch (err) {
      alert(err.message || 'Alert creation failed');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-rose/30';
      case 'WARNING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'WATCH': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400">
            <span>FIELD COMMS & SITREP</span>
            <span>•</span>
            <span className="text-slate-400">CHAMOLI DISTRICT BROADCAST</span>
          </div>
          <h2 className="text-xl font-bold text-white">Emergency Alerts & Broadcast Console</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronous Multi-Channel Dispatch: DEOC Incident Dashboard, NDRF Field Terminals, and Citizen SMS Gateways
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-glow-cyan transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>DISPATCH SITREP</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-[#0B0F17]/90 rounded-2xl border border-white/10">
            SYNCHRONIZING INCIDENT NOTIFICATIONS...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-[#0B0F17]/90 rounded-2xl border border-white/10">
            No active alerts in incident queue.
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl bg-[#0B0F17]/90 border transition-all space-y-3 shadow-2xl ${
                a.is_read ? 'border-white/5 opacity-70' : 'border-white/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{a.title}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {a.message}
              </p>

              <div className="p-3 rounded-xl bg-[#131A2B] border border-white/10 text-xs">
                <span className="font-bold text-amber-400">RECOMMENDED ACTION: </span>
                <span className="text-slate-200">{a.recommended_action}</span>
              </div>

              {/* Delivery Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-[11px] text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FCM: {a.fcm_status || 'DELIVERED'}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-cyan-400">
                    <Radio className="w-3.5 h-3.5" />
                    <span>SMS: {a.sms_status || 'BROADCASTED'}</span>
                  </span>
                  <span className="text-slate-500">SECTOR: {a.target_area} ({a.affected_population?.toLocaleString()} citizens)</span>
                </div>

                {!a.is_read && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold transition-all border border-white/10 text-[11px]"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Alert */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/80 backdrop-blur-md">
          <div className="bg-[#0B0F17] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Dispatch Operational Emergency Alert</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">ALERT TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Subsidence fissure extension detected"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SEVERITY TIER</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="WARNING">WARNING (Orange)</option>
                    <option value="WATCH">WATCH (Yellow)</option>
                    <option value="INFO">INFO (Advisory)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">TARGET SECTOR</label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={(e) => setTargetArea(e.target.value)}
                    required
                    className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">AFFECTED POPULATION</label>
                <input
                  type="number"
                  value={affectedPop}
                  onChange={(e) => setAffectedPop(e.target.value)}
                  required
                  className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">DETAILED MESSAGE</label>
                <textarea
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white"
                ></textarea>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">RECOMMENDED ACTION</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                  className="w-full bg-[#131A2B] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-glow-cyan"
                >
                  BROADCAST ALERT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
