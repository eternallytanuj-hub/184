'use client';

import React, { useState } from 'react';
import { 
  EVIDENCE_DATA, 
  EvidenceItem, 
  CASES_DATA, 
  OfficerProfile 
} from '@/data/collabData';
import { 
  FileCheck2, 
  ShieldCheck, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Hash, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Camera, 
  CreditCard, 
  Smartphone, 
  Scale, 
  Lock, 
  X, 
  Copy, 
  Check, 
  RefreshCw,
  MapPin,
  Laptop
} from 'lucide-react';

interface EvidenceModuleProps {
  currentOfficer: OfficerProfile;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function EvidenceModule({ currentOfficer, onAuditLog }: EvidenceModuleProps) {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(EVIDENCE_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  
  // Modals
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Verification states
  const [verifyingHashId, setVerifyingHashId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verifiedHashes, setVerifiedHashes] = useState<Record<string, boolean>>({
    'EVD-2026-901': true,
    'EVD-2026-902': true,
    'EVD-2026-903': true,
    'EVD-2026-904': true,
  });

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    caseId: CASES_DATA[0].id,
    category: 'Communication' as EvidenceItem['category'],
    type: 'image' as EvidenceItem['type'],
    fileName: '',
    fileSize: '1.2 MB',
    confidentiality: 'Restricted' as EvidenceItem['confidentiality'],
    source: 'Police' as EvidenceItem['source'],
    ocrText: '',
    sha256: '',
  });

  const categories = [
    { id: 'ALL', label: 'All Evidence' },
    { id: 'Communication', label: 'Communications & Chat' },
    { id: 'Financial', label: 'Financial & CFCFRMS' },
    { id: 'Surveillance', label: 'CCTV & Surveillance' },
    { id: 'Legal', label: 'FIR & Judicial' },
    { id: 'Device', label: 'Device & Hardware' },
    { id: 'Identity', label: 'Identity & KYC' },
  ];

  const filteredEvidence = evidenceList.filter((ev) => {
    if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false;
    if (selectedCaseFilter !== 'ALL' && ev.caseId !== selectedCaseFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      ev.id.toLowerCase().includes(q) ||
      ev.title.toLowerCase().includes(q) ||
      ev.fileName.toLowerCase().includes(q) ||
      ev.caseId.toLowerCase().includes(q) ||
      ev.sha256Hash.toLowerCase().includes(q) ||
      (ev.ocrExtractedText && ev.ocrExtractedText.toLowerCase().includes(q))
    );
  });

