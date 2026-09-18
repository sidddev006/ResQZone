import React from 'react';
import {
  LayoutDashboard,
  Map,
  Home,
  Building2,
  Navigation2,
  Cpu,
  BellRing,
  FileText,
  Activity,
  Globe,
  Radio,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const sections = [
    {
      title: 'COMMAND & SPATIAL GIS',
      items: [
        { id: 'dashboard', label: 'Command Deck', icon: LayoutDashboard },
        { id: 'map', label: 'Interactive GIS Map', icon: Map, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { id: 'habitations', label: 'Settlements & Risk', icon: Home },
        { id: 'capacity', label: 'Shelters & Capacity', icon: Building2 },
      ]
    },
    {
      title: 'TACTICAL ENGINES',
      items: [
        { id: 'relocation', label: 'Relocation Optimizer', icon: Navigation2 },
        { id: 'resq_twin', label: 'ResQ Twin Simulator', icon: Cpu, badge: 'What-If', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
        { id: 'alerts', label: 'Alerts & Broadcast', icon: BellRing },
      ]
    },
    {
      title: 'AUDIT & INTELLIGENCE',
      items: [
        { id: 'reports', label: 'NDRF SITREP Reports', icon: FileText },
        { id: 'system', label: 'Sensors & Lineage', icon: Activity },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0A0E18] border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none">
      <div className="py-5 px-3">
        {/* Brand Header */}
        <div className="px-3 pb-5 mb-4 border-b border-white/[0.07] flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/25">
            R
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight block">ResQZone</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Pan-India Crisis Grid</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="tracking-tight text-[13px]">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom System Health Pill */}
      <div className="p-3 m-3 rounded-2xl bg-[#0F1524]/80 border border-white/[0.08] text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-[11px]">Solver Online</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">12ms</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Sphere standard constraints & Pan-India Dijkstra graph verified.
        </p>
      </div>
    </aside>
  );
}
