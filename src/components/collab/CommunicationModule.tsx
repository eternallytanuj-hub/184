'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Send, Languages, Mic, Paperclip, 
  MapPin, Shield, CheckCheck, Users, Radio, AlertTriangle, 
  CornerDownRight, Volume2, Globe, Clock, ChevronDown, 
  Sparkles, FileText, ArrowRight, Share2, Check
} from 'lucide-react';
import { 
  OfficerRole, OFFICER_ROLES, OfficerProfile, CHAT_CHANNELS, CHAT_MESSAGES, 
  ChatMessage, INDIAN_LANGUAGES 
} from '@/data/collabData';

interface CommunicationModuleProps {
  currentRole?: OfficerRole;
  currentOfficer?: OfficerProfile;
  activeCaseId?: string | null;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function CommunicationModule({
  currentRole: propRole,
  currentOfficer,
  activeCaseId,
  onAuditLog,
}: CommunicationModuleProps) {
  const currentRole = propRole || currentOfficer?.role || 'i4c_admin';
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    activeCaseId ? `case-${activeCaseId.split('-')[2] || '44521'}` : 'case-44521'
  );
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [autoTranslateMode, setAutoTranslateMode] = useState(true);
  const [targetLanguage, setTargetLanguage] = useState<string>('hi');
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  // Quick message template open state
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Inter-State Action Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [jointModalOpen, setJointModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Form states for modals
  const [helpDetails, setHelpDetails] = useState({ targetState: 'Haryana', atmLocation: 'Tauru Chowk ATM', reason: 'Urgent CCTV DVR retrieval' });
  const [transferDetails, setTransferDetails] = useState({ targetState: 'Rajasthan', reason: 'Victim FIR originating in Mumbai, cash withdrawal transit confirmed in Jaipur' });

  // Quick Templates List
  const QUICK_TEMPLATES = [
    'Requesting immediate backup at [Sindhi Camp ATM Terminal]',
    'Suspect spotted at ATM wearing black hoodie, proceeding to detain',
    'CFCFRMS Account freeze confirmed for beneficiary [SBI-XXXX-4491]',
    'Funds successfully intercepted and recovered: ₹[2,65,000]',
    'False alert, area verified clear by field patrol squad',
    'Requesting inter-state CDR & tower dump analysis for case CY-44521',
  ];

  const activeOfficer = OFFICER_ROLES[currentRole];
  const currentMessages = messages[selectedChannelId] || [];

  // Toggle showing original vs translated text
  const toggleShowOriginal = (msgId: string) => {
    setShowOriginalMap(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Simulate AI Auto-Translation for outgoing message
    let simulatedTrans = '';
    let simLang = 'Hindi';
    if (activeOfficer.preferredLanguage === 'English') {
      simulatedTrans = `[AI Auto-Translated to Hindi]: ${text}`;
      simLang = 'Hindi';
    } else {
      simulatedTrans = `[AI Auto-Translated to English]: ${text}`;
      simLang = 'English';
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: activeOfficer.id,
      senderName: activeOfficer.name,
      senderRank: activeOfficer.rank,
      senderState: activeOfficer.state,
      channelId: selectedChannelId,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      originalText: text,
      originalLanguage: activeOfficer.preferredLanguage,
      translatedText: simulatedTrans,
      translatedLanguage: simLang,
      translationConfidence: 97,
      type: 'text',
      reactions: [],
    };

    setMessages(prev => ({
      ...prev,
      [selectedChannelId]: [...(prev[selectedChannelId] || []), newMsg],
    }));

    setInputMessage('');
    setTemplatesOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-white select-none">
      
      {/* 1. TOP SECURE COMMUNICATION BAR */}
      <div className="p-4 bg-[#141414] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-neon/10 border border-neon text-neon">
            <Languages className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Inter-State Encrypted Collaboration & Multi-Language Bridge
              <span className="text-[10px] text-neon bg-neon/10 border border-neon/30 px-1.5 py-0.2">
                E2E ENCRYPTED
              </span>
            </h2>
            <div className="text-[10px] text-zinc-400">
              Live AI Translation supporting 15+ Indian Languages for Seamless Cross-State Coordination
            </div>
          </div>
        </div>

        {/* Translation Mode Controls */}
        <div className="flex items-center gap-3 bg-black px-3 py-1.5 border border-white/15 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-neon" />
            <span className="text-[10px] text-zinc-300 uppercase">AUTO-TRANSLATE:</span>
            <button
              onClick={() => setAutoTranslateMode(!autoTranslateMode)}
              className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                autoTranslateMode ? 'bg-neon text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {autoTranslateMode ? 'ON [ACTIVE]' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase">MY TARGET:</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-[#141414] border border-white/20 px-1.5 py-0.5 text-[10px] text-neon focus:outline-none rounded-none"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 2. MAIN 2-PANEL CHAT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: CHANNELS & INTER-STATE TOOLS */}
        <div className="w-72 sm:w-80 flex-shrink-0 bg-[#101010] border-r border-white/10 flex flex-col">
          
          <div className="p-3 bg-[#141414] border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            [ COORDINATION CHANNELS ]
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {CHAT_CHANNELS.map((ch) => {
              const isSelected = ch.id === selectedChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`w-full text-left p-2.5 border transition-all text-xs flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-neon/10 border-neon text-white'
                      : 'bg-black/40 border-white/5 text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-2 truncate">
                    {ch.type === 'case' ? <FileText className="h-3.5 w-3.5 text-neon mt-0.5 flex-shrink-0" /> :
                     ch.type === 'group' ? <Users className="h-3.5 w-3.5 text-cyan-400 mt-0.5 flex-shrink-0" /> :
                     ch.type === 'broadcast' ? <Radio className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" /> :
                     <Shield className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />}
                    <div className="truncate">
                      <div className="font-bold truncate text-[11px]">{ch.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {ch.stateTags.map((tag) => (
                          <span key={tag} className="text-[8px] px-1 bg-white/10 text-zinc-300 border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {ch.unread > 0 && (
                    <span className="h-4 w-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {ch.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* INTER-STATE COLLAB WORKFLOW BUTTONS */}
          <div className="p-3 bg-[#141414] border-t border-white/10 space-y-1.5">
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
              [ INTER-STATE DIRECTIVES ]
            </div>
            <button
              onClick={() => setTransferModalOpen(true)}
              className="w-full py-1.5 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[10px] uppercase font-bold text-left px-2.5 flex items-center justify-between"
            >
              <span>INTER-STATE CASE TRANSFER</span>
              <ArrowRight className="h-3 w-3 text-neon" />
            </button>
            <button
              onClick={() => setJointModalOpen(true)}
              className="w-full py-1.5 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[10px] uppercase font-bold text-left px-2.5 flex items-center justify-between"
            >
              <span>CREATE JOINT TASK FORCE</span>
              <Users className="h-3 w-3 text-cyan-400" />
            </button>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="w-full py-1.5 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[10px] uppercase font-bold text-left px-2.5 flex items-center justify-between"
            >
              <span>FORMAL HELP REQUEST (4H SLA)</span>
              <Clock className="h-3 w-3 text-amber-400" />
            </button>
          </div>

        </div>

        {/* RIGHT PANEL: CHAT THREAD & MULTI-LANGUAGE TRANSLATION DISPLAY */}
        <div className="flex-1 flex flex-col bg-[#0c0c0c]">
          
          {/* Active Chat Header */}
          <div className="p-3 bg-[#141414] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-neon rounded-none" />
              <span className="text-xs font-bold text-white uppercase">
                {CHAT_CHANNELS.find(c => c.id === selectedChannelId)?.name}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>ACTIVE PARTICIPANTS: <strong>5 UNITS</strong></span>
              <span className="text-zinc-600">|</span>
              <span className="text-neon">TRANSLATION CONFIDENCE: 96%</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentMessages.map((msg) => {
              const isMe = msg.senderId === activeOfficer.id;
              const isOriginalExpanded = showOriginalMap[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-2xl ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  {/* Sender Metadata Bar */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-1 px-1">
                    <strong className="text-white">{msg.senderName}</strong>
                    <span className="text-zinc-500">• {msg.senderRank} ({msg.senderState})</span>
                    <span className="text-zinc-500">• {msg.timestamp}</span>
                    {msg.isPinned && (
                      <span className="text-neon text-[9px] bg-neon/10 border border-neon/30 px-1">
                        PINNED
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-3.5 border space-y-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#181818] border-neon/50 text-white'
                      : 'bg-[#141414] border-white/15 text-zinc-200'
                  }`}>
                    
                    {/* BILINGUAL TRANSLATION ENGINE CARD */}
                    {msg.translatedText && autoTranslateMode ? (
                      <div className="space-y-1.5">
                        
                        {/* Primary Translated View */}
                        <div className="text-zinc-100 font-medium">
                          {msg.translatedText}
                        </div>

                        {/* Translation Metadata Bar */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span className="text-neon font-bold">
                              [🇮🇳 {msg.originalLanguage} → {msg.translatedLanguage || 'Target'}]
                            </span>
                            <span>Conf: {msg.translationConfidence}%</span>
                          </div>

                          <button
                            onClick={() => toggleShowOriginal(msg.id)}
                            className="text-zinc-400 hover:text-white underline uppercase"
                          >
                            {isOriginalExpanded ? 'HIDE ORIGINAL' : 'VIEW ORIGINAL'}
                          </button>
                        </div>

                        {/* Collapsed/Expanded Original Regional Text */}
                        {isOriginalExpanded && (
                          <div className="p-2 bg-black border border-white/10 text-[10px] text-zinc-300 font-sans mt-1">
                            <span className="text-[8px] text-zinc-500 block font-mono uppercase mb-0.5">
                              ORIGINAL UNALTERED TRANSCRIPT:
                            </span>
                            {msg.originalText}
                          </div>
                        )}

                      </div>
                    ) : (
                      /* Plain text without translation */
                      <div>{msg.originalText}</div>
                    )}

                    {/* Voice Message Player UI (If voice message) */}
                    {msg.type === 'voice' && (
                      <div className="p-2.5 bg-black border border-white/10 space-y-1.5 mt-2">
                        <div className="flex items-center gap-3">
                          <button className="p-1.5 bg-neon text-black hover:bg-neon/90">
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex-1 flex items-center gap-1 h-4">
                            {[40, 70, 90, 60, 80, 100, 50, 65, 85, 45, 95, 30].map((h, i) => (
                              <div key={i} className="flex-1 bg-neon/80" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                          <span className="text-[9px] text-zinc-400">{msg.voiceDuration || '0:30'}</span>
                        </div>
                        {msg.voiceTranscript && (
                          <div className="text-[9px] text-zinc-400 border-t border-white/5 pt-1">
                            Voice STT: <span className="text-zinc-200">{msg.voiceTranscript}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions */}
                    {msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {msg.reactions.map((r, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-black/60 border border-white/10 text-[10px] text-zinc-300 flex items-center gap-1"
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[9px]">{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>

          {/* Chat Input & Action Bar */}
          <div className="p-3 bg-[#141414] border-t border-white/10 space-y-2">
            
            {/* Quick Templates Drawer */}
            {templatesOpen && (
              <div className="p-2 bg-black border border-white/15 space-y-1 text-xs">
                <div className="text-[9px] text-neon font-bold uppercase mb-1">
                  SELECT RAPID INTERVENTION TEMPLATE:
                </div>
                {QUICK_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(tmpl)}
                    className="w-full text-left p-1.5 bg-[#141414] hover:bg-neon hover:text-black border border-white/5 text-[10px] text-zinc-300 transition-colors"
                  >
                    • {tmpl}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTemplatesOpen(!templatesOpen)}
                className="px-2 py-2 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[10px] uppercase font-bold whitespace-nowrap"
                title="Quick Police Response Templates"
              >
                [ TEMPLATES ]
              </button>

              <button
                onClick={() => alert('GPS Location shared: 26.9196° N, 75.7942° E (Sindhi Camp ATM Terminal)')}
                className="p-2 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white"
                title="Share Live Officer GPS Location"
              >
                <MapPin className="h-4 w-4 text-neon" />
              </button>

              <button
                onClick={() => alert('Simulated microphone recording: Audio captured and transcribed via regional STT.')}
                className="p-2 bg-black hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white"
                title="Voice Memo Recording & Transcription"
              >
                <Mic className="h-4 w-4 text-amber-400" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Type message in any Indian language (Auto-Translates to recipient's language)...`}
                className="flex-1 bg-black border border-white/20 p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-neon rounded-none"
              />

              <button
                onClick={() => handleSendMessage()}
                className="px-4 py-2 bg-neon text-black font-bold uppercase text-xs hover:bg-neon/90 flex items-center gap-1.5"
              >
                <span>SEND</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-[9px] text-zinc-500 flex items-center justify-between">
              <span>AI Translation disclaimer: Verify all evidentiary statements for statutory legal compliance.</span>
              <span>Supported: HI, EN, TA, TE, KN, ML, BN, MR, GU, PA, OR, UR, AS, RAJ, BHO</span>
            </div>

          </div>

        </div>

      </div>

      {/* 3. INTER-STATE CASE TRANSFER MODAL */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-white/25 shadow-2xl p-5 relative">
            <div className="text-sm font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-neon" />
              Initiate Inter-State Case Transfer
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Transfer case jurisdiction when primary cash withdrawal nexus originates in another state.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Target Receiving State Cyber Cell:</label>
                <select
                  value={transferDetails.targetState}
                  onChange={(e) => setTransferDetails({ ...transferDetails, targetState: e.target.value })}
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono uppercase focus:border-neon rounded-none"
                >
                  <option value="Rajasthan">RAJASTHAN (STATE CYBER CELL, JAIPUR)</option>
                  <option value="Haryana">HARYANA (CYBER CRIME CELL, GURUGRAM)</option>
                  <option value="Delhi">DELHI (IFSO / SPECIAL CELL)</option>
                  <option value="Jharkhand">JHARKHAND (STATE CID CYBER, RANCHI)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Statutory Justification:</label>
                <textarea
                  rows={3}
                  value={transferDetails.reason}
                  onChange={(e) => setTransferDetails({ ...transferDetails, reason: e.target.value })}
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono placeholder-zinc-500 focus:border-neon rounded-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3 py-1.5 bg-black border border-white/20 text-zinc-300 hover:text-white uppercase text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    alert(`Inter-State Transfer request dispatched to ${transferDetails.targetState} Nodal Officer with full evidentiary chain.`);
                    setTransferModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-[10px]"
                >
                  DISPATCH TRANSFER DOSSIER →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FORMAL HELP REQUEST (4H SLA) MODAL */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-amber-500/50 shadow-2xl p-5 relative">
            <div className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Formal Help Request (4-Hour Auto-Escalation SLA)
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Formal mutual assistance dispatch requiring neighboring cyber cells to respond within 4 hours before escalating to I4C Joint Director.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Target Jurisdiction:</label>
                <input
                  type="text"
                  value={helpDetails.targetState}
                  onChange={(e) => setHelpDetails({ ...helpDetails, targetState: e.target.value })}
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono rounded-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Required Ground Operation:</label>
                <input
                  type="text"
                  value={helpDetails.reason}
                  onChange={(e) => setHelpDetails({ ...helpDetails, reason: e.target.value })}
                  className="w-full bg-black border border-white/20 p-2 text-white font-mono rounded-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setHelpModalOpen(false)}
                  className="px-3 py-1.5 bg-black border border-white/20 text-zinc-300 hover:text-white uppercase text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    alert(`Formal Help Request logged with Ticket #SLA-${Date.now().toString().slice(-4)}. 4-hour countdown initiated.`);
                    setHelpModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-[10px]"
                >
                  TRANSMIT MANDATE →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE JOINT TASK FORCE MODAL */}
      {jointModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
          <div className="w-full max-w-md bg-[#141414] border border-cyan-500/50 shadow-2xl p-5 relative">
            <div className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convene Multi-State Joint Task Force
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Establish a unified operational room uniting cyber crime cells across multiple state borders for coordinated syndicate takedowns.
            </p>

            <div className="space-y-2 text-xs mb-4">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Participating State Cyber Units:</div>
              <div className="space-y-1 bg-black p-2.5 border border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-none" />
                  <span>Rajasthan Cyber Crime Police (Jaipur HQ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-none" />
                  <span>Haryana Cyber Unit (Mewat / Gurugram)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-none" />
                  <span>Uttar Pradesh Cyber Police (Lucknow HQ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-none" />
                  <span>Maharashtra Crime Branch (Mumbai)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setJointModalOpen(false)}
                className="px-3 py-1.5 bg-black border border-white/20 text-zinc-300 hover:text-white uppercase text-[10px]"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  alert(`Task Force "Operation Dark Corridor" convened! Joint workspace and encrypted channel activated.`);
                  setJointModalOpen(false);
                }}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[10px]"
              >
                ACTIVATE TASK FORCE →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
