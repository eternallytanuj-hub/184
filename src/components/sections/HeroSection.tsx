'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { content } from '@/data/content';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import GlobeCanvas from '@/components/globe/GlobeCanvas';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.9 || 1)));
      setZoom(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#0c0c0c] text-white overflow-hidden pt-24 pb-16 lg:pb-24 bg-grid-technical flex flex-col justify-between"
    >
      {/* 3D WebGL Globe Viewport (Full Bleed Perspective) */}
      <div className="absolute inset-0 z-0 pointer-events-auto flex items-center justify-center overflow-hidden opacity-90">
        <div className="relative w-full h-full">
          <GlobeCanvas zoom={zoom} />
        </div>
      </div>

      {/* Foreground Ambient Contrast Gradients */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#0c0c0c] via-[#0c0c0c]/70 to-transparent w-full md:w-3/5" />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent h-40 bottom-0" />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Top Tagline / Hackathon Identifier */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="neon">
            {content.hero.tagline}
          </Badge>
          <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
            [ RADAR GEOLOC: 28.6139° N, 77.2090° E ]
          </span>
        </div>

        {/* Institutional Accreditation Logos Banner */}
        <div className="flex flex-wrap items-center gap-4 mb-8 py-2 px-3 border border-white/10 bg-black/60 backdrop-blur-md max-w-fit">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider pr-2 border-r border-white/10">
            OFFICIAL STAKEHOLDERS:
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" title="Ministry of Home Affairs">
              <Image
                src="/logos/emblem_india.svg"
                alt="Ministry of Home Affairs"
                width={20}
                height={20}
                className="h-5 w-auto object-contain filter invert brightness-200"
              />
              <span className="font-mono text-[10px] text-zinc-300 font-medium uppercase">MHA</span>
            </div>
            <span className="text-zinc-700 text-xs">/</span>
            <div className="flex items-center gap-2" title="Indian Cyber Crime Coordination Centre">
              <Image
                src="/logos/i4c.png"
                alt="I4C"
                width={24}
                height={20}
                className="h-5 w-auto object-contain"
              />
              <span className="font-mono text-[10px] text-zinc-300 font-medium uppercase">I4C</span>
            </div>
            <span className="text-zinc-700 text-xs">/</span>
            <div className="flex items-center gap-2" title="Smart India Hackathon">
              <Image
                src="/logos/sih2026.png"
                alt="Smart India Hackathon"
                width={36}
                height={20}
                className="h-5 w-auto object-contain"
              />
              <span className="font-mono text-[10px] text-zinc-300 font-medium uppercase">SIH</span>
            </div>
            <span className="text-zinc-700 text-xs">/</span>
            <div className="flex items-center gap-2" title="National Crime Records Bureau">
              <Image
                src="/logos/ncrb.png"
                alt="NCRB"
                width={20}
                height={20}
                className="h-5 w-auto object-contain"
              />
              <span className="font-mono text-[10px] text-zinc-300 font-medium uppercase">NCRB</span>
            </div>
          </div>
        </div>

        {/* Display Headline matching spur.us Editorial Weight */}
        <div className="max-w-3xl">
          <h1 className="font-heading-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12]">
            Predicting Cybercrime Cash Withdrawals{' '}
            <span className="text-neon font-normal">Before They Happen</span>
          </h1>
        </div>

        {/* 12-Column Grid: Subtitle & CTA on Left, Featured Intel on Right */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Sub-headline & Call-to-Actions (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed font-normal border-l border-neon pl-4">
              {content.hero.subHeadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button href="/dashboard" variant="neon" size="lg">
                {content.hero.buttonText}
              </Button>
              
              <Button href="#problem" variant="bracket" size="lg">
                READ CRISIS ANALYSIS →
              </Button>
            </div>

            {/* Live Indicator Feed */}
            <div className="flex items-center gap-6 pt-4 font-mono text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-neon rounded-none" />
                <span>NCRP COMPLAINTS STREAM: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-none" />
                <span>ATM GIS NODES: 2,48,000+</span>
              </div>
            </div>
          </div>

          {/* Right Featured Intel Card Widget (Right 5 Cols) */}
          <div className="lg:col-span-5">
            <Card variant="dark" className="border-white/15 p-5 space-y-4 bg-[#0c0c0c]/80 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-neon rounded-none" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                    {content.hero.featuredIntel.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neon uppercase tracking-wider">
                  [{content.hero.featuredIntel.status}]
                </span>
              </div>

              <div className="space-y-3 divide-y divide-white/10 text-xs">
                {content.hero.featuredIntel.items.map((intel, idx) => (
                  <div key={idx} className={idx > 0 ? "pt-3" : ""}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                        [{intel.tag}]
                      </span>
                      <span className="font-mono text-[9px] text-neon hover:underline cursor-pointer">
                        {intel.action}
                      </span>
                    </div>
                    <p className="text-zinc-200 font-medium leading-snug">
                      {intel.headline}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>

      </div>

      {/* Bottom Scroll Cue */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 mt-12 flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
        <span>[ SIH 2024 / PS 184 / MINISTRY OF HOME AFFAIRS, I4C ]</span>
        <span className="text-zinc-400">[ DRAG GLOBE TO ROTATE // SCROLL DOWN ↓ ]</span>
      </div>
    </section>
  );
}
