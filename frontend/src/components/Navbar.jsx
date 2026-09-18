import React from 'react';
import { Shield, Radio, Sparkles, Bell, AlertTriangle, Database } from 'lucide-react';

export default function Navbar({ onOpenCopilot, alertCount = 0, onSelectTab }) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Brand & Region */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">ResQZone</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SIH26191
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Chamoli-Joshimath District Command Room</p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>DEMO MODE (SYNTHETIC DATA CALIBRATED)</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all shadow-sm group"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Ask ResQ Copilot</span>
        </button>

        {/* Alerts Button */}
        <button
          onClick={() => onSelectTab('alerts')}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Active Emergency Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* Officer Badge */}
        <div className="hidden lg:flex items-center space-x-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
            DO
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">DEOC Duty Officer</div>
            <div className="text-[10px] text-slate-400">Authority Access (RBAC)</div>
          </div>
        </div>
      </div>
    </header>
  );
}
