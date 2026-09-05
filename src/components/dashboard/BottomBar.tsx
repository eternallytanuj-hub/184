'use client';

import React from 'react';
import { TICKER_ITEMS } from '@/data/dashboardData';

interface BottomBarProps {
  onTickerClick?: (item: string) => void;
}

export default function BottomBar({ onTickerClick }: BottomBarProps) {
  return (
    <footer className="relative z-40 w-full bg-[#0c0c0c] border-t border-white/10 text-white font-mono text-xs select-none">
      
      {/* PANEL 1: CONTINUOUS SCROLLING REAL-TIME TICKER */}
      <div className="w-full bg-[#111111] border-b border-white/10 py-1.5 px-3 overflow-hidden flex items-center group">
        <div className="flex-shrink-0 flex items-center gap-2 pr-3 border-r border-white/15 text-[10px] text-neon font-bold uppercase tracking-wider">
          <span className="h-2 w-2 bg-neon rounded-none animate-pulse" />
          <span>RADAR DISPATCH:</span>
        </div>

        <div className="relative w-full overflow-hidden whitespace-nowrap ml-3">
          <div className="inline-block animate-marquee group-hover:[animation-play-state:paused] text-[11px] text-zinc-300">
            {TICKER_ITEMS.map((item, idx) => (
              <span
                key={idx}
                onClick={() => onTickerClick && onTickerClick(item)}
                className="inline-block mx-6 hover:text-neon cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
            {/* Repeat for continuous loop */}
            {TICKER_ITEMS.map((item, idx) => (
              <span
                key={`dup-${idx}`}
                onClick={() => onTickerClick && onTickerClick(item)}
                className="inline-block mx-6 hover:text-neon cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL 2 & 3: MAP LEGEND & DATA SOURCE HEALTH */}
      <div className="px-3 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] bg-[#0c0c0c]">
        
        {/* Map Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-400">
          <span className="font-bold text-white uppercase text-[9px] tracking-wider">
            [ MAP LEGEND ]:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-emerald-500 rounded-none" />
            <span>ATM (Normal)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-yellow-400 rounded-none" />
            <span>ATM (Moderate)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-red-600 rounded-none animate-pulse" />
            <span>ATM (High Risk)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-cyan-400 rounded-none" />
            <span>Bank Branch</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-blue-600 rounded-none" />
            <span>Police Station</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-red-500 rotate-45 rounded-none" />
            <span>Active Incident</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 border border-neon bg-neon/30 rounded-none" />
            <span>Hotspot Zone</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 border-t-2 border-dashed border-red-500" />
            <span>Money Corridor</span>
          </div>
        </div>

        {/* Data Source Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-zinc-400 border-t md:border-t-0 pt-1 md:pt-0 border-white/10">
          <div className="flex items-center gap-1.5">
            <span>NCRP FEED:</span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-none" />
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <span>/</span>
          <div className="flex items-center gap-1.5">
            <span>BANK FEED:</span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-none" />
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <span>/</span>
          <div className="flex items-center gap-1.5">
            <span>OSM DATA:</span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-none" />
            <span className="text-zinc-300">UPDATED 2H AGO</span>
          </div>
          <span>/</span>
          <div className="flex items-center gap-1.5">
            <span>NEWS FEED:</span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-none" />
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <span>/</span>
          <div className="flex items-center gap-1.5">
            <span>ALERTS:</span>
            <span className="h-1.5 w-1.5 bg-neon rounded-none" />
            <span className="text-neon font-bold">ACTIVE</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
