import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Bell, Radio, Terminal, Cpu, Clock, Activity } from 'lucide-react';

export default function Navbar({ onOpenCopilot, alertCount = 0, onSelectTab }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30 shadow-2xl">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-sm shadow-glow-cyan">
            R
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-tight text-sm font-mono">ResQZone</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wider">
                SIH26191
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Chamoli District Spatial Command Engine</p>
          </div>
        </div>

        {/* Live Mission Telemetry Ticker */}
        <div className="hidden lg:flex items-center space-x-3 px-3 py-1 rounded-md bg-[#131A2B] border border-white/10 text-[11px] font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-bold">GRID ONLINE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">MCT SENSOR STREAM: <strong className="text-cyan-400">42 Hz</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-[10px] text-slate-300">
            ALAKNANDA RIVER: <strong className="text-amber-400">+1.4m NORMAL</strong>
          </div>
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-3">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 px-2 py-1 rounded bg-[#131A2B] border border-white/5">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{timeStr || 'LIVE'}</span>
        </div>

        {/* AI Copilot Terminal Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium transition-all shadow-glow-cyan"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Incident Copilot</span>
          <kbd className="hidden md:inline-block px-1 rounded bg-black/40 text-[9px] text-cyan-300/70 border border-cyan-500/30">
            ⌘K
          </kbd>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => onSelectTab('alerts')}
          className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-[#131A2B] hover:bg-[#1A233A] border border-white/10 transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        {/* Authority Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-slate-800 border border-cyan-500/30 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300">
            DO
          </div>
          <div className="text-left text-xs">
            <span className="font-semibold text-white block text-[11px] leading-tight font-mono">Incident Duty Officer</span>
            <span className="text-[10px] text-slate-400 font-mono">Chamoli DEOC</span>
          </div>
        </div>
      </div>
    </header>
  );
}
