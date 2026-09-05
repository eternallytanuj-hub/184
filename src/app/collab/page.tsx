'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  OFFICER_ROLES, 
  OfficerRole, 
  OfficerProfile,
  CASES_DATA,
  CaseEntity,
  AUDIT_LOGS_DATA,
  AuditLogEntry
} from '@/data/collabData';
import CollabHeader from '@/components/collab/CollabHeader';
import CaseManagementModule from '@/components/collab/CaseManagementModule';
import CommunicationModule from '@/components/collab/CommunicationModule';
import IntelligenceReportsModule from '@/components/collab/IntelligenceReportsModule';
import EvidenceModule from '@/components/collab/EvidenceModule';
import TaskManagementModule from '@/components/collab/TaskManagementModule';
import SearchAndAuditModule from '@/components/collab/SearchAndAuditModule';
import AuthModal from '@/components/collab/AuthModal';
import { 
  Briefcase, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  CheckSquare, 
  Search, 
  Clock, 
  Shield, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function CollabPage() {
  const [currentRole, setCurrentRole] = useState<OfficerRole>('i4c_admin');
  const [activeTab, setActiveTab] = useState<
    'cases' | 'comms' | 'intel' | 'evidence' | 'tasks' | 'nexus_audit'
  >('cases');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Cross-module selected case
  const [directSelectedCaseId, setDirectSelectedCaseId] = useState<string | null>(null);

  // Dynamic Audit logs state to capture in-session actions
  const [inSessionAuditLogs, setInSessionAuditLogs] = useState<AuditLogEntry[]>(AUDIT_LOGS_DATA);

  const currentOfficer: OfficerProfile = OFFICER_ROLES[currentRole];

  // Helper to log user interactions to the immutable audit trail
  const handleAuditLog = (action: string, entityId: string, entityType: string) => {
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(90200 + inSessionAuditLogs.length)}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
      officerName: currentOfficer.name,
      officerId: currentOfficer.id,
      role: currentOfficer.roleName,
      action: action,
      entityType: entityType as any,
      entityId: entityId,
      ipAddress: '10.24.110.19',
      deviceInfo: `${currentOfficer.rank} Console (Secured Terminal)`,
      integrityHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'VERIFIED',
    };
    setInSessionAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleRoleChange = (newRole: OfficerRole) => {
    setCurrentRole(newRole);
    handleAuditLog(`SWITCHED_OPERATIONAL_ROLE_TO_${newRole.toUpperCase()}`, newRole, 'LOGIN');
  };

  const handleSelectCaseFromSearch = (caseId: string) => {
    setDirectSelectedCaseId(caseId);
    setActiveTab('cases');
  };

  const navTabs = [
    {
      id: 'cases',
      label: 'Case Management & Dossiers',
      sublabel: '6-Tab Master Dossier',
      icon: <Briefcase className="w-4 h-4" />,
      badge: '8 Active',
    },
    {
      id: 'comms',
      label: 'Inter-State Collaboration',
      sublabel: '15+ Indian Languages Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: '3 Live',
    },
    {
      id: 'intel',
      label: 'AI Intelligence & SITREP',
      sublabel: 'Bilingual Daily Bulletins',
      icon: <FileText className="w-4 h-4" />,
      badge: 'NEW',
    },
    {
      id: 'evidence',
      label: 'Digital Evidence Locker',
      sublabel: 'SHA-256 Tamper Evident',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Sec 65B',
    },
    {
      id: 'tasks',
      label: 'Field Task Coordination',
      sublabel: '4h SLA Escalation Protocol',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: '5 Orders',
    },
    {
      id: 'nexus_audit',
      label: 'Nexus Search & Audit Trail',
      sublabel: 'Pan-India AI Graph & Logs',
      icon: <Search className="w-4 h-4" />,
      badge: 'Certified',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col font-sans selection:bg-[#ceff00] selection:text-black">
      {/* Top Law Enforcement Command Bar */}
      <CollabHeader
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onLoginClick={() => setShowAuthModal(true)}
      />

      {/* Role Banner / Context Strip */}
      <div className="bg-[#121212] border-b border-white/10 px-4 md:px-8 py-2.5">
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#ceff00]">
              <Shield className="w-3.5 h-3.5" />
              AUTHENTICATED AS:
            </span>
            <span className="font-bold text-white uppercase">{currentOfficer.name}</span>
            <span className="text-white/40">[{currentOfficer.rank}]</span>
            <span className="text-white/30 hidden lg:inline">•</span>
            <span className="text-white/60 hidden lg:inline">{currentOfficer.department}</span>
          </div>

          <div className="flex items-center gap-4 text-white/50 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">I4C SECURE NODE: ONLINE</span>
            </span>
            <span className="text-white/30">•</span>
            <span>JURISDICTION: <span className="text-white/80">{currentOfficer.state}</span></span>
            <span className="text-white/30">•</span>
            <span>ACTIVE CASES: <span className="text-[#ceff00] font-bold">{currentOfficer.assignedCasesCount}</span></span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Module Navigation Tabs */}
        <div className="border border-white/10 bg-[#121212] p-1.5 rounded-none shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`p-3 text-left transition-all rounded-none border flex flex-col justify-between relative group ${
                    isActive
                      ? 'bg-[#ceff00] text-black border-[#ceff00] shadow-[0_0_15px_rgba(206,255,0,0.25)]'
                      : 'bg-[#0c0c0c] text-white/70 hover:text-white border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={isActive ? 'text-black' : 'text-[#ceff00]'}>
                      {tab.icon}
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none font-bold uppercase ${
                        isActive
                          ? 'bg-black text-[#ceff00]'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>

                  <div>
                    <div
                      className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        isActive ? 'text-black' : 'text-white'
                      }`}
                    >
                      {tab.label}
                    </div>
                    <div
                      className={`text-[10px] font-mono truncate mt-0.5 ${
                        isActive ? 'text-black/70' : 'text-white/40'
                      }`}
                    >
                      {tab.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Module Views */}
        <div className="transition-all duration-200">
          {activeTab === 'cases' && (
            <CaseManagementModule
              currentOfficer={currentOfficer}
              onOpenCaseChat={(caseId) => setActiveTab('comms')}
              onAuditLog={handleAuditLog}
            />
          )}

          {activeTab === 'comms' && (
            <CommunicationModule
              currentOfficer={currentOfficer}
              onAuditLog={handleAuditLog}
            />
          )}

          {activeTab === 'intel' && (
            <IntelligenceReportsModule
              currentOfficer={currentOfficer}
              onAuditLog={handleAuditLog}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceModule
              currentOfficer={currentOfficer}
              onAuditLog={handleAuditLog}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManagementModule
              currentOfficer={currentOfficer}
              onAuditLog={handleAuditLog}
            />
          )}

          {activeTab === 'nexus_audit' && (
            <SearchAndAuditModule
              currentOfficer={currentOfficer}
              onSelectCase={handleSelectCaseFromSearch}
              onAuditLog={handleAuditLog}
            />
          )}
        </div>
      </main>

      {/* Institutional Legal Footer */}
      <footer className="border-t border-white/10 bg-[#080808] py-6 px-4 md:px-8 mt-12">
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <div className="flex items-center gap-3">
            <span className="text-[#ceff00] font-bold">CYBERCAST SIH PS 184</span>
            <span>•</span>
            <span>MINISTRY OF HOME AFFAIRS, GOVT OF INDIA</span>
            <span>•</span>
            <span>INDIAN CYBER CRIME COORDINATION CENTRE (I4C)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>SECTION 65B IEA COMPLIANT</span>
            <span>•</span>
            <span>CFCFRMS GATEWAY INTEGRATED</span>
            <span>•</span>
            <span>TAMPER EVIDENT AUDIT TRAIL</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(role) => setCurrentRole(role)}
        currentRole={currentRole}
      />
    </div>
  );
}
