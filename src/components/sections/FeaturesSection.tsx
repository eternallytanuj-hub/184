'use client';

import React, { useState } from 'react';
import { content, FeatureItem } from '@/data/content';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Cpu, Map, Shield, Bell } from 'lucide-react';

export default function FeaturesSection() {
  const { features } = content;
  const [activeFilter, setActiveFilter] = useState<'all' | 'analytics' | 'operations'>('all');

  const getIcon = (icon: FeatureItem['icon']) => {
    switch (icon) {
      case 'brain':
        return <Cpu className="h-6 w-6 text-neon" />;
      case 'map':
        return <Map className="h-6 w-6 text-neon" />;
      case 'shield':
        return <Shield className="h-6 w-6 text-neon" />;
      case 'bell':
        return <Bell className="h-6 w-6 text-neon" />;
      default:
        return <Cpu className="h-6 w-6 text-neon" />;
    }
  };

  return (
    <section id="features" className="relative w-full bg-[#111111] text-white py-20 lg:py-32 bg-grid-technical border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-neon rounded-none" />
              <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
                [ 03 // CORE CAPABILITIES ]
              </span>
            </div>

            <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
              {features.sectionTitle}
            </h2>
          </div>

          {/* Filter Pills matching spur.us */}
          <div className="flex items-center gap-2 p-1 bg-black/60 border border-white/10 font-mono text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 transition-colors uppercase ${activeFilter === 'all' ? 'bg-neon text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
            >
              [ ALL DELIVERABLES ]
            </button>
            <button
              onClick={() => setActiveFilter('analytics')}
              className={`px-3 py-1.5 transition-colors uppercase ${activeFilter === 'analytics' ? 'bg-neon text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
            >
              [ AI & GIS ENGINE ]
            </button>
            <button
              onClick={() => setActiveFilter('operations')}
              className={`px-3 py-1.5 transition-colors uppercase ${activeFilter === 'operations' ? 'bg-neon text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
            >
              [ OPS & ALERTS ]
            </button>
          </div>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.items.map((item, idx) => {
            // Simple filter logic
            if (activeFilter === 'analytics' && idx >= 2) return null;
            if (activeFilter === 'operations' && idx < 2) return null;

            return (
              <Card
                key={item.id}
                variant="glass"
                className="p-8 sm:p-10 hover:border-neon/50 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-3 bg-black/80 border border-white/10 group-hover:border-neon/40 transition-colors">
                      {getIcon(item.icon)}
                    </div>
                    <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                      FEATURE // {item.id}
                    </span>
                  </div>

                  <h3 className="font-heading-display text-2xl sm:text-3xl font-light text-white mb-4 group-hover:text-neon transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                  <span className="text-neon flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-neon rounded-none" />
                    OPERATIONAL SYSTEM
                  </span>
                  <span>[ VERIFIED v1.0 ]</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
