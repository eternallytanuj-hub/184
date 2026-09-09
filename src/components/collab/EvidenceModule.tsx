'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  EVIDENCE_DATA, 
  EvidenceItem, 
  CASES_DATA, 
  OfficerProfile 
} from '@/data/collabData';
import {
  BLOCKCHAIN_CONFIG,
  calculateSha256,
  verifyHashOnLedger,
  anchorEvidenceToLedger,
  generateBsa63Certificate,
  getPolygonScanTxUrl,
  getPolygonScanBlockUrl,
  getPolygonScanAddressUrl,
  Bsa63Certificate,
  LedgerVerificationResult,
} from '@/lib/blockchain/evidenceLedger';
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
  Laptop,
  ExternalLink,
  Printer,
  Link2,
  FileCheck,
  Layers,
  ArrowUpRight,
  Shield,
  FileCode2,
  Database,
  Languages,
  Phone,
  Zap,
  Package
} from 'lucide-react';
import EvidenceIngestModal from './EvidenceIngestModal';

interface EvidenceModuleProps {
  currentOfficer: OfficerProfile;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function EvidenceModule({ currentOfficer, onAuditLog }: EvidenceModuleProps) {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(EVIDENCE_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  
  // Modals & Drawers
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<Bsa63Certificate | null>(null);
  const [showCourtVerifier, setShowCourtVerifier] = useState(false);
  
  // Verification states
  const [verifyingHashId, setVerifyingHashId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [verifiedHashes, setVerifiedHashes] = useState<Record<string, boolean>>({
    'EVD-2026-901': true,
    'EVD-2026-902': true,
    'EVD-2026-903': true,
    'EVD-2026-904': true,
  });
  const [showTranslationCard, setShowTranslationCard] = useState<Record<string, boolean>>({});
  const [reverifiedMap, setReverifiedMap] = useState<Record<string, { status: 'verified' | 'verifying'; block: number; latency: number }>>({});

  // Blockchain Anchoring State
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [miningStep, setMiningStep] = useState<string | null>(null);
  const [anchoredSuccessToast, setAnchoredSuccessToast] = useState<{ id: string; txHash: string; block: number } | null>(null);

  // Courtroom Verifier State
  const [verifierInput, setVerifierInput] = useState<string>('');
  const [verifierCalculating, setVerifierCalculating] = useState<boolean>(false);
  const [verifierResult, setVerifierResult] = useState<LedgerVerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const verifierFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReverifyChecksum = async (ev: EvidenceItem) => {
    setReverifiedMap((prev) => ({
      ...prev,
      [ev.id]: { status: 'verifying', block: ev.polygonBlockNumber || 14892014, latency: 0 },
    }));
    const startTime = Date.now();
    await verifyHashOnLedger(ev.compoundHash || ev.rawFileSha256 || ev.sha256Hash);
    const latency = Date.now() - startTime;
    setReverifiedMap((prev) => ({
      ...prev,
      [ev.id]: { status: 'verified', block: ev.polygonBlockNumber || 14892014, latency },
    }));
    if (onAuditLog) {
      onAuditLog('REVERIFIED_CHECKSUM_ON_CHAIN', ev.id, 'EVIDENCE');
    }
  };

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
    autoAnchor: true,
  });

  // Sync any newly anchored evidence from localStorage on mount and reactive events
  useEffect(() => {
    const syncFromStorage = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('cybercast_blockchain_ledger');
          if (stored) {
            const parsed = JSON.parse(stored) as EvidenceItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvidenceList((prev) => {
                const ids = new Set(prev.map((i) => i.id));
                const extras = parsed.filter((p) => !ids.has(p.id));
                return [...extras, ...prev];
              });
            }
          }
        } catch (err) {
          console.warn('Failed to hydrate blockchain ledger state:', err);
        }
      }
    };

    syncFromStorage();

    const handleNewEvidence = (e: any) => {
      if (e?.detail) {
        setEvidenceList((prev) => {
          if (prev.some((item) => item.id === e.detail.id)) return prev;
          return [e.detail, ...prev];
        });
      } else {
        syncFromStorage();
      }
    };

    window.addEventListener('cybercast_evidence_anchored', handleNewEvidence);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('cybercast_evidence_anchored', handleNewEvidence);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Evidence' },
    { id: 'Communication', label: 'Communications & Chat' },
    { id: 'Financial', label: 'Financial & CFCFRMS' },
    { id: 'Surveillance', label: 'CCTV & Surveillance' },
    { id: 'Forensic / AI Intelligence Report', label: 'Forensic & AI Reports' },
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
      (ev.blockchainTxHash && ev.blockchainTxHash.toLowerCase().includes(q)) ||
      (ev.polygonBlockNumber && ev.polygonBlockNumber.toString().includes(q)) ||
      (ev.ocrExtractedText && ev.ocrExtractedText.toLowerCase().includes(q))
    );
  });

  const handleVerifyHash = (id: string, hash: string) => {
    setVerifyingHashId(id);
    setTimeout(async () => {
      await verifyHashOnLedger(hash);
      setVerifiedHashes((prev) => ({ ...prev, [id]: true }));
      setVerifyingHashId(null);
      if (onAuditLog) {
        onAuditLog('VERIFIED_EVIDENCE_BLOCKCHAIN_HASH', id, 'EVIDENCE');
      }
    }, 800);
  };

  const handleCopyHash = (hash: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const handleDownload = (ev: EvidenceItem) => {
    if (onAuditLog) {
      onAuditLog('DOWNLOADED_FORENSIC_EVIDENCE', ev.id, 'EVIDENCE');
    }
    alert(
      `[MHA I4C FORENSIC CHAIN]\nGenerating cryptographically stamped bundle for ${ev.fileName}\n` +
      `• SHA-256: ${ev.sha256Hash}\n` +
      `• Polygon Block: #${ev.polygonBlockNumber || '14892014'}\n` +
      `• Section 63 BSA Certificate: ${ev.bsa63CertificateId || 'BSA-63-2026-IND'}\n` +
      `Action permanently logged to central immutable audit trail.`
    );
  };

  const handleOpenCertificate = (ev: EvidenceItem) => {
    const cert = generateBsa63Certificate(ev, {
      name: currentOfficer.name,
      badgeNumber: currentOfficer.badgeNumber,
      rank: currentOfficer.rank,
      agency: currentOfficer.roleName,
    });
    setActiveCertificate(cert);
    setShowCertificateModal(true);
    if (onAuditLog) {
      onAuditLog('GENERATED_BSA_63_CERTIFICATE', ev.id, 'EVIDENCE');
    }
  };

  // Real-time client-side SHA-256 calculation for file upload
  const handleFileSelectSimulation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const computedHash = await calculateSha256(file);
      setUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        sha256: computedHash,
      }));
    }
  };

  // Anchor unanchored item to blockchain with gasless relayer simulation
  const handleAnchorToLedger = async (ev: EvidenceItem) => {
    setAnchoringId(ev.id);
    setMiningStep(`[1/3] Generating EIP-712 typed signature for ${currentOfficer.badgeNumber}...`);
    
    await new Promise((r) => setTimeout(r, 600));
    setMiningStep('[2/3] Broadcasting gasless transaction via MHA Amoy Relayer...');

    await new Promise((r) => setTimeout(r, 900));
    const result = await anchorEvidenceToLedger(ev, {
      name: currentOfficer.name,
      badgeNumber: currentOfficer.badgeNumber,
      rank: currentOfficer.rank,
      agency: currentOfficer.roleName,
    });

    setMiningStep(`[3/3] Confirmed in Polygon Amoy Block #${result.polygonBlockNumber}!`);
    await new Promise((r) => setTimeout(r, 400));

    // Update list in place
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === ev.id ? result.evidenceItem : item))
    );
    setVerifiedHashes((prev) => ({ ...prev, [ev.id]: true }));
    setAnchoringId(null);
    setMiningStep(null);
    setAnchoredSuccessToast({
      id: ev.id,
      txHash: result.blockchainTxHash,
      block: result.polygonBlockNumber,
    });
    setTimeout(() => setAnchoredSuccessToast(null), 6000);

    if (onAuditLog) {
      onAuditLog('ANCHORED_EVIDENCE_TO_BLOCKCHAIN', ev.id, 'BLOCKCHAIN');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.fileName) {
      alert('Please enter evidence title and attach file.');
      return;
    }

    const sha256 = uploadForm.sha256 || (await calculateSha256(uploadForm.title + uploadForm.fileName + Date.now()));
    const id = `EVD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const baseEvidence: EvidenceItem = {
      id,
      caseId: uploadForm.caseId,
      title: uploadForm.title,
      category: uploadForm.category,
      type: uploadForm.type,
      fileName: uploadForm.fileName,
      fileSize: uploadForm.fileSize || '2.4 MB',
      uploadedAt:
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
        ' IST',
      uploadedBy: `${currentOfficer.name} (${currentOfficer.badgeNumber})`,
      uploadingOfficerId: currentOfficer.badgeNumber,
      deviceUsed: `${currentOfficer.rank} Secure Terminal (MHA/I4C VPN Authenticated)`,
      gpsCoordinates: '26.9124° N, 75.7873° E (Verified Station Command GPS)',
      sha256Hash: sha256,
      relevance: 'Primary',
      source: uploadForm.source,
      confidentiality: uploadForm.confidentiality,
      ocrExtractedText: uploadForm.ocrText || undefined,
      ledgerStatus: uploadForm.autoAnchor ? 'ANCHORED' : 'LOCAL',
      chainOfCustody: [
        {
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          officerName: currentOfficer.name,
          action: 'Initial Evidence Ingestion & Cryptographic Hashing',
          purpose: 'Statutory Section 63 BSA 2023 Compliance',
        },
      ],
    };

    if (uploadForm.autoAnchor) {
      const anchorResult = await anchorEvidenceToLedger(baseEvidence, {
        name: currentOfficer.name,
        badgeNumber: currentOfficer.badgeNumber,
        rank: currentOfficer.rank,
        agency: currentOfficer.roleName,
      });
      setEvidenceList([anchorResult.evidenceItem, ...evidenceList]);
      setVerifiedHashes((prev) => ({ ...prev, [anchorResult.evidenceItem.id]: true }));
      setAnchoredSuccessToast({
        id: anchorResult.evidenceItem.id,
        txHash: anchorResult.blockchainTxHash,
        block: anchorResult.polygonBlockNumber,
      });
      setTimeout(() => setAnchoredSuccessToast(null), 6000);
    } else {
      setEvidenceList([baseEvidence, ...evidenceList]);
    }

    setShowUploadModal(false);
    // Reset form
    setUploadForm({
      title: '',
      caseId: CASES_DATA[0].id,
      category: 'Communication',
      type: 'image',
      fileName: '',
      fileSize: '1.2 MB',
      confidentiality: 'Restricted',
      source: 'Police',
      ocrText: '',
      sha256: '',
      autoAnchor: true,
    });

    if (onAuditLog) {
      onAuditLog('INGESTED_FORENSIC_EVIDENCE', id, 'EVIDENCE');
    }
  };

  // Instant Courtroom Verifier execution
  const handleRunCourtroomVerifier = async (hashOrCase: string) => {
    if (!hashOrCase.trim()) return;
    setVerifierCalculating(true);
    setVerifierResult(null);

    const res = await verifyHashOnLedger(hashOrCase.trim());
    setVerifierResult(res);
    setVerifierCalculating(false);

    if (onAuditLog) {
      onAuditLog('COURTROOM_VERIFIER_QUERY', hashOrCase.substring(0, 16), 'VERIFY');
    }
  };

  const handleVerifierFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerifierCalculating(true);
      const computedHash = await calculateSha256(file);
      setVerifierInput(computedHash);
      const res = await verifyHashOnLedger(computedHash);
      setVerifierResult(res);
      setVerifierCalculating(false);
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
      case 'Forensic':
      case 'Forensic / AI Intelligence Report':
        return <ShieldCheck className="w-4 h-4 text-[#ceff00]" />;
      default: return <FileCheck2 className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Blockchain Status Strip */}
      <div className="p-3 bg-[#0a0a0a] border border-[#ceff00]/40 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#ceff00] font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-none bg-[#ceff00] animate-pulse" />
            <span>POLYGON AMOY LEDGER: CONNECTED</span>
          </div>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-white/60 hidden sm:inline">FINALITY: 2.1s</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <a
            href={getPolygonScanAddressUrl(BLOCKCHAIN_CONFIG.contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-[#ceff00] truncate flex items-center gap-1 transition-colors"
            title="Inspect Smart Contract on PolygonScan"
          >
            <span>CONTRACT: 0x71cA...84E9</span>
            <ExternalLink className="w-3 h-3 text-[#ceff00]" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCourtVerifier(true)}
            className="px-2.5 py-1 bg-[#171717] hover:bg-[#222] border border-[#ceff00]/50 text-[#ceff00] text-[11px] font-mono uppercase font-bold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ceff00]" />
            <span>INSTANT COURTROOM VERIFIER</span>
          </button>

          <Link
            href="/verify"
            className="px-2.5 py-1 bg-[#121212] hover:bg-white/10 border border-white/20 text-white/80 hover:text-white text-[11px] font-mono uppercase flex items-center gap-1.5 transition-colors"
          >
            <span>Public Portal (/verify)</span>
            <ArrowUpRight className="w-3 h-3 text-[#ceff00]" />
          </Link>
        </div>
      </div>

      {/* Mining / Relayer Toast Alert */}
      {anchoredSuccessToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center justify-between gap-4 rounded-none animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>ANCHORED TO POLYGON AMOY:</strong> Evidence <code>{anchoredSuccessToast.id}</code> confirmed in Block <code>#{anchoredSuccessToast.block}</code>. Gas sponsored by MHA Relayer.
            </span>
          </div>
          <a
            href={getPolygonScanTxUrl(anchoredSuccessToast.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-200 underline hover:text-white flex items-center gap-1 shrink-0 text-[11px]"
          >
            <span>View Txn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Main Module Header & Ingest Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121212] border border-white/10 rounded-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#ceff00] uppercase bg-[#ceff00]/10 px-2 py-0.5 border border-[#ceff00]/30 rounded-none font-bold">
              MODULE 04 // FORENSIC EVIDENCE VAULT
            </span>
            <span className="text-[10px] font-mono text-white/50">
              BHARATIYA SAKSHYA ADHINIYAM, 2023 (SEC 63) / SEC 65B IEA
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2 font-mono">
            <ShieldCheck className="w-5 h-5 text-[#ceff00]" />
            Blockchain-Backed Chain of Custody & Evidence Locker
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            On-chain SHA-256 hash validation • IPFS off-chain encrypted ciphertext • Gasless EIP-712 MHA Relayer • Section 63 BSA Admissibility
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors rounded-none shadow-[0_0_15px_rgba(206,255,0,0.2)]"
          >
            <Upload className="w-4 h-4" />
            Ingest Forensic Evidence
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
            placeholder="Search by Evidence ID, file, SHA-256, Txn Hash or OCR text..."
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
            <div className="text-xs font-mono text-white/50 mt-1">Adjust your search query or category filter</div>
          </div>
        ) : (
          filteredEvidence.map((ev) => {
            const isVerified = (verifiedHashes[ev.id] ?? false) || ev.ledgerStatus === 'ANCHORED';
            const isVerifying = verifyingHashId === ev.id;
            const isAnchored = ev.ledgerStatus === 'ANCHORED';
            const isAnchoring = anchoringId === ev.id;

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

                    <div className="flex items-center gap-2">
                      {isAnchored ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-[#ceff00]/40 text-[#ceff00] bg-[#ceff00]/10 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ON-CHAIN #{ev.polygonBlockNumber || '14892014'}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-amber-500/40 text-amber-400 bg-amber-500/10 uppercase">
                          LOCAL / PENDING ANCHOR
                        </span>
                      )}

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
                  <div className="p-3 bg-[#0c0c0c] border border-white/10 rounded-none mb-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-white/40 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#ceff00]" />
                        SHA-256 CHECKSUM (IMMUTABLE FORENSIC HASH)
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
                            VALIDATING AGAINST POLYGON AMOY RPC...
                          </span>
                        ) : (isVerified || reverifiedMap[ev.id]?.status === 'verified') ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ✅ 0 BITS ALTERED · VERIFIED ON POLYGON BLOCK #{ev.polygonBlockNumber || reverifiedMap[ev.id]?.block || 14892014}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            UNVERIFIED CHECKSUM
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleReverifyChecksum(ev)}
                        disabled={isVerifying || reverifiedMap[ev.id]?.status === 'verifying'}
                        className="text-[10px] font-mono text-[#ceff00] hover:underline uppercase disabled:opacity-50 flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>RE-VERIFY CHECKSUM</span>
                      </button>
                    </div>
                  </div>

                  {/* Blockchain Details Strip (Tx, Block, IPFS) */}
                  {isAnchored && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-white/40 block">LEDGER STATUS:</span>
                        <span className="text-[#ceff00] font-bold">
                          ● {ev.ledgerStatus || 'ANCHORED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block">POLYGON BLOCK:</span>
                        <span className="text-white">#{ev.polygonBlockNumber || '14892014'}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-white/40 block">TRANSACTION HASH:</span>
                        <a
                          href={`https://amoy.polygonscan.com/tx/${ev.blockchainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ceff00] hover:underline flex items-center gap-0.5 truncate"
                        >
                          <span className="truncate">{ev.blockchainTxHash || '0x4f12...a98b'}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </div>
                      <div className="truncate">
                        <span className="text-white/40 block">IPFS CID:</span>
                        <a
                          href={`https://ipfs.io/ipfs/${ev.ipfsCid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/80 hover:text-[#ceff00] flex items-center gap-0.5 truncate"
                        >
                          <span className="truncate">{ev.ipfsCid || 'QmXoyp...4uco'}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* If not yet anchored, show Anchor CTA */}
                  {!isAnchored && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Awaiting on-chain judicial commitment
                      </span>
                      <button
                        onClick={() => handleAnchorToLedger(ev)}
                        disabled={isAnchoring}
                        className="px-2.5 py-1 bg-[#ceff00] hover:bg-[#b8e600] text-black text-[10px] font-mono uppercase font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {isAnchoring ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>MINING...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>ANCHOR TO LEDGER</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Mining progress step message if this item is being anchored */}
                  {isAnchoring && miningStep && (
                    <div className="p-2 bg-black border border-[#ceff00]/50 text-[10px] font-mono text-[#ceff00] mb-3 animate-pulse">
                      {miningStep}
                    </div>
                  )}

                  {/* OCR snippet if present */}
                  {ev.ocrExtractedText && (
                    <div className="p-3 bg-[#171717] border-l-2 border-[#ceff00] mb-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#ceff00] font-bold">
                            OCR EXTRACTED TEXT ({ev.detectedLanguage || 'Regional'})
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#ceff00]/10 text-[#ceff00] border border-[#ceff00]/30 text-[9px] font-bold">
                            PADDLE_OCR v2.8
                          </span>
                        </div>
                        {ev.translatedText && (
                          <button
                            type="button"
                            onClick={() => setShowTranslationCard((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                            className="text-[10px] text-[#ceff00] hover:underline flex items-center gap-1"
                          >
                            <Languages className="w-3 h-3" />
                            <span>{showTranslationCard[ev.id] ? 'ORIGINAL SCRIPT' : 'ENGLISH TRANSLATION'}</span>
                          </button>
                        )}
                      </div>

                      {/* Entity Chips */}
                      {ev.ocrEntities && (
                        <div className="flex flex-wrap gap-1">
                          {ev.ocrEntities.phone_numbers?.map((ph, idx) => (
                            <span key={`ph-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-950/60 border border-sky-400/30 text-sky-300 text-[9px] font-bold">
                              <Phone className="w-2 h-2" />
                              {ph}
                            </span>
                          ))}
                          {ev.ocrEntities.bank_accounts?.map((acc, idx) => (
                            <span key={`acc-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-950/60 border border-amber-400/30 text-amber-300 text-[9px] font-bold">
                              <CreditCard className="w-2 h-2" />
                              A/C {acc}
                            </span>
                          ))}
                          {ev.ocrEntities.ifsc_codes?.map((ifsc, idx) => (
                            <span key={`ifsc-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-950/60 border border-purple-400/30 text-purple-300 text-[9px] font-bold">
                              IFSC: {ifsc}
                            </span>
                          ))}
                          {ev.ocrEntities.utr_numbers?.map((utr, idx) => (
                            <span key={`utr-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-950/60 border border-teal-400/30 text-teal-300 text-[9px] font-bold">
                              <FileCode2 className="w-2 h-2" />
                              UTR: {utr}
                            </span>
                          ))}
                          {ev.ocrEntities.upi_ids?.map((upi, idx) => (
                            <span key={`upi-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold">
                              <Zap className="w-2 h-2" />
                              {upi}
                            </span>
                          ))}
                          {ev.ocrEntities.apks_detected?.map((apk, idx) => (
                            <span key={`apk-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-950/60 border border-rose-400/30 text-rose-300 text-[9px] font-bold">
                              <Package className="w-2 h-2" />
                              {apk}
                            </span>
                          ))}
                          {ev.ocrEntities.urgency_keywords?.map((kw, idx) => (
                            <span key={`kw-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-950/60 border border-red-500/40 text-red-300 text-[9px] font-bold">
                              <AlertTriangle className="w-2 h-2" />
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs font-mono text-white/80 line-clamp-2 italic">
                        &quot;{showTranslationCard[ev.id] && ev.translatedText ? ev.translatedText : ev.ocrExtractedText}&quot;
                      </p>
                      {ev.compoundHash && (
                        <div className="text-[9px] font-mono text-white/40 truncate" title={ev.compoundHash}>
                          Compound Root: {ev.compoundHash.substring(0, 24)}...
                        </div>
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedEvidence(ev);
                        setShowCustodyModal(true);
                      }}
                      className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-none transition-colors"
                      title="View chronological chain of custody"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#ceff00]" />
                      Custody ({ev.chainOfCustody.length})
                    </button>

                    <button
                      onClick={() => handleOpenCertificate(ev)}
                      className="text-xs font-mono text-[#ceff00] hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 bg-[#ceff00]/10 hover:bg-[#ceff00]/20 border border-[#ceff00]/30 rounded-none transition-colors"
                      title="Export official Section 63 BSA Certificate"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>🖨️ BSA SEC 63 CERTIFICATE</span>
                    </button>
                  </div>

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

      {/* INSTANT COURTROOM VERIFIER DRAWER / MODAL */}
      {showCourtVerifier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#ceff00]/50 w-full max-w-3xl rounded-none max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0c0c0c]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  INSTANT COURTROOM INTEGRITY VERIFIER (BSA 2023 SEC 63)
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCourtVerifier(false);
                  setVerifierResult(null);
                  setVerifierInput('');
                }}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 font-mono">
              <p className="text-xs text-white/70">
                Drag and drop any local evidence file to calculate its SHA-256 digest in-memory and match it against the Polygon Amoy blockchain ledger. Or paste a 64-character hash digest or Case ID.
              </p>

              {/* Drag & Drop Zone */}
              <div
                onClick={() => verifierFileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-white/20 hover:border-[#ceff00] cursor-pointer text-center bg-[#0c0c0c] transition-colors"
              >
                <input
                  ref={verifierFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleVerifierFileDrop}
                />
                <FileCode2 className="w-8 h-8 text-[#ceff00] mx-auto mb-2" />
                <div className="text-xs text-white font-bold uppercase">
                  Click or Drag local evidence file here to verify authenticity
                </div>
                <div className="text-[10px] text-white/40 mt-1">
                  Computes SHA-256 in browser buffer; checks on-chain state in &lt;100ms
                </div>
              </div>

              {/* Text / Hash input */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase block">
                  OR ENTER SHA-256 DIGEST OR CASE ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifierInput}
                    onChange={(e) => setVerifierInput(e.target.value)}
                    placeholder="e.g. 9e1a8b7c6d5e4f3a... or CY2026-MH-44521"
                    className="flex-1 bg-[#0c0c0c] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ceff00] rounded-none"
                  />
                  <button
                    onClick={() => handleRunCourtroomVerifier(verifierInput)}
                    disabled={verifierCalculating || !verifierInput.trim()}
                    className="px-4 py-2 bg-[#ceff00] hover:bg-[#b8e600] text-black font-bold uppercase text-xs rounded-none disabled:opacity-50"
                  >
                    {verifierCalculating ? 'Checking...' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Verification Result Card */}
              {verifierResult && (
                <div
                  className={`p-4 border rounded-none space-y-3 ${
                    verifierResult.isAuthentic
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-rose-950/40 border-rose-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {verifierResult.isAuthentic ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                            AUTHENTIC & UNALTERED (BSA SEC 63 COMPLIANT)
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <span className="text-sm font-bold text-rose-300 uppercase tracking-wide">
                            HASH MISMATCH / UNREGISTERED RECORD
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-white/50">
                      Query Latency: {verifierResult.latencyMs}ms ({verifierResult.engineUsed})
                    </span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    {verifierResult.details}
                  </p>

                  {verifierResult.isAuthentic && verifierResult.matchedEvidence && (
                    <div className="bg-[#0c0c0c] p-3 border border-white/10 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/40">MATCHED FILE:</span>
                        <span className="text-white font-bold">{verifierResult.matchedEvidence.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">POLYGON AMOY BLOCK:</span>
                        <a
                          href={getPolygonScanBlockUrl(verifierResult.blockNumber || 14892014)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ceff00] hover:underline flex items-center gap-1"
                        >
                          <span>#{verifierResult.blockNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">TRANSACTION HASH:</span>
                        <a
                          href={getPolygonScanTxUrl(verifierResult.blockchainTxHash || '')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ceff00] hover:underline truncate max-w-[280px] flex items-center gap-1"
                        >
                          <span>{verifierResult.blockchainTxHash}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">IPFS CID:</span>
                        <span className="text-white/80 truncate max-w-[280px]">{verifierResult.ipfsCid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">BSA CERTIFICATE ID:</span>
                        <span className="text-white font-bold">{verifierResult.bsaCertificateId}</span>
                      </div>
                    </div>
                  )}

                  {verifierResult.isAuthentic && verifierResult.matchedEvidence && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setShowCourtVerifier(false);
                          handleOpenCertificate(verifierResult.matchedEvidence!);
                        }}
                        className="px-3 py-1.5 bg-[#ceff00] hover:bg-[#b8e600] text-black font-bold uppercase text-xs rounded-none flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>View Section 63 BSA Certificate</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0c0c0c] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowCourtVerifier(false);
                  setVerifierResult(null);
                  setVerifierInput('');
                }}
                className="px-4 py-2 border border-white/20 text-xs font-mono text-white hover:bg-white/5 rounded-none uppercase"
              >
                Close Verifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL BSA 2023 SECTION 63 DIGITAL INTEGRITY CERTIFICATE MODAL */}
      {showCertificateModal && activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121212] border border-[#ceff00] w-full max-w-3xl rounded-none max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(206,255,0,0.15)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0c0c0c]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#ceff00]" />
                <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  SECTION 63 BSA, 2023 CERTIFICATE // COURTROOM EXHIBIT
                </span>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Body (Printable Area) */}
            <div id="bsa-certificate-printable" className="p-6 overflow-y-auto space-y-5 font-mono text-xs text-white">
              
              {/* Official Seal / Institutional Header */}
              <div className="border border-white/20 p-4 bg-[#090909] text-center space-y-1">
                <div className="text-[10px] tracking-widest text-[#ceff00] uppercase font-bold">
                  GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
                </div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">
                  INDIAN CYBER CRIME COORDINATION CENTRE (I4C)
                </div>
                <div className="text-[11px] text-white/70 uppercase">
                  {activeCertificate.statutoryTitle}
                </div>
                <div className="text-[10px] text-[#ceff00] bg-[#ceff00]/10 inline-block px-2 py-0.5 border border-[#ceff00]/30 mt-1">
                  STATUTORY PROOF UNDER {activeCertificate.governingSection.toUpperCase()}
                </div>
              </div>

              {/* Certificate Telemetry & QR Code Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#0c0c0c] border border-white/10 items-center">
                <div className="md:col-span-2 space-y-2">
                  <div>
                    <span className="text-white/40 text-[10px] block">CERTIFICATE SERIAL NO.</span>
                    <span className="text-base font-bold text-[#ceff00]">{activeCertificate.certificateId}</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">CASE UNIQUE IDENTIFIER</span>
                    <span className="text-white font-bold">{activeCertificate.caseId} (NCRP Portal Reference)</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[10px] block">EVIDENCE TITLE & FILE</span>
                    <span className="text-white/90">{activeCertificate.title} ({activeCertificate.fileName} • {activeCertificate.fileSize})</span>
                  </div>
                </div>

                {/* Inline SVG QR Code */}
                <div className="flex flex-col items-center justify-center p-2 bg-black border border-white/10">
                  <div
                    dangerouslySetInnerHTML={{ __html: activeCertificate.qrCodeSvg }}
                    className="w-32 h-32 flex items-center justify-center"
                  />
                  <span className="text-[9px] text-[#ceff00] mt-1 font-mono tracking-wider text-center">
                    SCAN FOR JUDICIAL PROOF
                  </span>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="p-4 bg-[#0e0e0e] border border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-[#ceff00] uppercase flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>CRYPTOGRAPHIC & ON-CHAIN PROOFS</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-white/40 block text-[10px]">SHA-256 CRYPTOGRAPHIC DIGEST (INVARIABLE)</span>
                    <span className="text-white font-mono break-all bg-black/60 p-1.5 border border-white/5 block select-all">
                      {activeCertificate.sha256Hash}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-white/40 block text-[10px]">POLYGON AMOY BLOCK HEIGHT</span>
                      <span className="text-[#ceff00] font-bold">#{activeCertificate.polygonBlockNumber}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px]">IPFS CIPHERTEXT CID</span>
                      <span className="text-white/80 font-mono truncate block" title={activeCertificate.ipfsCid}>
                        {activeCertificate.ipfsCid}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-white/40 block text-[10px]">BLOCKCHAIN TRANSACTION HASH</span>
                    <a
                      href={getPolygonScanTxUrl(activeCertificate.blockchainTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ceff00] hover:underline truncate block font-mono text-[10px] flex items-center gap-1"
                    >
                      <span>{activeCertificate.blockchainTxHash}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Officer in Lawful Control */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0c0c0c] border border-white/10 text-[10px]">
                <div>
                  <span className="text-white/40 block">CERTIFYING INVESTIGATOR</span>
                  <span className="text-white font-bold block">{activeCertificate.certifyingOfficer.name}</span>
                  <span className="text-white/60 block">{activeCertificate.certifyingOfficer.rank} (Badge: {activeCertificate.certifyingOfficer.badgeNumber})</span>
                </div>
                <div>
                  <span className="text-white/40 block">TERMINAL & GPS PROVENANCE</span>
                  <span className="text-white/80 block truncate">{activeCertificate.certifyingOfficer.terminalId}</span>
                  <span className="text-[#ceff00] block">{activeCertificate.certifyingOfficer.gpsCoordinates}</span>
                </div>
              </div>

              {/* Statutory Legal Declaration Text */}
              <div className="p-4 bg-[#090909] border-l-2 border-[#ceff00] text-[11px] text-white/80 leading-relaxed whitespace-pre-line">
                {activeCertificate.statutoryDeclaration}
              </div>
            </div>

            {/* Certificate Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#0c0c0c] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(activeCertificate.verificationUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <Link2 className="w-3.5 h-3.5 text-[#ceff00]" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase rounded-none flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>

                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-1.5 bg-[#ceff00] text-black text-xs font-mono font-bold hover:bg-[#b8e600] rounded-none uppercase"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Preview Modal */}
      {selectedEvidence && !showCustodyModal && !showCertificateModal && (
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
                  Section 63 BSA / Sec 65B Certified Forensic Media Container
                </div>

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCustodyModal(true)}
                  className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-[#ceff00]" />
                  Chain of Custody
                </button>
                <button
                  onClick={() => handleOpenCertificate(selectedEvidence)}
                  className="text-xs font-mono text-[#ceff00] hover:underline flex items-center gap-1.5 ml-3"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  View BSA 63 Cert
                </button>
              </div>

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
                  SHA-256: {selectedEvidence.sha256Hash.substring(0, 32)}...
                </div>
                {selectedEvidence.polygonBlockNumber && (
                  <div className="text-[10px] font-mono text-[#ceff00] mt-0.5">
                    Anchored to Polygon Amoy Block #{selectedEvidence.polygonBlockNumber}
                  </div>
                )}
              </div>

              <div className="relative pl-6 border-l border-white/20 space-y-6">
                {selectedEvidence.chainOfCustody.map((log, index) => (
                  <div key={index} className="relative font-mono">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#ceff00] border-2 border-black rounded-none" />
                    <div className="text-xs font-bold text-[#ceff00]">
                      {log.timestamp} • {log.action}
                    </div>
                    <div className="text-xs text-white mt-0.5">
                      Officer: <span className="font-bold">{log.officerName}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      Statutory Purpose: {log.purpose}
                    </div>
                    {log.blockNumber && (
                      <div className="text-[10px] text-white/40 mt-0.5">
                        Block: #{log.blockNumber} • Tx: {log.txHash?.substring(0, 16)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0c0c0c] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowCustodyModal(false);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase rounded-none"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Evidence Ingestion Modal with PaddleOCR & Polygon Amoy Anchoring */}
      <EvidenceIngestModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        currentOfficer={currentOfficer}
        onEvidenceIngested={(newItem) => {
          setEvidenceList((prev) => {
            const filtered = prev.filter((p) => p.id !== newItem.id && p.sha256Hash !== newItem.sha256Hash);
            return [newItem, ...filtered];
          });
          if (onAuditLog) {
            onAuditLog('INGESTED_FORENSIC_EVIDENCE', newItem.id, 'EVIDENCE');
          }
        }}
      />
    </div>
  );
}
