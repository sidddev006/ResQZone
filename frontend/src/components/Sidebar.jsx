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
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, theme = 'light' }) {
  const isDark = theme === 'dark';

  const sections = [
    {
      title: 'Command & Geospatial',
      items: [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'map', label: 'Interactive GIS Map', icon: Map, badge: 'Live GIS', badgeColor: isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 'habitations', label: 'Settlement Vulnerability', icon: Home },
        { id: 'capacity', label: 'Shelters & Capacity', icon: Building2 },
      ]
    },
    {
      title: 'Decision Intelligence',
      items: [
        { id: 'relocation', label: 'Relocation Optimizer', icon: Navigation2 },
        { id: 'resq_twin', label: 'ResQ Twin Simulator', icon: Cpu, badge: 'Scenario Engine', badgeColor: isDark ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200' },
        { id: 'alerts', label: 'Broadcast & Warnings', icon: BellRing },
      ]
    },
    {
      title: 'Governance & Audits',
      items: [
        { id: 'reports', label: 'NDRF SITREP Reports', icon: FileText },
        { id: 'system', label: 'Sensor Mesh & Health', icon: Activity },
      ]
    }
  ];

  return (
    <aside className={`w-64 flex flex-col justify-between shrink-0 select-none border-r transition-colors duration-200 ${
      isDark ? 'bg-[#090D16] border-white/[0.08]' : 'bg-white border-slate-200/90'
    }`}>
      <div className="py-6 px-4">
        {/* Navigation Sections */}
        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className={`px-3 text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {sec.title}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? (isDark 
                              ? 'bg-sky-500/15 text-sky-300 font-bold border border-sky-500/30 shadow-sm' 
                              : 'bg-sky-50 text-sky-700 font-bold border border-sky-200/80 shadow-sm')
                          : (isDark 
                              ? 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200' 
                              : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900')
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive 
                            ? (isDark ? 'text-sky-400' : 'text-sky-600') 
                            : (isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700')
                        }`} />
                        <span className="tracking-tight text-[13px]">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.badgeColor}`}>
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

      {/* Bottom System Status Widget */}
      <div className="p-4">
        <div className={`p-4 rounded-2xl border ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
            : 'bg-slate-50 border-slate-200/90 text-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold">Grid Engine Online</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            6 Pan-India Regional Theaters synced. Zero latency mesh active.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-medium text-slate-500">
            <span>v2.6 Multi-Theater</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold">99.98% Uptime</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
