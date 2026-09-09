'use client';

import React, { useState } from 'react';
import { 
  Layers, Filter, RotateCcw, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { 
  INDIAN_STATES_AND_UTS 
} from '@/data/dashboardData';

export interface LayerVisibilityState {
  atms: boolean;
  banks: boolean;
  police: boolean;
  incidents: boolean;
  hotspots: boolean;
  corridors: boolean;
  heatmap: boolean;
}

export interface FilterState {
  timeRange: string;
  fraudTypes: string[];
  amountRange: string;
  riskLevels: string[];
  selectedState: string;
}

interface LeftSidebarProps {
  layers: LayerVisibilityState;
  onToggleLayer: (layerKey: keyof LayerVisibilityState) => void;
  filters: FilterState;
  onChangeFilter: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  layerCounts: {
    atms: number;
    banks: number;
    police: number;
    incidents: number;
    hotspots: number;
    corridors: number;
  };
  // Optional legacy props for backwards compatibility
  timelineHour?: number;
  onTimelineChange?: (hour: number) => void;
  onTimelinePlayToggle?: () => void;
  isPlayingTimeline?: boolean;
  timelineSpeed?: number;
  onChangeTimelineSpeed?: (speed: number) => void;
}

export default function LeftSidebar({
  layers,
  onToggleLayer,
  filters,
  onChangeFilter,
  onResetFilters,
  layerCounts,
}: LeftSidebarProps) {
  // Collapsible section states
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [appliedNotice, setAppliedNotice] = useState(false);

  const fraudTypesList = [
    'KYC Fraud',
    'OTP Fraud',
    'Investment Fraud',
    'Job/Employment Fraud',
    'Loan Fraud',
    'Sextortion',
    'UPI Fraud',
    'Other',
  ];

  const toggleFraudType = (type: string) => {
    if (filters.fraudTypes.includes(type)) {
      onChangeFilter({ fraudTypes: filters.fraudTypes.filter(t => t !== type) });
    } else {
      onChangeFilter({ fraudTypes: [...filters.fraudTypes, type] });
    }
  };

  const toggleRiskLevel = (level: string) => {
    if (filters.riskLevels.includes(level)) {
      onChangeFilter({ riskLevels: filters.riskLevels.filter(l => l !== level) });
    } else {
      onChangeFilter({ riskLevels: [...filters.riskLevels, level] });
    }
  };

  const handleApplyClick = () => {
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2000);
  };

  return (
    <aside className="w-full h-full bg-[#0c0c0c] border-r border-white/10 flex flex-col overflow-y-auto text-white select-none divide-y divide-white/10 font-mono text-xs">
      
      {/* PANEL 1: LAYER CONTROL PANEL */}
      <div className="p-3">
        <button
          onClick={() => setLayersExpanded(!layersExpanded)}
          className="w-full flex items-center justify-between text-zinc-400 hover:text-white uppercase font-bold text-[10px] tracking-wider mb-2"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-neon" />
            <span>MAP LAYERS</span>
          </div>
          {layersExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {layersExpanded && (
          <div className="space-y-1.5">
            
            {/* ATM Locations Layer */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.atms}
                  onChange={() => onToggleLayer('atms')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">ATM Locations</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">({layerCounts.atms} visible)</span>
            </label>

            {/* Bank Branches Layer */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.banks}
                  onChange={() => onToggleLayer('banks')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Bank Branches</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">({layerCounts.banks} visible)</span>
            </label>

            {/* Police Stations Layer */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.police}
                  onChange={() => onToggleLayer('police')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Police Stations</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">({layerCounts.police} visible)</span>
            </label>

            {/* Active Crime Incidents */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.incidents}
                  onChange={() => onToggleLayer('incidents')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Active Incidents</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold">({layerCounts.incidents} active)</span>
            </label>

            {/* Predicted Hotspots */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.hotspots}
                  onChange={() => onToggleLayer('hotspots')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-neon font-medium">Predicted Hotspots</span>
              </div>
              <span className="text-[10px] text-neon font-bold">({layerCounts.hotspots} zones)</span>
            </label>

            {/* Criminal Corridors (Hidden by default) */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.corridors}
                  onChange={() => onToggleLayer('corridors')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Criminal Corridors</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold">({layerCounts.corridors} trails)</span>
            </label>

            {/* Risk Heatmap Overlay */}
            <label className="flex items-center justify-between p-1.5 bg-[#141414] hover:bg-white/[0.04] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={layers.heatmap}
                  onChange={() => onToggleLayer('heatmap')}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-amber-400 font-medium">Risk Heatmap</span>
              </div>
              <span className="text-[10px] text-amber-500 font-bold">[ ACTIVE ]</span>
            </label>

          </div>
        )}
      </div>

      {/* PANEL 2: FILTER PANEL */}
      <div className="p-3">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full flex items-center justify-between text-zinc-400 hover:text-white uppercase font-bold text-[10px] tracking-wider mb-2"
        >
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-neon" />
            <span>INTELLIGENCE FILTERS</span>
          </div>
          {filtersExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {filtersExpanded && (
          <div className="space-y-3 pt-1">
            
            {/* Time Filter */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Time Window:</label>
              <select
                value={filters.timeRange}
                onChange={(e) => onChangeFilter({ timeRange: e.target.value })}
                className="w-full bg-[#141414] border border-white/15 px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon rounded-none"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours (Default)</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* State / UT Filter */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Jurisdiction / State:</label>
              <select
                value={filters.selectedState}
                onChange={(e) => onChangeFilter({ selectedState: e.target.value })}
                className="w-full bg-[#141414] border border-white/15 px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon rounded-none"
              >
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Amount Range:</label>
              <select
                value={filters.amountRange}
                onChange={(e) => onChangeFilter({ amountRange: e.target.value })}
                className="w-full bg-[#141414] border border-white/15 px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-neon rounded-none"
              >
                <option value="all">All Amounts</option>
                <option value="below10k">Below ₹10,000</option>
                <option value="10k-50k">₹10,000 - ₹50,000</option>
                <option value="50k-2L">₹50,000 - ₹2,00,000</option>
                <option value="2L-10L">₹2,00,000 - ₹10,00,000</option>
                <option value="above10L">Above ₹10,00,000</option>
              </select>
            </div>

            {/* Risk Level Filter Checkboxes */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1.5">Risk Severity Level:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'Critical', label: 'Critical (76-100)', color: 'text-red-400' },
                  { id: 'High', label: 'High (51-75)', color: 'text-amber-400' },
                  { id: 'Moderate', label: 'Moderate (26-50)', color: 'text-yellow-400' },
                  { id: 'Low', label: 'Low (0-25)', color: 'text-zinc-400' },
                ].map((r) => (
                  <label key={r.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.riskLevels.includes(r.id)}
                      onChange={() => toggleRiskLevel(r.id)}
                      className="accent-[#ceff00] h-3 w-3 rounded-none"
                    />
                    <span className={r.color}>{r.id}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fraud Type Filter Checkboxes */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1.5">Fraud Typology:</label>
              <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1">
                {fraudTypesList.map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-[10px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.fraudTypes.includes(type)}
                      onChange={() => toggleFraudType(type)}
                      className="accent-[#ceff00] h-3 w-3 rounded-none"
                    />
                    <span className="truncate">{type.replace(' Fraud', '')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleApplyClick}
                className={`flex-1 py-1.5 font-bold uppercase text-[10px] tracking-wider rounded-none transition-all flex items-center justify-center gap-1.5 ${
                  appliedNotice
                    ? 'bg-emerald-400 text-black'
                    : 'bg-neon hover:bg-neon/90 text-black'
                }`}
              >
                {appliedNotice ? (
                  <>
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>FILTERS ACTIVE</span>
                  </>
                ) : (
                  <span>APPLY FILTERS</span>
                )}
              </button>
              <button
                onClick={onResetFilters}
                className="px-3 py-1.5 bg-[#141414] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/15 uppercase text-[10px] rounded-none active:scale-95 transition-transform"
                title="Reset all filters to default"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

          </div>
        )}
      </div>

    </aside>
  );
}
