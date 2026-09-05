'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LeftSidebar, { LayerVisibilityState, FilterState } from '@/components/dashboard/LeftSidebar';
import RightSidebar from '@/components/dashboard/RightSidebar';
import BottomBar from '@/components/dashboard/BottomBar';
import DashboardMap from '@/components/dashboard/DashboardMap';
import Modals from '@/components/dashboard/Modals';
import { 
  ATMS_DATA, 
  BANK_BRANCHES_DATA, 
  POLICE_STATIONS_DATA, 
  ACTIVE_INCIDENTS_DATA, 
  PREDICTED_HOTSPOTS_DATA, 
  CORRIDORS_DATA,
  ATMEntity,
  PoliceStationEntity,
  BankBranchEntity
} from '@/data/dashboardData';
import { Layers, Shield, Map as MapIcon, Sliders } from 'lucide-react';

export default function DashboardPage() {
  // Layer Toggles
  const [layers, setLayers] = useState<LayerVisibilityState>({
    atms: true,
    banks: true,
    police: true,
    incidents: true,
    hotspots: true,
    corridors: false, // hidden by default per user brief
    heatmap: true,
  });

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    timeRange: '24h',
    fraudTypes: ['KYC Fraud', 'OTP Fraud', 'Investment Fraud', 'UPI Fraud'],
    amountRange: 'all',
    riskLevels: ['Critical', 'High', 'Moderate'],
    selectedState: 'All India',
  });

  // Timeline Playback
  const [timelineHour, setTimelineHour] = useState(14); // 2PM default
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [timelineSpeed, setTimelineSpeed] = useState(1);

  // Selected Entities
  const [selectedZone, setSelectedZone] = useState('Sindhi Camp, Jaipur');
  const [selectedATM, setSelectedATM] = useState<ATMEntity | null>(null);
  const [selectedPolice, setSelectedPolice] = useState<PoliceStationEntity | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BankBranchEntity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string; data?: any } | null>(null);

  // Map FlyTo target
  const [flyToCoords, setFlyToCoords] = useState<{ coords: [number, number]; zoom?: number } | null>(null);

  // Modals state
  const [criticalAlertOpen, setCriticalAlertOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [drawZoneModalOpen, setDrawZoneModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Mobile / Tablet Tab State ('map' | 'layers' | 'intelligence')
  const [mobileTab, setMobileTab] = useState<'map' | 'layers' | 'intelligence'>('map');

  // Trigger one-time realistic critical alert demonstration after 4 seconds
  useEffect(() => {
    const alertTimer = setTimeout(() => {
      setCriticalAlertOpen(true);
    }, 4500);
    return () => clearTimeout(alertTimer);
  }, []);

  // Timeline playback loop
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setTimelineHour((prev) => (prev + 1) % 24);
    }, 1500 / timelineSpeed);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, timelineSpeed]);

  const handleToggleLayer = (key: keyof LayerVisibilityState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangeFilter = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      timeRange: '24h',
      fraudTypes: ['KYC Fraud', 'OTP Fraud', 'Investment Fraud', 'UPI Fraud'],
      amountRange: 'all',
      riskLevels: ['Critical', 'High', 'Moderate'],
      selectedState: 'All India',
    });
    setFlyToCoords({ coords: [22.5937, 78.9629], zoom: 5 });
  };

  const handleSelectZone = (zoneName: string, coords: [number, number], zoom = 14) => {
    setSelectedZone(zoneName);
    setFlyToCoords({ coords, zoom });
  };

  const handleSelectATM = (atm: ATMEntity) => {
    setSelectedATM(atm);
    setSelectedZone(atm.zone);
    setFlyToCoords({ coords: [atm.lat, atm.lng], zoom: 16 });
  };

  const handleSelectPolice = (station: PoliceStationEntity) => {
    setSelectedPolice(station);
    setFlyToCoords({ coords: [station.lat, station.lng], zoom: 15 });
  };

  const handleSelectBranch = (branch: BankBranchEntity) => {
    setSelectedBranch(branch);
    setFlyToCoords({ coords: [branch.lat, branch.lng], zoom: 15 });
  };

  const handleSelectFromHeader = (type: string, id: string, coords: [number, number], zoom = 15) => {
    setFlyToCoords({ coords, zoom });
    if (type === 'ATM') {
      const atm = ATMS_DATA.find((a) => a.id === id);
      if (atm) setSelectedATM(atm);
    } else if (type === 'ZONE') {
      setSelectedZone(id);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0c0c] text-white">
      
      {/* 1. TOP BAR */}
      <DashboardHeader
        onSelectEntity={handleSelectFromHeader}
        onTriggerSOS={() => setCriticalAlertOpen(true)}
        unreadCount={3}
      />

      {/* 2. MAIN 3-PANEL COMMAND CENTER LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR (Layers, Filters, Playback, Stats) */}
        <div className={`w-80 flex-shrink-0 h-full z-20 transition-all duration-300 ${
          mobileTab === 'layers' ? 'block absolute inset-0 z-30 w-full' : 'hidden lg:block'
        }`}>
          <LeftSidebar
            layers={layers}
            onToggleLayer={handleToggleLayer}
            filters={filters}
            onChangeFilter={handleChangeFilter}
            onResetFilters={handleResetFilters}
            timelineHour={timelineHour}
            onTimelineChange={setTimelineHour}
            onTimelinePlayToggle={() => setIsPlayingTimeline(!isPlayingTimeline)}
            isPlayingTimeline={isPlayingTimeline}
            timelineSpeed={timelineSpeed}
            onChangeTimelineSpeed={setTimelineSpeed}
            layerCounts={{
              atms: ATMS_DATA.length,
              banks: BANK_BRANCHES_DATA.length,
              police: POLICE_STATIONS_DATA.length,
              incidents: ACTIVE_INCIDENTS_DATA.length,
              hotspots: PREDICTED_HOTSPOTS_DATA.length,
              corridors: CORRIDORS_DATA.length,
            }}
          />
        </div>

        {/* CENTER: INTERACTIVE OPENSTREETMAP */}
        <main className={`flex-1 h-full relative z-10 ${
          mobileTab === 'map' ? 'block' : 'hidden lg:block'
        }`}>
          <DashboardMap
            layers={layers}
            filters={filters}
            onSelectATM={handleSelectATM}
            onSelectPolice={handleSelectPolice}
            onSelectBranch={handleSelectBranch}
            onSelectZone={handleSelectZone}
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenDrawZoneModal={() => setDrawZoneModalOpen(true)}
            onOpenCompareModal={() => setCompareModalOpen(true)}
            flyToCoords={flyToCoords}
          />
        </main>

        {/* RIGHT SIDEBAR (Live Alerts, Zone Intelligence, Top 10) */}
        <div className={`w-80 xl:w-96 flex-shrink-0 h-full z-20 transition-all duration-300 ${
          mobileTab === 'intelligence' ? 'block absolute inset-0 z-30 w-full' : 'hidden lg:block'
        }`}>
          <RightSidebar
            selectedZone={selectedZone}
            selectedEntity={selectedEntity}
            onSelectZone={handleSelectZone}
            onSelectATM={handleSelectATM}
            onAcknowledgeAlert={(id) => {}}
          />
        </div>

      </div>

      {/* 3. MOBILE & TABLET BOTTOM TAB SWITCHER */}
      <div className="lg:hidden flex items-center justify-around bg-[#141414] border-t border-white/15 py-2 px-4 z-40 font-mono text-[10px] uppercase">
        <button
          onClick={() => setMobileTab('layers')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'layers' ? 'text-neon font-bold' : 'text-zinc-400'}`}
        >
          <Sliders className="h-4 w-4" />
          <span>LAYERS & FILTERS</span>
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'map' ? 'text-neon font-bold' : 'text-zinc-400'}`}
        >
          <MapIcon className="h-4 w-4" />
          <span>RADAR MAP</span>
        </button>

        <button
          onClick={() => setMobileTab('intelligence')}
          className={`flex flex-col items-center gap-1 ${mobileTab === 'intelligence' ? 'text-neon font-bold' : 'text-zinc-400'}`}
        >
          <Shield className="h-4 w-4" />
          <span>INTELLIGENCE</span>
        </button>
      </div>

      {/* 4. BOTTOM BAR (Ticker, Legend, Feed Health) */}
      <div className="hidden sm:block">
        <BottomBar
          onTickerClick={(item) => {
            if (item.includes('Indore')) {
              setFlyToCoords({ coords: [22.7196, 75.8577], zoom: 14 });
            } else if (item.includes('Ahmedabad')) {
              setFlyToCoords({ coords: [23.0225, 72.5714], zoom: 14 });
            } else if (item.includes('Mewat')) {
              setFlyToCoords({ coords: [27.5000, 76.9000], zoom: 13 });
            }
          }}
        />
      </div>

      {/* 5. FLOATING POPUPS & ACTION MODALS */}
      <Modals
        criticalAlertOpen={criticalAlertOpen}
        onCloseCriticalAlert={() => setCriticalAlertOpen(false)}
        onDispatchTeam={() => {
          alert('Rapid Response Unit dispatched to Sindhi Camp Jaipur ATMs!');
          setCriticalAlertOpen(false);
        }}
        onViewAlertLocation={() => {
          setFlyToCoords({ coords: [26.9210, 75.7970], zoom: 15 });
          setSelectedZone('Sindhi Camp, Jaipur');
          setCriticalAlertOpen(false);
        }}
        reportModalOpen={reportModalOpen}
        onCloseReportModal={() => setReportModalOpen(false)}
        shareModalOpen={shareModalOpen}
        onCloseShareModal={() => setShareModalOpen(false)}
        drawZoneModalOpen={drawZoneModalOpen}
        onCloseDrawZoneModal={() => setDrawZoneModalOpen(false)}
        compareModalOpen={compareModalOpen}
        onCloseCompareModal={() => setCompareModalOpen(false)}
        selectedATM={selectedATM}
        onCloseATMDetail={() => setSelectedATM(null)}
        onRequestSurveillance={(id) => {
          // Handled in modal
        }}
        selectedPolice={selectedPolice}
        onClosePoliceDetail={() => setSelectedPolice(null)}
        onRequestDeployment={(id) => {
          // Handled in modal
        }}
        selectedBranch={selectedBranch}
        onCloseBranchDetail={() => setSelectedBranch(null)}
      />

    </div>
  );
}
