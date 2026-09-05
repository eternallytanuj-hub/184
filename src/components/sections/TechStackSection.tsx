'use client';

import React from 'react';
import { content } from '@/data/content';
import Card from '@/components/ui/Card';

export default function TechStackSection() {
  const { techStack } = content;

  return (
    <section id="tech-stack" className="relative w-full bg-obsidian text-white py-20 lg:py-32 bg-grid-technical border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-4xl space-y-4 mb-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-neon rounded-none" />
            <span className="font-mono text-xs uppercase tracking-widest text-neon font-semibold">
              [ 07 // SYSTEM ARCHITECTURE ]
            </span>
          </div>

          <h2 className="font-heading-display text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight uppercase text-white">
            {techStack.sectionTitle}
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 font-mono uppercase tracking-wider">
            [ FULL-STACK ENTERPRISE INTEGRATION ARCHITECTURE FOR NATIONWIDE SCALE ]
          </p>
        </div>

        {/* 6 Architecture Layers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.layers.map((layer, idx) => (
            <Card
              key={idx}
              variant="glass"
              className="p-8 hover:border-neon/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-neon">
                    LAYER 0{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    [ VERIFIED COMPONENT ]
                  </span>
                </div>

                <h3 className="font-heading-display text-2xl font-light text-white mb-3">
                  {layer.layer}
                </h3>

                <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                  {layer.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {layer.technologies.map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-2 py-0.5 bg-black/80 border border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-300 group-hover:border-neon/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
