'use client';

import React from 'react';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

export default function FeedbackLoopSection() {
  const { feedbackLoop } = content;

  return (
    <section id="feedback-loop" className="relative w-full bg-[#111111] text-white py-20 lg:py-32 bg-grid-technical border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
              [ 10 // CLOSED-LOOP ACTIVE LEARNING ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            {feedbackLoop.sectionTitle}
          </h2>

          <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal pt-2 border-l-2 border-neon pl-4">
            {feedbackLoop.mainParagraph}
          </p>
        </div>

        {/* Closed-Loop Diagram Container */}
        <Card variant="glass" className="p-8 sm:p-12 border-neon/40 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-neon animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-white font-bold">
                CONTINUOUS RETRAINING & DRIFT RECALIBRATION LOOP
              </span>
            </div>
            <div className="font-mono text-xs text-neon uppercase">
              [ TELEMETRY FEED: ONLINE ]
            </div>
          </div>

          {/* Simple Visual Text as specified in original request */}
          <div className="mb-10 p-4 bg-black/60 border border-white/10">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-2">
              [ PIPELINE CYCLE ]
            </span>
            <p className="font-mono text-xs sm:text-sm md:text-base text-neon font-semibold tracking-wide overflow-x-auto whitespace-nowrap py-1">
              {feedbackLoop.visualText}
            </p>
          </div>

          {/* 7-Step Circular / Sequential Node Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {feedbackLoop.cycleSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 bg-black/50 border border-white/10 relative group hover:border-neon transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3 font-mono text-[10px] text-zinc-500">
                  <span>NODE</span>
                  <span className="text-neon group-hover:text-white transition-colors">{step.number}</span>
                </div>

                <div className="font-mono text-xs sm:text-sm uppercase font-bold text-white group-hover:text-neon transition-colors my-2">
                  {step.label}
                </div>

                <div className="pt-2 border-t border-white/10 font-mono text-[9px] text-zinc-400 flex items-center justify-between">
                  <span>STEP {idx + 1}</span>
                  <span className="text-neon">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Telemetry Status Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-neon rounded-none" />
              <span>ACTIVE RETRAINING: CONTINUOUS (15m BATCH)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-cyan-400 rounded-none" />
              <span>RECALIBRATION DRIFT TOLERANCE: &lt; 0.05%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-none" />
              <span>GROUND REINFORCEMENT: VERIFIED</span>
            </div>
          </div>

        </Card>

      </div>
    </section>
  );
}
