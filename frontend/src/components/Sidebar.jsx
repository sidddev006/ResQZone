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
  Zap,
  Globe
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Deck', icon: LayoutDashboard },
    { id: 'map', label: 'Tactical GIS Map', icon: Map, badge: 'LIVE' },
    { id: 'habitations', label: 'Habitations & Risk', icon: Home, count: '20' },
    { id: 'capacity', label: 'Carrying Capacity', icon: Building2, count: '8' },
    { id: 'relocation', label: 'Relocation Planner', icon: Navigation2 },
    { id: 'resq_twin', label: 'ResQ Twin Simulation', icon: Cpu, badge: 'What-If' },
    { id: 'alerts', label: 'Alerts & Broadcast', icon: BellRing },
    { id: 'reports', label: 'NDRF SITREP Reports', icon: FileText },
    { id: 'system', label: 'Sensors & Lineage', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-white/10 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-4 mb-3 text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest flex items-center justify-between">
          <span>OPERATIONAL MODULES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        </div>
        <nav className="space-y-1 px-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-glow-cyan/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="tracking-tight text-[12px]">{item.label}</span>
                </div>
                {item.count && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tactical System Info */}
      <div className="p-3 m-3 rounded-xl bg-[#0F1524] border border-white/10 shadow-lg font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-200 mb-1">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-[10px]">SOLVER ENGINE</span>
          </div>
          <span className="text-[10px] text-cyan-400">OPTIMAL</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Graph Dijkstra & Sphere humanitarian constraints validated.
        </p>
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-500">
          <span>LATENCY: 12ms</span>
          <span className="text-cyan-400">CHAMOLI v2.4</span>
        </div>
      </div>
    </aside>
  );
}
