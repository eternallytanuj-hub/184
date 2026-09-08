'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BLOCKCHAIN_CONFIG,
  calculateSha256,
  verifyHashOnLedger,
  getCaseHistoryFromLedger,
  generateBsa63Certificate,
  getPolygonScanTxUrl,
  getPolygonScanBlockUrl,
  getPolygonScanAddressUrl,
  Bsa63Certificate,
  LedgerVerificationResult,
} from '@/lib/blockchain/evidenceLedger';
import { EvidenceItem, EVIDENCE_DATA } from '@/data/collabData';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Copy,
  Check,
  Printer,
  Clock,
  Database,
  Hash,
  ArrowLeft,
  FileCode2,
  RefreshCw,
  Lock,
  Layers,
  FileText,
  CreditCard,
  Camera,
  Scale,
  Smartphone
} from 'lucide-react';

function CourtroomVerifierContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams?.get('hash') || '';
  const initialCase = searchParams?.get('case') || '';

  const [queryInput, setQueryInput] = useState<string>(initialHash || initialCase || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LedgerVerificationResult | null>(null);
  const [caseHistory, setCaseHistory] = useState<EvidenceItem[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<Bsa63Certificate | null>(null);
  const [showCertificateView, setShowCertificateView] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const fileDropInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-verify if hash or case parameter is present in URL
  useEffect(() => {
    const q = initialHash || initialCase;
    if (q) {
      handleVerify(q);
    } else {
      // Default to first pre-seeded evidence item for instant demonstration
      handleVerify('EVD-2026-901');
    }
  }, [initialHash, initialCase]);

  const handleVerify = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setShowCertificateView(false);

    const res = await verifyHashOnLedger(query);
    setResult(res);

    if (res.isAuthentic && res.matchedEvidence) {
      const history = await getCaseHistoryFromLedger(res.matchedEvidence.caseId);
      setCaseHistory(history);
      const cert = generateBsa63Certificate(res.matchedEvidence);
      setActiveCertificate(cert);
    } else {
      setCaseHistory([]);
      setActiveCertificate(null);
    }

    setLoading(false);
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const computedHash = await calculateSha256(file);
      setQueryInput(computedHash);
      await handleVerify(computedHash);
    }
  };

  const handleCopyHash = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
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
      default: return <FileCheck className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col font-mono selection:bg-[#ceff00] selection:text-black">
      
      {/* Top Law Enforcement & Judiciary Header Bar */}
      <header className="w-full bg-[#121212] border-b border-white/10 select-none">
        <div className="max-w-[1500px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 flex items-center justify-center bg-black border border-white/20">
                <Image
                  src="/logos/cybercast.png"
                  alt="CyberCast Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-wider text-white">
                    CYBER<span className="text-[#ceff00]">CAST</span>
                  </span>
                  <span className="h-1.5 w-1.5 bg-[#ceff00]" />
                </div>
                <span className="text-[9px] text-white/40 tracking-wider">
                  JUDICIAL EVIDENCE VAULT // PS 184
                </span>
              </div>
            </Link>

            {/* Institutional Seal */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="flex items-center gap-1.5" title="Ministry of Home Affairs">
                <Image
                  src="/logos/emblem_india.svg"
                  alt="MHA"
                  width={16}
                  height={16}
                  className="h-4 w-auto filter invert brightness-200"
                />
                <span className="text-[10px] text-white/70 font-medium">MHA / I4C</span>
              </div>
              <span className="text-white/20">/</span>
              <span className="text-[10px] text-[#ceff00] font-bold">COURTROOM VERIFICATION PORTAL</span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/collab"
              className="px-3 py-1.5 bg-black hover:bg-white/10 border border-white/20 text-white text-xs uppercase flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3 text-[#ceff00]" />
              <span>Collab Portal</span>
            </Link>

            <a
              href={getPolygonScanAddressUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/10 border border-[#ceff00]/40 text-[#ceff00] text-xs uppercase transition-colors"
            >
              <Database className="w-3 h-3" />
              <span>Polygon Amoy Contract</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Verification Headline Banner */}
        <div className="p-6 bg-[#121212] border border-white/10 rounded-none space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#ceff00] bg-[#ceff00]/10 px-2.5 py-0.5 border border-[#ceff00]/30 font-bold uppercase">
                PUBLIC JUDICIAL VERIFICATION
              </span>
              <span className="text-[10px] text-white/50">
                STATUTORY PROOF UNDER SECTION 63 BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
              </span>
            </div>
            <div className="text-[10px] text-white/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none bg-[#ceff00] animate-pulse" />
              <span>LEDGER: POLYGON AMOY TESTNET (CHAIN 80002)</span>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#ceff00]" />
            Forensic Evidence Integrity & Chain of Custody Verifier
          </h1>
          <p className="text-xs text-white/60 max-w-3xl leading-relaxed">
            Verify the mathematical integrity and immutable timestamp of electronic evidence submitted in court.
            All records are anchored to the decentralized Polygon Amoy ledger via EIP-712 gasless meta-transactions, providing conclusive proof against fabrication, alteration, or backdating under Indian Law.
          </p>
        </div>

        {/* Verification Input & Drop Zone Bar */}
        <div className="p-5 bg-[#121212] border border-white/10 rounded-none space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-8 space-y-1.5">
              <label className="text-[10px] text-white/50 uppercase block">
                ENTER SHA-256 HASH, CASE ID (E.G. CY2026-MH-44521), OR POLYGON TX HASH:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify(queryInput)}
                    placeholder="e.g. 9e1a8b7c6d5e4f... or CY2026-MH-44521 or 0x8f2c3a1e9b4d..."
                    className="w-full bg-[#0c0c0c] border border-white/15 pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#ceff00] rounded-none"
                  />
                </div>
                <button
                  onClick={() => handleVerify(queryInput)}
                  disabled={loading || !queryInput.trim()}
                  className="px-5 py-2.5 bg-[#ceff00] hover:bg-[#b8e600] text-black font-bold uppercase text-xs rounded-none transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Authenticity</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Drag & Drop File Verifier */}
            <div className="lg:col-span-4">
              <label className="text-[10px] text-white/50 uppercase block mb-1.5">
                OR DROP PHYSICAL EVIDENCE FILE:
              </label>
              <div
                onClick={() => fileDropInputRef.current?.click()}
                className="p-3 border border-dashed border-white/20 hover:border-[#ceff00] cursor-pointer bg-[#0c0c0c] text-center transition-colors flex items-center justify-center gap-2"
              >
                <input
                  ref={fileDropInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileDrop}
                />
                <FileCode2 className="w-4 h-4 text-[#ceff00]" />
                <span className="text-[11px] text-white/80 font-bold uppercase">
                  Verify Local File
                </span>
                <span className="text-[10px] text-white/40">(Client SHA-256)</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Preset Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[10px]">
            <span className="text-white/40 uppercase">DEMO EXHIBITS:</span>
            {EVIDENCE_DATA.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setQueryInput(item.id);
                  handleVerify(item.id);
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-[#ceff00] transition-colors"
              >
                {item.id} ({item.fileName.substring(0, 16)}...)
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Main Verdict Card */}
            <div
              className={`p-6 border rounded-none space-y-4 ${
                result.isAuthentic
                  ? 'bg-emerald-950/25 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  : 'bg-rose-950/25 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {result.isAuthentic ? (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] tracking-widest uppercase font-bold text-white/50">
                      JUDICIAL VERDICT // STATUTORY INTEGRITY CHECK
                    </div>
                    <div className={`text-lg md:text-xl font-bold uppercase tracking-tight ${
                      result.isAuthentic ? 'text-emerald-300' : 'text-rose-400'
                    }`}>
                      {result.isAuthentic
                        ? 'STATUS: AUTHENTIC & UNALTERED (ON-CHAIN VERIFIED)'
                        : 'HASH MISMATCH / UNREGISTERED ON LEDGER'}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-white/50">
                  <div>ENGINE: <span className="text-[#ceff00]">{result.engineUsed}</span></div>
                  <div>QUERY LATENCY: {result.latencyMs}ms</div>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed border-t border-white/10 pt-3">
                {result.details}
              </p>

              {/* Pre-Cashout Mathematical Proof & Timeliness Panel */}
              {result.isAuthentic && (
                <div className="p-4 bg-black/60 border border-emerald-500/40 rounded-none space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] font-bold uppercase text-[#ceff00] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      PRE-CASHOUT IMMUTABILITY PROOF // SECTION 63 BSA 2023
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                      POLYGON AMOY BLOCK #{result.blockNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-white/50 block uppercase">COMPLAINT INGESTION TIMESTAMP</span>
                      <span className="text-white font-bold">
                        {result.complaintTimestamp || result.anchoredAt || result.matchedEvidence?.uploadedAt || '09 Sept 2026, 01:15:08 IST'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block uppercase">PREDICTED CASH-OUT WINDOW</span>
                      <span className="text-amber-400 font-bold">
                        {result.predictedCashOutWindow || '< 3.5 Hours'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block uppercase">STATUTORY ADMISSIBILITY</span>
                      <span className="text-emerald-400 font-bold">
                        Section 63 BSA 2023 Certified
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/25 text-[11px] text-zinc-300">
                    <strong className="text-emerald-400 uppercase">Mathematical Proof of Timeliness: </strong>
                    <span>
                      {result.mathematicalProofTimeliness ||
                        `AI model input features and forecasted interdiction window were cryptographically committed to Polygon Amoy Block #${result.blockNumber} at the exact moment of citizen complaint ingestion. This establishes mathematical proof that AI interdiction intelligence was recorded PRIOR TO physical cash-out, eliminating defense claims of post-incident fabrication under Section 63 BSA 2023.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions Bar */}
              {result.isAuthentic && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCertificateView(!showCertificateView)}
                      className="px-3.5 py-2 bg-[#ceff00] hover:bg-[#b8e600] text-black font-bold uppercase text-xs flex items-center gap-1.5 transition-colors rounded-none"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{showCertificateView ? 'Hide Certificate' : 'View Section 63 BSA Certificate'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') window.print();
                      }}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs flex items-center gap-1.5 transition-colors rounded-none"
                    >
                      <Printer className="w-4 h-4 text-[#ceff00]" />
                      <span>Print Courtroom Exhibit</span>
                    </button>
                  </div>

                  <a
                    href={getPolygonScanTxUrl(result.blockchainTxHash || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#ceff00] hover:underline flex items-center gap-1"
                  >
                    <span>View On-Chain on PolygonScan Amoy</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Cryptographic Technical Breakdown */}
            {result.isAuthentic && result.matchedEvidence && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Cryptographic Proof Spec */}
                <div className="lg:col-span-7 p-5 bg-[#121212] border border-white/10 rounded-none space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase text-[#ceff00] flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      Cryptographic Ledger Proofs
                    </span>
                    <span className="text-[10px] text-white/50">Polygon Amoy Block #{result.blockNumber}</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-white/40 block text-[10px]">EVIDENCE TITLE & CASE ID</span>
                      <span className="text-white font-bold text-sm">{result.matchedEvidence.title}</span>
                      <span className="text-white/60 block text-[11px]">Associated Case: {result.matchedEvidence.caseId}</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white/40">SHA-256 CRYPTOGRAPHIC CHECKSUM</span>
                        <button
                          onClick={() => handleCopyHash(result.sha256Hash)}
                          className="text-white/60 hover:text-white flex items-center gap-1"
                        >
                          {copiedHash ? (
                            <>
                              <Check className="w-3 h-3 text-[#ceff00]" />
                              <span className="text-[#ceff00]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="text-white font-mono break-all bg-black/60 p-2 border border-white/10 block mt-1 select-all">
                        {result.sha256Hash}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-white/40 block text-[10px]">POLYGON BLOCK NUMBER</span>
                        <a
                          href={getPolygonScanBlockUrl(result.blockNumber || 14892014)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ceff00] font-bold hover:underline flex items-center gap-1"
                        >
                          <span>#{result.blockNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div>
                        <span className="text-white/40 block text-[10px]">IPFS CIPHERTEXT CID</span>
                        <span className="text-white/80 font-mono truncate block" title={result.ipfsCid}>
                          {result.ipfsCid}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/40 block text-[10px]">TRANSACTION HASH</span>
                      <a
                        href={getPolygonScanTxUrl(result.blockchainTxHash || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ceff00] hover:underline font-mono text-[11px] truncate block flex items-center gap-1"
                        title={result.blockchainTxHash}
                      >
                        <span>{result.blockchainTxHash}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-[10px]">
                      <div>
                        <span className="text-white/40 block">SIGNING OFFICER</span>
                        <span className="text-white font-bold block">{result.matchedEvidence.uploadedBy}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">FORENSIC GPS FIX</span>
                        <span className="text-white block">{result.matchedEvidence.gpsCoordinates}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Chronological Chain of Custody */}
                <div className="lg:col-span-5 p-5 bg-[#121212] border border-white/10 rounded-none space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase text-[#ceff00] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Verified Chain of Custody ({result.matchedEvidence.chainOfCustody.length})
                    </span>
                    <span className="text-[10px] text-white/50">Immutable Timeline</span>
                  </div>

                  <div className="relative pl-6 border-l border-white/20 space-y-5 text-xs">
                    {result.matchedEvidence.chainOfCustody.map((log, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#ceff00] border-2 border-black rounded-none" />
                        <div className="text-xs font-bold text-[#ceff00]">
                          {log.timestamp} • {log.action}
                        </div>
                        <div className="text-xs text-white mt-0.5">
                          Officer: <span className="font-bold">{log.officerName}</span>
                        </div>
                        <div className="text-[11px] text-white/50 mt-0.5">
                          Purpose: {log.purpose}
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
              </div>
            )}

            {/* Embedded Section 63 BSA Digital Certificate View */}
            {result.isAuthentic && showCertificateView && activeCertificate && (
              <div id="bsa-certificate-printable" className="p-8 bg-[#0c0c0c] border border-[#ceff00] rounded-none space-y-6">
                {/* Official Indian Seal Banner */}
                <div className="border border-white/20 p-5 bg-[#121212] text-center space-y-1">
                  <div className="text-[10px] tracking-widest text-[#ceff00] uppercase font-bold">
                    GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS / I4C
                  </div>
                  <div className="text-base font-bold text-white uppercase tracking-wider">
                    {activeCertificate.statutoryTitle}
                  </div>
                  <div className="text-xs text-white/70">
                    Issued under {activeCertificate.governingSection}
                  </div>
                </div>

                {/* Grid with QR Code and Identifiers */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#121212] border border-white/10 items-center">
                  <div className="md:col-span-3 space-y-2 text-xs">
                    <div>
                      <span className="text-white/40 text-[10px] block">CERTIFICATE UNIQUE ID</span>
                      <span className="text-lg font-bold text-[#ceff00]">{activeCertificate.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[10px] block">CASE IDENTIFIER</span>
                      <span className="text-white font-bold">{activeCertificate.caseId} (NCRP Cyber Crime Portal)</span>
                    </div>
                    <div>
                      <span className="text-white/40 text-[10px] block">EVIDENCE TITLE & FILE</span>
                      <span className="text-white">{activeCertificate.title} ({activeCertificate.fileName} • {activeCertificate.fileSize})</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2 bg-black border border-white/10">
                    <div
                      dangerouslySetInnerHTML={{ __html: activeCertificate.qrCodeSvg }}
                      className="w-32 h-32 flex items-center justify-center"
                    />
                    <span className="text-[9px] text-[#ceff00] mt-1 font-mono tracking-wider text-center">
                      SCAN FOR ON-CHAIN AUDIT
                    </span>
                  </div>
                </div>

                {/* Cryptographic Ledger Verification Box */}
                <div className="p-4 bg-[#141414] border border-white/10 space-y-2 text-xs">
                  <div className="text-xs font-bold text-[#ceff00] uppercase">
                    CRYPTOGRAPHIC BLOCKCHAIN AUDIT TRAIL
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-white/40 block text-[10px]">SHA-256 DIGEST</span>
                      <span className="text-white font-mono break-all bg-black p-1 border border-white/5 block">
                        {activeCertificate.sha256Hash}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-white/40 block text-[10px]">POLYGON BLOCK NUMBER</span>
                        <span className="text-[#ceff00] font-bold">#{activeCertificate.polygonBlockNumber}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">IPFS CONTENT IDENTIFIER</span>
                        <span className="text-white font-mono truncate block">{activeCertificate.ipfsCid}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px]">TRANSACTION HASH</span>
                      <span className="text-white font-mono break-all block">{activeCertificate.blockchainTxHash}</span>
                    </div>
                  </div>
                </div>

                {/* Certifying Officer Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#121212] border border-white/10 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px]">OFFICER IN LAWFUL CONTROL</span>
                    <span className="text-white font-bold block">{activeCertificate.certifyingOfficer.name}</span>
                    <span className="text-white/60 block">{activeCertificate.certifyingOfficer.rank} (Badge: {activeCertificate.certifyingOfficer.badgeNumber})</span>
                    <span className="text-white/50 block text-[10px]">{activeCertificate.certifyingOfficer.agency}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">TERMINAL PROVENANCE & GPS LOCK</span>
                    <span className="text-white block">{activeCertificate.certifyingOfficer.terminalId}</span>
                    <span className="text-[#ceff00] block">{activeCertificate.certifyingOfficer.gpsCoordinates}</span>
                  </div>
                </div>

                {/* Statutory Text */}
                <div className="p-5 bg-[#121212] border-l-2 border-[#ceff00] text-xs text-white/80 leading-relaxed whitespace-pre-line">
                  {activeCertificate.statutoryDeclaration}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="px-4 py-2 bg-[#ceff00] text-black font-bold uppercase text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Formal Certificate (BSA Section 63)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0c0c0c] border-t border-white/10 p-4 text-center text-xs text-white/40 font-mono">
        CyberCast Evidence Vault // Governed by Bharatiya Sakshya Adhiniyam, 2023 (Section 63) & Information Technology Act, 2000 (Section 79A).
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center text-[#ceff00] font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        INITIALIZING SECURE COURTROOM VERIFIER...
      </div>
    }>
      <CourtroomVerifierContent />
    </Suspense>
  );
}
