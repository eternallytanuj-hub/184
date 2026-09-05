'use client';

import React, { useState } from 'react';
import { 
  X, AlertTriangle, Shield, Check, Copy, Download, 
  Share2, Split, MapPin, Phone, Building, ExternalLink 
} from 'lucide-react';
import { ATMEntity, PoliceStationEntity, BankBranchEntity } from '@/data/dashboardData';

interface ModalsProps {
  criticalAlertOpen: boolean;
  onCloseCriticalAlert: () => void;
  onDispatchTeam: () => void;
  onViewAlertLocation: () => void;

  reportModalOpen: boolean;
  onCloseReportModal: () => void;

  shareModalOpen: boolean;
  onCloseShareModal: () => void;

  drawZoneModalOpen: boolean;
  onCloseDrawZoneModal: () => void;

  compareModalOpen: boolean;
  onCloseCompareModal: () => void;

  selectedATM: ATMEntity | null;
  onCloseATMDetail: () => void;
  onRequestSurveillance: (atmId: string) => void;

  selectedPolice: PoliceStationEntity | null;
  onClosePoliceDetail: () => void;
  onRequestDeployment: (stationId: string) => void;

  selectedBranch: BankBranchEntity | null;
  onCloseBranchDetail: () => void;
}

export default function Modals({
  criticalAlertOpen,
  onCloseCriticalAlert,
  onDispatchTeam,
  onViewAlertLocation,
  reportModalOpen,
  onCloseReportModal,
  shareModalOpen,
  onCloseShareModal,
  drawZoneModalOpen,
  onCloseDrawZoneModal,
  compareModalOpen,
  onCloseCompareModal,
  selectedATM,
  onCloseATMDetail,
  onRequestSurveillance,
  selectedPolice,
  onClosePoliceDetail,
  onRequestDeployment,
  selectedBranch,
  onCloseBranchDetail,
}: ModalsProps) {
  // Report Form state
  const [includeStats, setIncludeStats] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeZones, setIncludeZones] = useState(true);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  // Surveillance requested state
  const [surveillanceRequested, setSurveillanceRequested] = useState(false);
  const [deploymentRequested, setDeploymentRequested] = useState(false);

  return (
    <>
      {/* 1. AUTO-TRIGGERED CRITICAL ALERT MODAL */}
      {criticalAlertOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-lg bg-[#141414] border-2 border-red-600 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={onCloseCriticalAlert}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4 mb-5">
              <div className="h-10 w-10 bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-600 rounded-none animate-ping" />
                  🚨 CRITICAL ALERT DETECTED 🚨
                </div>
                <h3 className="text-white text-base font-bold mt-0.5">
                  High-Confidence Cash Withdrawal Predicted
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-black/60 p-4 border border-white/10 mb-6">
              <div className="flex justify-between pb-1.5 border-b border-white/10">
                <span className="text-zinc-400">Target Hotspot:</span>
                <span className="text-white font-bold">Sindhi Camp ATMs, Jaipur</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/10">
                <span className="text-zinc-400">Confidence Rating:</span>
                <span className="text-neon font-bold">92% High Probability</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/10">
                <span className="text-zinc-400">Estimated Amount at Risk:</span>
                <span className="text-red-400 font-bold">₹12.4 Lakhs</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-white/10">
                <span className="text-zinc-400">Predicted Time Window:</span>
                <span className="text-white font-medium">Next 2 Hours (2:00PM - 4:00PM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Linked Active Cases:</span>
                <span className="text-zinc-200">4 Active Complaints Ingested</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  onViewAlertLocation();
                  onCloseCriticalAlert();
                }}
                className="py-2.5 bg-black hover:bg-white/10 border border-white/20 text-white font-bold uppercase tracking-wider text-center"
              >
                [ VIEW ON MAP ]
              </button>
              <button
                onClick={() => {
                  onDispatchTeam();
                  onCloseCriticalAlert();
                }}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-center"
              >
                [ DISPATCH TEAM ]
              </button>
              <button
                onClick={onCloseCriticalAlert}
                className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-center"
              >
                [ DISMISS ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERATE PDF REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-white/20 shadow-2xl p-6 relative">
            <button
              onClick={onCloseReportModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Download className="h-4 w-4 text-neon" />
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                Generate Intelligence Briefing Report
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Compile current GIS surveillance telemetry, hotspot probabilities, and active complaints for commanding officers.
            </p>

            <div className="space-y-2 text-xs bg-black/60 p-3 border border-white/10 mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Include National Operational Metrics</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAlerts}
                  onChange={(e) => setIncludeAlerts(e.target.checked)}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Include Active Critical Alert Logs</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeZones}
                  onChange={(e) => setIncludeZones(e.target.checked)}
                  className="accent-[#ceff00] h-3.5 w-3.5 rounded-none"
                />
                <span className="text-zinc-200">Include Top 10 High-Risk ATM Clusters</span>
              </label>
            </div>

            {reportGenerated ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-xs text-center space-y-2">
                <div>✓ PDF REPORT COMPILED SUCCESSFULLY</div>
                <div className="text-[10px] text-zinc-400">CYBERCAST-INTEL-BRIEF-{new Date().toISOString().slice(0, 10)}.pdf</div>
                <button
                  onClick={() => {
                    setReportGenerated(false);
                    onCloseReportModal();
                  }}
                  className="mt-2 px-4 py-1.5 bg-neon text-black font-bold uppercase text-[10px]"
                >
                  DOWNLOAD COMPLETE
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReportGenerated(true)}
                className="w-full py-2.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-xs tracking-wider"
              >
                COMPILE & EXPORT PDF REPORT →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SHARE VIEW MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-white/20 shadow-2xl p-6 relative">
            <button
              onClick={onCloseShareModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Share2 className="h-4 w-4 text-neon" />
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                Share Secure Map Telemetry View
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Generate an encrypted 24-hour authenticated view token for inter-state police coordination. Recipient officer will see the exact same filters, zoom level, and coordinates.
            </p>

            <div className="p-3 bg-black border border-white/10 mb-4 text-xs">
              <div className="text-[10px] text-zinc-500 uppercase mb-1">ENCRYPTED SHARE LINK (EXPIRES IN 24H):</div>
              <div className="text-neon break-all font-mono text-[11px]">
                https://cybercast.i4c.gov.in/v2/shared?session=7c8f2a91&coords=26.9209,75.7973&z=14&sec=I4C-RESTRICTED
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText('https://cybercast.i4c.gov.in/v2/shared?session=7c8f2a91');
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="w-full py-2.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'LINK COPIED TO CLIPBOARD' : 'COPY SECURE TELEMETRY LINK'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. DRAW ZONE POLYGON RISK CALCULATOR MODAL */}
      {drawZoneModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-white/20 shadow-2xl p-6 relative">
            <button
              onClick={onCloseDrawZoneModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <MapPin className="h-4 w-4 text-neon" />
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                Custom Surveillance Zone Analysis
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Define a custom tactical perimeter to calculate instantaneous aggregate risk and ATM vulnerability.
            </p>

            <div className="space-y-3 text-xs bg-black/60 p-3 border border-white/10 mb-5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Perimeter Type:</span>
                <span className="text-white">Radial 2.0km Cluster</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total ATMs Enclosed:</span>
                <span className="text-neon font-bold">14 Banking Terminals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Historical Incidents (30d):</span>
                <span className="text-amber-400 font-bold">23 Frauds</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-white font-bold">Calculated Risk Index:</span>
                <span className="text-red-400 font-bold text-sm">78.4 / 100 [HIGH RISK]</span>
              </div>
            </div>

            <button
              onClick={onCloseDrawZoneModal}
              className="w-full py-2.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-xs tracking-wider"
            >
              LOCK ZONE TO SURVEILLANCE RADAR →
            </button>
          </div>
        </div>
      )}

      {/* 5. COMPARE SPLIT-SCREEN MODAL */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-2xl bg-[#141414] border border-white/20 shadow-2xl p-6 relative">
            <button
              onClick={onCloseCompareModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Split className="h-4 w-4 text-neon" />
              <h3 className="text-white text-sm font-bold uppercase tracking-wider">
                Comparative Risk Progression Engine
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Compare current risk map with historical baselines to observe how withdrawal networks have migrated across jurisdictions.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs mb-5">
              <div className="p-3 bg-black border border-white/10 space-y-2">
                <div className="text-neon font-bold uppercase text-[10px] pb-1 border-b border-white/10">
                  CURRENT LIVE MAP (TODAY)
                </div>
                <div>Top Hotspot: <strong className="text-white">Sindhi Camp (92)</strong></div>
                <div>Active Complaints: <strong className="text-white">67 Nationwide</strong></div>
                <div>Avg Withdrawal Window: <strong className="text-white">2.8 Hours</strong></div>
              </div>

              <div className="p-3 bg-black border border-white/10 space-y-2">
                <div className="text-zinc-400 font-bold uppercase text-[10px] pb-1 border-b border-white/10">
                  HISTORICAL BASELINE (-7 DAYS)
                </div>
                <div>Top Hotspot: <strong className="text-white">Mewat Cluster (89)</strong></div>
                <div>Active Complaints: <strong className="text-white">54 Nationwide</strong></div>
                <div>Avg Withdrawal Window: <strong className="text-white">4.1 Hours</strong></div>
              </div>
            </div>

            <button
              onClick={onCloseCompareModal}
              className="w-full py-2 bg-[#141414] hover:bg-neon hover:text-black border border-white/20 text-white font-bold uppercase text-xs tracking-wider"
            >
              RETURN TO FULL COMMAND VIEW
            </button>
          </div>
        </div>
      )}

      {/* 6. POPUP: ATM DETAIL CARD (ON CLICK) */}
      {selectedATM && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md p-4 select-none font-mono">
          <div className="bg-[#141414] border border-white/25 shadow-2xl p-5 relative">
            <button
              onClick={onCloseATMDetail}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-neon" />
              <span className="font-heading-display text-white text-base font-normal">
                {selectedATM.bank} - {selectedATM.branch}
              </span>
            </div>
            <div className="text-zinc-400 text-[10px] mb-3">{selectedATM.address}</div>

            <div className="p-2 bg-black border border-white/10 flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-[10px]">ATM ID: <strong className="text-white">{selectedATM.id}</strong></span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                selectedATM.riskScore >= 75 ? 'text-red-400 border-red-500/40 bg-red-500/10' :
                selectedATM.riskScore >= 50 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                'text-neon border-neon/40 bg-neon/10'
              }`}>
                RISK STATUS: {selectedATM.riskScore}/100
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-300 mb-4 bg-zinc-900/50 p-2.5 border border-white/5">
              <div>Today&apos;s Activity: <strong className="text-white">3 Suspicious Withdrawals Flagged</strong></div>
              <div>Flagged Amount: <strong className="text-neon">₹45,000</strong> (Last: {selectedATM.lastAlert})</div>
              <div>Historical Data: <strong className="text-white">{selectedATM.fraudWithdrawals} Frauds in last 30d</strong></div>
              <div>Peak Fraud Hours: <strong className="text-amber-400">1:00 PM - 4:00 PM</strong></div>
              <div>Nearest Police Station: <strong className="text-white">Sindhi Camp PS (800m) • ~4 min response</strong></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                onClick={() => {
                  onRequestSurveillance(selectedATM.id);
                  setSurveillanceRequested(true);
                  setTimeout(() => setSurveillanceRequested(false), 3000);
                }}
                className={`py-2 font-bold uppercase ${
                  surveillanceRequested ? 'bg-emerald-600 text-white' : 'bg-neon hover:bg-neon/90 text-black'
                }`}
              >
                {surveillanceRequested ? 'FLAGGED ✓' : 'REQUEST SURVEILLANCE'}
              </button>
              <button
                onClick={() => alert(`Alert broadcast sent to ${selectedATM.bank} branch nodal officer!`)}
                className="py-2 bg-black hover:bg-white/10 border border-white/20 text-white font-bold uppercase"
              >
                ALERT BANK
              </button>
              <button
                onClick={onCloseATMDetail}
                className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. POPUP: POLICE STATION DETAIL CARD (ON CLICK) */}
      {selectedPolice && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md p-4 select-none font-mono">
          <div className="bg-[#141414] border border-blue-500/40 shadow-2xl p-5 relative">
            <button
              onClick={onClosePoliceDetail}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="font-heading-display text-white text-base font-normal">
                {selectedPolice.name}
              </span>
            </div>
            <div className="text-zinc-400 text-[10px] mb-3">{selectedPolice.jurisdiction}</div>

            <div className="space-y-1.5 text-[11px] text-zinc-300 mb-4 bg-black p-2.5 border border-white/10">
              <div>SHO: <strong className="text-white">{selectedPolice.sho}</strong></div>
              <div>Contact: <strong className="text-white">{selectedPolice.contact}</strong></div>
              <div>Cyber Cell: <strong className="text-neon">Available ({selectedPolice.cyberCellStaff} Officers)</strong></div>
              <div>Active Assigned Cases: <strong className="text-white">{selectedPolice.activeCases}</strong></div>
              <div>Response Time: <strong className="text-amber-400">{selectedPolice.responseTime}</strong></div>
              <div>Teams Deployed: <strong className="text-white">{selectedPolice.teamsDeployed} Units Active</strong></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <button
                onClick={() => {
                  onRequestDeployment(selectedPolice.id);
                  setDeploymentRequested(true);
                  setTimeout(() => setDeploymentRequested(false), 3000);
                }}
                className={`py-2 font-bold uppercase ${
                  deploymentRequested ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {deploymentRequested ? 'DISPATCHED ✓' : 'REQUEST DEPLOYMENT'}
              </button>
              <button
                onClick={() => alert(`Calling SHO ${selectedPolice.sho}...`)}
                className="py-2 bg-black hover:bg-white/10 border border-white/20 text-white font-bold uppercase"
              >
                CONTACT SHO
              </button>
              <button
                onClick={onClosePoliceDetail}
                className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. POPUP: BANK BRANCH DETAIL CARD (ON CLICK) */}
      {selectedBranch && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md p-4 select-none font-mono">
          <div className="bg-[#141414] border border-cyan-500/40 shadow-2xl p-5 relative">
            <button
              onClick={onCloseBranchDetail}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-cyan-400" />
              <span className="font-heading-display text-white text-base font-normal">
                {selectedBranch.name}
              </span>
            </div>
            <div className="text-zinc-400 text-[10px] mb-3">{selectedBranch.address}</div>

            <div className="space-y-1.5 text-[11px] text-zinc-300 mb-4 bg-black p-2.5 border border-white/10">
              <div>IFSC Code: <strong className="text-white">{selectedBranch.ifsc}</strong></div>
              <div>Flagged Mule Accounts: <strong className="text-red-400">{selectedBranch.flaggedAccounts} Accounts</strong></div>
              <div>Risk Level: <strong className="text-amber-400">{selectedBranch.riskLevel}</strong></div>
              <div>Branch Manager Contact: <strong className="text-white">{selectedBranch.managerContact}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                onClick={() => alert(`Freeze mandate dispatched for ${selectedBranch.flaggedAccounts} accounts at ${selectedBranch.name} via CFCFRMS!`)}
                className="py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase"
              >
                FREEZE FLAGGED ACCOUNTS
              </button>
              <button
                onClick={onCloseBranchDetail}
                className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
