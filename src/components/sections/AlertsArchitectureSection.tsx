'use client';

import React from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';

export default function AlertsArchitectureSection() {
  return (
    <section id="alerts-architecture" className="relative w-full bg-[#0c0c0c] text-white py-20 lg:py-32 border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#ceff00] rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#ceff00] font-semibold">
              [ SYSTEM ARCHITECTURE ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            Alert & Notification System
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-mono uppercase tracking-wider">
            [ MULTI-CHANNEL DISPATCH ARCHITECTURE ]
          </p>
          
          <div className="mt-4 p-4 border border-[#ceff00]/30 bg-[#ceff00]/5 text-xs font-mono">
            <p className="text-[#ceff00] uppercase font-bold mb-1">[ NOTICE ]</p>
            <p className="text-white/80">Currently in demo mode. Twilio and Resend API keys are not integrated for this environment. The system exercises the full API flow locally.</p>
          </div>
        </div>

        <div className="space-y-16">
          {/* 1. Event Trigger Pipeline */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              01 // Event Trigger Pipeline
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="dark" className="p-6 rounded-none border border-white/10 hover:border-[#ceff00]/40 transition-colors">
                <h4 className="font-mono text-sm uppercase text-white mb-4">Triggers</h4>
                <div className="space-y-4 text-sm font-mono text-zinc-300">
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2">
                    <span className="text-white/60">High-risk district detected</span>
                    <span>Risk score ≥ 0.85 (polled 60s)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2">
                    <span className="text-white/60">Live complaint prediction</span>
                    <span>Confidence ≥ 0.80 + window &lt; 3h</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2">
                    <span className="text-white/60">Risk score spike</span>
                    <span>Jump ≥ 0.25 in single cycle</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <span className="text-white/60">Manual escalation</span>
                    <span>Always fires on officer action</span>
                  </div>
                </div>
              </Card>
              
              <Card variant="dark" className="p-6 rounded-none border border-white/10 hover:border-[#ceff00]/40 transition-colors">
                <h4 className="font-mono text-sm uppercase text-white mb-4">Flow Architecture</h4>
                <pre className="text-xs font-mono text-zinc-400 bg-black/50 p-4 border border-white/5 overflow-x-auto">
{`Complaint submitted 
  → /predict API 
    → Risk Engine evaluates thresholds
      ↓
Alert Dispatcher (Next.js API route)
├── SMS Channel
├── Email Channel  
├── Dashboard Push Channel
└── Alert Log (Supabase)`}
                </pre>
              </Card>
            </div>
          </div>

          {/* 2. Channel Architecture */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              02 // Channel Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Channel A: SMS (Twilio)", targets: "Police", desc: "Sent to registered district numbers. Rate limit: 1 per 30m." },
                { title: "Channel B: Email (Resend)", targets: "Banks/ATMs", desc: "HTML email to mapped bank contacts. Rate limit: 1 per hour." },
                { title: "Channel C: Email Escalation", targets: "Senior Officers", desc: "Detailed SHAP reports for I4C Central & State Nodal. (Risk ≥ 0.90)" },
                { title: "Channel D: Dashboard Push", targets: "Command Center", desc: "Supabase Realtime WebSocket push. Latency < 2s." },
              ].map((channel, i) => (
                <Card key={i} variant="dark" className="p-6 rounded-none border border-white/10 hover:border-[#ceff00]/40 transition-colors">
                  <h4 className="font-mono text-sm font-bold uppercase text-white mb-2">{channel.title}</h4>
                  <div className="text-xs font-mono text-[#ceff00] mb-3">TARGET: {channel.targets}</div>
                  <p className="text-sm font-mono text-zinc-400">{channel.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* 3. Database Schema */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              03 // Database Schema (Supabase)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { table: "alerts", cols: "id, complaint_id, alert_type, severity, risk_score, channels_dispatched, status" },
                { table: "alert_recipients", cols: "id, alert_id, channel, recipient_identifier, delivery_status, sent_at" },
                { table: "alert_contacts", cols: "id, district, contact_type, name, phone, email, organization" },
              ].map((db, i) => (
                <Card key={i} variant="dark" className="p-6 rounded-none border border-white/10 hover:border-[#ceff00]/40 transition-colors">
                  <h4 className="font-mono text-sm uppercase text-white mb-4 bg-white/5 p-2 inline-block">Table: {db.table}</h4>
                  <p className="text-xs font-mono text-zinc-400 leading-relaxed">{db.cols.split(', ').map(c => `• ${c}`).join('\n')}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* 4. Deduplication & Rate Limiting */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              04 // Deduplication & Rate Limiting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { rule: "District Cooldown", logic: "Same district cannot trigger same alert type within 30 min" },
                { rule: "Severity Escalation", logic: "If a new alert for same district has higher severity, bypass cooldown" },
                { rule: "Daily Cap", logic: "Max 50 SMS, 100 emails per day (prevents runaway billing)" },
                { rule: "Hash-based Dedup", logic: "SHA256(district + alert_type + hour_bucket) stored in alerts table" }
              ].map((item, i) => (
                <Card key={i} variant="dark" className="p-4 rounded-none border border-white/10 hover:border-[#ceff00]/40 transition-colors">
                  <div className="text-[#ceff00] font-mono text-xs font-bold uppercase mb-2">[{item.rule}]</div>
                  <div className="text-zinc-400 font-mono text-xs">{item.logic}</div>
                </Card>
              ))}
            </div>
          </div>

          {/* 5. Priority & Severity */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              05 // Priority Classification
            </h3>
            <div className="space-y-4">
              {[
                { level: "CRITICAL", criteria: "Risk ≥ 0.95 OR window < 1h", action: "All 4 channels immediately", color: "text-rose-500", border: "border-rose-500/30" },
                { level: "HIGH", criteria: "Risk ≥ 0.85 OR window < 3h", action: "SMS + Dashboard + Email to senior officers", color: "text-orange-500", border: "border-orange-500/30" },
                { level: "MEDIUM", criteria: "Risk ≥ 0.70", action: "Dashboard + Email to bank contacts", color: "text-yellow-500", border: "border-yellow-500/30" },
                { level: "INFO", criteria: "Risk < 0.70", action: "Dashboard only (logged, no external dispatch)", color: "text-blue-500", border: "border-blue-500/30" },
              ].map((p, i) => (
                <div key={i} className={`p-4 border ${p.border} bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-none`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold uppercase ${p.color}`}>[{p.level}]</span>
                    <span className="font-mono text-xs text-white">{p.criteria}</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">{p.action}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 6. API Route Design */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              06 // API Route Design
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { route: "/api/alerts", method: "GET", purpose: "Fetch alert feed (paginated, filterable)" },
                { route: "/api/alerts", method: "POST", purpose: "Create manual alert (officer escalation)" },
                { route: "/api/alerts/[id]/acknowledge", method: "PATCH", purpose: "Mark alert as acknowledged" },
                { route: "/api/alerts/[id]/resolve", method: "PATCH", purpose: "Mark as resolved or false positive" },
                { route: "/api/alerts/dispatch", method: "POST", purpose: "Internal — evaluate thresholds and dispatch" },
                { route: "/api/alerts/contacts", method: "GET/POST", purpose: "Manage alert contact directory" }
              ].map((api, i) => (
                <div key={i} className="p-4 border border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center gap-4 rounded-none">
                  <span className="font-mono text-xs font-bold uppercase text-[#ceff00] bg-[#ceff00]/10 px-2 py-1">
                    {api.method}
                  </span>
                  <span className="font-mono text-sm text-white">{api.route}</span>
                  <span className="font-mono text-xs text-zinc-400 sm:ml-auto">{api.purpose}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Integration Points */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              07 // Integration Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { comp: "apiService.ts", desc: "Compare /districts scores → fire dispatch if threshold crossed" },
                { comp: "ComplaintPredictorModal.tsx", desc: "Auto-evaluate alert thresholds after /predict" },
                { comp: "DashboardHeader.tsx", desc: "Notification bell with Supabase Realtime subscription" },
                { comp: "MapEngine.tsx", desc: "Pulse animation on districts with active critical alerts" },
                { comp: "CaseManagementModule.tsx", desc: "Escalate button posts to /api/alerts" },
                { comp: "CollabHeader.tsx", desc: "Alert feed sidebar panel" }
              ].map((item, i) => (
                <Card key={i} variant="dark" className="p-4 rounded-none border border-white/10">
                  <div className="text-white font-mono text-sm font-bold mb-1">{item.comp}</div>
                  <div className="text-zinc-400 font-mono text-xs">{item.desc}</div>
                </Card>
              ))}
            </div>
          </div>

          {/* 8. Tech Stack Summary */}
          <div>
             <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              08 // Tech Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 border border-white/10 bg-black/20 rounded-none text-center flex flex-col items-center justify-center gap-3 hover:border-white/30 transition-colors">
                <Image src="https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg" alt="Twilio Logo" width={32} height={32} className="h-8 w-auto opacity-90" unoptimized />
                <div>
                  <p className="font-mono text-white text-sm uppercase mb-1">Twilio</p>
                  <p className="font-mono text-zinc-500 text-[10px] uppercase">SMS Delivery</p>
                </div>
              </div>
              <div className="p-6 border border-white/10 bg-black/20 rounded-none text-center flex flex-col items-center justify-center gap-3 hover:border-white/30 transition-colors">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/2/28/Resend_logo.svg" alt="Resend Logo" width={32} height={32} className="h-8 w-auto invert opacity-90" onError={(e) => { e.currentTarget.srcset = "https://raw.githubusercontent.com/resend/resend-node/main/github-assets/resend-icon.png"; e.currentTarget.classList.remove('invert'); }} unoptimized />
                <div>
                  <p className="font-mono text-white text-sm uppercase mb-1">Resend</p>
                  <p className="font-mono text-zinc-500 text-[10px] uppercase">Email Engine</p>
                </div>
              </div>
              <div className="p-6 border border-white/10 bg-black/20 rounded-none text-center flex flex-col items-center justify-center gap-3 hover:border-white/30 transition-colors">
                <Image src="https://supabase.com/brand-assets/supabase-logo-icon.svg" alt="Supabase Logo" width={32} height={32} className="h-8 w-auto opacity-90" unoptimized />
                <div>
                  <p className="font-mono text-white text-sm uppercase mb-1">Supabase</p>
                  <p className="font-mono text-zinc-500 text-[10px] uppercase">Realtime & DB</p>
                </div>
              </div>
              <div className="p-6 border border-white/10 bg-black/20 rounded-none text-center flex flex-col items-center justify-center gap-3 hover:border-white/30 transition-colors">
                <Image src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" alt="Vercel Logo" width={32} height={32} className="h-8 w-auto invert opacity-90" unoptimized />
                <div>
                  <p className="font-mono text-white text-sm uppercase mb-1">Vercel</p>
                  <p className="font-mono text-zinc-500 text-[10px] uppercase">API & Cron Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {/* 9. Demo vs Production */}
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-[#ceff00] mb-6 pb-2 border-b border-white/10">
              09 // Demo vs Production
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="dark" className="p-6 rounded-none border border-white/10">
                <h4 className="font-mono text-sm uppercase text-[#ceff00] mb-4">SIH Demo Environment</h4>
                <ul className="space-y-2 text-xs font-mono text-zinc-400">
                  <li>• Twilio test credentials (API flow exercised, no real SMS sent)</li>
                  <li>• Resend free tier (100 emails/day)</li>
                  <li>• Hardcoded 5-10 demo contacts in <span className="text-white">alert_contacts</span></li>
                  <li>• Full pipeline working end-to-end with mock phone numbers</li>
                </ul>
              </Card>
              <Card variant="dark" className="p-6 rounded-none border border-white/10">
                <h4 className="font-mono text-sm uppercase text-[#ceff00] mb-4">Production Environment</h4>
                <ul className="space-y-2 text-xs font-mono text-zinc-400">
                  <li>• Twilio production credentials with Indian DLT registration</li>
                  <li>• Email domain verification for reliable deliverability</li>
                  <li>• Secure contact management admin panel</li>
                  <li>• Webhook-based delivery status tracking & analytics</li>
                </ul>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
