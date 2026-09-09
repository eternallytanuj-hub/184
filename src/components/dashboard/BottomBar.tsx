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
          <span className="h-2 w-2 bg-neon rounded-none" />
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
            MAP LEGEND:
          </span>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>
            <span>ATM (Normal)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>
            <span>ATM (Moderate)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>
            <span>ATM (High Risk)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z"/></svg>
            <span>Bank Branch</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Police Station</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Active Incident</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeDasharray="3 3"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
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
