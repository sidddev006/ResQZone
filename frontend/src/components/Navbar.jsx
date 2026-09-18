import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Bell, Clock, Activity, MapPin, ChevronDown, 
  Sun, Moon, Shield, Radio, Layers
} from 'lucide-react';

export default function Navbar({
  onOpenCopilot,
  alertCount = 0,
  onSelectTab,
  regions = [],
  selectedRegion = 'ALL',
  onSelectRegion,
  currentRegionObj,
  theme = 'light',
  onToggleTheme
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

  const isDark = theme === 'dark';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200 backdrop-blur-xl ${
      isDark 
        ? 'bg-[#0B0F19]/90 border-white/[0.08] text-white shadow-xl' 
        : 'bg-white/85 border-slate-200/80 text-slate-900 shadow-sm'
    }`}>
      {/* Brand & Multi-Region Pills */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-md shadow-sky-500/20">
            R
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-base">ResQZone</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                SIH26191
              </span>
            </div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Hazard Red Zone & Relocation System
            </p>
          </div>
        </div>

        {/* Region Selector Pills (Mode SaaS Pattern) */}
        <div className={`hidden xl:flex items-center space-x-1 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`flex items-center rounded-xl p-1 border ${
            isDark ? 'bg-[#060910] border-slate-800' : 'bg-slate-100/80 border-slate-200'
          }`}>
            {regions.map((reg) => {
              const isSelected = reg.id === selectedRegion;
              return (
                <button
                  key={reg.id}
                  onClick={() => onSelectRegion(reg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? (isDark 
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20' 
                          : 'bg-white text-sky-950 shadow-sm font-bold border border-slate-200/80')
                      : (isDark 
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60')
                  }`}
                >
                  {reg.id === 'ALL' ? '🇮🇳 All India' : reg.name.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Region Dropdown */}
        <div className="relative xl:hidden">
          <button
            onClick={() => setRegionMenuOpen(!regionMenuOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-sky-400' 
                : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span className="max-w-[120px] truncate">{currentRegionObj?.name || 'All India'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {regionMenuOpen && (
            <div className={`absolute left-0 mt-2 w-64 rounded-2xl border shadow-2xl py-1 z-50 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${
                isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
              }`}>
                Select Region
              </div>
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                    onSelectRegion(reg.id);
                    setRegionMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                    reg.id === selectedRegion
                      ? (isDark ? 'bg-sky-500/15 text-sky-300 font-bold' : 'bg-sky-50 text-sky-700 font-bold')
                      : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                  }`}
                >
                  <span>{reg.name}</span>
                  <span className="text-[11px] opacity-60">{reg.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Tools & Theme Switcher */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Live IST Clock */}
        <div className={`hidden sm:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-700'
        }`}>
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>{timeStr || 'LIVE'}</span>
        </div>

        {/* 1-Click Theme Switcher (Mode / Apple Siri Clean Light vs UNITED24 Studio Dark) */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center space-x-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
          title={isDark ? "Switch to Apple / Mode Light Theme" : "Switch to Studio Dark Theme"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-xs font-semibold text-slate-200">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden md:inline text-xs font-semibold text-slate-700">Dark</span>
            </>
          )}
        </button>

        {/* Apple Siri Style AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-sky-200 animate-spin-slow" />
          <span className="hidden md:inline">Ask Copilot</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-semibold text-white">
            ⌘K
          </kbd>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => onSelectTab('alerts')}
          className={`relative p-2 rounded-xl border transition-all ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
              {alertCount}
            </span>
          )}
        </button>

        {/* Profile Pill */}
        <div className={`hidden md:flex items-center space-x-2.5 pl-3 border-l ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            ND
          </div>
          <div className="text-left text-xs">
            <span className="font-bold block leading-tight">Disaster Operations</span>
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentRegionObj?.name?.split('&')[0] || 'National DEOC'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
