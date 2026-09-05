'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, Layers, Activity, Filter, Play, Pause, 
  RotateCcw, ShieldAlert, TrendingUp, ChevronDown, 
  ChevronUp, Check, Eye, EyeOff
} from 'lucide-react';
import { 
  DASHBOARD_STATS, 
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
  timelineHour: number;
  onTimelineChange: (hour: number) => void;
  onTimelinePlayToggle: () => void;
  isPlayingTimeline: boolean;
  timelineSpeed: number;
  onChangeTimelineSpeed: (speed: number) => void;
  layerCounts: {
    atms: number;
    banks: number;
    police: number;
    incidents: number;
    hotspots: number;
    corridors: number;
  };
}

export default function LeftSidebar({
  layers,
  onToggleLayer,
  filters,
  onChangeFilter,
  onResetFilters,
  timelineHour,
  onTimelineChange,
  onTimelinePlayToggle,
  isPlayingTimeline,
  timelineSpeed,
  onChangeTimelineSpeed,
  layerCounts,
}: LeftSidebarProps) {
  // Collapsible section states
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(true);

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

  return (
    <aside className="w-full h-full bg-[#0c0c0c] border-r border-white/10 flex flex-col overflow-y-auto text-white select-none divide-y divide-white/10 font-mono text-xs">
      
      {/* PANEL 1: QUICK STATS CARDS */}
      <div className="p-3">
        <button
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="w-full flex items-center justify-between text-zinc-400 hover:text-white uppercase font-bold text-[10px] tracking-wider mb-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-neon" />
            <span>OPERATIONAL METRICS</span>
          </div>
          {statsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {statsExpanded && (
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Active Alerts Today */}
            <div className="p-2.5 bg-[#141414] border border-red-500/30">
              <div className="text-[9px] text-zinc-400 uppercase tracking-wider">ACTIVE ALERTS</div>
              <div className="text-xl font-heading-display font-light text-red-400 mt-1">
                {DASHBOARD_STATS.activeAlerts.value}
              </div>
              <div className="text-[9px] text-red-500/90 mt-0.5 font-mono">
                {DASHBOARD_STATS.activeAlerts.change}
              </div>
            </div>

            {/* Card 2: Predictions Generated Today */}
            <div className="p-2.5 bg-[#141414] border border-amber-500/30">
              <div className="text-[9px] text-zinc-400 uppercase tracking-wider">AI PREDICTIONS</div>
              <div className="text-xl font-heading-display font-light text-amber-400 mt-1">
                {DASHBOARD_STATS.predictionsGenerated.value}
              </div>
              <div className="text-[9px] text-zinc-400 mt-0.5">
                {DASHBOARD_STATS.predictionsGenerated.subtext}
              </div>
            </div>

            {/* Card 3: Cases Under Surveillance */}
            <div className="p-2.5 bg-[#141414] border border-cyan-500/30">
              <div className="text-[9px] text-zinc-400 uppercase tracking-wider">SURVEILLANCE</div>
              <div className="text-xl font-heading-display font-light text-cyan-400 mt-1">
                {DASHBOARD_STATS.underSurveillance.value}
              </div>
              <div className="text-[9px] text-zinc-400 mt-0.5">
                {DASHBOARD_STATS.underSurveillance.subtext}
              </div>
            </div>

            {/* Card 4: Funds Flagged Today */}
            <div className="p-2.5 bg-[#141414] border border-neon/30">
              <div className="text-[9px] text-zinc-400 uppercase tracking-wider">FUNDS FLAGGED</div>
              <div className="text-xl font-heading-display font-light text-neon mt-1">
                {DASHBOARD_STATS.fundsFlagged.value}
              </div>
              <div className="text-[9px] text-zinc-400 mt-0.5">
                {DASHBOARD_STATS.fundsFlagged.subtext}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL 2: LAYER CONTROL PANEL */}
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
              <span className="text-[10px] text-zinc-500">({layerCounts.atms} visible)</span>
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
              <span className="text-[10px] text-zinc-500">({layerCounts.banks} visible)</span>
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
              <span className="text-[10px] text-zinc-500">({layerCounts.police} visible)</span>
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
              <span className="text-[10px] text-neon">({layerCounts.hotspots} zones)</span>
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
              <span className="text-[10px] text-zinc-500">({layerCounts.corridors} trails)</span>
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

      {/* PANEL 3: FILTER PANEL */}
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
                <option value="custom">Custom Date Range</option>
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
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto pr-1">
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
                onClick={() => {}}
                className="flex-1 py-1.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-[10px] tracking-wider rounded-none"
              >
                APPLY FILTERS
              </button>
              <button
                onClick={onResetFilters}
                className="px-3 py-1.5 bg-[#141414] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/15 uppercase text-[10px] rounded-none"
                title="Reset to default view"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* PANEL 4: TIMELINE PLAYBACK SLIDER */}
      <div className="p-3">
        <button
          onClick={() => setTimelineExpanded(!timelineExpanded)}
          className="w-full flex items-center justify-between text-zinc-400 hover:text-white uppercase font-bold text-[10px] tracking-wider mb-2"
        >
          <div className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-neon" />
            <span>TIMELINE PLAYBACK (24H)</span>
          </div>
          {timelineExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {timelineExpanded && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">PLAYBACK TIME:</span>
              <span className="text-neon font-bold">
                {timelineHour.toString().padStart(2, '0')}:00 IST
              </span>
            </div>

            {/* Horizontal Slider */}
            <input
              type="range"
              min="0"
              max="23"
              value={timelineHour}
              onChange={(e) => onTimelineChange(parseInt(e.target.value, 10))}
              className="w-full accent-[#ceff00] bg-zinc-800 h-1.5 cursor-pointer rounded-none"
            />

            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
              <span>00:00 (MIDNIGHT)</span>
              <span>12:00 (NOON)</span>
              <span>23:00</span>
            </div>

            {/* Playback Controls & Speeds */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onTimelinePlayToggle}
                className={`px-3 py-1.5 flex items-center gap-1.5 font-bold uppercase text-[10px] border ${
                  isPlayingTimeline
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-[#141414] hover:bg-neon hover:text-black text-white border-white/20'
                }`}
              >
                {isPlayingTimeline ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{isPlayingTimeline ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <div className="flex items-center gap-1">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeTimelineSpeed(spd)}
                    className={`px-2 py-1 text-[10px] font-mono border ${
                      timelineSpeed === spd
                        ? 'bg-neon text-black font-bold border-neon'
                        : 'bg-black text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-zinc-500 leading-tight">
              Animate risk propagation across Indian ATM hubs to audit temporal escalation.
            </p>
          </div>
        )}
      </div>

    </aside>
  );
}
