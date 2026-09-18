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
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
        />

        <main className={`flex-1 min-w-0 overflow-y-auto ${activeTab === 'map' ? 'p-3 overflow-hidden' : 'p-6'} scroll-smooth bg-[#07090E] bg-tactical-grid`}>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setActiveTab}
              onSelectHabitation={handleInspectHabitation}
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'map' && (
            <InteractiveHazardMap
              onInspectHabitation={handleInspectHabitation}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              regions={regions}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'habitations' && (
            <HabitationsList
              onInspectHabitation={handleInspectHabitation}
              onLaunchSimulation={() => setActiveTab('resq_twin')}
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'capacity' && (
            <CarryingCapacityView
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'relocation' && (
            <RelocationPlanner
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'resq_twin' && (
            <ResQTwinSimulator
              selectedRegion={selectedRegion}
              currentRegionObj={currentRegionObj}
            />
          )}

          {activeTab === 'alerts' && <AlertsManager selectedRegion={selectedRegion} />}

          {activeTab === 'reports' && <ReportViewer selectedRegion={selectedRegion} />}

          {activeTab === 'system' && <SystemHealthView selectedRegion={selectedRegion} />}
        </main>
      </div>

      {/* Deep-Dive Modals */}
      <EvidenceModal
        habitation={selectedHabitation}
        onClose={() => setSelectedHabitation(null)}
      />

      <AICopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onSelectHabitation={handleInspectHabitation}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
