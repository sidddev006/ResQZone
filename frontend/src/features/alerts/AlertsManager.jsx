import React, { useState, useEffect } from 'react';
import { BellRing, Send, CheckCircle2, AlertOctagon, Radio, Shield, Users, RadioTower, ShieldAlert, X } from 'lucide-react';
import { api } from '../../api/client';

export default function AlertsManager({ selectedRegion = 'ALL', theme = 'light' }) {
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

  const isDark = theme === 'dark';

  useEffect(() => {
    loadAlerts();
  }, [selectedRegion]);

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
    if (isDark) {
      switch (sev) {
        case 'CRITICAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        case 'WARNING': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        case 'WATCH': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
        default: return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    } else {
      switch (sev) {
        case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'WARNING': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'WATCH': return 'bg-sky-50 text-sky-700 border-sky-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-slate-200/90'
      }`}>
        <div>
          <div className="flex items-center space-x-2 mb-1 text-xs font-bold tracking-wide">
            <span className="text-sky-600 dark:text-sky-400">FIELD COMMS & SITREP</span>
            <span className="text-slate-400">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>MULTI-DISTRICT BROADCAST MESH</span>
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Emergency Alerts & Broadcast Console
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Multi-Channel Dispatch: DEOC Incident Dashboard, NDRF Field Terminals, and Citizen SMS Gateways.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-sky-500/20 transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Emergency Alert</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {loading ? (
          <div className={`p-12 text-center text-xs rounded-2xl border ${
            isDark ? 'text-slate-500 bg-slate-900/60 border-slate-800' : 'text-slate-400 bg-white border-slate-200'
          }`}>
            Synchronizing incident notifications...
          </div>
        ) : alerts.length === 0 ? (
          <div className={`p-12 text-center text-xs rounded-2xl border ${
            isDark ? 'text-slate-500 bg-slate-900/60 border-slate-800' : 'text-slate-400 bg-white border-slate-200'
          }`}>
            No active alerts in incident queue.
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 shadow-sm ${
                isDark 
                  ? (a.is_read ? 'bg-[#0F172A]/60 border-white/[0.04] opacity-70' : 'bg-[#0F172A] border-white/[0.08]') 
                  : (a.is_read ? 'bg-slate-50/60 border-slate-200/60 opacity-80' : 'bg-white border-slate-200/90')
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(a.severity)}`}>
                    {a.severity}
                  </span>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.title}</span>
                </div>
                <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {a.message}
              </p>

              <div className={`p-3 rounded-xl border text-xs ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
              }`}>
                <span className="font-bold text-amber-600 dark:text-amber-400">RECOMMENDED ACTION: </span>
                <span>{a.recommended_action}</span>
              </div>

              {/* Delivery Metadata */}
              <div className={`flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t text-[11px] ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>FCM: {a.fcm_status || 'DELIVERED'}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-sky-600 dark:text-sky-400 font-semibold">
                    <Radio className="w-3.5 h-3.5" />
                    <span>SMS: {a.sms_status || 'BROADCASTED'}</span>
                  </span>
                  <span>SECTOR: {a.target_area} ({a.affected_population?.toLocaleString()} citizens)</span>
                </div>

                {!a.is_read && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all border text-xs ${
                      isDark 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-[#0F172A] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">Dispatch Operational Emergency Alert</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>ALERT TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Rapid slope deformation alert"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>SEVERITY TIER</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="CRITICAL">CRITICAL (Red Alert)</option>
                    <option value="WARNING">WARNING (Orange)</option>
                    <option value="WATCH">WATCH (Yellow)</option>
                    <option value="INFO">INFO (Advisory)</option>
                  </select>
                </div>
                <div>
                  <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>TARGET SECTOR</label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={(e) => setTargetArea(e.target.value)}
                    required
                    className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AFFECTED POPULATION</label>
                <input
                  type="number"
                  value={affectedPop}
                  onChange={(e) => setAffectedPop(e.target.value)}
                  required
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>DETAILED MESSAGE</label>
                <textarea
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                ></textarea>
              </div>

              <div>
                <label className={`block mb-1 font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>RECOMMENDED ACTION</label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                  className={`w-full border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-sky-500/20"
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
