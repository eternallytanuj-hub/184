'use client';

import React from 'react';
import { content } from '@/data/content';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function ProblemSection() {
  const { problem } = content;

  return (
    <section id="problem" className="relative w-full bg-[#ececec] text-black py-20 lg:py-32 bg-grid-technical-light border-y border-black/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Bracketed Monospace Tag */}
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-black rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600 font-semibold">
              [ 01 // PROBLEM STATEMENT ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase">
            {problem.sectionTitle}
          </h2>

          <p className="text-base sm:text-xl text-zinc-700 leading-relaxed font-normal pt-2 border-l-2 border-black pl-4">
            {problem.mainParagraph}
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {problem.cards.map((card, idx) => (
            <Card
              key={idx}
              variant="platinum"
              className="p-8 hover:-translate-y-1 transition-transform duration-300 relative border-black/15 bg-white shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-sm font-bold text-black border-b border-black/20 pb-0.5">
                    {`0${idx + 1} // CRITICAL`}
                  </span>
                  <span className="h-2 w-2 bg-red-600" />
                </div>

                <h3 className="font-heading-display text-2xl sm:text-3xl font-normal text-black mb-4 tracking-tight">
                  {card.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {card.text}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                <span>[ VULNERABILITY INDEX ]</span>
                <span className="text-red-600 font-bold">HIGH RISK</span>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
