'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { content } from '@/data/content';
import Button from '@/components/ui/Button';

export default function FooterSection() {
  const { footer } = content;

  return (
    <footer id="footer" className="relative w-full bg-[#0c0c0c] text-white overflow-hidden border-t border-white/10">
      
      {/* High-Impact Neon Lime Banner (Matching spur.us Section 11) */}
      <div className="w-full bg-neon text-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-black">
        <div className="mx-auto max-w-[1600px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-4xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-black/75 font-bold">
              [ NATIONWIDE CYBER DEFENSE INITIATIVE ]
            </span>
            <h2 className="font-heading-display text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight text-black">
              {footer.closingStatement}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <Button href="/dashboard" variant="dark" size="lg" className="border-black bg-black text-white hover:bg-black/90 rounded-none">
              EXPLORE CYBERCAST →
            </Button>
          </div>
        </div>
      </div>

      {/* Institutional Trust Logo Strip */}
      <div className="w-full bg-[#141414] border-b border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-semibold">
              [ INSTITUTIONAL CO-ORDINATION & JURISDICTION ]
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {/* MHA Emblem */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-white/10 px-3 py-1.5">
              <Image
                src="/logos/emblem_india.svg"
                alt="Government of India Emblem"
                width={20}
                height={26}
                className="h-6 w-auto object-contain brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-white font-bold leading-none">MHA</span>
                <span className="font-mono text-[8px] text-zinc-400">Govt of India</span>
              </div>
            </div>

            {/* I4C Logo */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-white/10 px-3 py-1.5">
              <Image
                src="/logos/i4c.png"
                alt="I4C Logo"
                width={40}
                height={26}
                className="h-6 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-white font-bold leading-none">I4C</span>
                <span className="font-mono text-[8px] text-zinc-400">Cyber Crime Center</span>
              </div>
            </div>

            {/* SIH 2026 Logo */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-white/10 px-3 py-1.5">
              <Image
                src="/logos/sih2026.png"
                alt="Smart India Hackathon Logo"
                width={65}
                height={26}
                className="h-6 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-white font-bold leading-none">SIH 2026</span>
                <span className="font-mono text-[8px] text-zinc-400">PS 184</span>
              </div>
            </div>

            {/* Galgotias University */}
            <div className="flex items-center gap-2.5 bg-black/60 border border-white/10 px-3 py-1.5">
              <div className="h-6 w-6 overflow-hidden border border-white/10">
                <Image
                  src="/logos/galgotias.jpg"
                  alt="Galgotias University Logo"
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-white font-bold leading-none">GALGOTIAS</span>
                <span className="font-mono text-[8px] text-zinc-400">University</span>
              </div>
            </div>

            {/* CyberCast Logo */}
            <div className="flex items-center gap-2 bg-black/60 border border-neon/30 px-3 py-1.5">
              <div className="h-6 w-6 flex items-center justify-center overflow-hidden">
                <Image
                  src="/CyberCast.png"
                  alt="CyberCast Logo"
                  width={24}
                  height={24}
                  className="h-full w-full object-contain scale-110"
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-white tracking-wider">
                CYBER<span className="text-neon">CAST</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-grid-technical">
        
        {/* Top Grid: Brand & Hackathon Details & Team Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand & Mission (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden border border-white/20 bg-black">
                <Image
                  src="/CyberCast.png"
                  alt="CyberCast Logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain scale-110"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold tracking-wider text-white">
                    CYBER<span className="text-neon">CAST</span>
                  </span>
                  <span className="h-1.5 w-1.5 bg-neon rounded-none" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                  SMART INDIA HACKATHON
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              An AI-powered predictive analytics framework forecasting cybercrime cash withdrawals in real-time for law enforcement and financial institutions.
            </p>

            <div className="pt-2 font-mono text-[11px] text-zinc-400 space-y-1">
              <div>STATUS: <span className="text-neon">ALL SYSTEMS OPERATIONAL</span></div>
              <div>SECURITY PROTOCOL: <span className="text-white">AIR-GAPPED TELEMETRY</span></div>
            </div>
          </div>

          {/* Project Details (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-neon font-semibold border-b border-white/10 pb-2">
              [ PROJECT DETAILS ]
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Event:</span>
                <span className="text-white font-medium">{footer.projectDetails.event}</span>
              </div>
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Problem Statement:</span>
                <span className="text-white font-mono font-medium">{footer.projectDetails.problemStatement}</span>
              </div>
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Organization:</span>
                <span className="text-white font-medium">{footer.projectDetails.organization}</span>
              </div>
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Department:</span>
                <span className="text-white font-medium">{footer.projectDetails.department}</span>
              </div>
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Classification:</span>
                <span className="text-zinc-300 font-mono text-xs">{footer.projectDetails.categoryTheme}</span>
              </div>
            </div>
          </div>

          {/* Team Section (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-neon font-semibold border-b border-white/10 pb-2">
              [ TEAM & INSTITUTION ]
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Team Name:</span>
                <span className="text-xl font-heading-display text-white font-normal">{footer.teamSection.teamName}</span>
              </div>

              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase block">Institution:</span>
                <span className="text-white font-medium">{footer.teamSection.college}</span>
              </div>

              <div className="pt-2">
                <span className="font-mono text-xs text-zinc-500 uppercase block mb-2">Team Members:</span>
                
                {/* Verbatim Members string as required */}
                <div className="p-3 bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 leading-relaxed">
                  {footer.teamSection.members}
                </div>

                {/* Structured Member Badges */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {footer.teamSection.memberList.map((member, idx) => (
                    <div key={idx} className="p-2 bg-black/40 border border-white/5 text-[11px] font-mono">
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-zinc-500 text-[10px]">{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Coordinate Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <div>
            © 2026 CYBERCAST • TEAM CYBER SINGHAM • GALGOTIAS UNIVERSITY
          </div>
          <div className="flex items-center gap-6">
            <Link href="#hero" className="hover:text-neon transition-colors">
              [ TOP ↑ ]
            </Link>
            <Link href="#problem" className="hover:text-neon transition-colors">
              [ THE PROBLEM ]
            </Link>
            <Link href="#solution" className="hover:text-neon transition-colors">
              [ SOLUTION ]
            </Link>
            <Link href="#features" className="hover:text-neon transition-colors">
              [ FEATURES ]
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
