import React from 'react';
import { Shield, Sparkles, Bell, Radio } from 'lucide-react';

export default function Navbar({ onOpenCopilot, alertCount = 0, onSelectTab }) {
  return (
    <header className="h-14 bg-white/95 backdrop-blur border-b border-stone-200/80 flex items-center justify-between px-6 sticky top-0 z-30 shadow-subtle">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-sm font-semibold tracking-tight shadow-xs">
            R
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-stone-900 tracking-tight text-sm">ResQZone</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                SIH26191
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-normal">Chamoli Emergency Operations Centre</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Calibrated Historical Benchmark (Chamoli Study Region)</span>
        </div>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-2.5">
        {/* Ask Copilot Button - Claude style warm accent */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask Copilot</span>
        </button>

        {/* Alerts Bell */}
        <button
          onClick={() => onSelectTab('alerts')}
          className="relative p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Authority Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-stone-200">
          <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-[11px] font-medium text-stone-700">
            DO
          </div>
          <div className="text-left text-xs">
            <span className="font-medium text-stone-800 block text-[11px] leading-tight">Duty Officer</span>
            <span className="text-[10px] text-stone-400">Chamoli DEOC</span>
          </div>
        </div>
      </div>
    </header>
  );
}
