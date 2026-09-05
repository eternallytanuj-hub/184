'use client';

import React, { useState } from 'react';
import { 
  AUDIT_LOGS_DATA, 
  AuditLogEntry, 
  CASES_DATA, 
  EVIDENCE_DATA, 
  OfficerProfile 
} from '@/data/collabData';
import { 
  Search, 
  ShieldCheck, 
  Link2, 
  FileText, 
  Smartphone, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Download, 
  Filter, 
  Share2, 
  Terminal, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

interface SearchAndAuditModuleProps {
  currentOfficer: OfficerProfile;
  onSelectCase?: (caseId: string) => void;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function SearchAndAuditModule({
  currentOfficer,
  onSelectCase,
  onAuditLog,
}: SearchAndAuditModuleProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'cross_search' | 'ai_links'>('ai_links');
  
  // Search state
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchEntityFilter, setSearchEntityFilter] = useState<'ALL' | 'CASES' | 'MULES' | 'PHONES' | 'EVIDENCE'>('ALL');
  
  // Audit log filter
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AUDIT_LOGS_DATA);
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');

  // AI Cross-Case Link Cluster Data
  const linkClusters = [
    {
      id: 'LNK-9921',
      title: 'Common Mule Ring: SBI Account #4491',
      type: 'Mule Account Link',
      confidence: 96,
      syndicate: 'Mewat-Bharatpur Syndicate #04',
      cases: ['CY2026-MH-44521', 'CY2026-UP-44519', 'CY2026-HR-44472'],
      details: 'Identical beneficiary account SBI-XXXX-4491 utilized in 3 independent complaints filed across Mumbai, Lucknow, and Gurugram within 72 hours. Total routed volume: ₹19.4 Lakhs.',
      sharedEntity: 'SBI-XXXX-4491 (Jaipur Branch)',
    },
    {
      id: 'LNK-9922',
      title: 'Shared Handset IMEI: 864902819203918',
      type: 'IMEI / Device Nexus',
      confidence: 91,
      syndicate: 'Jamtara-Karmatanr Module 3',
      cases: ['CY2026-DL-44502', 'CY2026-KA-44498', 'CY2026-WB-44485'],
      details: 'IMEI terminal active across 3 separate SIM cards registered under false identities in Jharkhand and Bihar. Geolocation coordinates coincide at Jamtara CSP center.',
      sharedEntity: 'IMEI: 864902819203918 (Realme C11)',
    },
    {
      id: 'LNK-9923',
      title: 'Virtual WhatsApp Calling Gateway: +91-98765-XXXXX',
      type: 'Telecom Gateway Nexus',
      confidence: 89,
      syndicate: 'Cross-Border Digital Arrest Cartel',
      cases: ['CY2026-WB-44485', 'CY2026-GJ-44441'],
      details: 'VoIP gateway spoofing Mumbai Crime Branch calling line ID. Sanchar Saathi DoT database flags 41 consumer spam reports in 7 days.',
      sharedEntity: 'CLI: +91-98765-XXXXX (VoIP Virtual)',
    },
  ];

  // Perform multi-entity search
  const searchResults = React.useMemo(() => {
    if (!globalQuery.trim()) return [];
    const q = globalQuery.toLowerCase();
    const results: {
      type: 'Case' | 'Mule' | 'Phone' | 'Evidence';
      title: string;
      subtitle: string;
      id: string;
      caseId?: string;
    }[] = [];

    CASES_DATA.forEach((c) => {
      // Case match
      if (
        c.id.toLowerCase().includes(q) ||
        c.fraudType.toLowerCase().includes(q) ||
        c.victimState.toLowerCase().includes(q) ||
        c.victim.name.toLowerCase().includes(q)
      ) {
        if (searchEntityFilter === 'ALL' || searchEntityFilter === 'CASES') {
          results.push({
            type: 'Case',
            title: `${c.id} - ${c.fraudType}`,
            subtitle: `Victim: ${c.victim.maskedName} (${c.victimState}) • ₹${c.totalAmount.toLocaleString('en-IN')}`,
            id: c.id,
            caseId: c.id,
          });
        }
      }

      // Mule match
      c.linkedMuleAccounts.forEach((mule) => {
        if (mule.toLowerCase().includes(q)) {
          if (searchEntityFilter === 'ALL' || searchEntityFilter === 'MULES') {
            results.push({
              type: 'Mule',
              title: `Mule Account: ${mule}`,
              subtitle: `Linked to Case: ${c.id} (${c.victimState})`,
              id: mule,
              caseId: c.id,
            });
          }
        }
      });

      // Phone match
      c.linkedPhoneNumbers.forEach((ph) => {
        if (ph.toLowerCase().includes(q)) {
          if (searchEntityFilter === 'ALL' || searchEntityFilter === 'PHONES') {
            results.push({
              type: 'Phone',
              title: `Phone / MSISDN: ${ph}`,
              subtitle: `Linked to Case: ${c.id}`,
              id: ph,
              caseId: c.id,
            });
          }
        }
      });
    });

    // Evidence match
    EVIDENCE_DATA.forEach((ev) => {
      if (
        ev.id.toLowerCase().includes(q) ||
        ev.title.toLowerCase().includes(q) ||
        ev.sha256Hash.toLowerCase().includes(q) ||
        (ev.ocrExtractedText && ev.ocrExtractedText.toLowerCase().includes(q))
      ) {
        if (searchEntityFilter === 'ALL' || searchEntityFilter === 'EVIDENCE') {
          results.push({
            type: 'Evidence',
            title: `Evidence ${ev.id}: ${ev.title}`,
            subtitle: `SHA-256: ${ev.sha256Hash.substring(0, 16)}... • Case: ${ev.caseId}`,
            id: ev.id,
            caseId: ev.caseId,
          });
        }
      }
    });

    return results;
  }, [globalQuery, searchEntityFilter]);

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
    return true;
  });

  const handleExportAudit = () => {
    if (onAuditLog) {
      onAuditLog('EXPORTED_OFFICIAL_AUDIT_LOG', 'AUD-TRAIL-CSV', 'SYSTEM');
    }
    alert('[MHA I4C STATUTORY COMPLIANCE] Full cryptographically certified system audit trail generated as SHA-256 signed archive. Logged to central security ledger.');
  };

  return (
    <div className="space-y-6">
      {/* Title & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121212] border border-white/10 rounded-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#ceff00] uppercase bg-[#ceff00]/10 px-2 py-0.5 border border-[#ceff00]/30 rounded-none">
              MODULE 07-09 // INTELLIGENCE NEXUS & IMMUTABLE LEDGER
            </span>
            <span className="text-[10px] font-mono text-white/40">PAN-INDIA GRAPH CORRELATION</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-[#ceff00]" />
            Search, AI Link Detection & Audit Trail
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            Multi-entity cross-state matching • Automated syndicate graph clustering • Sec 65B certified audit logs
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-black p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('ai_links')}
            className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all rounded-none ${
              activeTab === 'ai_links'
                ? 'bg-[#ceff00] text-black shadow-[0_0_10px_rgba(206,255,0,0.2)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            AI Link Detection
          </button>
          <button
            onClick={() => setActiveTab('cross_search')}
            className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all rounded-none ${
              activeTab === 'cross_search'
                ? 'bg-[#ceff00] text-black shadow-[0_0_10px_rgba(206,255,0,0.2)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Omnibox Search
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all rounded-none ${
              activeTab === 'audit'
                ? 'bg-[#ceff00] text-black shadow-[0_0_10px_rgba(206,255,0,0.2)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Immutable Audit Trail
          </button>
        </div>
      </div>

      {/* TAB 1: AI LINK DETECTION */}
      {activeTab === 'ai_links' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#121212] border border-[#ceff00]/20 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link2 className="w-5 h-5 text-[#ceff00]" />
              <div>
                <span className="text-xs font-mono text-white font-bold uppercase block">
                  3 ACTIVE SYNDICATE NEXUS CLUSTERS IDENTIFIED
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  AI neural engine autonomously correlates recurring mule accounts, IMEIs, and IPDR traces across all state cyber units
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#ceff00] bg-[#ceff00]/10 px-2.5 py-1 border border-[#ceff00]/30 font-bold uppercase">
              LIVE GRAPH ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {linkClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-5 bg-[#121212] border border-white/10 hover:border-[#ceff00]/50 transition-all rounded-none space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-black bg-[#ceff00] px-2 py-0.5 rounded-none">
                      {cluster.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      {cluster.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                      {cluster.confidence}% AI CONFIDENCE
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/30">
                      {cluster.syndicate}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-mono text-white/70 bg-[#0c0c0c] p-3 border border-white/5 leading-relaxed">
                  {cluster.details}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase">INTER-CONNECTED CASES:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cluster.cases.map((cId) => (
                        <button
                          key={cId}
                          onClick={() => onSelectCase && onSelectCase(cId)}
                          className="text-[10px] font-mono text-[#ceff00] hover:underline bg-white/5 px-2 py-0.5 border border-white/10 rounded-none"
                        >
                          {cId}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        alert(
                          `[INTER-STATE COORDINATION] Joint Task Force charter created for ${cluster.id} linking ${cluster.cases.join(', ')}. Dispatched formal invitations to concerned State Nodal Officers.`
                        )
                      }
                      className="text-xs font-mono text-black font-bold px-3 py-1.5 bg-[#ceff00] hover:bg-[#b8e600] uppercase rounded-none transition-colors"
                    >
                      Create Joint Task Force
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OMNIBOX CROSS-ENTITY SEARCH */}
      {activeTab === 'cross_search' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#121212] border border-white/10 rounded-none space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Search across all Indian cases, mule accounts, phone numbers, IMEIs, or evidence hashes..."
                className="w-full bg-[#0c0c0c] border border-white/10 pl-11 pr-4 py-3 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#ceff00] rounded-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-white/40 uppercase">Filter Entity Type:</span>
              {(['ALL', 'CASES', 'MULES', 'PHONES', 'EVIDENCE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchEntityFilter(type)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-none uppercase transition-colors ${
                    searchEntityFilter === type
                      ? 'bg-[#ceff00] text-black font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-2">
            {!globalQuery.trim() ? (
              <div className="p-12 text-center bg-[#121212] border border-white/10 rounded-none">
                <Search className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <div className="text-sm font-mono text-white uppercase font-bold">Global Forensic Search</div>
                <div className="text-xs font-mono text-white/40 mt-1">
                  Type a phone number, account number, case ACK, victim name, or SHA-256 signature to query across all 28 states
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-12 text-center bg-[#121212] border border-white/10 rounded-none">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-sm font-mono text-white uppercase font-bold">No Matching Entities Located</div>
                <div className="text-xs font-mono text-white/40 mt-1">
                  Try searching for partial keywords like &quot;SBI&quot;, &quot;Jaipur&quot;, &quot;44521&quot; or &quot;98765&quot;
                </div>
              </div>
            ) : (
              searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => res.caseId && onSelectCase && onSelectCase(res.caseId)}
                  className="p-4 bg-[#121212] border border-white/10 hover:border-[#ceff00] cursor-pointer transition-all rounded-none flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {res.type === 'Case' ? (
                        <FileText className="w-4 h-4 text-sky-400" />
                      ) : res.type === 'Mule' ? (
                        <CreditCard className="w-4 h-4 text-[#ceff00]" />
                      ) : res.type === 'Phone' ? (
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-black bg-[#ceff00] px-1.5 py-0.2 rounded-none font-bold uppercase">
                          {res.type}
                        </span>
                        <h4 className="text-xs font-bold text-white font-mono uppercase group-hover:text-[#ceff00] transition-colors">
                          {res.title}
                        </h4>
                      </div>
                      <p className="text-[11px] font-mono text-white/50 mt-0.5">
                        {res.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-white/40 group-hover:text-white transition-colors">
                    <span>Inspect Case</span>
                    <ChevronRight className="w-4 h-4 text-[#ceff00]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#121212] border border-white/10 rounded-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-mono text-white font-bold uppercase block">
                  IMMUTABLE SYSTEM AUDIT LEDGER (SEC 65B EVIDENCE ACT)
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  Every login, case inspection, evidence download, and freeze order is cryptographically signed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportAudit}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase rounded-none transition-colors border border-white/10"
              >
                <Download className="w-3.5 h-3.5 text-[#ceff00]" />
                Export Audit Ledger (CSV)
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="border border-white/10 bg-[#121212] overflow-x-auto rounded-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono text-white/50 uppercase">
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Timestamp (IST)</th>
                  <th className="py-2.5 px-3">Officer & Role</th>
                  <th className="py-2.5 px-3">Action Performed</th>
                  <th className="py-2.5 px-3">Entity ID</th>
                  <th className="py-2.5 px-3">Terminal & IP</th>
                  <th className="py-2.5 px-3">Integrity Digest (SHA-256)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 text-[#ceff00] font-bold">
                      {log.id}
                    </td>
                    <td className="py-2.5 px-3 text-white/70 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{log.officerName}</div>
                      <div className="text-[10px] text-white/40">{log.role}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 border border-white/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white/70">
                      {log.entityId}
                    </td>
                    <td className="py-2.5 px-3 text-white/50 text-[10px]">
                      <div>{log.ipAddress}</div>
                      <div className="truncate max-w-[120px] text-white/30">{log.deviceInfo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-white/60 text-[10px] font-mono">
                      <span className="bg-black/60 px-1.5 py-0.5 border border-white/5 text-white/70">
                        {log.integrityHash.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 uppercase">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
