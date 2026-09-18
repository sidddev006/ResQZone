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
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'map', label: 'Multi-Hazard GIS Map', icon: Map, badge: 'GIS' },
    { id: 'habitations', label: 'Habitations & Risk', icon: Home, badge: '20' },
    { id: 'capacity', label: 'Carrying Capacity', icon: Building2, badge: '8' },
    { id: 'relocation', label: 'Relocation Planner', icon: Navigation2, badge: 'Opt' },
    { id: 'resq_twin', label: 'ResQ Twin (Digital Twin)', icon: Cpu, badge: 'Novel' },
    { id: 'alerts', label: 'Alerts & Broadcast', icon: BellRing, badge: null },
    { id: 'reports', label: 'Incident Reports', icon: FileText, badge: null },
    { id: 'system', label: 'Data Sources & Audits', icon: Activity, badge: 'Health' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-5 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Decision Support Modules
        </div>
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.badge === 'Novel'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Operational Status */}
      <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Mesh Engine Online</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          PostGIS spatial indices & XGBoost inference ready for Chamoli district.
        </p>
      </div>
    </aside>
  );
}
