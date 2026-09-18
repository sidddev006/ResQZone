import React, { useState, useEffect } from 'react';
import { BellRing, Send, CheckCircle2, AlertOctagon, Radio, Shield, Users } from 'lucide-react';
import { api } from '../../api/client';

export default function AlertsManager() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New alert form
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
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'WARNING': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'WATCH': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Emergency Alerts & Broadcast Center</h2>
            <p className="text-xs text-slate-400">
              Multi-channel operational notifications (Dashboard, FCM Push, SMS broadcast)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-950/50 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Emergency Alert</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl">No active alerts.</div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all space-y-3 ${
                a.is_read ? 'border-slate-800 opacity-80' : 'border-slate-700 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{a.title}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                {a.message}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <strong className="text-amber-400">Recommended Action:</strong>{' '}
                <span className="text-slate-300">{a.recommended_action}</span>
              </div>

              {/* Delivery Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FCM: {a.fcm_status || 'Delivered'}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-blue-400">
                    <Radio className="w-3.5 h-3.5" />
                    <span>SMS: {a.sms_status || 'Broadcasted'}</span>
                  </span>
                  <span className="text-slate-500">Target: {a.target_area} ({a.affected_population?.toLocaleString()} citizens)</span>
                </div>

                {!a.is_read && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Dispatch Operational Alert</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Subsidence fissure extension detected"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Severity Tier</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="WARNING">WARNING (Orange)</option>
                    <option value="WATCH">WATCH (Yellow)</option>
                    <option value="INFO">INFO (Advisory)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Area</label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={(e) => setTargetArea(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Affected Population Estimate</label>
                <input
                  type="number"
                  value={affectedPop}
                  onChange={(e) => setAffectedPop(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Alert Message</label>
                <textarea
                  rows="3"
                  placeholder="Detailed multi-sensor fusion observation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                ></textarea>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Recommended Action</label>
                <input
                  type="text"
                  placeholder="Evacuation order or route diversion notice"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-950/50"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
