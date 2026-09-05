'use client';

import React from 'react';
import { content } from '@/data/content';

export default function ImpactSection() {
  const { impact } = content;

  return (
    <section id="impact" className="relative w-full bg-obsidian text-white py-20 lg:py-32 bg-grid-technical border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
              [ 05 // QUANTITATIVE TELEMETRY ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            {impact.sectionTitle}
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-mono uppercase tracking-wider">
            [ MEASURABLE OPERATIONAL IMPACT ACROSS INDIA&apos;S FINANCIAL CYBER DEFENSE ]
          </p>
        </div>

        {/* 6 Stats Grid with spur.us Vertical Dashed Border Separators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/15 bg-black/40 backdrop-blur-sm">
          {impact.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-12 border-b md:border-b-0 md:border-r border-dashed border-white/15 flex flex-col justify-between group hover:bg-white/[0.03] transition-colors relative"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                  METRIC // 0{idx + 1}
                </span>
                <span className="h-1.5 w-1.5 bg-neon opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div>
                <div className="font-heading-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white group-hover:text-neon transition-colors leading-none">
                  {stat.number}
                </div>
                
                <p className="mt-4 font-mono text-xs sm:text-sm uppercase tracking-wider text-zinc-400 font-normal leading-relaxed">
                  {stat.label}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                <span>[ STATUS: ACTIVE ]</span>
                <span className="text-neon">ONLINE</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