  const handleVerifyHash = (id: string) => {
    setVerifyingHashId(id);
    setTimeout(() => {
      setVerifiedHashes((prev) => ({ ...prev, [id]: true }));
      setVerifyingHashId(null);
      if (onAuditLog) {
        onAuditLog('VERIFIED_EVIDENCE_SHA256', id, 'EVIDENCE');
      }
    }, 1200);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDownload = (ev: EvidenceItem) => {
    if (onAuditLog) {
      onAuditLog('DOWNLOADED_FORENSIC_EVIDENCE', ev.id, 'EVIDENCE');
    }
    alert(`[MHA I4C FORENSIC CHAIN] Generating cryptographically stamped bundle for ${ev.fileName} (SHA-256: ${ev.sha256Hash.substring(0, 12)}...). Download logged to central immutable audit trail.`);
  };

  const handleFileSelectSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const generatedHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        sha256: generatedHash,
      }));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.fileName) {
      alert('Please enter evidence title and attach file.');
      return;
    }

    const newEvidence: EvidenceItem = {
      id: `EVD-2026-${Math.floor(100 + Math.random() * 900)}`,
      caseId: uploadForm.caseId,
      title: uploadForm.title,
      category: uploadForm.category,
      type: uploadForm.type,
      fileName: uploadForm.fileName,
      fileSize: uploadForm.fileSize || '2.4 MB',
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      uploadedBy: `${currentOfficer.name} (${currentOfficer.badgeNumber})`,
      uploadingOfficerId: currentOfficer.id,
      deviceUsed: `${currentOfficer.rank} Secure Terminal (VPN Authenticated)`,
      gpsCoordinates: '26.9124° N, 75.7873° E (Verified Command GPS)',
      sha256Hash: uploadForm.sha256 || 'a4f3b2c1d0e9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
      relevance: 'Primary',
      source: uploadForm.source,
      confidentiality: uploadForm.confidentiality,
      ocrExtractedText: uploadForm.ocrText || undefined,
      chainOfCustody: [
        {
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          officerName: currentOfficer.name,
          action: 'Initial Evidence Ingestion & Cryptographic Hashing',
          purpose: 'Statutory Section 65B Indian Evidence Act Compliance',
        },
      ],
    };

    setEvidenceList([newEvidence, ...evidenceList]);
    setVerifiedHashes((prev) => ({ ...prev, [newEvidence.id]: true }));
    setShowUploadModal(false);

    if (onAuditLog) {
      onAuditLog('UPLOADED_FORENSIC_EVIDENCE', newEvidence.id, 'EVIDENCE');
    }
  };

  const getCategoryIcon = (cat: EvidenceItem['category']) => {
    switch (cat) {
      case 'Communication': return <FileText className="w-4 h-4 text-sky-400" />;
      case 'Financial': return <CreditCard className="w-4 h-4 text-[#ceff00]" />;
      case 'Surveillance': return <Camera className="w-4 h-4 text-rose-400" />;
      case 'Legal': return <Scale className="w-4 h-4 text-purple-400" />;
      case 'Device': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'Identity': return <Lock className="w-4 h-4 text-amber-400" />;
      default: return <FileCheck2 className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header telemetry and Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121212] border border-white/10 rounded-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#ceff00] uppercase bg-[#ceff00]/10 px-2 py-0.5 border border-[#ceff00]/30 rounded-none">
              MODULE 04 // EVIDENCE INTEGRITY & CUSTODY
            </span>
            <span className="text-[10px] font-mono text-white/40">SEC 65B IEA TAMPER-EVIDENT</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ceff00]" />
            Digital Evidence Locker & Chain of Custody
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            Cryptographic SHA-256 validation • Real-time OCR script parsing • Immutable multi-officer access tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none shadow-[0_0_15px_rgba(206,255,0,0.2)]"
          >
            <Upload className="w-4 h-4" />
            Ingest New Evidence
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#121212] border border-white/10 rounded-none">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Evidence ID, file, case, SHA-256 or OCR text..."
            className="w-full bg-[#0c0c0c] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#ceff00] rounded-none"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedCaseFilter}
            onChange={(e) => setSelectedCaseFilter(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
          >
            <option value="ALL">All Linked Cases</option>
            {CASES_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} ({c.victimState})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evidence Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEvidence.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#121212] border border-white/10 rounded-none">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <div className="text-sm font-mono text-white uppercase font-bold">No Evidence Items Found</div>
            <div className="text-xs font-mono text-white/50 mt-1">Adjust your search parameters or category filter</div>
          </div>
        ) : (
          filteredEvidence.map((ev) => {
            const isVerified = verifiedHashes[ev.id] ?? false;
            const isVerifying = verifyingHashId === ev.id;

            return (
              <div
                key={ev.id}
                className="bg-[#121212] border border-white/10 hover:border-white/30 transition-all p-5 rounded-none flex flex-col justify-between"
              >
                <div>
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#ceff00] bg-[#ceff00]/10 px-2 py-0.5 border border-[#ceff00]/30 rounded-none flex items-center gap-1.5 font-bold">
                        {getCategoryIcon(ev.category)}
                        {ev.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 border border-white/10 rounded-none">
                        CASE: {ev.caseId}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-none uppercase ${
                        ev.confidentiality === 'Top Secret'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                          : ev.confidentiality === 'Restricted'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                      }`}
                    >
                      {ev.confidentiality}
                    </span>
                  </div>

                  {/* Title and filename */}
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide mb-1">
                    {ev.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-white/50 mb-3">
                    <span>{ev.fileName}</span>
                    <span>•</span>
                    <span>{ev.fileSize}</span>
                    <span>•</span>
                    <span className="text-white/70">{ev.source} Sourced</span>
                  </div>

                  {/* Cryptographic SHA-256 Hash Display */}
                  <div className="p-3 bg-[#0c0c0c] border border-white/10 rounded-none mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-white/40 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#ceff00]" />
                        SHA-256 CHECKSUM (IMMUTABLE)
                      </span>
                      <button
                        onClick={() => handleCopyHash(ev.sha256Hash)}
                        className="text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedHash === ev.sha256Hash ? (
                          <>
                            <Check className="w-3 h-3 text-[#ceff00]" />
                            <span className="text-[#ceff00]">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-white/90 break-all bg-black/40 p-1.5 border border-white/5 select-all">
                      {ev.sha256Hash}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {isVerifying ? (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            CALCULATING SHA-256 BLOCK...
                          </span>
                        ) : isVerified ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            HASH VERIFIED — TAMPER EVIDENT
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            UNVERIFIED SIGNATURE
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleVerifyHash(ev.id)}
                        disabled={isVerifying}
                        className="text-[10px] font-mono text-[#ceff00] hover:underline uppercase disabled:opacity-50"
                      >
                        [ Re-Verify Checksum ]
                      </button>
                    </div>
                  </div>

                  {/* OCR snippet if present */}
                  {ev.ocrExtractedText && (
                    <div className="p-3 bg-[#171717] border-l-2 border-[#ceff00] mb-4 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#ceff00] font-bold">OCR EXTRACTED TEXT ({ev.detectedLanguage || 'REGIONAL'})</span>
                        <span className="text-white/40">NLP PARSED</span>
                      </div>
                      <p className="text-xs font-mono text-white/80 line-clamp-2 italic">
                        &quot;{ev.ocrExtractedText}&quot;
                      </p>
                      {ev.translatedText && (
                        <p className="text-[11px] font-mono text-white/50 line-clamp-1">
                          En: &quot;{ev.translatedText}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Metadata telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/50 mb-4 bg-[#0e0e0e] p-2.5 border border-white/5">
                    <div>
                      <span className="text-white/30 block">INGESTED BY</span>
                      <span className="text-white/80 truncate block">{ev.uploadedBy}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block">TIMESTAMP</span>
                      <span className="text-white/80 block">{ev.uploadedAt}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block">GPS COORDINATES</span>
                      <span className="text-white/80 truncate block">{ev.gpsCoordinates}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block">HARDWARE TERMINAL</span>
                      <span className="text-white/80 truncate block">{ev.deviceUsed}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedEvidence(ev);
                      setShowCustodyModal(true);
                    }}
                    className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-none transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#ceff00]" />
                    Chain of Custody ({ev.chainOfCustody.length})
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvidence(ev)}
                      className="text-xs font-mono text-white hover:text-[#ceff00] flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-none transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(ev)}
                      className="text-xs font-mono text-black font-bold flex items-center gap-1.5 px-3 py-1.5 bg-[#ceff00] hover:bg-[#b8e600] rounded-none transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {selectedEvidence && !showCustodyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/20 w-full max-w-3xl rounded-none max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase">
                  FORENSIC PREVIEW: {selectedEvidence.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-[#0c0c0c] border border-white/10 rounded-none">
                <h4 className="text-base font-bold text-white font-mono uppercase mb-1">
                  {selectedEvidence.title}
                </h4>
                <div className="text-xs font-mono text-white/50">
                  Case ID: {selectedEvidence.caseId} • Filename: {selectedEvidence.fileName} • {selectedEvidence.fileSize}
                </div>
              </div>

              {/* Simulated Viewer */}
              <div className="bg-black border border-white/10 p-6 text-center rounded-none min-h-[220px] flex flex-col items-center justify-center relative">
                <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  {getCategoryIcon(selectedEvidence.category)}
                </div>
                <div className="text-xs font-mono text-white uppercase font-bold">
                  {selectedEvidence.fileName}
                </div>
                <div className="text-[10px] font-mono text-white/40 mt-1">
                  Sec 65B Certified Forensic Media Container
                </div>

                {/* Holographic simulated forensic watermark */}
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#ceff00]/40">
                  DIGITALLY WATERMARKED // I4C FORENSIC LAB
                </div>
              </div>

              {/* OCR Deep View */}
              {selectedEvidence.ocrExtractedText && (
                <div className="p-4 bg-[#171717] border border-white/10 rounded-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#ceff00] uppercase">
                      Extracted Text Analysis ({selectedEvidence.detectedLanguage})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">99.4% OCR Confidence</span>
                  </div>
                  <div className="p-3 bg-[#0c0c0c] border border-white/10 font-mono text-xs text-white leading-relaxed">
                    {selectedEvidence.ocrExtractedText}
                  </div>
                  {selectedEvidence.translatedText && (
                    <div className="p-3 bg-[#0c0c0c] border border-white/10 font-mono text-xs text-white/70 leading-relaxed">
                      <span className="text-white/40 block text-[10px] mb-1">ENGLISH PARSED TRANSLATION:</span>
                      {selectedEvidence.translatedText}
                    </div>
                  )}
                </div>
              )}

              {/* SHA-256 Box */}
              <div className="p-3 bg-[#0c0c0c] border border-white/10 rounded-none space-y-1">
                <span className="text-[10px] font-mono text-white/40">FULL SHA-256 DIGEST</span>
                <p className="text-xs font-mono text-white/90 break-all bg-black/60 p-2 border border-white/5">
                  {selectedEvidence.sha256Hash}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0c0c0c] flex items-center justify-between">
              <button
                onClick={() => {
                  setShowCustodyModal(true);
                }}
                className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#ceff00]" />
                View Chain of Custody Log
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="px-4 py-2 border border-white/20 text-xs font-mono text-white hover:bg-white/5 rounded-none uppercase"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedEvidence)}
                  className="px-4 py-2 bg-[#ceff00] text-black text-xs font-mono font-bold hover:bg-[#b8e600] rounded-none uppercase"
                >
                  Download Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chain of Custody Modal */}
      {selectedEvidence && showCustodyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/20 w-full max-w-2xl rounded-none max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase">
                  IMMUTABLE CHAIN OF CUSTODY: {selectedEvidence.id}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCustodyModal(false);
                  setSelectedEvidence(null);
                }}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-[#0c0c0c] border border-white/10">
                <div className="text-xs font-mono font-bold text-white uppercase">
                  {selectedEvidence.title}
                </div>
                <div className="text-[10px] font-mono text-white/50 mt-1">
                  SHA-256: {selectedEvidence.sha256Hash.substring(0, 24)}...
                </div>
              </div>

              <div className="relative pl-6 border-l border-white/20 space-y-6">
                {selectedEvidence.chainOfCustody.map((log, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#ceff00] border-2 border-black rounded-none" />
                    <div className="text-xs font-mono font-bold text-[#ceff00]">
                      {log.timestamp} • {log.action}
                    </div>
                    <div className="text-xs font-mono text-white mt-0.5">
                      Officer: <span className="font-bold">{log.officerName}</span>
                    </div>
                    <div className="text-[11px] font-mono text-white/50 mt-0.5">
                      Statutory Purpose: {log.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0c0c0c] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowCustodyModal(false);
                  setSelectedEvidence(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase rounded-none"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Evidence Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/20 w-full max-w-2xl rounded-none max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase">
                  INGEST DIGITAL EVIDENCE (SEC 65B CERTIFIED)
                </span>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Evidence Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV Frame - Suspect at ATM Terminal #04"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Associate with Case *
                  </label>
                  <select
                    value={uploadForm.caseId}
                    onChange={(e) => setUploadForm({ ...uploadForm, caseId: e.target.value })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    {CASES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} ({c.fraudType.substring(0, 20)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Evidence Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    <option value="Communication">Communication (SMS, WhatsApp, Call)</option>
                    <option value="Financial">Financial (Statements, CFCFRMS)</option>
                    <option value="Surveillance">Surveillance (CCTV, Bodycam)</option>
                    <option value="Legal">Legal (FIR, Seizure Memo, Warrant)</option>
                    <option value="Device">Device (Phone, Hard Drive, SIM)</option>
                    <option value="Identity">Identity (Aadhaar, KYC, Photo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Source Entity
                  </label>
                  <select
                    value={uploadForm.source}
                    onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value as any })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    <option value="Police">Police Field Squad</option>
                    <option value="Victim">Victim Submission</option>
                    <option value="Bank">Bank / Financial Institution</option>
                    <option value="CCTV">ATM CCTV System</option>
                    <option value="AI-detected">CyberCast AI Predictive Engine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Confidentiality Rating
                  </label>
                  <select
                    value={uploadForm.confidentiality}
                    onChange={(e) => setUploadForm({ ...uploadForm, confidentiality: e.target.value as any })}
                    className="w-full bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  >
                    <option value="Restricted">Restricted (Inter-State Task Force)</option>
                    <option value="Top Secret">Top Secret (National I4C Only)</option>
                    <option value="Open">Open (All Investigating Officers)</option>
                  </select>
                </div>
              </div>

              {/* File input simulation */}
              <div className="p-4 border-2 border-dashed border-white/20 hover:border-[#ceff00] transition-colors rounded-none text-center bg-[#0c0c0c]">
                <input
                  type="file"
                  id="evidence-file"
                  onChange={handleFileSelectSimulation}
                  className="hidden"
                />
                <label htmlFor="evidence-file" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <div className="text-xs font-mono text-white font-bold uppercase">
                    {uploadForm.fileName ? uploadForm.fileName : 'Click or Drag file to calculate SHA-256'}
                  </div>
                  <div className="text-[10px] font-mono text-white/40 mt-1">
                    Supports PNG, JPG, MP4, PDF, PCAP, CSV (Up to 250 MB)
                  </div>
                </label>
              </div>

              {uploadForm.sha256 && (
                <div className="p-3 bg-[#0a0a0a] border border-[#ceff00]/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#ceff00]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AUTONOMOUS CLIENT-SIDE SHA-256 CHECKSUM GENERATED:
                  </div>
                  <div className="text-[11px] font-mono text-white break-all">
                    {uploadForm.sha256}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  OCR Regional Text / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.ocrText}
                  onChange={(e) => setUploadForm({ ...uploadForm, ocrText: e.target.value })}
                  placeholder="Paste or preview any text transcribed from the document..."
                  className="w-full bg-[#0c0c0c] border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                />
              </div>

              <div className="p-3 bg-[#0c0c0c] border border-white/5 text-[10px] font-mono text-white/40 space-y-1">
                <div className="flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-[#ceff00]" />
                  <span>Terminal: {currentOfficer.rank} ({currentOfficer.badgeNumber})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ceff00]" />
                  <span>GPS Lock: 26.9124° N, 75.7873° E (Station Node Verified)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-white/20 text-xs font-mono text-white hover:bg-white/5 rounded-none uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ceff00] text-black text-xs font-mono font-bold hover:bg-[#b8e600] rounded-none uppercase tracking-wider shadow-[0_0_15px_rgba(206,255,0,0.2)]"
                >
                  Confirm Forensic Ingestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
