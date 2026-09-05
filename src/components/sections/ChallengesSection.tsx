'use client';

import React from 'react';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

export default function ChallengesSection() {
  const { challenges } = content;

  return (
    <section id="challenges" className="relative w-full bg-obsidian text-white py-20 lg:py-32 bg-grid-technical border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
              [ 09 // PRODUCTION RESILIENCE ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            {challenges.sectionTitle}
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-mono uppercase tracking-wider">
            [ MITIGATING SYSTEMIC FRICTION, ADVERSARIAL DRIFT & MULTI-JURISDICTION SILOS ]
          </p>
        </div>

        {/* 4 Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {challenges.cards.map((card) => (
            <Card
              key={card.id}
              variant="glass"
              className="p-8 sm:p-10 hover:border-neon/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon">
                    CHALLENGE 0{card.id}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    [ RESILIENCE VECTOR ]
                  </span>
                </div>

                <h3 className="font-heading-display text-2xl sm:text-3xl font-light text-white mb-4">
                  {card.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  {card.text}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <span>[ SOLUTION STATUS ]</span>
                <span className="text-neon font-semibold">ARCHITECTED & TESTED</span>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
