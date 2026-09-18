import React, { useState, useEffect } from 'react';
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

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} selection:bg-sky-500 selection:text-white transition-colors duration-200`}>
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

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
        />

        <main className={`flex-1 min-w-0 overflow-y-auto ${activeTab === 'map' ? 'p-3 overflow-hidden' : 'p-5 sm:p-7 lg:p-8'} scroll-smooth ${theme === 'dark' ? 'bg-[#090D16]' : 'bg-[#F8FAFC]'} bg-saas-grid`}>
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
