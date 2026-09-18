import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, Building2, Navigation2, BellRing, Sparkles 
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EvidenceModal from './components/EvidenceModal';
import AICopilotModal from './features/copilot/AICopilotModal';

import DashboardOverview from './features/dashboard/DashboardOverview';
import InteractiveHazardMap from './features/map/InteractiveHazardMap';
import HabitationsList from './features/habitations/HabitationsList';
import CarryingCapacityView from './features/capacity/CarryingCapacityView';
import RelocationPlanner from './features/relocation/RelocationPlanner';
import ResQTwinSimulator from './features/scenarios/ResQTwinSimulator';
import AlertsManager from './features/alerts/AlertsManager';
import ReportViewer from './features/reports/ReportViewer';
import SystemHealthView from './features/system/SystemHealthView';

import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHabitation, setSelectedHabitation] = useState(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('resqzone_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('resqzone_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initial fetch of unread alerts count
    api.getAlerts().then((alerts) => {
      const unread = (alerts || []).filter((a) => !a.is_read).length;
      setUnreadAlerts(unread);
    }).catch(() => {});

    // Fetch regions catalog
    api.getRegions().then((regs) => {
      if (regs && regs.length > 0) {
        setRegions(regs);
      }
    }).catch((err) => {
      console.warn("Failed to load regions:", err);
    });
  }, []);

  const handleInspectHabitation = (hab) => {
    setSelectedHabitation(hab);
  };

  const currentRegionObj = regions.find(r => r.id === selectedRegion) || (regions.length > 0 ? regions[0] : null);

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} selection:bg-sky-500 selection:text-white transition-colors duration-200`}>
      {/* Sidebar Navigation (Desktop Static + Mobile Drawer) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        isOpenMobile={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenCopilot={() => setCopilotOpen(true)}
          alertCount={unreadAlerts}
          onSelectTab={setActiveTab}
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          currentRegionObj={currentRegionObj}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onToggleMobileMenu={() => setMobileNavOpen(prev => !prev)}
        />

        <main className={`flex-1 min-w-0 overflow-y-auto ${activeTab === 'map' ? 'p-2 sm:p-3 overflow-hidden' : 'p-3 sm:p-6 lg:p-8 pb-20 md:pb-8'} scroll-smooth ${isDark ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'} bg-saas-grid`}>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setActiveTab}
              onSelectHabitation={handleInspectHabitation}
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'map' && (
            <InteractiveHazardMap
              onInspectHabitation={handleInspectHabitation}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              regions={regions}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'habitations' && (
            <HabitationsList
              onInspectHabitation={handleInspectHabitation}
              onLaunchSimulation={() => setActiveTab('resq_twin')}
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'capacity' && (
            <CarryingCapacityView
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'relocation' && (
            <RelocationPlanner
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'resq_twin' && (
            <ResQTwinSimulator
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
              theme={theme}
            />
          )}

          {activeTab === 'alerts' && <AlertsManager selectedRegion={selectedRegion} theme={theme} />}

          {activeTab === 'reports' && <ReportViewer selectedRegion={selectedRegion} theme={theme} />}

          {activeTab === 'system' && <SystemHealthView selectedRegion={selectedRegion} theme={theme} />}
        </main>

        {/* Sleek Mobile Bottom Navigation Dock (Phones / < md) */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 border-t flex items-center justify-around px-2 backdrop-blur-xl ${
          isDark ? 'bg-[#0B0F19]/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
        }`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              activeTab === 'dashboard' ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : ''
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              activeTab === 'map' ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : ''
            }`}
          >
            <MapIcon className="w-4 h-4 mb-0.5" />
            <span>Map</span>
          </button>

          {/* Floating Copilot Quick Button */}
          <button
            onClick={() => setCopilotOpen(true)}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              activeTab === 'capacity' ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : ''
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => setActiveTab('relocation')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              activeTab === 'relocation' ? (isDark ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : ''
            }`}
          >
            <Navigation2 className="w-4 h-4 mb-0.5" />
            <span>Routes</span>
          </button>
        </nav>
      </div>

      {/* Deep-Dive Modals */}
      <EvidenceModal
        habitation={selectedHabitation}
        onClose={() => setSelectedHabitation(null)}
        theme={theme}
      />

      <AICopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onSelectHabitation={handleInspectHabitation}
        onNavigate={setActiveTab}
        theme={theme}
      />
    </div>
  );
}
