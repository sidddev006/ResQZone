import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Bell, Radio, Terminal, Cpu, Clock, Activity, MapPin, Globe, ChevronDown } from 'lucide-react';

export default function Navbar({
  onOpenCopilot,
  alertCount = 0,
  onSelectTab,
  regions = [],
  selectedRegion = 'ALL',
  onSelectRegion,
  currentRegionObj
}) {
  const [timeStr, setTimeStr] = useState('');
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const telemetry = currentRegionObj?.telemetry || {
    river_basin: "National Network Online",
    seismic_freq: "Multi-State Mesh: 48 Nodes",
    weather: "Monsoon Watch Active"
  };

  return (
    <header className="h-14 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-2xl">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
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
            <p className="text-[10px] text-slate-400 font-mono">Pan-India Hazard Red Zone & Relocation Grid</p>
          </div>
        </div>

        {/* Region Selector Pills (Eleken / UNITED24 Pattern) */}
        <div className="hidden xl:flex items-center space-x-1 pl-3 border-l border-slate-800">
          <div className="flex items-center bg-[#070B12] rounded-lg p-1 border border-slate-800/80">
            {regions.map((reg) => {
              const isSelected = reg.id === selectedRegion;
              return (
                <button
                  key={reg.id}
                  onClick={() => onSelectRegion(reg.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {reg.id === 'ALL' ? '🇮🇳 All India' : reg.name.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Dropdown for Smaller Screens */}
        <div className="relative xl:hidden">
          <button
            onClick={() => setRegionMenuOpen(!regionMenuOpen)}
            className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#131A2B] border border-cyan-500/30 text-cyan-300 text-xs font-mono"
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="max-w-[110px] truncate">{currentRegionObj?.name || 'All India'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {regionMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Select Disaster Management Theater
              </div>
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                    onSelectRegion(reg.id);
                    setRegionMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between transition-colors ${
                    reg.id === selectedRegion
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{reg.name}</span>
                  <span className="text-[10px] text-slate-500">{reg.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Dynamic Telemetry Ticker */}
        <div className="hidden 2xl:flex items-center space-x-3 px-3 py-1 rounded-md bg-[#131A2B] border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-bold">GRID ONLINE</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">{telemetry.seismic_freq || telemetry.monitored_nodes || 'TELEMETRY FRESH'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-[10px] text-slate-300">
            {telemetry.river_basin || telemetry.active_alert_level || 'ALL SYSTEMS NORMAL'}
          </div>
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-3">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-[#131A2B] border border-slate-800">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{timeStr || 'LIVE'}</span>
        </div>

        {/* AI Copilot Terminal Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium transition-all shadow-glow-cyan"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">AI Copilot</span>
          <kbd className="hidden lg:inline-block px-1 rounded bg-black/40 text-[9px] text-cyan-300/70 border border-cyan-500/30">
            ⌘K
          </kbd>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => onSelectTab('alerts')}
          className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-[#131A2B] hover:bg-[#1A233A] border border-slate-800 transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        {/* Authority Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-slate-800 border border-cyan-500/30 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300">
            ND
          </div>
          <div className="text-left text-xs">
            <span className="font-semibold text-white block text-[11px] leading-tight font-mono">Disaster Operations</span>
            <span className="text-[10px] text-slate-400 font-mono">{currentRegionObj?.name?.split('&')[0] || 'National DEOC'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
