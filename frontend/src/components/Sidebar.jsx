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
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'map', label: 'Multi-Hazard GIS Map', icon: Map },
    { id: 'habitations', label: 'Habitations & Risk', icon: Home, count: '20' },
    { id: 'capacity', label: 'Carrying Capacity', icon: Building2, count: '8' },
    { id: 'relocation', label: 'Relocation Planner', icon: Navigation2 },
    { id: 'resq_twin', label: 'ResQ Twin (Simulator)', icon: Cpu, badge: 'What-If' },
    { id: 'alerts', label: 'Alerts & Broadcast', icon: BellRing },
    { id: 'reports', label: 'Incident Reports', icon: FileText },
    { id: 'system', label: 'Data Sources & Audits', icon: Activity },
  ];

  return (
    <aside className="w-60 bg-stone-50/70 border-r border-stone-200/80 flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-4 mb-2 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
          Decision Modules
        </div>
        <nav className="space-y-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'bg-white text-stone-900 font-semibold shadow-xs border border-stone-200/70'
                    : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 font-normal'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="text-[10px] text-stone-400 font-mono">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/80 text-amber-800 font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Quiet System Info */}
      <div className="p-3 m-2.5 rounded-lg bg-white border border-stone-200/70 shadow-xs">
        <div className="flex items-center space-x-1.5 text-[11px] font-medium text-stone-800 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Inference Engine Ready</span>
        </div>
        <p className="text-[10px] text-stone-500 leading-relaxed">
          Spatial graph and gradient boosted models synchronized for Chamoli.
        </p>
      </div>
    </aside>
  );
}
