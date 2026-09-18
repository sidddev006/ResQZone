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

  useEffect(() => {
    // Initial fetch of unread alerts count
    api.getAlerts().then((alerts) => {
      const unread = (alerts || []).filter((a) => !a.is_read).length;
      setUnreadAlerts(unread);
    }).catch(() => {});
  }, []);

  const handleInspectHabitation = (hab) => {
    setSelectedHabitation(hab);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenCopilot={() => setCopilotOpen(true)}
          alertCount={unreadAlerts}
          onSelectTab={setActiveTab}
        />

        <main className={`flex-1 min-w-0 overflow-y-auto ${activeTab === 'map' ? 'p-3 overflow-hidden' : 'p-6'} scroll-smooth bg-[#07090E] bg-tactical-grid`}>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setActiveTab}
              onSelectHabitation={handleInspectHabitation}
            />
          )}

          {activeTab === 'map' && (
            <InteractiveHazardMap onInspectHabitation={handleInspectHabitation} />
          )}

          {activeTab === 'habitations' && (
            <HabitationsList
              onInspectHabitation={handleInspectHabitation}
              onLaunchSimulation={() => setActiveTab('resq_twin')}
            />
          )}

          {activeTab === 'capacity' && <CarryingCapacityView />}

          {activeTab === 'relocation' && <RelocationPlanner />}

          {activeTab === 'resq_twin' && <ResQTwinSimulator />}

          {activeTab === 'alerts' && <AlertsManager />}

          {activeTab === 'reports' && <ReportViewer />}

          {activeTab === 'system' && <SystemHealthView />}
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
