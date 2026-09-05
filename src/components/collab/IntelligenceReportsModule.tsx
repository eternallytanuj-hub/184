'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Share2, Sparkles, TrendingUp, 
  BarChart3, Globe, Calendar, Check, Printer, Shield, 
  AlertTriangle, Network, Layers, ExternalLink
} from 'lucide-react';
import { OfficerRole, OFFICER_ROLES, OfficerProfile } from '@/data/collabData';

interface IntelligenceReportsModuleProps {
  currentRole?: OfficerRole;
  currentOfficer?: OfficerProfile;
  onAuditLog?: (action: string, entityId: string, entityType: string) => void;
}

export default function IntelligenceReportsModule({
  currentRole: propRole,
  currentOfficer,
  onAuditLog,
}: IntelligenceReportsModuleProps) {
  const currentRole = propRole || currentOfficer?.role || 'i4c_admin';
  const [selectedReportType, setSelectedReportType] = useState<number>(1);
  const [sitrepLanguage, setSitrepLanguage] = useState<'en' | 'hi'>('en');
  const [customRange, setCustomRange] = useState('Last 7 Days');
  const [customFormat, setCustomFormat] = useState('PDF');
  const [isExporting, setIsExporting] = useState(false);

  const activeOfficer = OFFICER_ROLES[currentRole];

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Intelligence Report compiled and downloaded to local secure downloads directory.');
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-white select-none">
      
      {/* 1. TOP MODULE HEADER */}
      <div className="p-4 bg-[#141414] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-neon/10 border border-neon text-neon">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              National Intelligence & Threat Analytics Reports
              <span className="text-[10px] text-zinc-400 font-normal">
                [STATUTORY BRIEFINGS]
              </span>
            </h2>
            <div className="text-[10px] text-zinc-400">
              Automated AI Pattern Summaries, Daily SITREPs, and Inter-State Criminal Syndicate Dossiers
            </div>
          </div>
        </div>

        {/* Global Export & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-black hover:bg-white/10 border border-white/20 text-zinc-300 hover:text-white text-xs uppercase flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PRINT DOSSIER</span>
          </button>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="px-3.5 py-1.5 bg-neon hover:bg-neon/90 text-black font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'COMPILING...' : 'EXPORT REPORT'}</span>
          </button>
        </div>

      </div>

      {/* 2. REPORT TABS NAVIGATION */}
      <div className="flex items-center border-b border-white/10 bg-black overflow-x-auto text-[11px] uppercase tracking-wider">
        {[
          { id: 1, label: 'Report 1: Case-Specific AI Intel' },
          { id: 2, label: 'Report 2: Daily SITREP (Bilingual)' },
          { id: 3, label: 'Report 3: Weekly Trend Analysis' },
          { id: 4, label: 'Report 4: Criminal Network Syndicate' },
          { id: 5, label: 'Report 5: Custom Report Builder' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReportType(tab.id)}
            className={`px-4 py-2.5 font-bold whitespace-nowrap transition-colors border-r border-white/10 ${
              selectedReportType === tab.id
                ? 'bg-[#141414] text-neon border-b-2 border-b-neon'
                : 'text-zinc-400 hover:text-white hover:bg-[#141414]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. REPORT CONTENT VIEWER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0c0c0c] text-xs">
        
        {/* REPORT 1: CASE-SPECIFIC INTELLIGENCE REPORT */}
        {selectedReportType === 1 && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="p-4 bg-[#141414] border border-white/20 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <span className="text-[10px] text-neon uppercase font-bold tracking-widest">[ CLASSIFIED DOSSIER ]</span>
                  <h3 className="text-base font-bold text-white uppercase mt-0.5">
                    Case CY2026-MH-44521 — Predictive Withdrawal Hotspot Intelligence
                  </h3>
                  <div className="text-[10px] text-zinc-400">
                    Source FIR #412/2026 • Ingested: 05 Sept 2026 11:42 IST • Target: Jaipur North
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">THREAT INDEX:</span>
                  <span className="text-red-400 font-bold text-base">92 / 100 CRITICAL</span>
                </div>
              </div>

              <div className="space-y-4 text-zinc-300 text-[11px] leading-relaxed">
                <div className="p-3 bg-black border border-white/10 space-y-1">
                  <div className="text-[9px] text-neon uppercase font-bold">1. AI PATTERN MATCHING & MODUS OPERANDI:</div>
                  <p>
                    Pattern analysis extracted from victim statement matches the <strong>&quot;Electricity Bill Disconnection APK&quot;</strong> attack vector. 
                    The malware routed ₹4.50 Lakhs into two tier-1 mule accounts in Jaipur (State Bank of India) and Alwar (Punjab National Bank). 
                    Historical correlation matches <strong>18 previous cases</strong> associated with the <em>Mewat Sector-4 Collective</em>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-black border border-white/10">
                    <span className="text-[9px] text-zinc-500 block uppercase">PREDICTED CASH-OUT:</span>
                    <strong className="text-white text-xs">Sindhi Camp ATMs, Jaipur</strong>
                    <span className="text-[9px] text-amber-400 block mt-1">Window: 14:00 - 16:30 IST Today</span>
                  </div>
                  <div className="p-3 bg-black border border-white/10">
                    <span className="text-[9px] text-zinc-500 block uppercase">MODEL CONFIDENCE:</span>
                    <strong className="text-neon text-xs">92% High Probability</strong>
                    <span className="text-[9px] text-zinc-400 block mt-1">Trained on 45,000 NCRP Cases</span>
                  </div>
                  <div className="p-3 bg-black border border-white/10">
                    <span className="text-[9px] text-zinc-500 block uppercase">RECOVERY FEASIBILITY:</span>
                    <strong className="text-emerald-400 text-xs">74% High Recovery</strong>
                    <span className="text-[9px] text-zinc-400 block mt-1">₹1.85L Frozen at Tier-1</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-white/10 space-y-2">
                  <div className="text-[9px] text-neon uppercase font-bold">2. RECOMMENDED TACTICAL DIRECTIVES:</div>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-200">
                    <li>Maintain 2 plainclothes officers around SBI ATM Terminal #RJ-4421 on Station Road.</li>
                    <li>Verify suspect identity against CCTV reference photo (Black Hoodie, male, 25-30 yrs).</li>
                    <li>CFCFRMS freeze executed on PNB #XXXX1102; alert branch manager to report walk-in withdrawal attempts.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: DAILY SITUATION REPORT (SITREP) - BILINGUAL */}
        {selectedReportType === 2 && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#141414] border border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <Globe className="h-4 w-4 text-neon" />
                <span className="font-bold text-white uppercase">SITREP LANGUAGE TOGGLE:</span>
                <button
                  onClick={() => setSitrepLanguage('en')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase ${
                    sitrepLanguage === 'en' ? 'bg-neon text-black' : 'bg-black text-zinc-400'
                  }`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => setSitrepLanguage('hi')}
                  className={`px-2 py-1 text-[10px] font-bold uppercase ${
                    sitrepLanguage === 'hi' ? 'bg-neon text-black' : 'bg-black text-zinc-400'
                  }`}
                >
                  हिन्दी (HINDI)
                </button>
              </div>

              <span className="text-[10px] text-zinc-400">PUBLISHED DAILY AT 08:00 IST • DISPATCH #SIT-2026-248</span>
            </div>

            <div className="p-5 bg-[#141414] border border-white/20 space-y-5">
              {sitrepLanguage === 'en' ? (
                <>
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] text-neon font-bold uppercase tracking-widest">[ MHA / I4C NATIONAL BRIEFING ]</span>
                    <h3 className="text-base font-bold text-white uppercase mt-0.5">
                      National Cyber Threat Daily Situation Report (SITREP) — 05 September 2026
                    </h3>
                  </div>

                  {/* 4 Stat KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">24H COMPLAINTS:</span>
                      <strong className="text-lg text-white font-bold">8,247</strong>
                      <span className="text-[9px] text-red-400 block">+14% vs Previous Day</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">TOTAL AMOUNT AT RISK:</span>
                      <strong className="text-lg text-amber-400 font-bold">₹18.42 Cr</strong>
                      <span className="text-[9px] text-zinc-400 block">Across 28 States & UTs</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">FUNDS FROZEN (CFCFRMS):</span>
                      <strong className="text-lg text-neon font-bold">₹4.85 Cr</strong>
                      <span className="text-[9px] text-emerald-400 block">26.3% Interception Rate</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">FIELD ARRESTS MADE:</span>
                      <strong className="text-lg text-white font-bold">14 Suspects</strong>
                      <span className="text-[9px] text-cyan-400 block">6 Inter-State Gangs</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-[11px] leading-relaxed text-zinc-300">
                    <div className="p-3 bg-black border border-white/10">
                      <div className="text-[10px] text-white font-bold uppercase mb-1">Top 5 Trending Cyber Fraud Typologies:</div>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li><strong>KYC / Electricity Bill Disconnection Scams</strong> (2,410 cases — High severity in MH, RJ, DL)</li>
                        <li><strong>Institutional Stock & Crypto Investment Frauds</strong> (1,840 cases — ₹8.2 Cr losses in GJ, KA, TS)</li>
                        <li><strong>Instant Loan App Extortion & Sextortion</strong> (1,120 cases — Originating in Jamtara & Bharatpur)</li>
                        <li><strong>UPI Phishing / Fake QR Code Payments</strong> (1,090 cases — Rural and urban ATM cash-outs)</li>
                        <li><strong>Digital Arrest & FedEx Customs Impersonation</strong> (610 cases — High net-worth seniors targeted)</li>
                      </ol>
                    </div>

                    <div className="p-3 bg-black border border-white/10">
                      <div className="text-[10px] text-white font-bold uppercase mb-1">Top 3 National High-Risk Withdrawal Hotspots:</div>
                      <div className="space-y-1">
                        <div>1. 🔴 <strong>Sindhi Camp, Jaipur</strong> — 14 ATMs under heightened surveillance (Predicted volume: ₹45L)</div>
                        <div>2. 🔴 <strong>Tauru-Kaman Corridor, Mewat</strong> — Rural POS terminals actively monitored (Predicted volume: ₹68L)</div>
                        <div>3. 🟠 <strong>Hazratganj, Lucknow</strong> — High-value corporate bank branch clusters (Predicted volume: ₹32L)</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* HINDI TRANSLATED SITREP */
                <>
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] text-neon font-bold uppercase tracking-widest">[ गृह मंत्रालय / आई4सी राष्ट्रीय ब्रीफिंग ]</span>
                    <h3 className="text-base font-bold text-white uppercase mt-0.5">
                      राष्ट्रीय साइबर अपराध दैनिक स्थिति रिपोर्ट (SITREP) — 05 सितंबर 2026
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">24 घंटे की कुल शिकायतें:</span>
                      <strong className="text-lg text-white font-bold">8,247</strong>
                      <span className="text-[9px] text-red-400 block">पिछले दिन की तुलना में +14%</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">जोखिम में कुल राशि:</span>
                      <strong className="text-lg text-amber-400 font-bold">₹18.42 करोड़</strong>
                      <span className="text-[9px] text-zinc-400 block">28 राज्यों और केंद्र शासित प्रदेशों में</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">फ्रीज की गई राशि (CFCFRMS):</span>
                      <strong className="text-lg text-neon font-bold">₹4.85 करोड़</strong>
                      <span className="text-[9px] text-emerald-400 block">26.3% रोकथाम दर</span>
                    </div>
                    <div className="p-3 bg-black border border-white/10">
                      <span className="text-[9px] text-zinc-500 block uppercase">गिरफ्तार संदिग्ध:</span>
                      <strong className="text-lg text-white font-bold">14 व्यक्ति</strong>
                      <span className="text-[9px] text-cyan-400 block">6 अंतर-राज्यीय गिरोह</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-[11px] leading-relaxed text-zinc-300">
                    <div className="p-3 bg-black border border-white/10">
                      <div className="text-[10px] text-white font-bold uppercase mb-1">शीर्ष 5 साइबर धोखाधड़ी श्रेणियां:</div>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li><strong>केवाईसी / बिजली बिल विच्छेदन धोखाधड़ी</strong> (2,410 मामले — महाराष्ट्र, राजस्थान, दिल्ली में उच्च प्रसार)</li>
                        <li><strong>फर्जी शेयर बाजार और क्रिप्टो निवेश घोटाला</strong> (1,840 मामले — गुजरात, कर्नाटक में भारी नुकसान)</li>
                        <li><strong>लोन ऐप ब्लैकमेल और सेक्सटॉर्शन</strong> (1,120 मामले — जामताड़ा और भरतपुर गिरोह)</li>
                        <li><strong>यूपीआई क्यूआर कोड भुगतान धोखाधड़ी</strong> (1,090 मामले)</li>
                        <li><strong>डिजिटल अरेस्ट / फेडेक्स कस्टम अधिकारी धोखाधड़ी</strong> (610 मामले)</li>
                      </ol>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* REPORT 3: WEEKLY TREND ANALYSIS */}
        {selectedReportType === 3 && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-5 bg-[#141414] border border-white/20 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neon font-bold uppercase tracking-widest">[ WEEKLY TREND STRATEGY ]</span>
                  <h3 className="text-base font-bold text-white uppercase mt-0.5">
                    National Trend & Migration Analytics — Week 36 (2026)
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">Comparing W35 vs W36</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="p-3 bg-black border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-neon" />
                    Emerging Modus Operandi Shifts
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Fraud networks in the Mewat corridor are shifting from urban bank branch ATM withdrawals toward rural Customer Service Points (CSP) and micro-ATMs. 
                    Average cash-out time window has compressed from 4.2 hours down to <strong>2.6 hours</strong>.
                  </p>
                </div>

                <div className="p-3 bg-black border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Inter-State Recovery Leaderboard
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>1. Rajasthan State Cyber Cell:</span><strong className="text-neon">34.2% Recovery</strong></div>
                    <div className="flex justify-between"><span>2. Maharashtra Cyber Police:</span><strong className="text-white">31.8% Recovery</strong></div>
                    <div className="flex justify-between"><span>3. Haryana Cyber Crime Unit:</span><strong className="text-white">28.4% Recovery</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 4: CRIMINAL NETWORK SYNDICATE */}
        {selectedReportType === 4 && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-5 bg-[#141414] border border-white/20 space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">[ SYNDICATE ATTRIBUTION ]</span>
                  <h3 className="text-base font-bold text-white uppercase mt-0.5">
                    Network Dossier: &quot;Mewat-Jamtara Transit Ring #04&quot;
                  </h3>
                </div>
                <span className="text-xs text-neon font-bold">42 LINKED CASES INGESTED</span>
              </div>

              <div className="p-4 bg-black border border-white/10 space-y-3">
                <div className="text-[10px] text-neon font-bold uppercase flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  MULE ACCOUNT & CALLER TOPOLOGY GRAPH
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 bg-[#141414] border border-white/5">
                    <span className="text-zinc-500 text-[9px] block uppercase">CALLING CORES:</span>
                    <strong>12 Active SIMs</strong>
                    <span className="text-zinc-400 text-[9px] block">Location: Nuh & Bharatpur</span>
                  </div>
                  <div className="p-2.5 bg-[#141414] border border-white/5">
                    <span className="text-zinc-500 text-[9px] block uppercase">TIER-1 MULE ACCOUNTS:</span>
                    <strong>28 Flagged Accounts</strong>
                    <span className="text-zinc-400 text-[9px] block">SBI, PNB, Canara Bank</span>
                  </div>
                  <div className="p-2.5 bg-[#141414] border border-white/5">
                    <span className="text-zinc-500 text-[9px] block uppercase">PRIMARY CASH-OUT HUB:</span>
                    <strong>Jaipur & Alwar ATMs</strong>
                    <span className="text-neon text-[9px] block">Sindhi Camp & MI Road</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: CUSTOM REPORT BUILDER */}
        {selectedReportType === 5 && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-5 bg-[#141414] border border-white/20 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] text-neon font-bold uppercase tracking-widest">[ REPORT COMPILER WIZARD ]</span>
                <h3 className="text-base font-bold text-white uppercase mt-0.5">
                  Build Custom Strategic / Parliamentary Dossier
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Select Time Window:</label>
                  <select
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    className="w-full bg-black border border-white/20 p-2 text-white font-mono uppercase focus:border-neon rounded-none"
                  >
                    <option value="Last 24 Hours">LAST 24 HOURS</option>
                    <option value="Last 7 Days">LAST 7 DAYS</option>
                    <option value="Last 30 Days">LAST 30 DAYS</option>
                    <option value="Quarter 3 (2026)">CURRENT QUARTER (Q3 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Target Jurisdictions:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-black border border-white/10 text-[10px]">
                    {['Rajasthan', 'Maharashtra', 'Uttar Pradesh', 'Haryana', 'Delhi NCR', 'Pan-India Combined'].map((st) => (
                      <label key={st} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded-none" />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Export Format:</label>
                  <div className="flex items-center gap-3">
                    {['PDF (Statutory Dossier)', 'Excel (.XLSX Audit Sheets)', 'PowerPoint (.PPTX Command Brief)'].map((fmt) => (
                      <label key={fmt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          checked={customFormat === fmt.split(' ')[0]}
                          onChange={() => setCustomFormat(fmt.split(' ')[0])}
                        />
                        <span>{fmt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleExportReport}
                    className="px-4 py-2 bg-neon hover:bg-neon/90 text-black font-bold uppercase text-xs flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>GENERATE & COMPILE CUSTOM REPORT →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
