'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Volume2, VolumeX, RefreshCw, AlertTriangle, 
  MapPin, Shield, Building, ChevronRight, TrendingUp, 
  TrendingDown, CheckCircle, Clock, BarChart3, ChevronUp, ChevronDown 
} from 'lucide-react';
import { 
  LIVE_ALERTS_DATA, 
  TOP_10_RISK_ZONES, 
  ATMS_DATA, 
  LiveAlertItem, 
  RiskZoneRank, 
  ATMEntity 
} from '@/data/dashboardData';

interface RightSidebarProps {
  selectedZone: string;
  selectedEntity: { type: string; id: string; data?: any } | null;
  onSelectZone: (zoneName: string, coords: [number, number], zoom?: number) => void;
  onSelectATM: (atm: ATMEntity) => void;
  onAcknowledgeAlert?: (id: string) => void;
}

export default function RightSidebar({
  selectedZone,
  selectedEntity,
  onSelectZone,
  onSelectATM,
  onAcknowledgeAlert,
}: RightSidebarProps) {
  const [alerts, setAlerts] = useState<LiveAlertItem[]>(LIVE_ALERTS_DATA);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'zone' | 'alerts' | 'top10'>('zone');

  // Collapsible panels
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [zoneExpanded, setZoneExpanded] = useState(true);
  const [top10Expanded, setTop10Expanded] = useState(true);

  // Auto refresh alerts simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Rotate or update alert timestamps
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    if (onAcknowledgeAlert) onAcknowledgeAlert(id);
  };

  // Find ATMs in current selected zone
  const zoneATMs = ATMS_DATA.filter(a => a.zone === selectedZone || selectedZone.includes(a.zone.split(',')[0]));
  const currentZoneData = TOP_10_RISK_ZONES.find(z => z.name === selectedZone || selectedZone.includes(z.name.split(',')[0])) || TOP_10_RISK_ZONES[0];

  return (
    <aside className="w-full h-full bg-[#0c0c0c] border-l border-white/10 flex flex-col overflow-y-auto text-white select-none divide-y divide-white/10 font-mono text-xs">
      
      {/* PANEL 1: LIVE ALERTS FEED */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-red-500 rounded-none animate-beacon-pulse" />
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">LIVE ALERTS FEED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 border ${soundEnabled ? 'text-neon border-neon/40' : 'text-zinc-500 border-white/10'}`}
              title={soundEnabled ? 'Alert Sound Enabled' : 'Alert Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            </button>
            <button
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              {alertsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {alertsExpanded && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2.5 bg-[#141414] border transition-all ${
                  alert.acknowledged
                    ? 'border-white/5 opacity-50'
                    : alert.severity === 'CRITICAL'
                    ? 'border-red-500/50 bg-red-950/10'
                    : alert.severity === 'HIGH'
                    ? 'border-amber-500/40'
                    : 'border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500' :
                      alert.severity === 'HIGH' ? 'bg-amber-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                      {alert.severity} • {alert.timeAgo}
                    </span>
                  </div>
                  <span className="text-neon font-bold text-[10px]">{alert.amount}</span>
                </div>

                <div className="font-heading-display text-white text-xs font-normal leading-snug">
                  {alert.location}
                </div>

                <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                  <span>{alert.fraudType}</span>
                  <span>Conf: <strong className="text-neon">{alert.confidence}%</strong></span>
                </div>

                <div className="text-[9px] text-zinc-500 mt-0.5">
                  Window: {alert.predictedWindow}
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <button
                    onClick={() => onSelectZone(alert.location, [alert.lat, alert.lng], 15)}
                    className="text-neon hover:underline uppercase"
                  >
                    [ VIEW ON MAP → ]
                  </button>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-zinc-400 hover:text-white uppercase"
                  >
                    {alert.acknowledged ? 'ACKNOWLEDGED' : '[ ACKNOWLEDGE ]'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL 2: SELECTED ZONE INTELLIGENCE PANEL */}
      <div className="p-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-neon" />
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">
              ZONE INTELLIGENCE
            </span>
          </div>
          <button
            onClick={() => setZoneExpanded(!zoneExpanded)}
            className="text-zinc-400 hover:text-white"
          >
            {zoneExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {zoneExpanded && (
          <div className="space-y-3">
            
            {/* Zone Name & Overall Risk Gauge */}
            <div className="p-3 bg-[#141414] border border-white/15">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">ACTIVE SECTOR:</span>
                  <div className="font-heading-display text-sm font-medium text-white">
                    {currentZoneData.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    State: {currentZoneData.state}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-heading-display font-light text-red-400 leading-none">
                    {currentZoneData.score}<span className="text-xs text-zinc-500">/100</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                    CRITICAL RISK
                  </span>
                </div>
              </div>

              {/* Visual Score Bar */}
              <div className="w-full bg-zinc-800 h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-red-600"
                  style={{ width: `${currentZoneData.score}%` }}
                />
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="space-y-1.5 text-[10px]">
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                [ THREAT VECTORS BREAKDOWN ]
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#141414] border border-white/5">
                <span className="text-zinc-400">ATM Density Risk:</span>
                <span className="text-white font-medium">{currentZoneData.atmDensity}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#141414] border border-white/5">
                <span className="text-zinc-400">Historical Fraud Risk:</span>
                <span className="text-amber-400 font-medium">{currentZoneData.historicalFraud}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#141414] border border-white/5">
                <span className="text-zinc-400">Active Alert Risk:</span>
                <span className="text-red-400 font-medium">{currentZoneData.activeAlerts}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-[#141414] border border-white/5">
                <span className="text-zinc-400">Police Coverage:</span>
                <span className="text-neon font-medium">{currentZoneData.policeCoverage}</span>
              </div>
            </div>

            {/* ATMs in this Zone */}
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">
                [ ATMS IN THIS HOTSPOT ({zoneATMs.length}) ]
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {zoneATMs.map((atm) => (
                  <div
                    key={atm.id}
                    onClick={() => onSelectATM(atm)}
                    className="p-1.5 bg-[#141414] hover:bg-white/5 border border-white/10 cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate">
                      <span className="text-white font-medium">{atm.bank}</span>
                      <span className="text-zinc-400 text-[9px] block truncate">{atm.branch}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1 py-0.2 ${
                      atm.riskScore >= 75 ? 'text-red-400 bg-red-500/10' :
                      atm.riskScore >= 50 ? 'text-amber-400 bg-amber-500/10' :
                      'text-neon bg-neon/10'
                    }`}>
                      {atm.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="space-y-1">
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                [ RECENT SURVEILLANCE LOG ]
              </div>
              <div className="p-2 bg-[#141414] border border-white/10 space-y-1.5 text-[10px]">
                <div className="text-zinc-300">
                  <span className="text-neon font-bold">12:45 PM:</span> Complaint CY-44521 linked to this zone
                </div>
                <div className="text-zinc-300">
                  <span className="text-amber-400 font-bold">11:30 AM:</span> Unusual withdrawal pattern detected at SBI ATM
                </div>
                <div className="text-zinc-300">
                  <span className="text-cyan-400 font-bold">10:15 AM:</span> Mule account flagged at HDFC branch nearby
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="p-2.5 bg-neon/10 border border-neon/30 space-y-1.5">
              <div className="text-[9px] text-neon font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                RECOMMENDED POLICE ACTION:
              </div>
              <ul className="text-[10px] text-zinc-200 space-y-1 list-disc pl-3">
                <li>Deploy 2 officers to SBI and PNB ATMs between 2PM-5PM</li>
                <li>Alert SBI branch manager to monitor large withdrawals</li>
                <li>Coordinate with Jaipur Cyber Cell - Case CY-44521</li>
              </ul>
            </div>

            {/* Historical Pattern 7-Day Mini Chart */}
            <div className="p-2.5 bg-[#141414] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[9px] text-zinc-400 uppercase">
                <span>7-DAY WITHDRAWAL PATTERN</span>
                <span className="text-neon font-bold">PEAK: 1PM - 4PM</span>
              </div>
              <div className="flex items-end justify-between h-10 gap-1.5 pt-1">
                {[
                  { day: 'M', val: 40 },
                  { day: 'T', val: 55 },
                  { day: 'W', val: 70 },
                  { day: 'T', val: 65 },
                  { day: 'F', val: 90 },
                  { day: 'S', val: 95 },
                  { day: 'S', val: 80 },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full ${bar.val > 75 ? 'bg-red-500' : 'bg-neon'}`}
                      style={{ height: `${bar.val}%` }}
                    />
                    <span className="text-[8px] text-zinc-500">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* PANEL 3: TOP 10 RISK ZONES LIST */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-neon" />
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">
              TOP 10 RISK ZONES
            </span>
          </div>
          <button
            onClick={() => setTop10Expanded(!top10Expanded)}
            className="text-zinc-400 hover:text-white"
          >
            {top10Expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {top10Expanded && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {TOP_10_RISK_ZONES.map((zone) => (
              <div
                key={zone.rank}
                onClick={() => onSelectZone(zone.name, [zone.lat, zone.lng], 14)}
                className={`p-1.5 bg-[#141414] hover:bg-white/5 border flex items-center justify-between cursor-pointer transition-colors ${
                  zone.name === selectedZone ? 'border-neon bg-neon/5' : 'border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[9px] w-3">{zone.rank}.</span>
                  <span className={`h-1.5 w-1.5 ${
                    zone.score >= 80 ? 'bg-red-500' :
                    zone.score >= 65 ? 'bg-amber-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-white font-medium text-[10px] truncate max-w-[130px]">
                    {zone.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-[10px]">{zone.score}</span>
                  {zone.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
}
