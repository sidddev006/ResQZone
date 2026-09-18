import React, { useState, useEffect } from 'react';
import { BellRing, Send, CheckCircle2, AlertOctagon, Radio, Shield, Users } from 'lucide-react';
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
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'WARNING': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'WATCH': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-stone-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Emergency Alerts & Notification Feed</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Multi-channel notifications dispatched to DEOC dashboard, field FCM terminals, and citizen SMS gateways
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Notice</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-xl border border-stone-200">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-xl border border-stone-200">No active alerts.</div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-xl bg-white border transition-all space-y-3 shadow-card ${
                a.is_read ? 'border-stone-200/60 opacity-75' : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className="font-semibold text-stone-900 text-sm">{a.title}</span>
                </div>
                <div className="text-[11px] font-mono text-stone-400">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {a.message}
              </p>

              <div className="p-3 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                <span className="font-medium text-stone-900">Recommended Action: </span>
                <span className="text-stone-700">{a.recommended_action}</span>
              </div>

              {/* Delivery Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FCM: {a.fcm_status || 'Delivered'}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-stone-600">
                    <Radio className="w-3.5 h-3.5" />
                    <span>SMS: {a.sms_status || 'Broadcasted'}</span>
                  </span>
                  <span className="text-stone-400">Target: {a.target_area} ({a.affected_population?.toLocaleString()} citizens)</span>
                </div>

                {!a.is_read && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors border border-stone-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-elevated">
            <h3 className="font-semibold text-stone-900 text-sm">Dispatch Operational Alert</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Subsidence fissure extension detected"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Severity Tier</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900"
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="WARNING">WARNING (Orange)</option>
                    <option value="WATCH">WATCH (Yellow)</option>
                    <option value="INFO">INFO (Advisory)</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Target Area</label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={(e) => setTargetArea(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Affected Population</label>
                <input
                  type="number"
                  value={affectedPop}
                  onChange={(e) => setAffectedPop(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Detailed Message</label>
                <textarea
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900"
                ></textarea>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Recommended Action</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-xs"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
