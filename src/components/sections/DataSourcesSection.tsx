'use client';

import React from 'react';
import Image from 'next/image';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

const SOURCE_LOGOS: Record<string, { src: string; alt: string; className?: string }> = {
  'National Crime Records Bureau (NCRB)': {
    src: '/logos/ncrb.png',
    alt: 'NCRB Logo',
    className: 'h-10 w-auto object-contain',
  },
  'Reserve Bank of India (RBI)': {
    src: '/logos/rbi.svg',
    alt: 'Reserve Bank of India Seal',
    className: 'h-11 w-auto object-contain',
  },
  'OpenStreetMap': {
    src: '/logos/osm.svg',
    alt: 'OpenStreetMap Logo',
    className: 'h-10 w-auto object-contain',
  },
  'Sanchar Saathi (DoT)': {
    src: '/logos/sanchar_saathi.png',
    alt: 'Sanchar Saathi Logo',
    className: 'h-10 w-auto object-contain',
  },
  'TRAI': {
    src: '/logos/trai.png',
    alt: 'TRAI Logo',
    className: 'h-10 w-auto object-contain',
  },
  'CERT-In': {
    src: '/logos/cert_in.png',
    alt: 'CERT-In Logo',
    className: 'h-10 w-auto object-contain',
  },
  'data.gov.in': {
    src: '/logos/data_gov.svg',
    alt: 'data.gov.in Open Data Logo',
    className: 'h-9 w-auto object-contain',
  },
  'NewsAPI': {
    src: '/logos/newsapi.png',
    alt: 'NewsAPI Logo',
    className: 'h-10 w-auto object-contain',
  },
  'Kaggle Fraud Datasets': {
    src: '/logos/kaggle.png',
    alt: 'Kaggle Logo',
    className: 'h-9 w-auto object-contain',
  },
};

export default function DataSourcesSection() {
  const { dataSources } = content;

  return (
    <section id="data-sources" className="relative w-full bg-[#ececec] text-black py-20 lg:py-32 bg-grid-technical-light border-b border-black/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-black rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-600 font-semibold">
              [ 08 // INTELLIGENCE CORPUS ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase">
            {dataSources.sectionTitle}
          </h2>

          <p className="text-base sm:text-xl text-zinc-700 leading-relaxed font-normal pt-2 border-l-2 border-black pl-4">
            {dataSources.mainParagraph}
          </p>
        </div>

        {/* 9 Data Sources Grid with Official Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.sources.map((source, idx) => {
            const logoInfo = SOURCE_LOGOS[source.name];

            return (
              <Card
                key={idx}
                variant="platinum"
                className="p-6 sm:p-8 bg-white border-black/15 shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Feed Status Bar */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-black/10">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {`FEED 0${idx + 1} // INGESTION ACTIVE`}
                    </span>
                    <span className="h-2 w-2 bg-emerald-600 rounded-none" />
                  </div>

                  {/* Official Logo Banner */}
                  <div className="h-14 flex items-center mb-4 bg-zinc-50/70 border border-black/5 p-2 px-3">
                    {logoInfo ? (
                      <div className="relative h-10 w-full flex items-center">
                        <Image
                          src={logoInfo.src}
                          alt={logoInfo.alt}
                          width={140}
                          height={44}
                          className={logoInfo.className || 'h-9 w-auto object-contain'}
                        />
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-zinc-400">
                        [ OFFICIAL DATA PARTNER ]
                      </div>
                    )}
                  </div>

                  <h3 className="font-heading-display text-lg sm:text-xl font-normal text-black mb-2">
                    {source.name}
                  </h3>

                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {source.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-black/10 flex items-center justify-between font-mono text-[10px] uppercase text-zinc-500">
                  <span>[ DATA PROTOCOL ]</span>
                  <span className="text-black font-semibold">VERIFIED TELEMETRY</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
