'use client';

import React from 'react';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

export default function HowItWorksSection() {
  const { howItWorks } = content;

  return (
    <section id="how-it-works" className="relative w-full bg-[#ececec] text-black py-20 lg:py-32 bg-grid-technical-light border-y border-black/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-black rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600 font-semibold">
              [ 04 // OPERATIONAL TIMELINE ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase">
            {howItWorks.sectionTitle}
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 font-mono uppercase tracking-wider pt-2">
            [ REAL-TIME NCRP INGESTION → GEOSPATIAL INTERVENTION PIPELINE ]
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {howItWorks.steps.map((step, idx) => (
            <Card
              key={idx}
              variant="platinum"
              className="p-8 relative bg-white border-black/15 shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                    PHASE // {step.step}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    [ T+{idx * 30}s ]
                  </span>
                </div>

                <h3 className="font-heading-display text-2xl font-normal text-black mb-3">
                  {step.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
                  {step.text}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between font-mono text-[10px] uppercase text-zinc-500">
                <span>STAGE {idx + 1} OF 6</span>
                <span className="font-bold text-black">AUTOMATED →</span>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
