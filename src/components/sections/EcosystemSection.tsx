'use client';

import React from 'react';
import Image from 'next/image';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

export default function EcosystemSection() {
  const { ecosystem } = content;

  // Stakeholder official logos mapping
  const stakeholderLogos: Record<string, { src: string; alt: string; invert?: boolean }> = {
    '01': { src: '/logos/i4c.png', alt: 'I4C Command Center Logo' },
    '02': { src: '/logos/emblem_india.svg', alt: 'State Police Emblem', invert: false },
    '03': { src: '/logos/emblem_india.svg', alt: 'District Police Law Enforcement', invert: false },
    '04': { src: '/logos/rbi.svg', alt: 'Reserve Bank of India & Financial Institutions' },
  };

  return (
    <section id="ecosystem" className="relative w-full bg-[#ececec] text-black py-20 lg:py-32 bg-grid-technical-light border-b border-black/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-black rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600 font-semibold">
              [ 06 // INTER-AGENCY COLLABORATION ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-tight uppercase">
            {ecosystem.sectionTitle}
          </h2>

          <p className="text-base sm:text-xl text-zinc-700 leading-relaxed font-normal pt-2 border-l-2 border-black pl-4">
            {ecosystem.mainParagraph}
          </p>
        </div>

        {/* 4 Stakeholder Cards Grid with Official Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ecosystem.cards.map((card) => {
            const logo = stakeholderLogos[card.id];
            return (
              <Card
                key={card.id}
                variant="platinum"
                className="p-8 relative bg-white border-black/15 shadow-none hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                      NODE // {card.id}
                    </span>
                    {logo && (
                      <div className="relative h-10 w-10 flex items-center justify-center p-1 bg-zinc-50 border border-black/10">
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading-display text-xl sm:text-2xl font-normal text-black mb-3">
                    {card.title}
                  </h3>

                  <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                    {card.text}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between font-mono text-[10px] uppercase text-zinc-500">
                  <span>[ PROTOCOL ACCESS ]</span>
                  <span className="text-black font-semibold">CONNECTED</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
