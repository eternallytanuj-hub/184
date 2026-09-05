'use client';

import React from 'react';
import { content } from '@/data/content';
import MarqueeTicker from '@/components/motion/MarqueeTicker';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function SolutionSection() {
  const { solution } = content;

  return (
    <section id="solution" className="relative w-full bg-obsidian text-white py-20 lg:py-32 bg-grid-technical overflow-hidden">
      
      {/* Top Infinite Marquee Ticker */}
      <div className="mb-16">
        <MarqueeTicker
          items={solution.marqueeItems}
          theme="neon"
          speed={20}
          separator="///"
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
              [ 02 // ARCHITECTURAL PARADIGM ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            {solution.sectionTitle}
          </h2>

          <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal pt-2 border-l-2 border-neon pl-4">
            {solution.mainParagraph}
          </p>
        </div>

        {/* Paradigm Shift Comparison Card */}
        <div className="mt-16">
          <Card variant="glass" className="border-neon/30 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              [ PIPELINE TRANSFORMATION ]
            </div>

            <div className="space-y-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  CRITICAL PARADIGM SHIFT:
                </span>
                <p className="mt-3 text-lg sm:text-2xl lg:text-3xl font-light text-white leading-relaxed">
                  {solution.highlight}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                {/* Legacy Flow */}
                <div className="p-6 bg-red-950/20 border border-red-500/20 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs text-red-400 font-bold">
                    <span>LEGACY REACTIVE MODEL</span>
                    <span>[ DELAY: 2-6 HRS ]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
                    <span className="px-2 py-1 bg-black/40 border border-white/10">Crime</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-black/40 border border-white/10">Complaint</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-black/40 border border-white/10">Investigation</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-red-900/40 text-red-300 border border-red-500/30">Money Gone ✕</span>
                  </div>
                </div>

                {/* CyberCast Proactive Flow */}
                <div className="p-6 bg-[#ceff00]/10 border border-[#ceff00]/30 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs text-neon font-bold">
                    <span>CYBERCAST PROACTIVE MODEL</span>
                    <span>[ REAL-TIME FORECAST ]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 flex-wrap">
                    <span className="px-2 py-1 bg-black/60 border border-white/10">Complaint</span>
                    <span className="text-neon">→</span>
                    <span className="px-2 py-1 bg-black/60 border border-neon/50 text-neon">Prediction</span>
                    <span className="text-neon">→</span>
                    <span className="px-2 py-1 bg-black/60 border border-white/10">Deployment</span>
                    <span className="text-neon">→</span>
                    <span className="px-2 py-1 bg-neon text-black font-bold">Criminal Caught ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </section>
  );
}
