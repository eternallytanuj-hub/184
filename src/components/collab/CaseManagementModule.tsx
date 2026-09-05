'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderOpen, Search, ArrowUpDown, Filter, Eye, EyeOff,
  Shield, AlertTriangle, CheckCircle2, Clock, Lock, 
  FileText, MessageSquare, Download, Share2, CornerDownRight,
  TrendingDown, Check, X, Building, Smartphone, MapPin, 
  ChevronRight, RefreshCw, Send, Sparkles, ExternalLink
} from 'lucide-react';
import { 
  CaseEntity, CASES_DATA, CaseStatus, PriorityLevel, 
  OfficerRole, OFFICER_ROLES, OfficerProfile, MoneyTrailNode, EVIDENCE_DATA,
  CHAT_MESSAGES, ChatMessage
} from '@/data/collabData';

interface CaseManagementModuleProps {
  currentRole?: OfficerRole;
  currentOfficer?: OfficerProfile;
  onOpenCaseChat?: (caseId: string) => void;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
  directSelectedCaseId?: string | null;
}

export default function CaseManagementModule({
  currentRole: propRole,
  currentOfficer,
  onOpenCaseChat,
  onAuditLog,
  directSelectedCaseId,
}: CaseManagementModuleProps) {
  const currentRole = propRole || currentOfficer?.role || 'i4c_admin';
  const [cases, setCases] = useState<CaseEntity[]>(CASES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'amount' | 'priority' | 'status' | 'updated'>('newest');
  
  // Selection and Bulk Actions
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  
  // Selected Case Detail View
  const [activeCase, setActiveCase] = useState<CaseEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'money_trail' | 'evidence' | 'chat' | 'intelligence' | 'action_log'>('overview');
  const [unmaskVictim, setUnmaskVictim] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus>('UNDER_INVESTIGATION');
  const [statusNote, setStatusNote] = useState('');

  // Money trail freeze state tracker
  const [frozenNodeIds, setFrozenNodeIds] = useState<string[]>([]);

  // Filter & Search Logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Role-based visibility check
      if (currentRole === 'district_officer' && c.victimDistrict !== 'Jaipur North' && c.suspectedWithdrawalCity !== 'Jaipur') {
        // District officers only see Jaipur cases unless shared
        if (c.id !== 'CY2026-MH-44521') return false;
      }
      if (currentRole === 'field_investigator' && c.assignedOfficerId !== 'OFF-FLD-004' && c.id !== 'CY2026-MH-44521') {
        return false;
      }
      if (currentRole === 'bank_liaison') {
        const hasSBIAccount = c.moneyTrail?.some(n => n.bank.includes('State Bank') || n.bank.includes('SBI')) || c.id === 'CY2026-MH-44521';
        if (!hasSBIAccount) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(q);
        const matchType = c.fraudType.toLowerCase().includes(q);
        const matchVictim = c.victim.name.toLowerCase().includes(q) || c.victim.phoneMasked.includes(q);
        const matchState = c.victimState.toLowerCase().includes(q) || c.suspectedWithdrawalCity.toLowerCase().includes(q);
        const matchMule = c.linkedMuleAccounts.some(m => m.toLowerCase().includes(q));
        if (!matchId && !matchType && !matchVictim && !matchState && !matchMule) return false;
      }

      // Filters
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (filterPriority !== 'ALL' && c.priority !== filterPriority) return false;
      if (filterState !== 'ALL' && c.suspectedWithdrawalState !== filterState && c.victimState !== filterState) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'priority') {
        const pOrder: Record<PriorityLevel, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0; // default order is newest first
    });
  }, [cases, searchQuery, filterStatus, filterPriority, filterState, sortBy, currentRole]);

  // Handle Bulk Status Change
  const handleBulkStatusChange = (status: CaseStatus) => {
    setCases(prev => prev.map(c => selectedCaseIds.includes(c.id) ? { ...c, status, lastUpdated: 'Just now' } : c));
    setSelectedCaseIds([]);
  };

  // Handle Account Freeze in Money Trail
  const handleRequestFreeze = (nodeId: string, accountMasked: string) => {
    setFrozenNodeIds(prev => [...prev, nodeId]);
    if (activeCase) {
      const updatedMoneyTrail = activeCase.moneyTrail.map(n => 
        n.id === nodeId ? { ...n, status: 'Frozen' as const, freezeStatus: 'Executed' as const } : n
      );
      const newActionLogEntry = {
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        officerName: OFFICER_ROLES[currentRole].name,
        role: OFFICER_ROLES[currentRole].roleName,
        action: `CFCFRMS Statutory Debit Freeze executed on ${accountMasked}`,
        outcome: 'Account successfully lien-marked via nodal bank API hook',
      };
      const updatedCase: CaseEntity = {
        ...activeCase,
        moneyTrail: updatedMoneyTrail,
        actionLog: [newActionLogEntry, ...activeCase.actionLog],
      };
      setActiveCase(updatedCase);
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    }
  };

  // Handle Status Update Submit
  const handleStatusUpdate = () => {
    if (!activeCase) return;
    const newLogEntry = {
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      officerName: OFFICER_ROLES[currentRole].name,
      role: OFFICER_ROLES[currentRole].roleName,
      action: `Status transitioned to ${newStatus}`,
      outcome: statusNote || 'Manual case status update by assigned officer',
    };
    const updatedCase: CaseEntity = {
      ...activeCase,
      status: newStatus,
      lastUpdated: 'Just now',
      actionLog: [newLogEntry, ...activeCase.actionLog],
    };
    setActiveCase(updatedCase);
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setStatusModalOpen(false);
    setStatusNote('');
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'SURVEILLANCE_ACTIVE':
        return <span className="text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase animate-pulse">SURVEILLANCE ACTIVE</span>;
      case 'FUNDS_FROZEN':
        return <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase">FUNDS FROZEN</span>;
      case 'ARREST_MADE':
        return <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase">ARREST MADE</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase">INVESTIGATION</span>;
      case 'CASE_RESOLVED':
        return <span className="text-neon bg-neon/10 border border-neon/30 px-1.5 py-0.5 text-[9px] font-bold uppercase">RESOLVED</span>;
      default:
        return <span className="text-zinc-400 bg-zinc-800 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase">{status}</span>;
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical':
        return <span className="text-red-400 font-bold">🔴 CRITICAL</span>;
      case 'High':
        return <span className="text-amber-400 font-bold">🟠 HIGH</span>;
      case 'Medium':
        return <span className="text-yellow-400 font-medium">🟡 MEDIUM</span>;
      default:
        return <span className="text-zinc-400 font-normal">🟢 LOW</span>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-white select-none">
      
      {/* 1. TOP MODULE TOOLBAR & SEARCH */}
      <div className="p-4 bg-[#141414] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        {/* Module Title & Counter */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-neon/10 border border-neon text-neon">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              National Case Dossier Management
              <span className="text-[10px] text-zinc-400 font-normal">
                ({filteredCases.length} ACTIVE IN CURRENT JURISDICTION)
              </span>
            </h2>
            <div className="text-[10px] text-zinc-400">
              Correlated against NCRP Portal, CFCFRMS Gateway, & Indian Telecom Registries
            </div>
          </div>
        </div>

        {/* Global Case Search Box */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, Phone, Mule Account, City..."
            className="w-full bg-black border border-white/15 px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon rounded-none"
          />
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* 2. FILTERS & SORTING BAR */}
      <div className="px-4 py-2 bg-black border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">FILTERS:</span>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#141414] border border-white/15 px-2 py-1 text-[10px] text-zinc-300 rounded-none focus:border-neon"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="SURVEILLANCE_ACTIVE">SURVEILLANCE ACTIVE</option>
            <option value="FUNDS_FROZEN">FUNDS FROZEN</option>
            <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
            <option value="ARREST_MADE">ARREST MADE</option>
            <option value="CASE_RESOLVED">CASE RESOLVED</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#141414] border border-white/15 px-2 py-1 text-[10px] text-zinc-300 rounded-none focus:border-neon"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="Critical">CRITICAL</option>
            <option value="High">HIGH</option>
            <option value="Medium">MEDIUM</option>
          </select>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-[#141414] border border-white/15 px-2 py-1 text-[10px] text-zinc-300 rounded-none focus:border-neon"
          >
            <option value="ALL">ALL STATES</option>
            <option value="Maharashtra">MAHARASHTRA</option>
            <option value="Rajasthan">RAJASTHAN</option>
            <option value="Uttar Pradesh">UTTAR PRADESH</option>
            <option value="Haryana">HARYANA</option>
            <option value="Delhi">DELHI</option>
            <option value="West Bengal">WEST BENGAL</option>
            <option value="Gujarat">GUJARAT</option>
          </select>

          {/* Reset button */}
          {(filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterState !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setFilterPriority('ALL');
                setFilterState('ALL');
                setSearchQuery('');
              }}
              className="text-[9px] text-neon hover:underline uppercase"
            >
              [ RESET FILTERS ]
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase">SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#141414] border border-white/15 px-2 py-1 text-[10px] text-white rounded-none focus:border-neon"
          >
            <option value="newest">NEWEST COMPLAINT</option>
            <option value="amount">HIGHEST AMOUNT</option>
            <option value="priority">PRIORITY LEVEL</option>
            <option value="status">CASE STATUS</option>
          </select>
        </div>

      </div>

      {/* 3. BULK ACTIONS BAR (When cases are selected) */}
      {selectedCaseIds.length > 0 && (
        <div className="px-4 py-2 bg-neon/10 border-b border-neon flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-neon uppercase">
              {selectedCaseIds.length} CASES SELECTED
            </span>
            <button
              onClick={() => handleBulkStatusChange('SURVEILLANCE_ACTIVE')}
              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase"
            >
              MARK SURVEILLANCE ACTIVE
            </button>
            <button
              onClick={() => handleBulkStatusChange('FUNDS_FROZEN')}
              className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-700 text-white text-[9px] font-bold uppercase"
            >
              MARK FUNDS FROZEN
            </button>
          </div>
          <button
            onClick={() => setSelectedCaseIds([])}
            className="text-[10px] text-zinc-400 hover:text-white uppercase"
          >
            DESELECT ALL
          </button>
        </div>
      )}

      {/* 4. MAIN CASES TABLE */}
      <div className="flex-1 overflow-auto bg-[#0c0c0c]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#141414] border-b border-white/10 text-[9px] text-zinc-400 uppercase tracking-wider sticky top-0 z-10">
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedCaseIds.length === filteredCases.length && filteredCases.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCaseIds(filteredCases.map(c => c.id));
                    else setSelectedCaseIds([]);
                  }}
                  className="rounded-none cursor-pointer"
                />
              </th>
              <th className="p-3">Case ID</th>
              <th className="p-3">Complaint Time</th>
              <th className="p-3">Fraud Taxonomy</th>
              <th className="p-3">Amount Involved</th>
              <th className="p-3">Origin → Target Withdrawal</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Assigned Lead</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCases.map((c) => {
              const isSelected = selectedCaseIds.includes(c.id);
              return (
                <tr
                  key={c.id}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-white/5' : ''
                  }`}
                  onClick={() => setActiveCase(c)}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCaseIds(prev => [...prev, c.id]);
                        else setSelectedCaseIds(prev => prev.filter(id => id !== c.id));
                      }}
                      className="rounded-none cursor-pointer"
                    />
                  </td>
                  <td className="p-3 font-bold text-white flex items-center gap-1.5">
                    <span className="text-neon">{c.id}</span>
                    {c.linkedCasesCount > 1 && (
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 border border-white/10" title={`${c.linkedCasesCount} Linked Cases Detected`}>
                        +{c.linkedCasesCount}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-400 text-[10px]">{c.registeredAt}</td>
                  <td className="p-3 text-zinc-200">{c.fraudType}</td>
                  <td className="p-3 font-bold text-neon">
                    ₹{c.totalAmount.toLocaleString('en-IN')}
                    {c.recoveredAmount > 0 && (
                      <span className="text-[9px] text-emerald-400 block font-normal">
                        (₹{c.recoveredAmount.toLocaleString('en-IN')} Secured)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] text-zinc-300">
                    <span>{c.victimState}</span>
                    <span className="text-zinc-500 mx-1">→</span>
                    <span className="text-amber-400 font-medium">{c.suspectedWithdrawalCity}</span>
                    <span className="text-[9px] text-zinc-500 block truncate max-w-[140px]">{c.suspectedWithdrawalZone}</span>
                  </td>
                  <td className="p-3">{getStatusBadge(c.status)}</td>
                  <td className="p-3">{getPriorityBadge(c.priority)}</td>
                  <td className="p-3 text-zinc-300 text-[10px] truncate max-w-[120px]">{c.assignedOfficerName}</td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveCase(c)}
                      className="px-2 py-1 bg-black hover:bg-neon hover:text-black border border-white/20 text-white text-[10px] uppercase tracking-wider font-bold transition-colors"
                    >
                      DOSSIER →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCases.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No cybercrime cases match current query or role security scope.
          </div>
        )}
      </div>

      {/* 5. FULL CASE DOSSIER MODAL (6 DEEP TABS) */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-5xl h-[90vh] bg-[#141414] border border-white/25 shadow-2xl flex flex-col relative overflow-hidden">
            
            {/* Dossier Top Banner */}
            <div className="p-4 bg-black border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-neon/10 border border-neon text-neon text-xs font-bold px-2">
                  CASE DOSSIER: {activeCase.id}
                </div>
                {getStatusBadge(activeCase.status)}
                {getPriorityBadge(activeCase.priority)}
                <span className="text-zinc-500 text-xs">• NCRP: {activeCase.ncrpAckNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-2.5 py-1 bg-neon text-black hover:bg-neon/90 font-bold text-xs uppercase"
                >
                  CHANGE STATUS
                </button>
                <button
                  onClick={() => onOpenCaseChat && onOpenCaseChat(activeCase.id)}
                  className="px-2.5 py-1 bg-[#141414] hover:bg-white/10 border border-white/20 text-white text-xs uppercase flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-neon" />
                  <span>CASE CHAT</span>
                </button>
                <button
                  onClick={() => setActiveCase(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="flex items-center border-b border-white/10 bg-[#181818] overflow-x-auto text-[11px] uppercase tracking-wider">
              {[
                { id: 'overview', label: '1. Case Overview' },
                { id: 'money_trail', label: '2. Money Trail Flowchart' },
                { id: 'evidence', label: '3. Evidence Locker' },
                { id: 'chat', label: '4. Communication Thread' },
                { id: 'intelligence', label: '5. AI Predictive Intel' },
                { id: 'action_log', label: '6. Immutable Action Log' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors border-r border-white/10 ${
                    activeTab === tab.id
                      ? 'bg-black text-neon border-b-2 border-b-neon'
                      : 'text-zinc-400 hover:text-white hover:bg-black/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dossier Content Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#0c0c0c] text-xs">
              
              {/* TAB 1: CASE OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Financial & Complaint Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-[#141414] border border-white/10 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest">TOTAL STOLEN AMOUNT:</div>
                      <div className="text-xl font-bold text-white">₹{activeCase.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-zinc-400">Via 3 swift RTGS/IMPS Transfers</div>
                    </div>

                    <div className="p-3.5 bg-[#141414] border border-white/10 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest">RECOVERED / SECURED:</div>
                      <div className="text-xl font-bold text-emerald-400">₹{activeCase.recoveredAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-neon">
                        {Math.round((activeCase.recoveredAmount / activeCase.totalAmount) * 100)}% of total fund trail
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#141414] border border-white/10 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest">PREDICTED WITHDRAWAL ZONE:</div>
                      <div className="text-sm font-bold text-amber-400 truncate">{activeCase.predictedZone}</div>
                      <div className="text-[10px] text-red-400">Time Window: {activeCase.predictedTimeWindow}</div>
                    </div>
                  </div>

                  {/* Victim Information with Privacy Unmask */}
                  <div className="p-4 bg-[#141414] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                        [ VICTIM RECORD & JURISDICTION COMPLIANCE ]
                      </span>
                      <button
                        onClick={() => setUnmaskVictim(!unmaskVictim)}
                        className="flex items-center gap-1.5 text-[10px] text-neon hover:underline uppercase"
                      >
                        {unmaskVictim ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        <span>{unmaskVictim ? 'MASK IDENTIFIERS' : 'UNMASK FOR INVESTIGATOR'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Victim Name:</span>
                        <strong className="text-white">
                          {unmaskVictim ? activeCase.victim.name : activeCase.victim.maskedName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Demographics:</span>
                        <strong className="text-white">{activeCase.victim.age} Yrs • {activeCase.victim.gender}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Contact Number:</span>
                        <strong className="text-white">{activeCase.victim.phoneMasked}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase">Debited Bank:</span>
                        <strong className="text-white">{activeCase.victim.bankName}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-zinc-500 block text-[9px] uppercase mb-1">Victim Complaint Statement:</span>
                      <p className="p-2.5 bg-black border border-white/5 text-zinc-300 leading-relaxed text-[11px]">
                        &quot;{activeCase.victim.summaryText}&quot;
                      </p>
                    </div>
                  </div>

                  {/* AI Case Summary & Gang Attribution */}
                  <div className="p-4 bg-neon/5 border border-neon/30 space-y-2">
                    <div className="flex items-center gap-2 text-neon text-[10px] uppercase font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      CYBERCAST AI SYNTHESIS & ATTRIBUTION (CONFIDENCE: {activeCase.confidenceScore}%)
                    </div>
                    <p className="text-zinc-200 leading-relaxed text-[11px]">
                      {activeCase.aiSummary}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 text-[10px]">
                      <div>Attributed Syndicate: <strong className="text-amber-400">{activeCase.suspectedGang}</strong></div>
                      <div>Linked Mule Accounts: <strong className="text-white">{activeCase.linkedMuleAccounts.length} Flagged</strong></div>
                      <div>Linked IMEIs: <strong className="text-white">{activeCase.linkedIMEIs.length} Captured</strong></div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MONEY TRAIL FLOWCHART */}
              {activeTab === 'money_trail' && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between p-3 bg-[#141414] border border-white/10">
                    <div>
                      <h3 className="font-bold text-white uppercase text-xs">
                        Interactive Fund Dispersal Flowchart
                      </h3>
                      <p className="text-[10px] text-zinc-400">
                        CFCFRMS Real-Time Automated Multi-Tier Account Tracing
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 uppercase">Secured Ratio:</div>
                      <div className="text-sm font-bold text-emerald-400">
                        ₹{activeCase.recoveredAmount.toLocaleString('en-IN')} / ₹{activeCase.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Flowchart Nodes */}
                  <div className="space-y-4">
                    {activeCase.moneyTrail.map((node, idx) => {
                      const isFrozen = frozenNodeIds.includes(node.id) || node.status === 'Frozen';
                      return (
                        <div key={node.id} className="relative">
                          {idx > 0 && (
                            <div className="w-0.5 h-4 bg-neon/40 mx-auto my-1 flex items-center justify-center">
                              <CornerDownRight className="h-3 w-3 text-neon" />
                            </div>
                          )}

                          <div className={`p-4 bg-[#141414] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isFrozen 
                              ? 'border-cyan-500/50 bg-cyan-950/10' 
                              : node.type === 'atm'
                              ? 'border-red-500/50 bg-red-950/10'
                              : 'border-white/15'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 border ${
                                node.type === 'victim' ? 'border-white/20 bg-black text-white' :
                                node.type === 'mule' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' :
                                'border-red-500/40 bg-red-500/10 text-red-400'
                              }`}>
                                {node.type === 'victim' ? <Building className="h-4 w-4" /> :
                                 node.type === 'mule' ? <Smartphone className="h-4 w-4" /> :
                                 <MapPin className="h-4 w-4" />}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                                    [{node.label}]
                                  </span>
                                  <span className="text-white font-bold text-xs">{node.bank}</span>
                                </div>
                                <div className="text-[11px] text-zinc-300">
                                  Account: <strong>{node.accountMasked}</strong> • {node.location}
                                </div>
                                <div className="text-[9px] text-zinc-500">
                                  Transfer Timestamp: {node.timestamp} {node.holderName ? `• Beneficiary: ${node.holderName}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  ₹{node.amount.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[9px]">
                                  {isFrozen ? (
                                    <span className="text-cyan-400 font-bold uppercase">LIEN FROZEN ✓</span>
                                  ) : node.status === 'Drained' ? (
                                    <span className="text-zinc-500 uppercase">TRANSFERRED OUT</span>
                                  ) : (
                                    <span className="text-red-400 font-bold uppercase">ACTIVE RISK</span>
                                  )}
                                </div>
                              </div>

                              {/* Freeze Button for Active Mules */}
                              {node.type === 'mule' && (
                                <button
                                  onClick={() => handleRequestFreeze(node.id, node.accountMasked)}
                                  disabled={isFrozen}
                                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isFrozen 
                                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 cursor-not-allowed'
                                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                  }`}
                                >
                                  {isFrozen ? 'FROZEN VIA CFCFRMS' : 'REQUEST FREEZE'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 3: EVIDENCE LOCKER */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Linked Evidentiary Artifacts ({EVIDENCE_DATA.filter(e => e.caseId === activeCase.id).length})
                    </span>
                    <span className="text-[10px] text-neon">SHA-256 INTEGRITY VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EVIDENCE_DATA.filter(e => e.caseId === activeCase.id).map((ev) => (
                      <div key={ev.id} className="p-3.5 bg-[#141414] border border-white/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-neon/10 border border-neon/40 text-neon font-bold px-1.5 py-0.2 uppercase">
                            {ev.category}
                          </span>
                          <span className="text-[9px] text-zinc-500">{ev.fileSize}</span>
                        </div>
                        <div className="font-bold text-white text-xs">{ev.title}</div>
                        <div className="text-[9px] text-zinc-400 font-mono truncate">
                          HASH: {ev.sha256Hash}
                        </div>
                        {ev.ocrExtractedText && (
                          <div className="p-2 bg-black border border-white/5 text-[10px] text-zinc-300">
                            <span className="text-[8px] text-neon block uppercase font-bold">OCR EXTRACT:</span>
                            {ev.ocrExtractedText}
                          </div>
                        )}
                        <div className="text-[9px] text-zinc-500 pt-1 border-t border-white/5 flex items-center justify-between">
                          <span>Uploaded: {ev.uploadedAt}</span>
                          <span className="text-zinc-300">{ev.confidentiality}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COMMUNICATION THREAD */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-neon" />
                      Inter-Agency Operational Comms ({activeCase.id})
                    </span>
                    <span className="text-[10px] text-neon bg-neon/10 px-2 py-0.5 border border-neon/30">
                      SECURE E2EE ENCRYPTED
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(CHAT_MESSAGES['case-44521'] || []).map((msg) => (
                      <div key={msg.id} className="p-3 bg-[#141414] border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{msg.senderName}</span>
                            <span className="text-zinc-500">[{msg.senderRank} • {msg.senderState}]</span>
                          </div>
                          <span className="text-zinc-500">{msg.timestamp}</span>
                        </div>

                        <div className="text-xs text-zinc-200">
                          {msg.translatedText || msg.originalText}
                        </div>

                        {msg.translatedText && (
                          <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-white/5">
                            <span className="text-neon">
                              [🇮🇳 {msg.originalLanguage} → {msg.translatedLanguage}] Conf: {msg.translationConfidence}%
                            </span>
                            <span className="italic">Orig: &quot;{msg.originalText.substring(0, 45)}...&quot;</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onOpenCaseChat && onOpenCaseChat(activeCase.id)}
                      className="px-4 py-2 bg-neon hover:bg-[#b8e600] text-black font-bold text-xs uppercase"
                    >
                      Open Full Translation Bridge Console →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: INTELLIGENCE REPORT */}
              {activeTab === 'intelligence' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#141414] border border-white/10 space-y-3">
                    <div className="text-xs font-bold text-neon uppercase flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      PREDICTIVE ATM WITHDRAWAL CORRIDOR REPORT
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] p-2.5 bg-black border border-white/5">
                      <div><span className="text-zinc-500 text-[9px] block">TARGET HOTSPOT:</span><strong>{activeCase.predictedZone}</strong></div>
                      <div><span className="text-zinc-500 text-[9px] block">CONFIDENCE:</span><strong className="text-neon">{activeCase.confidenceScore}% High Probability</strong></div>
                      <div><span className="text-zinc-500 text-[9px] block">EST. TIME WINDOW:</span><strong className="text-amber-400">{activeCase.predictedTimeWindow}</strong></div>
                      <div><span className="text-zinc-500 text-[9px] block">RECOVERY OUTLOOK:</span><strong className="text-emerald-400">High (72% Chance)</strong></div>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <div className="text-[10px] font-bold text-white uppercase">[ RECOMMENDED LAW ENFORCEMENT PROTOCOL ]</div>
                      <ol className="list-decimal pl-4 space-y-1 text-zinc-300 text-[11px]">
                        <li>Dispatch two undercover surveillance units to Sindhi Camp SBI ATM perimeter.</li>
                        <li>Alert nodal officer Priya Nambiar at SBI to place debit block on suspect mule cards.</li>
                        <li>Coordinate with Maharashtra Crime Branch regarding source victim FIR #412/2026.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ACTION LOG */}
              {activeTab === 'action_log' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-white pb-2 border-b border-white/10">
                    Statutory Case Audit Trail (Immutable & Cryptographically Chained)
                  </div>
                  <div className="space-y-2">
                    {activeCase.actionLog.map((log, idx) => (
                      <div key={idx} className="p-3 bg-[#141414] border border-white/5 flex items-start gap-3 text-[11px]">
                        <span className="text-neon font-bold text-[10px] whitespace-nowrap">{log.timestamp}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-white">{log.officerName}</strong>
                            <span className="text-zinc-500 text-[9px]">({log.role})</span>
                          </div>
                          <div className="text-zinc-300 mt-0.5">{log.action}</div>
                          <div className="text-zinc-500 text-[10px] mt-0.5">Outcome: {log.outcome}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* 6. STATUS CHANGE MODAL */}
      {statusModalOpen && activeCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-white/25 shadow-2xl p-5 relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Update Case Status: {activeCase.id}
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Formal status transitions are permanently recorded in the national immutable audit log.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Select New Status:</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono uppercase focus:border-neon rounded-none"
                >
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="SURVEILLANCE_ACTIVE">SURVEILLANCE ACTIVE</option>
                  <option value="FUNDS_FROZEN">FUNDS FROZEN</option>
                  <option value="ARREST_MADE">ARREST MADE</option>
                  <option value="CASE_RESOLVED">CASE RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Mandatory Officer Note / Reason:</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Provide statutory rationale, seizure memo reference, or court order details..."
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono placeholder-zinc-500 focus:border-neon rounded-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 bg-black border border-white/20 text-zinc-300 hover:text-white uppercase text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-1.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-[10px]"
                >
                  COMMIT STATUS UPDATE →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
